import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';
import { serialize as serializeNew } from './marshalling/serializerNew';

/**
 * Интерфейс мета-описания массива.
 * @public
 * @see IMeta
 */
export interface IArrayMeta<
    RuntimeInterface,
    ItemRuntimeInterface = RuntimeInterface extends (infer T)[] ? T : never
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
    RuntimeInterface,
    ItemRuntimeInterface = RuntimeInterface extends (infer T)[] ? T : never
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
        descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface> & {
            defaultValue?: ItemRuntimeInterface[];
        } = {
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
    of<NewItemRuntimeInterface>(
        arrayOf: Meta<NewItemRuntimeInterface>
    ): ArrayMeta<NewItemRuntimeInterface[]> {
        if (this._arrayOf === (arrayOf as unknown)) {
            return this as any;
        }
        return this.clone<
            ArrayMeta<NewItemRuntimeInterface[]>,
            IArrayMeta<NewItemRuntimeInterface[]>
        >({ arrayOf });
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

    toJSON(isNewFormat: boolean = false): TMetaJson {
        // проверяем на true, т.к. нативный JSON.stringify вызывает toJSON() с аргументами
        // например JSON.stringify([a, b]), вызовет a.toJSON('0') и b.toJSON('1')
        return isNewFormat === true ? serializeNew(this) : serialize(this);
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
