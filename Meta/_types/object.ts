/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IEditorLoaders, IMeta, IPropertyEditorHiddenProps } from './baseMeta';
import type {} from './network/loadEditors';
import { Meta, createMetaInfo, MetaClass } from './baseMeta';
import {
    IComponentLoader,
    IComponent,
    IPropertyEditorProps,
    ObjectComponentLoaderWithProps,
} from './components';
import type { IControlDesignerProps } from './design';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';
import { serialize as serializeNew } from './marshalling/serializerNew';
import { App, logger } from 'Application/Env';

export const OBJECT_TYPE_DEFAULT_VALUE = {};

/**
 * Интерфейс мета-описания объекта.
 * @public
 * @see IMeta
 * @see IObjectMetaProperties
 */
export interface IObjectMeta<RuntimeInterface extends object> extends IMeta<RuntimeInterface> {
    /**
     * @deprecated
     * TODO нужно избавляться от is в descriptor. Он нужен только для сериализации
     */
    readonly is: MetaClass.object | MetaClass.widget | MetaClass.page;

    /**
     * Описание атрибутов объекта.
     * @public
     * @see IObjectMetaProperties
     * @deprecated Свойство устарело, вместо него следует использовать properties
     */
    readonly attributes?:
        | ObjectMetaProperties<RuntimeInterface>
        | IObjectMetaProperties<RuntimeInterface>;

    /**
     * Описание атрибутов объекта.
     * @public
     * @see IObjectMetaProperties
     */
    readonly properties?:
        | ObjectMetaProperties<RuntimeInterface>
        | IObjectMetaProperties<RuntimeInterface>;
}

/**
 * Интерфейс мета-описания атрибутов объекта.
 * @remark
 * Требует описать каждый атрибут `RuntimeInterface` через `IMeta`.
 * Допускается указывать `null`, если этот атрибут неважен для конструктора;
 *   поведение аналогично мета-описанию с `info.hidden=true`.
 * @public
 * @see IObjectMeta.properties
 * @see IMeta
 * @see IMeta.hidden
 */
export type IObjectMetaProperties<RuntimeInterface extends object> = {
    [Key in keyof RuntimeInterface]-?: IMeta<RuntimeInterface[Key]>;
};

/**
 * Интерфейс атрибутов объекта.
 * @remark
 * Требует описать каждый атрибут RuntimeInterface через `Meta`.
 * Допускается указывать `null`, если этот атрибут неважен для конструктора;
 *   поведение аналогично типу с `isHidden()`.
 * @public
 * @see IObjectMetaProperties
 * @see IObjectMeta.properties
 * @see IMeta
 * @see IMeta.hidden
 */
export type ObjectMetaProperties<RuntimeInterface extends object> = {
    [Key in keyof RuntimeInterface]-?: Meta<RuntimeInterface[Key]>;
};

type TPropertiesKeys<RuntimeInterface extends object> =
    keyof ObjectMetaProperties<RuntimeInterface>;

/**
 * Класс, реализующий тип "объект".
 * @public
 * @see Meta
 * @see IObjectMeta
 */
export class ObjectMeta<
    T = object,
    RuntimeInterface extends object = T extends object ? T : never,
