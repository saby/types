/* eslint-disable @typescript-eslint/ban-ts-comment */
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import type { Meta } from '../baseMeta';
import { ConverterUtils } from './format';
import type { TMetaJsonSingle } from './format';
import type { Serializer as TypesSerializer } from 'Types/serializer';
import * as Types from '../types';

export const META_TYPES = new Map<string, Meta<unknown>>([
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

export function createInfo(
    data: TMetaJsonSingle,
    parser: typeof TypesSerializer.prototype.deserialize
) {
    // TODO: удалить
    let group;
    if (data.group === 'Main') {
        group = undefined;
    } else {
        group = data.group ? createGroup(JSON.parse(data.group, parser)) : void 0;
    }
    // TODO: удалить
    if (data.hidden === 'false') {
        data.hidden = false;
    }
    return {
        title: data.title,
        description: data.description,
        icon: data.icon,
        category: data.category,
        group,
        extended: data.extended,
        order: data.order,
        hidden: data.hidden,
        disabled: data.disabled,
    };
}

export function createEditor(
    editor: string | undefined,
    props: string | undefined,
    parser: typeof TypesSerializer.prototype.deserialize
) {
    // TODO: удалить
    if (editor === 'NoneType' || !editor?.includes('/')) {
        editor = undefined;
    }
    const loader = editor ? () => loadAsync(editor) : void 0;
    if (loader && typeof editor === 'string') {
        // @ts-ignore
        loader._moduleName = editor;
    }
    return {
        loader,
        props: props ? JSON.parse(props, parser) : void 0,
    };
}

export function createDesignTimeEditor(
    editor: string | undefined,
    props: string | undefined,
    designEditorAS: boolean | undefined,
    parser: typeof TypesSerializer.prototype.deserialize
) {
    const loaderFn = editor ? () => loadAsync(editor) : void 0;
    if (loaderFn) {
        // @ts-ignore
        loaderFn._moduleName = editor;
    }
    return {
        loader: loaderFn,
        props: props ? { ...JSON.parse(props, parser) } : void 0,
        isAlwaysShow: designEditorAS,
    };
}

interface ConverterUtilsLoaders extends Partial<Record<keyof ConverterUtils, { loader: string }>> {
    valueConverterInput?: { loader: string };
    valueConverterOutput?: { loader: string };
    isValueConvertable?: { loader: string };
}

export function createConverterUtils(json: Record<string, any>): ConverterUtilsLoaders {
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
