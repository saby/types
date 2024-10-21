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
import { createRightMode } from './rightmode';
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

function findMetaByFull(
    fullJson: TMetaJsonSingle[],
    metaId: string
): Meta<unknown> | TVariantMeta | undefined {
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
    fullJson: TMetaJsonSingle[]
): IArrayMeta<unknown, unknown> {
    const itemMeta = findMetaByFull(fullJson, arrayOf) as Meta<unknown>;
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
    fullJson: TMetaJsonSingle[],
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

/**
 * @public
 */
export default function deserialize<T extends TMetaJson | RecordSet = TMetaJson>(
    json: T,
    newFormat?: boolean
): TVariantMeta {
    jsonParseReviver = new TypesSerializer(undefined, false).deserialize;
    if (newFormat) {
        // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
        return deserializeInnerNew(json, jsonParseReviver);
    }
    // @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
    return deserializeInner(json);
}

/**
 * @private
 */
function deserializeInner(json: TMetaJsonSingle[], target?: TMetaJsonSingle): TVariantMeta {
    if (json.length === 0) {
        throw new DeserializeError('Переданы пустота для десереализации');
    }
    const main = target ?? (json[json.length - 1] as TMetaJsonSingle);
    const constructor = META_CLASSES.get(main.is);
    if (!constructor) {
        throw new DeserializeError(`Неизвестный тип метатипа (is) ${main.is}`);
    }
    // @ts-ignore это легаси код, не надо его поведение ломать
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
            ? {
                  meta: findMetaByFull(json, JSON.parse(main.originId as string).meta),
                  key: originId.key,
              }
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
        // @ts-ignore `is`'s type typeguard don't work for enum
        return new constructor(
            main.arrayOf
                ? addArrayFields(descriptor as IArrayMeta<any>, main.arrayOf, json)
                : descriptor
        );
    }

    if (main.properties) {
        const targetInJson = json.indexOf(target as TMetaJsonSingle);
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

    // @ts-ignore легаси апи
    if (main.attributes) {
        const targetInJson = json.indexOf(target as TMetaJsonSingle);
        let newJson = json;
        if (targetInJson > -1) {
            newJson = [...json];
            newJson.splice(targetInJson, 1);
        }
        const properties: IObjectMetaProperties<object> = getPropertiesMeta(
            // @ts-ignore легаси апи
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

    if (main.attachedProperties) {
        const attached: [string, string][] = JSON.parse(main.attachedProperties, jsonParseReviver);
        const attachedProperties = getPropertiesMeta(attached, json);
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attachedProperties,
        };
    }

    if (main.attachedEditors) {
        const attachedEditors = JSON.parse(main.attachedEditors, jsonParseReviver);
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attachedEditors,
        };
    }

    if (main.rights) {
        const access: { rights?: string[]; mode?: number } = {};
        if (!!main.rights) {
            access.rights = JSON.parse(main.rights);
        }

        access.mode = createRightMode(main.rightmode);
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
                mode: createRightMode(main.rightmode),
            },
            components: main?.componentUUID ? JSON.parse(main.componentUUID) : undefined,
            feature: main?.feature ? JSON.parse(main.feature) : undefined,
            roles: main?.roles ? JSON.parse(main.roles) : undefined,
            keywords: main?.keywords ? JSON.parse(main.keywords) : undefined,
            parent: main?.parent ? JSON.parse(main.parent) : undefined,
            ...createConverterUtils(main),
        };
    }
    // @ts-ignore легаси апи
    return new constructor(descriptor);
}
// @ts-ignore из-за 2-х подходов к сериализации нормально это не типизировать
TypesSerializer.setMetaHandler(deserialize, MetaClass);
