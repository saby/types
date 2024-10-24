/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TMetaJson, TMetaJsonSingle, TVariantMeta } from './format';
import { MetaClass, GENERATOR_ID_RANDOM_DELIMITER, ConverterUtils, TAttributes } from './format';
import type { Meta } from '../baseMeta';
import type { ArrayMeta } from '../array';
import type { VariantMeta } from '../variant';
import type { ObjectMeta } from '../object';
import type { WidgetMeta, TAttachedProperties, TAttachedStyle } from '../widget';
import { createRightMode } from './rightmode';
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

        const primitive = this.serializePrimitive(meta as Meta<unknown>);
        this.includes.add(meta.getId());

        if (MetaClass.primitive === primitive.is) {
            return [primitive];
        }

        if (primitive.is === MetaClass.array) {
            const itemMeta = (meta as ArrayMeta<unknown>).getItemMeta();
            const itemJson = this.serialize(itemMeta);
            primitive.arrayOf = itemMeta.getId();
            // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
            itemJson.push(primitive);
            return itemJson;
        }

        if (primitive.is === MetaClass.variant) {
            let variantResult: TMetaJson = [];
            primitive.invariant = (meta as VariantMeta<Record<string, object>>).getInvariant();
            const [variantsValue, variantsJson] = this.getPropertiesMetaJson(
                // @ts-ignore разобраться как этот код работает getTypes отсутствует у VaerinaMeta
                meta.getTypes()
            );
            if (variantsValue.length > 0) {
                primitive.of = JSON.stringify(variantsValue, this.jsonStringifyReplacer);
                variantResult = variantsJson;
            }
            // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
            variantResult.push(primitive);
            return variantResult;
        }

        let result: TMetaJson = [];
        if (primitive.is === MetaClass.widget) {
            const widgetMeta = meta as WidgetMeta<unknown>;
            const [attachedValue, attachedJson] = this.getAttachedPropertiesJson(
                widgetMeta.getAttachedProperties()
            );
            const [stylesValue, stylesJson] = this.getAttachedStyleJson(
                widgetMeta.getAttachedStyles()
            );
            const attachedEditorValue = (meta as WidgetMeta<unknown>).getAttachedEditors();
            // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
            result = result.concat(attachedJson, stylesJson);
            if (attachedValue.length > 0) {
                primitive.attachedProperties = JSON.stringify(
                    attachedValue,
                    this.jsonStringifyReplacer
                );
            }
            if (stylesValue.length > 0) {
                primitive.attachedStyles = JSON.stringify(stylesValue, this.jsonStringifyReplacer);
            }
            if (attachedEditorValue) {
                primitive.attachedEditors = JSON.stringify(
                    attachedEditorValue,
                    this.jsonStringifyReplacer
                );
            }
            const access = (meta as WidgetMeta<unknown>).getAccess();
            if (access) {
                primitive.rights = JSON.stringify(access.rights);
                primitive.rightmode = createRightMode(access.mode);
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

            const parent = (meta as WidgetMeta<unknown>).getParent();
            if (parent) {
                primitive.parent = parent;
            }

            const converterLoaders = this.getConverterLoaders(meta as WidgetMeta<unknown>);
            const convertersKeys = Object.keys(converterLoaders);
            if (convertersKeys.length) {
                convertersKeys.forEach(
                    // @ts-ignore тут надо разбираться по типам получается что мы можем засетить в readOnly свойства
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
            const [attrsValue, attrsJson] = this.getPropertiesMetaJson(
                (meta as ObjectMeta<unknown>).getProperties()
            );
            // @ts-ignore мы знаем что есть attributes, он depricated, но еще используется
            primitive.attributes = attrsValue;
            primitive.properties = attrsValue;
            if (attrsValue.length > 0) {
                // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
                result = result.concat(attrsJson);
            }
        }

        // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
        result.push(primitive);
        return result;
    }

    private stringifyIfNeed(value: unknown): string | undefined {
        if (typeof value !== 'undefined') {
            return JSON.stringify(value, this.jsonStringifyReplacer);
        }
    }

    private serializePrimitive(meta: Meta<unknown>): TMetaJsonSingle {
        const description = meta.toDescriptor();

        let sampleData: { importPath?: string; data?: unknown };
        if (meta.getSampleData()?.importPath) {
            sampleData = { importPath: meta.getSampleData().importPath };
        } else if (meta.getSampleData()?.data) {
            // eslint-disable-next-line
            sampleData = { data: meta.getSampleData().data };
        }

        const group: [string, string] | undefined = description.info?.group
            ? [description.info.group.uid, description.info.group.name]
            : undefined;
        // @ts-ignore
        const editor = description.editor?.loader?._moduleName;
        const editorProps = this.stringifyIfNeed(description.editor?.props);
        // @ts-ignore
        const designtimeEditor = description.designtimeEditor?.loader?._moduleName;
        const designtimeEditorProps = this.stringifyIfNeed(description.designtimeEditor?.props);
        const defaultValue = this.stringifyIfNeed(meta.getDefaultValue());
        const originId = meta.getOrigin()
            ? { meta: meta.getOrigin()?.meta?.getId(), key: meta.getOrigin()?.key }
            : void 0;

        const jsonMeta: TMetaJsonSingle = {
            is: description.is as MetaClass,
            id: description.id,
            inherits: description.inherits ?? [],
            required: description.required,
            editor,
            editorProps,
            designtimeEditor,
            designtimeEditorProps,
            defaultValue,
            originId: this.stringifyIfNeed(originId),
            // @ts-ignore разобраться почему так, что будет если sampleData = {}
            sampleData: this.stringifyIfNeed(sampleData),
            ...description.info,
            group: this.stringifyIfNeed(group),
            designEditorAS: description?.designtimeEditor?.isAlwaysShow,
        };
        Object.keys(jsonMeta).forEach((key) => {
            const typedKey = key as keyof TAttributes;
            if (jsonMeta[typedKey] !== undefined) {
                return;
            }
            delete jsonMeta[typedKey];
        });
        jsonMeta.inherits = jsonMeta.inherits?.filter((item) => {
            return !item.includes(GENERATOR_ID_RANDOM_DELIMITER);
        });

        return jsonMeta;
    }

    private getConverterLoaders(meta: WidgetMeta<unknown>) {
        const valueConverterInput = meta.getValueConverterInput();
        const valueConverterOutput = meta.getValueConverterOutput();
        const isValueConvertable = meta.getIsValueConvertable();
        const valueConverterInputModule =
            //@ts-ignore
            valueConverterInput?.loader?._moduleName || valueConverterInput?._moduleName;
        const valueConverterOutputModule =
            //@ts-ignore
            valueConverterOutput?.loader?._moduleName || valueConverterOutput?._moduleName;
        const isValueConvertableModule =
            //@ts-ignore
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

    private getAttachedPropertiesJson(
        attrObject: TAttachedProperties
    ): [[string, [string, string][]][], TMetaJson] {
        if (!attrObject) {
            return [[], []];
        }
        const attachedProperties: [string, [string, string][]][] = [];
        const attachedMetaJsons: TMetaJson = [];
        Object.entries(attrObject).forEach(([key, value]: [string, Meta<never>]) => {
            if (value === null || value === undefined) {
                return;
            }
            // @ts-ignore разобраться почему так, врут или типы или реально ошибка
            attachedProperties.push([value.getId(), key]);
            // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
            attachedMetaJsons.push(this.serialize(value));
        });
        return [attachedProperties, Array.prototype.concat.apply([], attachedMetaJsons)];
    }

    private getAttachedStyleJson(
        attrObject: TAttachedStyle<any>
    ): [[string, [string, string][]][], TMetaJson] {
        if (!attrObject) {
            return [[], []];
        }
        const attachedProperties: [string, [string, string][]][] = [];
        const attachedMetaJsons: TMetaJson = [];
        Object.entries(attrObject).forEach(([prop, attrs]: [string, TVariantMeta]) => {
            const [attrsValue, metasJson] = this.getPropertiesMetaJson(attrs);
            // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
            attachedMetaJsons.push(metasJson);
            attachedProperties.push([prop, attrsValue]);
        });
        return [attachedProperties, Array.prototype.concat.apply([], attachedMetaJsons)];
    }

    private getPropertiesMetaJson(attrObject: TVariantMeta): [[string, string][], TMetaJson] {
        const properties: [string, string][] = [];
        const attrMetaJsons: TMetaJson = [];
        if (attrObject) {
            Object.entries(attrObject).forEach(([key, value]: [string, Meta<never>]) => {
                if (value === null || value === undefined) {
                    return;
                }

                properties.push([value.getId(), key]);
                // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
                attrMetaJsons.push(this.serialize(value));
                if (
                    value.getOrigin()?.meta &&
                    !attrMetaJsons.some((a) => {
                        return Array.isArray(a) && a[0]?.id === value.getOrigin()?.meta.getId();
                    }) &&
                    !this.includes.has(value.getOrigin()?.meta?.getId() as string)
                ) {
                    // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
                    attrMetaJsons.push(this.serialize(value.getOrigin().meta));
                }
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
