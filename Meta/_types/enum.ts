import { Meta, MetaClass } from './baseMeta';
import type { IObjectMeta } from './object';
import { IAbstractCollectionMeta, AbstractCollectionMeta } from 'Meta/_types/collection';

/**
 * Интерфейс мета-описания типа "Перечисляемое".
 * @public
 */
export type IEnumMeta<RuntimeInterface extends object> = IAbstractCollectionMeta<
    RuntimeInterface,
    MetaClass.enum
>;

/**
 * Класс, реализующий тип "Перечисляемое".
 * @public
 */
export class EnumMeta<
    RuntimeInterface extends object,
> extends AbstractCollectionMeta<RuntimeInterface> {
    /**
     * Конструктор.
     * @param descriptor - Мета-описание типа "Перечисляемое".
     */
    constructor(descriptor: IEnumMeta<RuntimeInterface> = { is: MetaClass.enum }) {
        super(descriptor);
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IEnumMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.enum,
        };
    }
}

/**
 * Определяет, что аргумент - это мета-описание типа "Перечисляемое".
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isEnumMetaDescriptor<RuntimeInterface extends object>(
    descriptor: any
): descriptor is IObjectMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.enum;
}

Meta.registerChildMeta(EnumMeta, isEnumMetaDescriptor);
