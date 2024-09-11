/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TMetaJson, TVariantMeta, TMetaJsonNewSingle, IMetaJsonNewProperties } from './format';
import { MetaClass, GENERATOR_ID_RANDOM_DELIMITER, ConverterUtils } from './format';
import type { Meta } from '../baseMeta';
import type { ArrayMeta } from '../array';
import type { VariantMeta } from '../variant';
import type { ObjectMeta } from '../object';
import type { WidgetMeta } from '../widget';
import { Serializer as TypesSerializer } from 'Types/serializer';

const baseIds = [
    'unknown',
    'any',
    'void',
    'null',
    'undefined',
    'boolean',
    'number',
    'string',
    'object',
    'promise',
    'function',
    'variant',
];

class Serializer {
    /**
     * Уже включенные ids в сериализацию
     */
    private includes: Set<string> = new Set();

    private jsonStringifyReplacer: typeof TypesSerializer.prototype.serialize = new TypesSerializer(
        undefined,
        true
    ).serialize;

    serialize(meta: TVariantMeta): TMetaJson {
        if (baseIds.includes(meta.getId())) {
            return [];
        }
        if (this.includes.has(meta.getId())) {
            return [];
        }

        const primitive = this.serializePrimitive(meta);
        this.includes.add(meta.getId());

        if (MetaClass.primitive === primitive.metatype) {
            return [primitive];
        }

        if (primitive.metatype === MetaClass.array) {
            const itemMeta = (meta as ArrayMeta<unknown>).getItemMeta();
            const itemJson = this.serialize(itemMeta);
            primitive.metaattributes.arrayOf = itemMeta.getId();
            itemJson.push(primitive);
            return itemJson;
        }

        if (primitive.metatype === MetaClass.variant) {
            let variantResult: TMetaJson = [];
            primitive.metaattributes.invariant = (meta as VariantMeta<never>).getInvariant();
            const [variantsValue, variantsJson] = this.getPropertiesMetaJson(
                (meta as VariantMeta<never>).getTypes()
            );
            if (variantsValue.length > 0) {
                primitive.metaattributes.of = JSON.stringify(
                    variantsValue,
                    this.jsonStringifyReplacer
                );
                variantResult = variantsJson;
            }
            variantResult.push(primitive);
            return variantResult;
        }

        let result: TMetaJson = [];
        if (primitive.metatype === MetaClass.widget) {
            const [attachedValue, attachedJson] = this.getAttachedMetaJson(
                (meta as WidgetMeta<unknown>).getAttachedAttributes()
            );
            const [stylesValue, stylesJson] = this.getAttachedMetaJson(
                (meta as WidgetMeta<unknown>).getAttachedStyles()
            );
            result = result.concat(attachedJson, stylesJson);
            if (attachedValue.length > 0) {
                primitive.metaattributes.attachedAttributes = JSON.stringify(
                    attachedValue,
                    this.jsonStringifyReplacer
                );
            }
            if (stylesValue.length > 0) {
                primitive.metaattributes.attachedStyles = JSON.stringify(
                    stylesValue,
                    this.jsonStringifyReplacer
                );
            }
            const access = (meta as WidgetMeta<unknown>).getAccess();
            if (access) {
                if (access.rights) {
                    primitive.metaattributes.rights = JSON.stringify(access.rights);
                }
                primitive.metaattributes.rightmode = Number(access.mode);
                if (isNaN(primitive.metaattributes.rightmode)) {
                    delete primitive.metaattributes.rightmode;
                }
            }
            const components = (meta as WidgetMeta<unknown>).getComponents();
            if (components) {
                primitive.metaattributes.componentUUID = JSON.stringify(components);
            }

            const feature = (meta as WidgetMeta<unknown>).getFeature();
            if (feature) {
                primitive.metaattributes.feature = JSON.stringify(feature);
            }

            const roles = (meta as WidgetMeta<unknown>).getRoles();
            if (roles) {
                primitive.metaattributes.roles = JSON.stringify(roles);
            }

            const keywords = (meta as WidgetMeta<unknown>).getKeywords();
            if (keywords) {
                primitive.metaattributes.keywords = JSON.stringify(keywords);
            }

            const parent = (meta as WidgetMeta<unknown>).getParent();
            if (parent) {
                primitive.metaattributes.parent = parent;
            }

            const converterLoaders = this.getConverterLoaders(meta as WidgetMeta<unknown>);
            const convertersKeys = Object.keys(converterLoaders);
            if (convertersKeys.length) {
                convertersKeys.forEach(
                    (converterKey) =>
                        (primitive.metaattributes[converterKey] = converterLoaders[converterKey])
                );
            }
        }

        if (MetaClass.object === primitive.metatype) {
            if (primitive.metaattributes.defaultValue === '{}') {
                delete primitive.metaattributes.defaultValue;
            }
        }

        if ([MetaClass.object, MetaClass.widget].includes(primitive.metatype)) {
            const metaAttributes = (meta as ObjectMeta<unknown>).getProperties();
            const [attrsValue, attrsJson] = this.getPropertiesMetaJson(metaAttributes);
            primitive.properties = this.getPropertiesFromMeta(metaAttributes);
            if (attrsValue.length > 0) {
                result = result.concat(attrsJson);
            }
        }

        result.push(primitive);
        return result;
    }

