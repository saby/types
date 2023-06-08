import type { IMeta } from './baseMeta';

import { Meta, MetaClass } from './baseMeta';

/**
 * Интерфейс мета-описания вариативного типа.
 * @interface
 * @public
 */
export interface IUnionMeta<RuntimeInterface> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.union;

    /**
     * Типы или мета-описания вариантов.
     */
    readonly types?: (IMeta<any> | Meta<any>)[];
}

/**
 * Класс, реализующий вариативный тип.
 * @public
 */
export class UnionMeta<RuntimeInterface> extends Meta<RuntimeInterface> {
    /**
     * Возможные типы.
     */
    protected _types: Meta<any>[];

    /**
     * Конструктор вариативного типа.
     * @param descriptor - Мета-описание вариативного типа.
     */
    constructor(descriptor: IUnionMeta<RuntimeInterface> = { is: MetaClass.union }) {
        super(descriptor);
        this._types = (descriptor.types || []).map((item) => {
            return Meta.meta(item as any);
        });
    }

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A>(types: readonly [Meta<A>]): UnionMeta<A>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B>(types: readonly [Meta<A>, Meta<B>]): UnionMeta<A | B>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B, C>(types: readonly [Meta<A>, Meta<B>, Meta<C>]): UnionMeta<A | B | C>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B, C, D>(types: readonly [Meta<A>, Meta<B>, Meta<C>, Meta<D>]): UnionMeta<A | B | C | D>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B, C, D, E>(
        types: readonly [Meta<A>, Meta<B>, Meta<C>, Meta<D>, Meta<E>]
    ): UnionMeta<A | B | C | D | E>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of(types: any): UnionMeta<any> {
        return this.clone({ types } as any);
    }

    /**
     * Возвращает возможные типы.
     */
    getTypes(): Meta<any>[] {
        return this._types;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IUnionMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.union,
            types: this._types,
        };
    }

    /**
     * Помечает тип обязательным для заполнения.
     * @see IUnionMeta.required
     * @see UnionMeta.optional
     */
    required(): UnionMeta<Exclude<RuntimeInterface, undefined>> {
        // Возможно потребуется удалять из `types` мета-описание `Meta<undefined>`.
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным для заполнения.
     * @see IUnionMeta.required
     * @see UnionMeta.required
     */
    optional(): UnionMeta<RuntimeInterface | undefined> {
        // Возможно потребуется добавлять в `types` мета-описание `Meta<undefined>`.
        return super.optional() as any;
    }
}

/**
 * Определяет, что аргумент - это мета-описание вариативного типа.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isUnionMetaDescriptor<RuntimeInterface>(
    descriptor: any
): descriptor is IUnionMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.union;
}

Meta.registerChildMeta(UnionMeta, isUnionMetaDescriptor);
