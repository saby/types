/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { IMeta } from './baseMeta';

import { Meta, MetaClass } from './baseMeta';

import type { ObjectMeta, IObjectMeta } from './object';

type TOfDescType<T extends Record<string, object>> = {
    [invariant in keyof T]: IObjectMeta<T[invariant]>;
};

type TOfType<T extends Record<string, object>> = {
    [invariant in keyof T]: ObjectMeta<T[invariant]>;
};

/**
 * Интерфейс мета-описания вариативного типа.
 * @public
 */
export interface IVariantMeta<TVariants extends Record<string, object>> extends IMeta<TVariants> {
    readonly is: MetaClass.variant;

    /**
     * Поле определения выбора типа
     */
    readonly invariant: TVariants extends unknown[] ? void : string;

    /**
     * Типы или мета-описания вариантов.
     */
    readonly types?: TOfDescType<TVariants> | TOfType<TVariants>;
}

/**
 * Класс, реализующий вариативный тип.
 * @public
 * @example
 * Пример смешанного вариативного типа:
 * const variant = [NumberType, StringType, ObjectType, VariantType];
 *
 * Использование VariantMeta.of():
 * const meta = new VariantMeta<object>().of(variant);
 *
 * Использование VariantMeta.getTypes():
 * const types = meta.getTypes();
 *
 * Для обхода вариантов следует использовать Object.entries:
 * for (const [key, value] of Object.entries(variant)) {
 *   ...
 * }
 */
export class VariantMeta<TVariants extends Record<string, object>> extends Meta<TVariants> {
    /**
     * Возможные типы.
     */
    protected _types: TOfType<TVariants>;

    private _invariant: TVariants extends unknown[] ? void : string;

    /**
     * Конструктор вариативного типа.
     * @param descriptor - Мета-описание вариативного типа.
     */
    constructor(
        descriptor: IVariantMeta<TVariants> = {
            is: MetaClass.variant,
            invariant: 'type',
        }
    ) {
        super(descriptor);
        let types: Partial<TOfType<TVariants>> = {};
        if (descriptor.types) {
            types = Object.entries(descriptor.types).reduce(
                (result: Partial<TOfType<TVariants>>, [key, value]) => {
                    // @ts-ignore
                    result[key] = Meta.meta(value);
                    return result;
                },
                {}
            );
        }
        // @ts-ignore
        this._types = types;
        this._invariant = descriptor.invariant;
    }

    invariant(value: TVariants extends unknown[] ? void : string): this {
        if (value === this._invariant) {
            return this;
        }
        return this.clone<this, IVariantMeta<TVariants>>({ invariant: value });
    }

    getInvariant(): TVariants extends unknown[] ? void : string {
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
            invariant: this._invariant,
        };
    }
}

/**
 * Определяет, что аргумент - это мета-описание вариативного типа.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isVariantMetaDescriptor<TVariant extends Record<string, object>>(descriptor: {
    is?: string;
}): descriptor is IVariantMeta<TVariant> {
    return descriptor?.is === MetaClass.variant;
}

Meta.registerChildMeta(VariantMeta, isVariantMetaDescriptor);
