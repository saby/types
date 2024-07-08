/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component, ComponentType, MemoExoticComponent } from 'react';
import { logger } from 'Application/Env';
import { loadAsync } from 'WasabyLoader/ModulesLoader';

import type { Meta } from './baseMeta';

const BROKEN_EDITOR = null;

/**
 * Интерфейс React-компонента виджета.
 * @private
 */
export type IComponent<PropsRuntimeInterface> =
    | Component<PropsRuntimeInterface>
    | ComponentType<PropsRuntimeInterface>
    | MemoExoticComponent<ComponentType<PropsRuntimeInterface>>;

/**
 * Интерфейс загрузчика React-компонента.
 * @public
 */
export type IComponentLoader<ComponentPropsInterface extends object = object> = (
    value: unknown
) => Promise<
    IComponent<ComponentPropsInterface> | { default: IComponent<ComponentPropsInterface> }
>;

/**
 * Интерфейс загрузчика React-компонента и свойств для него.
 * @public
 */
export interface IComponentLoaderWithProps<
    ComponentPropsInterface extends object,
    ComponentEditablePropsInterface extends object | void = void
> {
    /**
     * Ссылка на загрузчик компонента.
     * @public
     */
    readonly loader?: IComponentLoader<ComponentPropsInterface> | string;

    /**
     * Свойства компонента.
     * @public
     */
    readonly props?: ComponentEditablePropsInterface extends object
        ? Partial<ComponentEditablePropsInterface>
        : never;

    /**
     * Всегда отображать designtimeEditor
     */
    readonly isAlwaysShow?: boolean;

    /**
     * Редактор типа - React-компонент.
     * @public
     * @see ComponentLoaderWithProps.load
     */
    readonly component?: IComponent<ComponentPropsInterface>;
}

/**
 * Интерфейс свойств любого редактора (React-компонента).
 * @public
 */
export interface IEditorProps<RuntimeInterface> {
    /**
     * Значение, которое позже в Runtime будет передано в виджет.
     * @remark
     * Значение может быть любым,
     * главное - обеспечить сериализацию в DesignTime и десериализацию этого значения в Runtime.
     * @see IEditorProps.onChange
     */
    value?: RuntimeInterface;

    /**
     * Функция, через которую редактор сообщает об изменении значения.
     * @param value - Значение, которое в Runtime будет передано в виджет.
     * @see IEditorProps.value
     */
    onChange?: (value: RuntimeInterface) => void;
}

/**
 * Упрощённый интерфейс загрузчика редактора.
 * @private
 * @see ComponentLoaderWithProps
 */
interface IEditorLoader {
    ready: boolean;
    component?: any;
    loader?: (value: unknown) => Promise<any>;
    load: (value?: unknown) => Promise<any>;
}

/**
 * Интерфейс общих свойств для редактора и его раскладки.
 * @private
 */
export interface IPropertyEditorCommonProps {
    /**
     * Ссылка на иконку для редактора.
     */
    icon?: string;

    /**
     * Название редактора.
     */
    title?: string;

    /**
     * Детальное описание редактора.
     */
    description?: string;

    /**
     * Обязательно ли значение.
     */
    required?: boolean;

    /**
     * Признак недоступности свойства для редактирования.
     */
    disabled?: boolean;
}

/**
 * Интерфейс свойств редактора типа (React-компонента).
 * @public
 */
