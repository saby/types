/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TMetaJson, TMetaJsonSingle } from './format';
import { MetaClass, TVariantMeta } from './format';
import { Meta } from '../baseMeta';
import { ArrayMeta, IArrayMeta } from '../array';
import { ObjectMeta, IObjectMeta, IObjectMetaAttributes } from '../object';
import { WidgetMeta, IWidgetMeta } from '../widget';
import { FunctionMeta } from '../function';
import { PromiseMeta } from '../promise';
import { VariantMeta } from '../variant';


class DeserializeError extends Error { }

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

function createGroup(data: [string, string] | void) {
    if (!data) {
        return;
    }
    return {
        uid: data[0],
        name: data[1]
    };
}

function createInfo(data: TMetaJsonSingle) {
    return {
        title: data.title,
        description: data.description,
        icon: data.icon,
        category: data.category,
        group: data.group ? createGroup(JSON.parse(data.group)) : void 0,
        extended: data.extended,
        order: data.order,
        hidden: data.hidden,
        disabled: data.disabled,
    };
}

function createEditor(editor: string | undefined, props: string | undefined) {
    return {
        loader: editor ? () => import(editor) : void 0,
        props: props ? JSON.parse(props) : void 0
    };
}

function addArrayFields(
    refDescriptor: IArrayMeta<unknown, unknown>,
    arrayOf: string, fullJson: TMetaJson): IArrayMeta<unknown, unknown> {

    const itemJson = fullJson.find((item) => item.id === arrayOf);
    return {
        arrayOf: deserialize(fullJson, itemJson),
        ...refDescriptor
    };
}

function getAttributesMeta(attrs: [string, string][], fullJson: TMetaJson): IObjectMetaAttributes<object> {
    if (attrs.length === 0) {
        return {};
    }
    return attrs.map(([metaId, attrName]) => {
        const itemJson = fullJson.find((item) => item.id === metaId);
        return { [attrName]: deserialize(fullJson, itemJson) };
    }).reduce((acc, item) => {
        return { ...acc, ...item };
    }, {}) as IObjectMetaAttributes<object>;
}

export default function deserialize(json: TMetaJson, target?: TMetaJsonSingle): TVariantMeta {
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
        defaultValue: main.defaultValue ? JSON.parse(main.defaultValue) : void 0,
        sampleData: main.sampleData ? JSON.parse(main.sampleData) : void 0,
        editor: createEditor(main.editor, main.editorProps),
        designtimeEditor: createEditor(main.designtimeEditor, main.designtimeEditorProps)
    };
    if (descriptor.is === MetaClass.array) {
        // `is`'s type typeguard don't work for enum
        return new constructor(
            main.arrayOf ?
                addArrayFields(descriptor as IArrayMeta<unknown>, main.arrayOf, json) :
                descriptor);
    }

    if (main.attributes) {
        const attributes: IObjectMetaAttributes<object> = getAttributesMeta(main.attributes, json);
        // `is`'s type typeguard don't work for enum
        (descriptor as IObjectMeta<object>) = {
            ...(descriptor as IObjectMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attributes
        };
    }

    if (main.attachedStyles) {
        const attached: [string, [string, string][]][] = JSON.parse(main.attachedStyles);
        const attachedStyles = attached.map(([attrName, attrs]) => {
            return { [attrName]: getAttributesMeta(attrs, json) };
        }).reduce((acc, item) => {
            return { ...acc, ...item };
        }, {});
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attachedStyles
        };
    }

    if (main.attachedAttributes) {
        const attached: [string, [string, string][]][] = JSON.parse(main.attachedAttributes);
        const attachedAttributes = attached.map(([attrName, attrs]) => {
            return { [attrName]: getAttributesMeta(attrs, json) };
        }).reduce((acc, item) => {
            return { ...acc, ...item };
        }, {});
        // `is`'s type typeguard don't work for enum
        (descriptor as IWidgetMeta<object>) = {
            ...(descriptor as IWidgetMeta<object>),
            // @ts-ignore не понимаю, почему он интерфейс превратил в object
            attachedAttributes
        };
    }

    return new constructor(descriptor);
}
