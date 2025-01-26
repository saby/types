/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { IMeta } from './baseMeta';

import { Meta, MetaClass } from './baseMeta';

import type { ObjectMeta, IObjectMeta } from './object';

// TODO: обратная совместимость с variantType удалить в 25.1100
type TOfDescType<T extends Record<string, object>> = {
    [invariant in keyof T]: IObjectMeta<T[invariant]>;
};

// TODO: обратная совместимость с variantType удалить в 25.1100
type TOfType<T extends Record<string, object>> = {
    [invariant in keyof T]: ObjectMeta<T[invariant]>;
};

/**
 * Интерфейс мета-описания enum типа.
 * @public
 */
export interface IEnumMeta<RuntimeInterface extends object> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.enum;
    /**
     * Список элементов
     */
    readonly elements?: Meta<unknown>[];

    // TODO: обратная совместимость с variantType удалить в 25.1100
    readonly invariant?: undefined | string;

    // TODO: обратная совместимость с variantType удалить в 25.1100
    readonly types?: TOfDescType<any>;
}

/**
 * Класс, реализующий enum тип.
 * @public
 */
export class EnumMeta<RuntimeInterface extends object> extends Meta<RuntimeInterface> {
    protected _elements: Meta<unknown>[];
    // TODO: обратная совместимость с variantType удалить в 25.1100
    protected _types: TOfType<any>;
    // TODO: обратная совместимость с variantType удалить в 25.1100
    private _invariant: undefined | string;

    /**
     * Конструктор enum типа.
     * @param descriptor - Мета-описание enum типа.
     */
    constructor(descriptor: IEnumMeta<RuntimeInterface> = { is: MetaClass.enum }) {
        super(descriptor);

        const elements: Meta<unknown>[] = [];
        if (descriptor.elements) {
            Object.entries(descriptor.elements).forEach((value) => {
                elements.push(Meta.meta(value[1]).id(value[0]));
            });
        }
        this._elements = elements;
        // TODO: обратная совместимость с variantType удалить в 25.1100
        let types: Partial<TOfType<any>> = {};
        if (descriptor.types) {
            types = Object.entries(descriptor.types).reduce(
                (result: Partial<TOfType<any>>, [key, value]) => {
                    // @ts-ignore
                    result[key] = Meta.meta(value);
                    return result;
                },
                {}
            );
        }
        // @ts-ignore обратная совместимость с variantType удалить в 25.1100
        this._types = types;
        // TODO: обратная совместимость с variantType удалить в 25.1100
        this._invariant = descriptor.invariant;
    }

    /**
     * Задает элемнты enum.
     * @param [elements] - Новые элементы.
     * @public
     */
    elements<NewRuntimeInterface extends object>(
        elements: Meta<any>[]
    ): EnumMeta<NewRuntimeInterface> {
        // @ts-ignore TODO поправть типы
        return this.clone({ elements });
    }

    /**
     * Возвращает элемнты enum.
     */
    getElements(): Meta<unknown>[] {
        return this._elements;
    }

    // TODO: обратная совместимость с variantType удалить в 25.1100
    invariant(value: any extends unknown[] ? void : string): this {
        if (value === this._invariant) {
            return this;
        }
        // @ts-ignore обратная совместимость с variantType удалить в 25.1100
        return this.clone({ invariant: value });
    }

    // TODO: обратная совместимость с variantType удалить в 25.1100
    getInvariant(): undefined | string {
        return this._invariant;
    }

    // TODO: обратная совместимость с variantType удалить в 25.1100
    of<T extends Record<string, object>>(types: TOfType<T>): any {
        // @ts-ignore обратная совместимость с variantType удалить в 25.1100
        return this.clone({ types });
    }

    // TODO: обратная совместимость с variantType удалить в 25.1100
    getTypes(): TOfType<any> {
        return this._types;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IEnumMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.enum,
            elements: this._elements,
            // @ts-ignore обратная совместимость с variantType удалить в 25.1100
            types: this._types,
            // TODO: обратная совместимость с variantType удалить в 25.1100
            invariant: this._invariant,
        };
    }
}

/**
 * Определяет, что аргумент - это мета-описание enum.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isEnumMetaDescriptor<RuntimeInterface extends object>(
    descriptor: any
): descriptor is IObjectMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.enum;
}

Meta.registerChildMeta(EnumMeta, isEnumMetaDescriptor);
