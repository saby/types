import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';

/**
 * Интерфейс мета-описания массива.
 * @public
 * @see IMeta
 */
export interface IArrayMeta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.array;

    /**
     * Тип или мета-описание элемента массива.
     * @see IMeta
     */
    readonly arrayOf?: IMeta<ItemRuntimeInterface> | Meta<ItemRuntimeInterface>;
}

/**
 * Класс, реализующий тип "массив".
 * @public
 * @see Meta
 * @see IArrayMeta
 */
export class ArrayMeta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
> extends Meta<RuntimeInterface> {
    /**
     * Тип элемента массива.
     * @see Meta
     */
    protected _arrayOf: Meta<ItemRuntimeInterface>;

    /**
     * Конструктор типа "массив".
     * @param descriptor - Мета-описание массива.
     * @public
     * @see IArrayMeta
     */
    constructor(
        descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface> = {
            is: MetaClass.array,
        }
    ) {
        super(descriptor);
        this._arrayOf = Meta.meta((descriptor.arrayOf || {}) as Meta<ItemRuntimeInterface>);
    }

    /**
     * Меняет тип элемента массива.
     * @param arrayOf - Тип или мета-описание элемента массива.
     */
    of<
        NewItemRuntimeInterface extends ItemRuntimeInterface = ItemRuntimeInterface,
        NewRuntimeInterface extends NewItemRuntimeInterface[] = NewItemRuntimeInterface[]
    >(
        arrayOf: Meta<NewItemRuntimeInterface> | IMeta<ItemRuntimeInterface>
    ): ArrayMeta<NewRuntimeInterface, NewItemRuntimeInterface> {
        if (this._arrayOf === arrayOf) {
            return this as any;
        }
        return this.clone({ arrayOf } as any) as any;
    }

    /**
     * Возвращает тип элемента массива.
     */
    getItemMeta(): Meta<ItemRuntimeInterface> {
        return this._arrayOf;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IArrayMeta<RuntimeInterface, ItemRuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.array,
            arrayOf: this._arrayOf,
        };
    }

    toJSON(): unknown[] {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metaResult = super.toJSON() as any[];
        metaResult[0].is = MetaClass.array;
        if (this._arrayOf) {
            metaResult[0].arrayOf = this._arrayOf.getId();
        }
        return this._arrayOf.toJSON().concat(metaResult);
    }

    /**
     * Помечает тип обязательным для заполнения.
     * @remark
     * Перегрузка в `ArrayMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ArrayMeta.required
     * @see ArrayMeta.optional
     */
    required(): ArrayMeta<Exclude<RuntimeInterface, undefined>, ItemRuntimeInterface> {
        return super.required() as ArrayMeta<
            Exclude<RuntimeInterface, undefined>,
            ItemRuntimeInterface
        >;
    }

    /**
     * Помечает тип необязательным для заполнения.
     * @remark
     * Перегрузка в `ArrayMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ArrayMeta.required
     * @see ArrayMeta.required
     */
    optional(): ArrayMeta<RuntimeInterface | undefined, ItemRuntimeInterface> {
        return super.optional() as ArrayMeta<RuntimeInterface | undefined, ItemRuntimeInterface>;
    }
}

/**
 * Определяет, что аргумент - это мета-описание массива.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isArrayMetaDescriptor<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface
>(descriptor: any): descriptor is IArrayMeta<RuntimeInterface, ItemRuntimeInterface> {
    return descriptor?.is === MetaClass.array;
}

Meta.registerChildMeta(ArrayMeta, isArrayMetaDescriptor);
