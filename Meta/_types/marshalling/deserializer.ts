/* eslint-disable @typescript-eslint/ban-ts-comment */
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import type { TMetaJson, TMetaJsonSingle } from './format';
import { ConverterUtils, MetaClass, TVariantMeta } from './format';
import { Meta } from '../baseMeta';
import * as Types from '../types';
import { ArrayMeta, IArrayMeta } from '../array';
import { ObjectMeta, IObjectMeta, IObjectMetaAttributes } from '../object';
import { WidgetMeta, IWidgetMeta } from '../widget';
import { FunctionMeta } from '../function';
import { PromiseMeta } from '../promise';
import { VariantMeta } from '../variant';
import { Serializer as TypesSerializer } from 'Types/serializer';

class DeserializeError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'DeserializeError';
    }
}

let jsonParseReviver: typeof TypesSerializer.prototype.deserialize;

type TMetaConstructor = new (descriptor: object) => TVariantMeta;
const META_CLASSES = new Map<MetaClass, TMetaConstructor>([
    [MetaClass.primitive, Meta],
    [MetaClass.array, ArrayMeta],
    [MetaClass.object, ObjectMeta],
    [MetaClass.widget, WidgetMeta],
    [MetaClass.promise, PromiseMeta],
    [MetaClass.function, FunctionMeta],
    [MetaClass.variant, VariantMeta],
]);

const META_TYPES = new Map<string, Meta<unknown>>([
    ['any', Types.AnyType],
    ['void', Types.VoidType],
    ['null', Types.NullType],
    ['undefined', Types.UndefinedType],
    ['boolean', Types.BooleanType],
    ['number', Types.NumberType],
    ['string', Types.StringType],
    ['date', Types.DateType],
    ['object', Types.ObjectType],
    ['promise', Types.PromiseType],
    ['function', Types.FunctionType],
    ['array', Types.ArrayType],
    ['variant', Types.VariantType],
    ['widget', Types.WidgetType],
    ['resource', Types.ResourceType],
]);

function createGroup(data: [string, string] | void) {
    if (!data) {
        return;
    }
    return {
        uid: data[0],
        name: data[1],
    };
}

function createInfo(data: TMetaJsonSingle) {
    return {
        title: data.title,
        description: data.description,
        icon: data.icon,
        category: data.category,
        group: data.group ? createGroup(JSON.parse(data.group, jsonParseReviver)) : void 0,
        extended: data.extended,
        order: data.order,
        hidden: data.hidden,
        disabled: data.disabled,
    };
}

function createEditor(editor: string | undefined, props: string | undefined) {
    return {
        loader: editor ? () => loadAsync(editor) : void 0,
        props: props ? JSON.parse(props, jsonParseReviver) : void 0,
    };
}

interface ConverterUtilsLoaders extends Partial<Record<keyof ConverterUtils, { loader: string }>> {
    valueConverterInput?: { loader: string };
    valueConverterOutput?: { loader: string };
    isValueConvertable?: { loader: string };
}

function createConverterUtils(json: Record<string, any>): ConverterUtilsLoaders {
    const converterUtils: ConverterUtilsLoaders = {};
    ['valueConverterInput', 'valueConverterOutput', 'isValueConvertable'].forEach(
        (converterUtilKey) => {
            if (converterUtilKey in json && typeof json[converterUtilKey] === 'string') {
                converterUtils[converterUtilKey as keyof ConverterUtils] = {
                    loader: json[converterUtilKey],
                };
            }
        }
    );

    return converterUtils;
}

function findMetaByFull(fullJson: TMetaJson, metaId: string): Meta<unknown> | undefined {
    if (META_TYPES.has(metaId)) {
        return META_TYPES.get(metaId);
    }
    const itemJson = fullJson.find((item: TMetaJsonSingle) => item.id === metaId);
    if (!itemJson) {
        return;
    }
    return deserializeInner(fullJson, itemJson);
}

function addArrayFields(
    refDescriptor: IArrayMeta<unknown, unknown>,
    arrayOf: string,
    fullJson: TMetaJson
): IArrayMeta<unknown, unknown> {
    const itemMeta = findMetaByFull(fullJson, arrayOf);
    if (!itemMeta) {
        return refDescriptor;
    }

    return {
        arrayOf: itemMeta,
        ...refDescriptor,
    };
}

