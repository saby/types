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
    category,
    group,
    MetaClass,
    Meta,
    ObjectMeta,
    ArrayMeta,
    PromiseMeta,
    FunctionMeta,
    IEditorLoaders,
    IPropertyEditorProps,
    IPropertyEditorLayoutProps,
    ObjectMetaAttributes,
} from './_meta/meta';

export * from './_meta/types';
