/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    IEditorLoaders,
    IMeta,
    IPropertyEditorProps,
    IPropertyEditorHiddenProps,
} from './baseMeta';
import { Meta, createMetaInfo, MetaClass } from './baseMeta';
import { IComponentLoader, ObjectComponentLoaderWithProps } from './components';
import type { IControlDesignerProps } from './design';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';


/**
 * Интерфейс мета-описания объекта.
 * @public
 * @see IMeta
 * @see IObjectMetaAttributes
 */
export interface IObjectMeta<RuntimeInterface extends object> extends IMeta<RuntimeInterface> {
    /**
     * @deprecated
     * TODO нужно избавляться от is в descriptor. Он нужен только для сериализации
     */
    readonly is: MetaClass.object | MetaClass.widget;

    /**
     * Описание атрибутов объекта.
     * @public
     * @see IObjectMetaAttributes
     */
    readonly attributes?:
        | ObjectMetaAttributes<RuntimeInterface>
        | IObjectMetaAttributes<RuntimeInterface>;
}

/**
 * Интерфейс мета-описания атрибутов объекта.
 * @remark
 * Требует описать каждый атрибут `RuntimeInterface` через `IMeta`.
 * Допускается указывать `null`, если этот атрибут неважен для конструктора;
 *   поведение аналогично мета-описанию с `info.hidden=true`.
 * @public
 * @see IObjectMeta.attributes
 * @see IMeta
 * @see IMeta.hidden
 */
export type IObjectMetaAttributes<RuntimeInterface extends object> = {
    [Key in keyof RuntimeInterface]-?: IMeta<RuntimeInterface[Key]> | null;
};

/**
 * Интерфейс атрибутов объекта.п
 * @remark
 * Требует описать каждый атрибут RuntimeInterface через `Meta`.
 * Допускается указывать `null`, если этот атрибут неважен для конструктора;
 *   поведение аналогично типу с `isHidden()`.
 * @public
 * @see IObjectMetaAttributes
 * @see IObjectMeta.attributes
 * @see IMeta
 * @see IMeta.hidden
 */
export type ObjectMetaAttributes<RuntimeInterface extends object> = {
    [Key in keyof RuntimeInterface]-?: Meta<RuntimeInterface[Key]> | null;
};

/**
 * Класс, реализующий тип "объект".
 * @public
 * @see Meta
 * @see IObjectMeta
 */
export class ObjectMeta<T = object,
    RuntimeInterface extends object = T extends object ? T : never
