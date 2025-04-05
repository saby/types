import { Meta, MetaClass } from './baseMeta';
import type { IObjectMeta } from './object';
import { IAbstractCollectionMeta, AbstractCollectionMeta } from 'Meta/_types/collection';

/**
 * Интерфейс мета-описания типа "Перечисляемое".
 * @public
 */
export type IFlagsMeta<RuntimeInterface extends object> = IAbstractCollectionMeta<
    RuntimeInterface,
    MetaClass.flags
>;

/**
 * Класс, реализующий тип "Флаги".
 * @public
 */
export class FlagsMeta<
    RuntimeInterface extends object,
> extends AbstractCollectionMeta<RuntimeInterface> {
    /**
     * Конструктор.
     * @param descriptor - Мета-описание типа "Флаги".
     */
    constructor(descriptor: IFlagsMeta<RuntimeInterface> = { is: MetaClass.flags }) {
        super(descriptor);
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IFlagsMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.flags,
        };
    }
}

/**
 * Определяет, что аргумент - это мета-описание типа "Флаги".
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isFlagsMetaDescriptor<RuntimeInterface extends object>(
    descriptor: any
): descriptor is IObjectMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.enum;
}

Meta.registerChildMeta(FlagsMeta, isFlagsMetaDescriptor);