function getAttributesMeta(
    attrs: [string, string][],
    fullJson: TMetaJson
): IObjectMetaAttributes<object> {
    if (attrs.length === 0) {
        return {};
    }
    return attrs
        .map(([metaId, attrName]) => {
            const itemMeta = findMetaByFull(fullJson, metaId);
            if (!itemMeta) {
                return {};
            }
            return { [attrName]: itemMeta };
        })
        .reduce((acc, item) => {
            return { ...acc, ...item };
        }, {}) as IObjectMetaAttributes<object>;
}

/**
 * @public
 */
export default function deserialize(json: TMetaJson): TVariantMeta {
    jsonParseReviver = new TypesSerializer(undefined, false).deserialize;
    return deserializeInner(json);
}

/**
 * @private
 */
function deserializeInner(json: TMetaJson, target?: TMetaJsonSingle): TVariantMeta {
    if (json.length === 0) {
        throw new DeserializeError('Переданы пустота для десереализации');
    }
    const main = target ?? json[json.length - 1];
    const constructor = META_CLASSES.get(main.is);
    if (!constructor) {
        throw new DeserializeError(`Неизвестный тип метатипа (is) ${main.is}`);
    }

    let descriptor = {
        is: main.is,
        id: main.id,
        fixedId: true,
        inherits: main.inherits,
        required: main.required,
        info: createInfo(main),
        defaultValue: main.defaultValue ? JSON.parse(main.defaultValue, jsonParseReviver) : void 0,
        sampleData: main.sampleData ? JSON.parse(main.sampleData, jsonParseReviver) : void 0,
        editor: createEditor(main.editor, main.editorProps),
        designtimeEditor: createEditor(main.designtimeEditor, main.designtimeEditorProps),
    };
    if (descriptor.is === MetaClass.array) {
        // `is`'s type typeguard don't work for enum
        return new constructor(
            main.arrayOf
                ? addArrayFields(descriptor as IArrayMeta<unknown>, main.arrayOf, json)
                : descriptor
        );
    }

    if (main.attributes) {
        const attributes: IObjectMetaAttributes<object> = getAttributesMeta(main.attributes, json);
        // `is`'s type typeguard don't work for enum
        (descriptor as IObjectMeta<object>) = {
            ...(descriptor as IObjectMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attributes,
        };
    }

    if (main.attachedStyles) {
        const attached: [string, [string, string][]][] = JSON.parse(
            main.attachedStyles,
            jsonParseReviver
        );
        const attachedStyles = attached
            .map(([attrName, attrs]) => {
                return { [attrName]: getAttributesMeta(attrs, json) };
            })
            .reduce((acc, item) => {
                return { ...acc, ...item };
            }, {});
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attachedStyles,
        };
    }

    if (main.attachedAttributes) {
        const attached: [string, [string, string][]][] = JSON.parse(
            main.attachedAttributes,
            jsonParseReviver
        );
        const attachedAttributes = attached
            .map(([attrName, attrs]) => {
                return { [attrName]: getAttributesMeta(attrs, json) };
            })
            .reduce((acc, item) => {
                return { ...acc, ...item };
            }, {});
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attachedAttributes,
        };
    }

    if (main.rights || main.rightmode) {
        const access: { rights?: string[]; mode?: number } = {};
        if (!!main.rights) {
            access.rights = JSON.parse(main.rights);
        }

        if (!!main.rightmode) {
            access.mode = Number(main.rightmode);
        }
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            access,
        };
    }

    if (main.feature) {
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            feature: JSON.parse(main.feature),
        };
    }

    if (descriptor.is === MetaClass.widget) {
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            access: {
                rights: main?.rights ? JSON.parse(main.rights) : undefined,
                mode: main.rightmode,
            },
            components: main?.componentUUID ? JSON.parse(main.componentUUID) : undefined,
            feature: main?.feature ? JSON.parse(main.feature) : undefined,
            roles: main?.roles ? JSON.parse(main.roles) : undefined,
            ...createConverterUtils(main),
        };
    }

    return new constructor(descriptor);
}