export interface IPropertyEditorProps<RuntimeInterface>
    extends IEditorProps<RuntimeInterface>,
        IPropertyEditorCommonProps {
    /**
     * Тип свойства.
     * @deprecated Используйте metaType.
     */
    type?: Meta<RuntimeInterface>;

    /**
     * Тип свойства.
     */
    metaType?: Meta<RuntimeInterface>;

    /**
     * Название свойства в объекте (ключ свойства).
     */
    name?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ILoadedEditor = Record<string, IComponent<IPropertyEditorProps<any>>>;

/**
 * Упрощённое описание атрибутов объекта.
 * @private
 * @see IObjectMetaProperties
 */
type IAsyncObjectProperties = Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    null | undefined | Meta<any>
>;

/**
 * Класс, реализующий асинхронный компонент.
 * @public
 * @see IComponentLoaderWithProps
 */
export class ComponentLoaderWithProps<
    ComponentPropsInterface extends object,
    ComponentEditablePropsInterface extends object | void = void
> implements
        IEditorLoader,
        IComponentLoaderWithProps<ComponentPropsInterface, ComponentEditablePropsInterface>
{
    /**
     * Ссылка на загрузчик редактора типа.
     * @public
     * @see ComponentLoaderWithProps.load
     */
    readonly loader?: IComponentLoader<ComponentPropsInterface>;

    /**
     * Параметры для редактора типа.
     * @public
     */
    readonly props?: ComponentEditablePropsInterface extends object
        ? Partial<ComponentEditablePropsInterface>
        : never;

    /**
     * Всегда ли показывать на поверх стекла
     */
    readonly isAlwaysShow?: boolean;

    /**
     * Редактор типа - React-компонент.
     * @public
     * @see ComponentLoaderWithProps.load
     */
    readonly component?: IComponent<ComponentPropsInterface>;

    readonly _moduleName?: string;

    constructor(
        descriptor: IComponentLoaderWithProps<
            ComponentPropsInterface,
            ComponentEditablePropsInterface
        > = {}
    ) {
        const loader = descriptor.loader;
        // eslint-disable-next-line max-len
        let newLoader: IComponentLoader<ComponentPropsInterface> =
            loader as IComponentLoader<ComponentPropsInterface>;
        if (typeof loader === 'string') {
            newLoader = () => loadAsync(loader);
            // TODO https://dev.sbis.ru/opendoc.html?guid=bcf2d977-599e-46d5-b532-1a2a9540df8a&client=3
            // @ts-ignore hotfix для серилизации.
            newLoader._moduleName = loader;
        }

        this.loader = newLoader;
        this.props = descriptor.props;
        this.isAlwaysShow = descriptor.isAlwaysShow;
        this.component = descriptor.component;
    }

    /**
     * Загружен ли компонент.
     * @public
     * @returns {boolean}
     * @see ComponentLoaderWithProps.load
     */
    get ready(): boolean {
        return Boolean(!this.loader || this.component || this.component === BROKEN_EDITOR);
    }

    /**
     * Загружает компонент.
     * @returns {Promise}
     * @public
     * @see ComponentLoaderWithProps.loader
     * @see ComponentLoaderWithProps.ready
     */
    async load(value?: unknown): Promise<IComponent<ComponentPropsInterface>> {
        if (this.loader && this.component === undefined) {
            (this as any).component = null; // Предотвращаем повторные вызовы load
            let result: any;
            try {
                result = await this.loader(value);
            } catch (e: unknown) {
                const err = e as { requireModules?: string[]; message?: string };
                logger.error(
                    'Meta/types: Ошибка загрузчика компонента редактора: ',
                    err.requireModules || err.message
                );
            }

            if (isReactComponent(result)) {
                (this as any).component = result;
            } else if (typeof result === 'object' && isReactComponent(result?.default)) {
                (this as any).component = result.default;
            } else {
                throw new Error('Неверный компонент');
            }
        }
        return this.component;
    }
}

/**
 * Класс, реализующий асинхронный компонент, у которого есть вложенные атрибуты с редакторами.
 * @public
 * @see ComponentLoaderWithProps
 */
export class ObjectComponentLoaderWithProps<
    ComponentPropsInterface extends object,
    PropsInterface extends object | void = void
> extends ComponentLoaderWithProps<ComponentPropsInterface, PropsInterface> {
    /**
     * Упрощённое описание атрибутов объекта.
     * @remark
     * Не сериализуется.
     * @protected
     */
    protected _properties?: IAsyncObjectProperties;

    /**
     * Конструктор асинхронного компонента.
     * @param descriptor
     * @param properties
     */
    constructor(
        descriptor: IComponentLoaderWithProps<ComponentPropsInterface, PropsInterface> = {},
        properties: IAsyncObjectProperties = {},
        private editorGetter: (m: Meta<unknown>) => IEditorLoader
    ) {
        super(descriptor);
        Object.defineProperty(this, '_properties', {
            value: properties,
            enumerable: false,
        });
    }

    /**
     * Возвращает мета-описание атрибутов объекта.
     * @deprecated Метод устарел, вместо него следует использовать getProperties()
     */
    getAttributes(): IAsyncObjectProperties | undefined {
        return this._properties;
    }

    /**
     * Возвращает мета-описание атрибутов объекта.
     */
    getProperties(): IAsyncObjectProperties | undefined {
        return this._properties;
    }

    /**
     * Загружены ли все компоненты.
     * @returns {boolean}
     * @public
     * @see ObjectComponentLoaderWithProps.load
     */
    get ready(): boolean {
        if (this.loader) {
            return Boolean(this.component);
        }
        const properties = Object.values(this._properties || {});
        return (
            !properties.length ||
            properties.every((meta) => {
                if (!meta) {
                    return true;
                }
                const originEditor = this.editorGetter(meta.getOrigin()?.meta);
                if (originEditor?.loader || originEditor?.component) {
                    return originEditor.ready;
                }
                const editor = this.editorGetter(meta);
                return !editor || editor.ready;
            })
        );
    }

    /**
     * Загружает свой компонент и все вложенные.
     * @returns {Promise}
     * @public
     * @see ObjectComponentLoaderWithProps.ready
     * @see ComponentLoaderWithProps.load
     */
    async load(value?: unknown): Promise<IComponent<ComponentPropsInterface>> {
        if (!this.ready) {
            if (this.loader) {
                return super.load(value);
            }
            await Promise.all(
                Object.values(this._properties || {}).map(async (meta) => {
                    if (!meta) {
                        return;
                    }
                    const originEditor = this.editorGetter(meta.getOrigin()?.meta);
                    if (originEditor?.loader && originEditor.component === undefined) {
                        return originEditor.load(value);
                    }
                    try {
                        return await this.editorGetter(meta)?.load(value);
                    } catch (e) {
                        logger.error('Meta/types: Редактор был пропущен из-за ошибки загрузки');
                        return BROKEN_EDITOR;
                    }
                })
            );
        }
        return this.component;
    }
}

/**
 * Определяет, является ли `component` React-компонентом.
 * @param component - Всё, что угодно.
 * @private
 */
function isReactComponent(component: any): boolean {
    return Boolean(component) && (isFunctionComponent(component) || isClassComponent(component));
}

/**
 * Определяет, является ли `component` функциональным React-компонентом.
 * @param component - Всё, что угодно.
 * @private
 */
function isFunctionComponent(component: any): boolean {
    return (
        typeof component === 'function' ||
        (typeof component === 'object' && typeof component.$$typeof === 'symbol')
    );
}

/**
 * Определяет, является ли `component` классовым React-компонентом.
 * @param component - Всё, что угодно.
 * @private
 */
function isClassComponent(component: any): boolean {
    return typeof component === 'function' && !!component.prototype?.isReactComponent;
}

/**
 * Временный загрузчик для переходного периода, когда editor станет строкой
 */
export class TmpMetaEditor implements IMetaEditor {
    loader: Function;

    constructor(
        loader: string | Function,
        public props?: object,
        public component?: Component,
        public _moduleName?: string
    ) {
        if (typeof loader === 'string') {
            this.loader = () => loadAsync(loader);
            // @ts-ignore
            this.loader._moduleName = loader;
        } else {
            this.loader = loader;
        }
    }

    isSame(value: string | Function): boolean {
        if (typeof value === 'string') {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            return this.loader?._moduleName === value;
        }
        return this.loader === value;
    }

    getName(): string {
        return this._moduleName as string;
    }

    async load(): Promise<IComponent<unknown>> {
        if (!this.loader) {
            return (this.component = BROKEN_EDITOR);
        }
        return this.loader?.().then((result) => {
            if (isReactComponent(result)) {
                (this as any).component = result;
            } else if (typeof result === 'object' && isReactComponent(result?.default)) {
                (this as any).component = result.default;
            } else {
                (this as any).component = BROKEN_EDITOR;
                throw new Error('Неверный компонент');
            }

            return this.component;
        });
    }

    get ready(): boolean {
        return !!this.component || this.component === BROKEN_EDITOR;
    }
}

export interface IMetaEditor {
    load(): Promise<IComponent<unknown>>;
    ready: boolean;
    component?: Component;
    getName?: () => string;
    _moduleName?: string;
}
