import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';
import { ObjectMeta } from './object';
import type { IObjectMetaAttributes, ObjectMetaAttributes } from './object';


/**
 * Варианты проверки прав доступа.
 * @public
 */
export enum RightMode {
    any = 0,
    anyNested = 1,
    all = 10,
    allNested = 11,
}

/**
 * Правила проверки прав доступа, необходимых для работы виджета.
 * @public
 * @see WidgetMeta.access
 */
export interface IWidgetMetaAccess {
    /**
     * Список зон доступа, необходимых для работы виджета.
     * @public
     * @see IWidgetMetaAccess.mode
     */
    readonly rights?: string[];

    /**
     * Правила проверки прав доступа.
     * @default RightMode.any
     * @public
     * @see IWidgetMetaAccess.rights
     */
    readonly mode?: RightMode;
}

/**
 * Описание виджета.
 * @public
 * @see WidgetMeta
 */
export interface IWidgetMeta<ComponentPropsInterface extends object>
    extends IMeta<ComponentPropsInterface> {
    is: MetaClass.widget;

    /**
     * Правила проверки прав доступа, необходимых для работы виджета.
     * @public
     * @see IWidgetMetaAccess
     */
    readonly access?: IWidgetMetaAccess;

    /**
     * Описание свойств виджета.
     * @public
     */
    readonly attributes?:
    | ObjectMetaAttributes<ComponentPropsInterface>
    | IObjectMetaAttributes<ComponentPropsInterface>;
}

/**
 * Класс, реализующий тип "виджет".
 * @public
 * @see ObjectMeta
 */
export class WidgetMeta<
    ComponentPropsInterface extends object
> extends ObjectMeta<ComponentPropsInterface> {
    /**
     * Правила проверки прав доступа, необходимых для работы виджета.
     */
    protected _access: IWidgetMetaAccess;

    /**
     * Конструктор типа "виджет".
     * @param descriptor - Мета-описание виджета.
     */
    constructor(
        descriptor: IWidgetMeta<ComponentPropsInterface> = {
            is: MetaClass.widget,
        }
    ) {
        super(descriptor as any);
        this._access = {
            rights: descriptor.access?.rights,
            mode: descriptor.access?.mode ?? RightMode.any,
        };
    }

    /**
     * Возвращает типы свойств виджета.
     * @public
     */
    attributes(): ObjectMetaAttributes<ComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета.
     * @param attributes - Атрибуты объекта.
     * @public
     */
    attributes<NewComponentPropsInterface extends object>(
        attributes: IWidgetMeta<NewComponentPropsInterface>['attributes']
    ): WidgetMeta<NewComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета или возвращает текущие.
     * @param [attributes] - Атрибуты объекта.
     * @public
     */
    attributes<NewComponentPropsInterface extends object>(
        attributes?: IWidgetMeta<NewComponentPropsInterface>['attributes']
    ): WidgetMeta<NewComponentPropsInterface> |
        ObjectMetaAttributes<ComponentPropsInterface> {
        if (!arguments.length) {
            return this._attributes;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attributes });
    }

    /**
     * Изменяет правила проверки прав доступа, необходимых для работы виджета.
     */
    access(rights?: string[], mode: RightMode = RightMode.any): this {
        return this.clone({ access: { rights, mode } } as any);
    }

    /**
     * Возвращает правила проверки прав доступа, необходимых для работы виджета.
     */
    getAccess(): IWidgetMetaAccess {
        return this._access;
    }
}

/**
 * Определяет, что аргумент - это мета-описание виджета.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isWidgetMetaDescriptor<
    PropsRuntimeInterface extends object = any
>(descriptor: any): descriptor is IWidgetMeta<PropsRuntimeInterface> {
    return descriptor?.is === MetaClass.widget;
}

Meta.registerChildMeta(WidgetMeta, isWidgetMetaDescriptor);