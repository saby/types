import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';
import { IObjectMeta, ObjectMeta } from './object';

// TODO: обратная совместимость с variantType
type TOfDescType<T extends Record<string, object>> = {
    [invariant in keyof T]: IObjectMeta<T[invariant]>;
};

// TODO: обратная совместимость с variantType
type TOfType<T extends Record<string, object>> = {
    [invariant in keyof T]: ObjectMeta<T[invariant]>;
};

/**
 * Интерфейс мета-описания типа "Коллекция элементов".
 * @private
 */
export interface IAbstractCollectionMeta<
    RuntimeInterface extends object,
    TType extends MetaClass = MetaClass,
    TElement = unknown,
> extends IMeta<RuntimeInterface> {
    readonly is: TType;
    /**
     * Список элементов
     */
    readonly elements?: Meta<TElement>[];

    // TODO: обратная совместимость с variantType
    readonly invariant?: undefined | string;

    // TODO: обратная совместимость с variantType
    readonly types?: TOfDescType<any>;
}

/**
 * Абстрактный класс, реализующий тип "Коллекция элементов".
 * @private
 */
export abstract class AbstractCollectionMeta<
    RuntimeInterface extends object,
    TType extends MetaClass = MetaClass,
    TElement = unknown,
> extends Meta<RuntimeInterface> {
    protected _elements: Meta<TElement>[];
    // TODO: обратная совместимость с variantType
    protected _types: TOfType<any>;
    // TODO: обратная совместимость с variantType
    private _invariant: undefined | string;

    /*
     * Конструктор
     * @param descriptor - Мета-описание типа "Коллекция элементов".
     */
    constructor(descriptor: IAbstractCollectionMeta<RuntimeInterface, TType>) {
        super(descriptor);

        const elements: Meta<TElement>[] = [];
        if (descriptor.elements) {
            for (const [id, elementDescriptor] of Object.entries(descriptor.elements)) {
                elements.push(Meta.meta(elementDescriptor).id(id));
            }
        }
        this._elements = elements;
        // TODO: обратная совместимость с variantType
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
        // @ts-ignore обратная совместимость с variantType
        this._types = types;
        // TODO: обратная совместимость с variantType
        this._invariant = descriptor.invariant;
    }

    /**
     * Задает элементы коллекции.
     * @param [elements] - Новые элементы.
     * @public
     */
    elements<NewRuntimeInterface extends object>(
        elements: Meta<any>[]
    ): AbstractCollectionMeta<NewRuntimeInterface, TType, TElement> {
        // @ts-ignore TODO поправть типы
        return this.clone({ elements });
    }

    /**
     * Возвращает элементы коллекции.
     */
    getElements(): Meta<TElement>[] {
        return this._elements;
    }

    // TODO: обратная совместимость с variantType
    invariant(value: any extends unknown[] ? void : string): this {
        if (value === this._invariant) {
            return this;
        }
        // @ts-ignore обратная совместимость с variantType
        return this.clone({ invariant: value });
    }

    // TODO: обратная совместимость с variantType
    getInvariant(): undefined | string {
        return this._invariant;
    }

    // TODO: обратная совместимость с variantType
    of<T extends Record<string, object>>(types: TOfType<T>): any {
        // @ts-ignore обратная совместимость с variantType
        return this.clone({ types });
    }

    // TODO: обратная совместимость с variantType
    getTypes(): TOfType<any> {
        return this._types;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IAbstractCollectionMeta<RuntimeInterface, TType, TElement> {
        return {
            ...super.toDescriptor(),
            // @ts-ignore обратная совместимость с variantType
            is: MetaClass.abstractCollection,
            elements: this._elements,
            // @ts-ignore обратная совместимость с variantType
            types: this._types,
            // TODO: обратная совместимость с variantType
            invariant: this._invariant,
        };
    }
}