> extends Meta<RuntimeInterface> {
    /**
     * Атрибуты объекта.
     * @see ObjectMetaProperties
     * @see IObjectMetaProperties
     */
    protected _properties: ObjectMetaProperties<RuntimeInterface>;

    /**
     * Конструктор типа "объект".
     * @param descriptor - Мета-описание объекта.
     * @public
     * @see IObjectMeta
     */
    constructor(descriptor: IObjectMeta<RuntimeInterface> = { is: MetaClass.object }) {
        super(descriptor);
        this._properties = this._createProperties(descriptor.properties || descriptor.attributes);
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
        if (this._editor?.loader || this._editor?.component) {
            Object.entries(this._properties as Record<string, Meta<any> | null>).forEach(
                ([key, value]) => {
                    if (value) {
                        this._properties[key as TPropertiesKeys<RuntimeInterface>] = value.clone({
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
            properties: this._properties,
        };
    }

    /**
     * Преобразует в json для сохранения в сервисе метатипов
     */
    saveMeta(isNewFormat: boolean = false): TMetaJson {
        // проверяем на true, т.к. нативный JSON.stringify вызывает toJSON() с аргументами
        // например JSON.stringify([a, b]), вызовет a.toJSON('0') и b.toJSON('1')
        // @ts-ignore это не описать типами, пока не будет один способ сериалищации
        return isNewFormat === true ? serializeNew(this) : serialize(this);
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
    // @ts-ignore Изменение "неизвестного" RuntimeInterface
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
    // @ts-ignore Изменение "неизвестного" RuntimeInterface
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
     * @see IObjectMetaProperties
     */
    getDefaultValue(): RuntimeInterface | undefined {
        if (this._defaultValue !== undefined) {
            return this._defaultValue;
        }
        const result = {} as RuntimeInterface;
        Object.keys(this._properties).forEach((key) => {
            const value = this._properties[key as TPropertiesKeys<RuntimeInterface>];
            const defaultValue = value?.getDefaultValue();
            if (defaultValue !== undefined) {
                result[key as TPropertiesKeys<RuntimeInterface>] = defaultValue;
            }
        });

        if (Object.keys(result).length === 0) {
            return OBJECT_TYPE_DEFAULT_VALUE as RuntimeInterface;
        }

        return result;
    }

    /**
     * Возвращает типы атрибутов объекта.
     * @public
     * @deprecated Метод устарел, вместо него следует использовать properties()
     */
    attributes(): ObjectMetaProperties<RuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта.
     * @param properties - Атрибуты объекта.
     * @public
     * @deprecated Метод устарел, вместо него следует использовать properties()
     */
    attributes<NewRuntimeInterface extends object>(
        properties: IObjectMeta<NewRuntimeInterface>['properties']
    ): ObjectMeta<NewRuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта или возвращает текущие.
     * @param [properties] - Атрибуты объекта.
     * @public
     * @deprecated Метод устарел, вместо него следует использовать properties()
     */
    attributes<NewRuntimeInterface extends object>(
        properties?: IObjectMeta<NewRuntimeInterface>['properties']
    ): ObjectMeta<NewRuntimeInterface> | ObjectMetaProperties<RuntimeInterface> {
        if (App.getInstance()) {
            logger.error(
                'Meta/types: метод attributes устарел вместо него следует использовать properties'
            );
        }
        if (!arguments.length) {
            return this._properties;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ properties });
    }

    /**
     * Возвращает типы атрибутов объекта.
     * @deprecated Метод устарел, вместо него следует использовать getProperties()
     */
    getAttributes(): ObjectMetaProperties<RuntimeInterface> {
        if (App.getInstance()) {
            logger.error(
                'Meta/types: метод getAttributes устарел вместо него следует использовать getProperties'
            );
        }
        return this._properties;
    }

    /**
     * Возвращает типы атрибутов объекта.
     * @public
     */
    properties(): ObjectMetaProperties<RuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта.
     * @param properties - Атрибуты объекта.
     * @public
     */
    properties<NewRuntimeInterface extends object>(
        properties: IObjectMeta<NewRuntimeInterface>['properties']
    ): ObjectMeta<NewRuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта или возвращает текущие.
     * @param [properties] - Атрибуты объекта.
     * @public
     */
    properties<NewRuntimeInterface extends object>(
        properties?: IObjectMeta<NewRuntimeInterface>['properties']
    ): ObjectMeta<NewRuntimeInterface> | ObjectMetaProperties<RuntimeInterface> {
        if (!arguments.length) {
            return this._properties;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ properties });
    }

    /**
     * Возвращает типы атрибутов объекта.
     */
    getProperties(): ObjectMetaProperties<RuntimeInterface> {
        return this._properties;
    }

    /**
     * Создаёт объект `properties` на базе типа или мета-описания.
     * @param [properties] - Тип или мета-описание атрибутов.
     * @protected
     */
    protected _createProperties(
        properties?:
            | ObjectMetaProperties<RuntimeInterface>
            | IObjectMetaProperties<RuntimeInterface>
    ): ObjectMetaProperties<RuntimeInterface> {
        const result = {} as ObjectMetaProperties<RuntimeInterface>;
        Object.keys(properties || {}).forEach((key) => {
            const value = properties?.[key as TPropertiesKeys<RuntimeInterface>];
            result[key as TPropertiesKeys<RuntimeInterface>] = value ? Meta.meta(value) : null;
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
        ComponentInterface extends object = IPropertyEditorProps<RuntimeInterface>,
    >(
        loader: IComponentLoader<ComponentInterface> | undefined,
        props: any,
        isAlwaysShow: boolean,
        loaderKey: string,
        component?: IComponent<ComponentInterface>
    ): ObjectComponentLoaderWithProps<ComponentInterface, any> {
        return new ObjectComponentLoaderWithProps(
            { loader, props, isAlwaysShow, component },
            this._properties,
            loaderKey === Meta.KEY_EDITOR
                ? (ObjectMeta.getEditorFrom as unknown as (
                      meta: Meta<any>
                  ) => Record<string, IComponentLoader<IPropertyEditorProps<any>>>)
                : ObjectMeta.getDesigntimeEditorFrom
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    private static getDesigntimeEditorFrom(
        meta: Meta<any>
    ): Record<string, IComponentLoader<IPropertyEditorProps<any>>> {
        return meta?.getDesigntimeEditor?.() as unknown as Record<
            string,
            IComponentLoader<IPropertyEditorProps<any>>
        >;
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