    private stringifyIfNeed(value: unknown): string {
        if (typeof value !== 'undefined') {
            return JSON.stringify(value, this.jsonStringifyReplacer);
        }
    }

    private serializePrimitive(meta: Meta<unknown>): TMetaJsonNewSingle {
        const description = meta.toDescriptor();

        let sampleData: { importPath?: string; data?: unknown };
        if (meta.getSampleData()?.importPath) {
            sampleData = { importPath: meta.getSampleData().importPath };
        } else if (meta.getSampleData()?.data) {
            // eslint-disable-next-line
            sampleData = { data: meta.getSampleData().data };
        }

        const group: [string, string] = description.info.group
            ? [description.info.group.uid, description.info.group.name]
            : undefined;
        // @ts-ignore
        const editor = description.editor?.loader?._moduleName;
        const editorProps = this.stringifyIfNeed(description.editor?.props);
        // @ts-ignore
        const designtimeEditor = description.designtimeEditor?.loader?._moduleName;
        let designtimeEditorProps = description.designtimeEditor?.loader;
        const defaultValue = this.stringifyIfNeed(meta.getDefaultValue());
        // @ts-ignore
        delete designtimeEditorProps?._moduleName;
        designtimeEditorProps = this.stringifyIfNeed(designtimeEditorProps);
        const jsonMeta: TMetaJsonNewSingle = {
            metatype: description.is,
            id: description.id,
            properties: [],
            metaattributes: {
                inherits: description.inherits ?? [],
                required: description.required,
                editor,
                editorProps,
                designtimeEditor,
                designtimeEditorProps,
                defaultValue,
                sampleData: this.stringifyIfNeed(sampleData),
                ...description.info,
                group: this.stringifyIfNeed(group),
            },
        };

        Object.keys(jsonMeta.metaattributes).forEach((key) => {
            if (jsonMeta.metaattributes[key] !== undefined) {
                return;
            }
            delete jsonMeta.metaattributes[key];
        });
        jsonMeta.metaattributes.inherits = jsonMeta.metaattributes.inherits.filter((item) => {
            return !item.includes(GENERATOR_ID_RANDOM_DELIMITER);
        });

        return jsonMeta;
    }

    private getPropertiesFromMeta(
        attrObject: Record<string, TVariantMeta>
    ): IMetaJsonNewProperties[] {
        const result: IMetaJsonNewProperties[] = [];
        if (attrObject) {
            Object.entries(attrObject).forEach(([key, value]: [string, Meta<never>]) => {
                if (value === null || value === undefined) {
                    return;
                }
                result.push({
                    name: key,
                    type: value.getId(),
                });
            });
        }
        return result;
    }

    private getConverterLoaders(meta: WidgetMeta<unknown>) {
        const valueConverterInput = meta.getValueConverterInput();
        const valueConverterOutput = meta.getValueConverterOutput();
        const isValueConvertable = meta.getIsValueConvertable();
        //@ts-ignore
        const valueConverterInputModule =
            valueConverterInput?.loader?._moduleName || valueConverterInput?._moduleName;
        //@ts-ignore
        const valueConverterOutputModule =
            valueConverterOutput?.loader?._moduleName || valueConverterOutput?._moduleName;
        //@ts-ignore
        const isValueConvertableModule =
            isValueConvertable?.loader?._moduleName || isValueConvertable?._moduleName;

        const converters: ConverterUtils = {};

        if (valueConverterInputModule) {
            converters.valueConverterInput = valueConverterInputModule;
        }

        if (valueConverterOutputModule) {
            converters.valueConverterOutput = valueConverterOutputModule;
        }

        if (isValueConvertableModule) {
            converters.isValueConvertable = isValueConvertableModule;
        }

        return converters;
    }

    private getAttachedMetaJson(
        attrObject: Record<string, Record<string, TVariantMeta> | TVariantMeta>
    ): [[string, [string, string][]][], TMetaJson] {
        if (!attrObject) {
            return [[], []];
        }
        const attachedAttributes = [];
        const attachedMetaJsons = [];
        Object.entries(attrObject).forEach(
            ([prop, attrs]: [string, Record<string, TVariantMeta>]) => {
                const [attrsValue, metasJson] = this.getPropertiesMetaJson(attrs);
                attachedMetaJsons.push(metasJson);
                attachedAttributes.push([prop, attrsValue]);
            }
        );
        return [attachedAttributes, Array.prototype.concat.apply([], attachedMetaJsons)];
    }

    private getPropertiesMetaJson(
        attrObject: Record<string, TVariantMeta>
    ): [[string, string][], TMetaJson] {
        const properties = [];
        const attrMetaJsons = [];
        if (attrObject) {
            Object.entries(attrObject).forEach(([key, value]: [string, Meta<never>]) => {
                if (value === null || value === undefined) {
                    return;
                }

                properties.push([value.getId(), key]);
                attrMetaJsons.push(this.serialize(value));
            });
        }
        return [properties, Array.prototype.concat.apply([], attrMetaJsons)];
    }
}

/**
 * Сериализация meta
 * TODO Перевести везде работу на IMeta, а IMeta переименовать в IDescriptor
 */
export function serialize(meta: TVariantMeta): TMetaJson {
    return new Serializer().serialize(meta);
}
