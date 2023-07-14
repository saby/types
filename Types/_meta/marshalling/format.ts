import type { IMetaInfo } from '../baseMeta';

export type Mutable<T extends object> = {
    -readonly [K in keyof T]: T[K]
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
}

type MetaInfo = Partial<IMetaInfo>;
type TGroupUid = string;
type TGroupName = string;
type TAttrName = string;
type TMetaId = string;
type TJsonValue<T> = string;
type TInfo = Omit<MetaInfo, 'group'>;

export type TMetaJsonSingle = TInfo & Partial<{
    is: MetaClass,
    id: TMetaId,
    inherits: TMetaId[],
    required: boolean,
    group: TJsonValue<[TGroupUid, TGroupName]>,
    editor: string,
    editorProps: TJsonValue<object>,
    designtimeEditor: string,
    designtimeEditorProps: TJsonValue<object>,
    defaultValue: TJsonValue<unknown>,
    sampleData: TJsonValue<{ i?: string, d?: unknown }>,
    arrayOf: TMetaId,
    attributes: [TMetaId, TAttrName][],
    attachedAttributes: TJsonValue<[TAttrName, [TMetaId, TAttrName][]][]>,
    attachedStyles: TJsonValue<[TAttrName, [TMetaId, TAttrName][]][]>,
}>;

export type TMetaJson = TMetaJsonSingle[];

export const GENERATOR_ID_RANDOM_DELIMITER = '→';