import type { IMetaInfo, Meta } from '../baseMeta';
import type { ArrayMeta } from '../array';
import type { VariantMeta } from '../variant';
import type { WidgetMeta } from '../widget';
import type { ObjectMeta } from '../object';
import type { FunctionMeta } from '../function';
import type { PromiseMeta } from '../promise';
import type { PageMeta } from '../page';

export type Mutable<T extends object> = {
    -readonly [K in keyof T]: T[K];
};

/**
 * Указатель на то, каким классом конструировать тип.
 */
export enum MetaClass {
    widget = 'widget',
    primitive = 'primitive',
    object = 'object',
    array = 'array',
    promise = 'promise',
    function = 'function',
    union = 'union',
    variant = 'variant',
    page = 'page',
    rpc = 'rpc',
}

export type ConverterUtils = {
    valueConverterInput?: string;
    valueConverterOutput?: string;
    isValueConvertable?: string;
};

type MetaInfo = Partial<IMetaInfo>;
type TGroupUid = string;
type TGroupName = string;
type TPropName = string;
type TMetaId = string;
type TJsonValue<T> = string;
type TInfo = Omit<MetaInfo, 'group'>;

export type TMetaJsonSingle = TInfo & { is: MetaClass } & Partial<
        {
            id: TMetaId;
            inherits: TMetaId[];
            required: boolean;
            group: TJsonValue<[TGroupUid, TGroupName]>;
            editor: string;
            editorProps: TJsonValue<object>;
            designtimeEditor: string;
            designtimeEditorProps: TJsonValue<object>;
            defaultValue: TJsonValue<unknown>;
            sampleData: TJsonValue<{ importPath?: string; data?: unknown }>;
            arrayOf: TMetaId;
            invariant: string;
            of: TJsonValue<[TMetaId, TPropName][]>;
            properties: [TMetaId, TPropName][];
            attachedProperties: TJsonValue<[TPropName, [TMetaId, TPropName][]][]>;
            attachedStyles: TJsonValue<[TPropName, [TMetaId, TPropName][]][]>;
            attachedEditors: TJsonValue<[TPropName, [TMetaId, TPropName][]][]>;
            rights: string;
            rightmode: number;
            componentUUID: TJsonValue<string[]>;
            feature: string;
            roles: TJsonValue<string[]>;
            keywords: TJsonValue<string[]>;
            parent: string;
            designEditorAS: boolean;
        } & ConverterUtils
    >;

export type TMetaJsonNewSingle = {
    properties: IMetaJsonNewProperties[];
    metaattributes?: TAttributes;
    metatype?: MetaClass;
    id?: TMetaId;
    inherits?: string[];
};

export interface IMetaJsonNewProperties {
    type: string;
    metaattributes?: TAttributes;
    isarray?: boolean;
    name?: string;
}

type TAttributes = TInfo &
    Partial<
        {
            inherits: TMetaId[];
            required: boolean;
            group: TJsonValue<[TGroupUid, TGroupName]>;
            editor: string;
            editorProps: TJsonValue<object>;
            designtimeEditor: string;
            designtimeEditorProps: TJsonValue<object>;
            defaultValue: TJsonValue<unknown>;
            sampleData: TJsonValue<{ i?: string; d?: unknown }>;
            arrayOf: TMetaId;
            invariant: string;
            of: TJsonValue<[TMetaId, TPropName][]>;
            properties: [TMetaId, TPropName][];
            attachedProperties: TJsonValue<[TPropName, [TMetaId, TPropName][]][]>;
            attachedStyles: TJsonValue<[TPropName, [TMetaId, TPropName][]][]>;
            attachedEditors: TJsonValue<[TPropName, [TMetaId, TPropName][]][]>;
            rights: string;
            rightmode: number;
            componentUUID: TJsonValue<string[]>;
            feature: string;
            roles: TJsonValue<string[]>;
        } & ConverterUtils
    >;

export type TMetaJson = TMetaJsonSingle[] | TMetaJsonNewSingle[];

export type TVariantMeta =
    | Meta<unknown>
    | ObjectMeta<unknown>
    | ArrayMeta<unknown>
    | WidgetMeta<unknown>
    | VariantMeta<Record<string, object>>
    | FunctionMeta<() => unknown, unknown>
    | PromiseMeta<Promise<unknown>>
    | PageMeta<unknown>;

export const GENERATOR_ID_RANDOM_DELIMITER = '→';
