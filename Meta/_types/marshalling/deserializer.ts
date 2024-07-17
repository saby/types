import {
    createInfo,
    createEditor,
    createDesignTimeEditor,
    createConverterUtils,
    META_TYPES,
} from './attributes';
import type { TMetaJson, TMetaJsonSingle } from './format';
import { MetaClass, TVariantMeta } from './format';
import { ISerialized, Meta } from '../baseMeta';
import { ArrayMeta, IArrayMeta } from '../array';
import { ObjectMeta, IObjectMeta, IObjectMetaProperties } from '../object';
import { WidgetMeta, IWidgetMeta } from '../widget';
import { FunctionMeta } from '../function';
import { PromiseMeta } from '../promise';
import { VariantMeta } from '../variant';
import { Serializer as TypesSerializer } from 'Types/serializer';
import { RecordSet } from 'Types/collection';
import { deserializeInnerNew, DeserializeError } from './deserializeInnerNew';

export let jsonParseReviver: typeof TypesSerializer.prototype.deserialize;

// type TMetaConstructor = new (descriptor: any) => TVariantMeta;
type TMetaConstructor =
    | typeof Meta
    | typeof ArrayMeta
    | typeof ObjectMeta
    | typeof WidgetMeta
    | typeof PromiseMeta
    | typeof FunctionMeta
    | typeof VariantMeta;
const META_CLASSES = new Map<MetaClass, TMetaConstructor>([
    [MetaClass.primitive, Meta],
    [MetaClass.array, ArrayMeta],
    [MetaClass.object, ObjectMeta],
    [MetaClass.widget, WidgetMeta],
    [MetaClass.promise, PromiseMeta],
    [MetaClass.function, FunctionMeta],
    [MetaClass.variant, VariantMeta],
]);

Meta.fromJSON = function fromJSON(data: ISerialized): unknown {
    return deserialize(data.state);
};

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

function getPropertiesMeta(
    attrs: [string, string][],
    fullJson: TMetaJson,
    newFormat: false = false
): IObjectMetaProperties<object> {
    if (attrs.length === 0) {
        return {};
    }
    return attrs
        .map(([metaId, attrName]) => {
            const itemMeta = findMetaByFull(fullJson, metaId);
            if (!itemMeta) {
                return {};
            }
            return { [newFormat ? metaId : attrName]: itemMeta };
        })
        .reduce((acc, item) => {
            return { ...acc, ...item };
        }, {}) as IObjectMetaProperties<object>;
}

type TIsNewFormat<T> = T extends TMetaJson ? true : false | void;

/**
 * @public
 */
export default function deserialize<T extends TMetaJson | RecordSet = TMetaJson>(
    json: T,
    newFormat?: boolean
): TVariantMeta {
    jsonParseReviver = new TypesSerializer(undefined, false).deserialize;
    if (newFormat) {
        return deserializeInnerNew(json, jsonParseReviver);
    }
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
    const originId = main.originId ? JSON.parse(main.originId, exports.jsonParseReviver) : void 0;
    let descriptor = {
        is: main.is,
        id: main.id,
        fixedId: true,
        inherits: main.inherits,
        required: main.required,
        info: createInfo(main, jsonParseReviver),
        defaultValue: main.defaultValue ? JSON.parse(main.defaultValue, jsonParseReviver) : void 0,
        origin: originId
            ? { meta: findMetaByFull(json, JSON.parse(main.originId).meta), key: originId.key }
            : void 0,
        sampleData: main.sampleData ? JSON.parse(main.sampleData, jsonParseReviver) : void 0,
        editor: createEditor(main.editor, main.editorProps, jsonParseReviver),
        designtimeEditor: createDesignTimeEditor(
            main.designtimeEditor,
            main.designtimeEditorProps,
            main.designEditorAS,
            jsonParseReviver
        ),
    };
    if (descriptor.is === MetaClass.array) {
        // `is`'s type typeguard don't work for enum
        return new constructor(
            main.arrayOf
                ? addArrayFields(descriptor as IArrayMeta<unknown>, main.arrayOf, json)
                : descriptor
        );
    }

    if (main.properties) {
        const targetInJson = json.indexOf(target);
        let newJson = json;
        if (targetInJson > -1) {
            newJson = [...json];
            newJson.splice(targetInJson, 1);
        }
        const properties: IObjectMetaProperties<object> = getPropertiesMeta(
            main.properties,
            newJson
        );
        // `is`'s type typeguard don't work for enum
        (descriptor as IObjectMeta<object>) = {
            ...(descriptor as IObjectMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            properties,
        };
    }

    if (main.attributes) {
        const targetInJson = json.indexOf(target);
        let newJson = json;
        if (targetInJson > -1) {
            newJson = [...json];
            newJson.splice(targetInJson, 1);
        }
        const properties: IObjectMetaProperties<object> = getPropertiesMeta(
            main.attributes,
            newJson
        );
        // `is`'s type typeguard don't work for enum
        (descriptor as IObjectMeta<object>) = {
            ...(descriptor as IObjectMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            properties,
        };
    }

    if (main.attachedStyles) {
        const attached: [string, [string, string][]][] = JSON.parse(
            main.attachedStyles,
            jsonParseReviver
        );
        const attachedStyles = attached
            .map(([attrName, attrs]) => {
                return { [attrName]: getPropertiesMeta(attrs, json) };
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
                return { [attrName]: getPropertiesMeta(attrs, json) };
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
            keywords: main?.keywords ? JSON.parse(main.keywords) : undefined,
            parent: main?.parent ? JSON.parse(main.parent) : undefined,
            ...createConverterUtils(main),
        };
    }

    return new constructor(descriptor);
}

TypesSerializer.setMetaHandler(deserialize, MetaClass);