> extends Meta<RuntimeInterface> {
    /**
     * Атрибуты объекта.
     * @see ObjectMetaAttributes
     * @see IObjectMetaAttributes
     */
    protected _attributes: ObjectMetaAttributes<RuntimeInterface>;

    /**
     * Конструктор типа "объект".
     * @param descriptor - Мета-описание объекта.
     * @public
     * @see IObjectMeta
     */
    constructor(descriptor: IObjectMeta<RuntimeInterface> = { is: MetaClass.object }) {
        super(descriptor);
        this._attributes = this._createAttributes(descriptor.attributes);
        this._propsEditor = this._createEditor<IPropertyEditorProps<RuntimeInterface>>(
            descriptor,
            Meta.KEY_EDITOR
        );
        this._designtimeEditor = this._createEditor<IControlDesignerProps<RuntimeInterface>>(
            descriptor,
            Meta.KEY_DESIGNTIME_EDITOR
        );
        this._info = createMetaInfo(descriptor.info);

        // Подменяем `origin` у всех атрибутов на текущий тип.
        // Это позволит при отрисовке редактора типа использовать редактор из `origin` с привязкой атрибутов
        // из оригинального типа к атрибутам в текущем объекте.
        // Важно: создаются циклические ссылки, использование JSON.stringify() становится невозможным.
        // TODO Реализовать собственную логику сериализации
        if (this._propsEditor?.loader || this._propsEditor?.component) {
            Object.entries(this._attributes as Record<string, Meta<any> | null>).forEach(
                ([key, value]) => {
                    if (value) {
                        this._attributes[key] = value.clone({
                            origin: { meta: this, key },
                        });
                    }
                }
            );
        }
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IObjectMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.object,
            attributes: this._attributes,
        };
    }

    toJSON(): TMetaJson {
        return serialize(this);
    }

    /**
     * Возвращает информацию о редакторе.
     * @public
     * @see Meta.editor
     */
    getDesigntimeEditor(
        defaultEditorLoaders?: IEditorLoaders
    ): ObjectComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    > {
        return super.getDesigntimeEditor(defaultEditorLoaders) as any;
    }

    /**
     * Помечает тип обязательным для заполнения.
     * @remark
     * Перегрузка в `ObjectMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ObjectMeta.required
     * @see ObjectMeta.optional
     */
    required(): ObjectMeta<Exclude<RuntimeInterface, undefined>> {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным для заполнения.
     * @remark
     * Перегрузка в `ObjectMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ObjectMeta.required
     * @see ObjectMeta.optional
     */
    optional(): ObjectMeta<RuntimeInterface | undefined> {
        return super.optional() as any;
    }

    /**
     * Возвращает значение по-умолчанию.
     * @remark
     * Если у мета-описания не указано собственное значение `defaultValue`,
     * оно рассчитывается на основе `getDefaultValue` всех атрибутов объекта.
     * @public
     * @see IObjectMeta.defaultValue
     * @see ObjectMeta.defaultValue
     * @see IObjectMetaAttributes
     */
    getDefaultValue(): RuntimeInterface | undefined {
        if (this._defaultValue !== undefined) {
            return this._defaultValue;
        }
        const result: any = {};
        Object.keys(this._attributes).forEach((key) => {
            const value = this._attributes[key];
            const defaultValue = value?.getDefaultValue();
            if (defaultValue !== undefined) {
                result[key] = defaultValue;
            }
        });

        return result;
    }

    /**
     * Возвращает типы атрибутов объекта.
     * @public
     */
    attributes(): ObjectMetaAttributes<RuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта.
     * @param attributes - Атрибуты объекта.
     * @public
     */
    attributes<NewRuntimeInterface extends object>(
        attributes: IObjectMeta<NewRuntimeInterface>['attributes']
    ): ObjectMeta<NewRuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта или возвращает текущие.
     * @param [attributes] - Атрибуты объекта.
     * @public
     */
    attributes<NewRuntimeInterface extends object>(
        attributes?: IObjectMeta<NewRuntimeInterface>['attributes']
    ): ObjectMeta<NewRuntimeInterface> | ObjectMetaAttributes<RuntimeInterface> {
        if (!arguments.length) {
            return this._attributes;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attributes });
    }

    /**
     * Возвращает типы атрибутов объекта.
     */
    getAttributes(): ObjectMetaAttributes<RuntimeInterface> {
        return this._attributes;
    }

    /**
     * Создаёт объект `attributes` на базе типа или мета-описания.
     * @param [attributes] - Тип или мета-описание атрибутов.
     * @protected
     */
    protected _createAttributes(
        attributes?:
            | ObjectMetaAttributes<RuntimeInterface>
            | IObjectMetaAttributes<RuntimeInterface>
    ): ObjectMetaAttributes<RuntimeInterface> {
        const result = {} as ObjectMetaAttributes<RuntimeInterface>;
        Object.keys(attributes || {}).forEach((key) => {
            const value = attributes?.[key];
            result[key] = value ? Meta.meta(value) : null;
        });
        return result;
    }

    /**
     * Создаёт экземпляр класса `ObjectComponentLoaderWithProps`.
     * @param [loader] - Описание загрузчика компонента.
     * @param [props] - Параметры для компонента.
     * @protected
     */
    protected _createComponentLoader<
        ComponentInterface extends object = IPropertyEditorProps<RuntimeInterface>
    >(
        loader: IComponentLoader<ComponentInterface> | undefined,
        props: any,
        isAlwaysShow: boolean,
        loaderKey: string
    ): ObjectComponentLoaderWithProps<ComponentInterface, any> {
        return new ObjectComponentLoaderWithProps(
            { loader, props, isAlwaysShow },
            this._attributes,
            loaderKey === Meta.KEY_EDITOR
                ? ObjectMeta.getEditorFrom
                : ObjectMeta.getDesigntimeEditorFrom
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    private static getDesigntimeEditorFrom(meta: Meta<unknown>) {
        return meta?.getDesigntimeEditor?.();
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    private static getEditorFrom(meta: Meta<unknown>) {
        return meta?.getEditor?.();
    }
}

/**
 * Определяет, что аргумент - это мета-описание объекта.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isObjectMetaDescriptor<RuntimeInterface extends object>(
    descriptor: any
): descriptor is IObjectMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.object;
}

Meta.registerChildMeta(ObjectMeta, isObjectMetaDescriptor);
