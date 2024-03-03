import type { IMetaInfo, Meta } from '../baseMeta';
import type { ArrayMeta } from '../array';
import type { ObjectMeta } from '../object';
import type { WidgetMeta } from '../widget';
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
}

export type ConverterUtils = {
    valueConverterInput?: string;
    valueConverterOutput?: string;
    isValueConvertable?: string;
};

type MetaInfo = Partial<IMetaInfo>;
type TGroupUid = string;
type TGroupName = string;
type TAttrName = string;
type TMetaId = string;
type TJsonValue<T> = string;
type TInfo = Omit<MetaInfo, 'group'>;

export type TMetaJsonSingle = TInfo &
    Partial<
        {
            is: MetaClass;
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
            of: TJsonValue<[TMetaId, TAttrName][]>;
            attributes: [TMetaId, TAttrName][];
            attachedAttributes: TJsonValue<[TAttrName, [TMetaId, TAttrName][]][]>;
            attachedStyles: TJsonValue<[TAttrName, [TMetaId, TAttrName][]][]>;
            rights: string;
            rightmode: number;
            componentUUID: TJsonValue<string[]>;
            feature: string;
            roles: TJsonValue<string[]>;
            keywords: TJsonValue<string[]>;
            designEditorAS: boolean;
        } & ConverterUtils
    >;

export type TMetaJson = TMetaJsonSingle[];

export type TVariantMeta =
    | Meta<unknown>
    | ArrayMeta<unknown>
    | ObjectMeta<unknown>
    | WidgetMeta<unknown>
    | PageMeta<unknown>;

export const GENERATOR_ID_RANDOM_DELIMITER = '→';
