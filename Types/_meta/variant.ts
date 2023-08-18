import type { IMeta } from './baseMeta';

import { Meta, MetaClass } from './baseMeta';

import type { ObjectMeta } from './object';


type TOfType<T> = {
    [invariant in keyof T]: ObjectMeta<T[invariant]>
};

/**
 * Интерфейс мета-описания вариативного типа.
 * @public
 */
export interface IVariantMeta<TVariants extends object> extends IMeta<TVariants> {
    readonly is: MetaClass.variant;

    /**
     * Поле определения выбора типа
     */
    readonly invariant: string;

    /**
     * Типы или мета-описания вариантов.
     */
    readonly types?: TOfType<TVariants>;
}

/**
 * Класс, реализующий вариативный тип.
 * @public
 */
export class VariantMeta<TVariants extends object> extends Meta<TVariants> {
    /**
     * Возможные типы.
     */
    protected _types: TOfType<TVariants>;

    private _invariant: string;

    /**
     * Конструктор вариативного типа.
     * @param descriptor - Мета-описание вариативного типа.
     */
    constructor(descriptor: IVariantMeta<TVariants> = {
        is: MetaClass.variant,
        invariant: 'type'
    }) {
        super(descriptor);
        this._types = descriptor.types;
        this._invariant = descriptor.invariant;
    }

    invariant(value: string): this {
        if (value === this._invariant) {
            return this;
        }
        return this.clone<this, IVariantMeta<TVariants>>({ invariant: value });
    }

    getInvariant(): string {
        return this._invariant;
    }

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<T extends object>(types: TOfType<T>): VariantMeta<T> {
        return this.clone<VariantMeta<T>, IVariantMeta<T>>({ types });
    }

    /**
     * Возвращает возможные типы.
     */
    getTypes(): TOfType<TVariants> {
        return this._types;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IVariantMeta<TVariants> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.variant,
            types: this._types,
            invariant: this._invariant
        };
    }
}

/**
 * Определяет, что аргумент - это мета-описание вариативного типа.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isVariantMetaDescriptor<TVariant extends object>(
    descriptor: any
): descriptor is IVariantMeta<TVariant> {
    return descriptor?.is === MetaClass.variant;
}

Meta.registerChildMeta(VariantMeta, isVariantMetaDescriptor);
