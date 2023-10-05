/**
 * @kaizen_zone 24e2c3ae-d8a2-4113-a7d9-03e243a583d5
 */
/**
 * Библиотека для мета-описания виджетов и их свойств.
 * @library Types/meta
 * @public
 */

export {
    IComponent, // TODO Удалить
    IEditorProps,
    IComponentLoader,
} from './_meta/components';

export {
    Meta,
    MetaClass,
    isMeta,
    IEditorLoaders,
    IPropertyEditorProps,
    IPropertyEditorLayoutProps,
} from './_meta/baseMeta';

export { ArrayMeta } from './_meta/array';
export { PromiseMeta } from './_meta/promise';
export { FunctionMeta } from './_meta/function';
export { VariantMeta } from './_meta/variant';
export { ObjectMeta, ObjectMetaAttributes, OBJECT_TYPE_DEFAULT_VALUE } from './_meta/object';
export { WidgetMeta, RightMode } from './_meta/widget';

export { category, group, extended } from './_meta/meta';

export { UnionType } from './_meta/legacy/union';
export * from './_meta/types';

export { default as deserialize } from './_meta/marshalling/deserializer';
export { default as fetch } from './_meta/network/fetch';

export { findConvertableTypes, convertValueOfMeta, isEqual } from './_meta/conversion/base';
