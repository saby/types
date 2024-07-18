/**
 * @kaizen_zone 24e2c3ae-d8a2-4113-a7d9-03e243a583d5
 */
/**
 * Библиотека для мета-описания виджетов и их свойств.
 * @library Meta/types
 * @public
 */

export {
    IComponent, // TODO Удалить
    IComponentLoader,
    IEditorProps,
    IPropertyEditorProps,
} from './_types/components';

export {
    Meta,
    MetaClass,
    isMeta,
    IEditorLoaders,
    IPropertyEditorLayoutProps,
    isBaseWidget,
} from './_types/baseMeta';

export { ArrayMeta } from './_types/array';
export { PromiseMeta } from './_types/promise';
export { FunctionMeta } from './_types/function';
export { VariantMeta } from './_types/variant';
export { ObjectMeta, ObjectMetaAttributes, OBJECT_TYPE_DEFAULT_VALUE } from './_types/object';
export { WidgetMeta, RightMode } from './_types/widget';
export { PageMeta } from './_types/page';

export { category, group, extended } from './_types/meta';

export { UnionType } from './_types/legacy/union';
export * from './_types/types';

export { default as deserialize } from './_types/marshalling/deserializer';
export { default as fetch, metaFetchAll as fetchAll } from './_types/network/fetch';
export { default as loadEditors, getComponent } from './_types/network/loadEditors';

export {
    ValueConverterOutputType,
    ValueConverterInputType,
    BROKEN_FUNC,
    ValueConverter,
    ConversionContent,
} from './_types/valueConverter';
