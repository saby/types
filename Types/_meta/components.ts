/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ComponentType, MemoExoticComponent } from 'react';

import type { Meta } from './baseMeta';

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
    readonly loader?: IComponentLoader<ComponentPropsInterface>;

    /**
     * Свойства компонента.
     * @public
     */
    readonly props?: ComponentEditablePropsInterface extends object ? Partial<ComponentEditablePropsInterface> : never;

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
    value: RuntimeInterface;

    /**
     * Функция, через которую редактор сообщает об изменении значения.
     * @param value - Значение, которое в Runtime будет передано в виджет.
     * @see IEditorProps.value
     */
    onChange: (value: RuntimeInterface) => void;
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
 * Упрощённое описание атрибутов объекта.
 * @private
 * @see IObjectMetaAttributes
 */
type IAsyncObjectAttributes = Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    null | undefined | Meta<any>
>;

// Classes

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

    constructor(
        descriptor: IComponentLoaderWithProps<
            ComponentPropsInterface,
            ComponentEditablePropsInterface
        > = {}
    ) {
        this.loader = descriptor.loader;
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
        return Boolean(!this.loader || this.component);
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
            const result: any = await this.loader(value);
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
    protected _attributes?: IAsyncObjectAttributes;

    /**
     * Конструктор асинхронного компонента.
     * @param descriptor
     * @param attributes
     */
    constructor(
        descriptor: IComponentLoaderWithProps<ComponentPropsInterface, PropsInterface> = {},
        attributes: IAsyncObjectAttributes = {},
        private editorGetter: (m: Meta<unknown>) => IEditorLoader
    ) {
        super(descriptor);
        Object.defineProperty(this, '_attributes', {
            value: attributes,
            enumerable: false,
        });
    }

    /**
     * Возвращает мета-описание атрибутов объекта.
     */
    getAttributes(): IAsyncObjectAttributes | undefined {
        return this._attributes;
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
        const attributes = Object.values(this._attributes || {});
        return (
            !attributes.length ||
            attributes.every((meta) => {
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
                Object.values(this._attributes || {}).map((meta) => {
                    if (!meta) {
                        return;
                    }
                    const originEditor = this.editorGetter(meta.getOrigin()?.meta);
                    if (originEditor?.loader && originEditor.component === undefined) {
                        return originEditor.load(value);
                    }
                    return this.editorGetter(meta)?.load(value);
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
