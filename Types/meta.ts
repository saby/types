/**
 * Библиотека для мета-описания виджетов и их свойств.
 * @library Types/meta
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
export { UnionMeta } from './_meta/union';
export { ObjectMeta, ObjectMetaAttributes } from './_meta/object';
export { WidgetMeta } from './_meta/widget';

export { category, group } from './_meta/meta';

export * from './_meta/types';
