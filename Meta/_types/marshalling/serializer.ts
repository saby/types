/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TMetaJson, TMetaJsonSingle, TVariantMeta } from './format';
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

        if (MetaClass.primitive === primitive.is) {
            return [primitive];
        }

        if (primitive.is === MetaClass.array) {
            const itemMeta = (meta as ArrayMeta<unknown>).getItemMeta();
            const itemJson = this.serialize(itemMeta);
            primitive.arrayOf = itemMeta.getId();
            itemJson.push(primitive);
            return itemJson;
        }

        if (primitive.is === MetaClass.variant) {
            let variantResult: TMetaJson = [];
            primitive.invariant = (meta as VariantMeta<never>).getInvariant();
            const [variantsValue, variantsJson] = this.getAttributiesMetaJson(
                (meta as VariantMeta<never>).getTypes()
            );
            if (variantsValue.length > 0) {
                primitive.of = JSON.stringify(variantsValue, this.jsonStringifyReplacer);
                variantResult = variantsJson;
            }
            variantResult.push(primitive);
            return variantResult;
        }

        let result: TMetaJson = [];
        if (primitive.is === MetaClass.widget) {
            const [attachedValue, attachedJson] = this.getAttachedMetaJson(
                (meta as WidgetMeta<unknown>).getAttachedAttributes()
            );
            const [stylesValue, stylesJson] = this.getAttachedMetaJson(
                (meta as WidgetMeta<unknown>).getAttachedStyles()
            );
            result = result.concat(attachedJson, stylesJson);
            if (attachedValue.length > 0) {
                primitive.attachedAttributes = JSON.stringify(
                    attachedValue,
                    this.jsonStringifyReplacer
                );
            }
            if (stylesValue.length > 0) {
                primitive.attachedStyles = JSON.stringify(stylesValue, this.jsonStringifyReplacer);
            }
            const access = (meta as WidgetMeta<unknown>).getAccess();
            if (access) {
                primitive.rights = JSON.stringify(access.rights);
                primitive.rightmode = Number(access.mode);
                if (isNaN(primitive.rightmode)) {
                    delete primitive.rightmode;
                }
            }
            const components = (meta as WidgetMeta<unknown>).getComponents();
            if (components) {
                primitive.componentUUID = JSON.stringify(components);
            }

            const feature = (meta as WidgetMeta<unknown>).getFeature();
            if (feature) {
                primitive.feature = JSON.stringify(feature);
            }

            const roles = (meta as WidgetMeta<unknown>).getRoles();
            if (roles) {
                primitive.roles = JSON.stringify(roles);
            }

            const keywords = (meta as WidgetMeta<unknown>).getKeywords();
            if (keywords) {
                primitive.keywords = JSON.stringify(keywords);
            }

            const converterLoaders = this.getConverterLoaders(meta as WidgetMeta<unknown>);
            const convertersKeys = Object.keys(converterLoaders);
            if (convertersKeys.length) {
                convertersKeys.forEach(
                    (converterKey) => (primitive[converterKey] = converterLoaders[converterKey])
                );
            }
        }

        if (MetaClass.object === primitive.is) {
            if (primitive.defaultValue === '{}') {
                delete primitive.defaultValue;
            }
        }

        if ([MetaClass.object, MetaClass.widget].includes(primitive.is)) {
            const [attrsValue, attrsJson] = this.getAttributiesMetaJson(
                (meta as ObjectMeta<unknown>).getAttributes()
            );
            primitive.attributes = attrsValue;
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

    private serializePrimitive(meta: Meta<unknown>): TMetaJsonSingle {
        const descritption = meta.toDescriptor();

        let sampleData: { importPath?: string; data?: unknown };
        if (meta.getSampleData()?.importPath) {
            sampleData = { importPath: meta.getSampleData().importPath };
        } else if (meta.getSampleData()?.data) {
            // eslint-disable-next-line
            sampleData = { data: meta.getSampleData().data };
        }

        const group: [string, string] = descritption.info.group
            ? [descritption.info.group.uid, descritption.info.group.name]
            : undefined;
        // @ts-ignore
        const editor = descritption.editor?.loader?._moduleName;
        const editorProps = this.stringifyIfNeed(descritption.editor?.props);
        // @ts-ignore
        const designtimeEditor = descritption.designtimeEditor?.loader?._moduleName;
        const designtimeEditorProps = this.stringifyIfNeed(descritption.designtimeEditor?.props);
        const defaultValue = this.stringifyIfNeed(meta.getDefaultValue());

        const jsonMeta: TMetaJsonSingle = {
            is: descritption.is,
            id: descritption.id,
            inherits: descritption.inherits ?? [],
            required: descritption.required,
            editor,
            editorProps,
            designtimeEditor,
            designtimeEditorProps,
            defaultValue,
            sampleData: this.stringifyIfNeed(sampleData),
            ...descritption.info,
            group: this.stringifyIfNeed(group),
            designEditorAS: descritption?.designtimeEditor?.isAlwaysShow,
        };
        Object.keys(jsonMeta).forEach((key) => {
            if (jsonMeta[key] !== undefined) {
                return;
            }
            delete jsonMeta[key];
        });
        jsonMeta.inherits = jsonMeta.inherits.filter((item) => {
            return !item.includes(GENERATOR_ID_RANDOM_DELIMITER);
        });

        return jsonMeta;
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
        const attributes = [];
        const attachedMetaJsons = [];
        Object.entries(attrObject).forEach(
            ([prop, attrs]: [string, Record<string, TVariantMeta>]) => {
                const [attrsValue, metasJson] = this.getAttributiesMetaJson(attrs);
                attachedMetaJsons.push(metasJson);
                attributes.push([prop, attrsValue]);
            }
        );
        return [attributes, Array.prototype.concat.apply([], attachedMetaJsons)];
    }

    private getAttributiesMetaJson(
        attrObject: Record<string, TVariantMeta>
    ): [[string, string][], TMetaJson] {
        const attributes = [];
        const attrMetaJsons = [];
        if (attrObject) {
            Object.entries(attrObject).forEach(([key, value]: [string, Meta<never>]) => {
                if (value === null || value === undefined) {
                    return;
                }

                attributes.push([value.getId(), key]);
                attrMetaJsons.push(this.serialize(value));
            });
        }
        return [attributes, Array.prototype.concat.apply([], attrMetaJsons)];
    }
}

/**
 * Сериализация meta
 * TODO Перевести везде работу на IMeta, а IMeta переименовать в IDescriptor
 */
export function serialize(meta: TVariantMeta): TMetaJson {
    return new Serializer().serialize(meta);
}
