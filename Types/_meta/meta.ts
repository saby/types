/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IMeta } from './baseMeta';

import { Meta } from './baseMeta';
import { IArrayMeta, ArrayMeta } from './array';
import { IPromiseMeta, PromiseMeta } from './promise';
import { IAnyFunction, IFunctionMeta, FunctionMeta } from './function';
import { UnionMeta } from './union';

import { IObjectMeta, IObjectMetaAttributes, ObjectMeta } from './object';

import { IWidgetMeta, WidgetMeta } from './widget';

/**
 * Определяет, что аргумент - это тип "массив".
 * @param item - Всё, что угодно.
 * @private
 */
export function isArrayMeta<RuntimeInterface extends ItemRuntimeInterface[], ItemRuntimeInterface>(
    item: any
): item is ArrayMeta<RuntimeInterface, ItemRuntimeInterface> {
    return item instanceof ArrayMeta;
}

/**
 * Определяет, что аргумент - это тип "обещание".
 * @param item - Всё, что угодно.
 * @private
 */
export function isPromiseMeta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface
>(item: any): item is PromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> {
    return item instanceof PromiseMeta;
}

/**
 * Определяет, что аргумент - это тип "функция".
 * @param item - Всё, что угодно.
 * @private
 */
export function isFunctionMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(item: any): item is FunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
    return item instanceof FunctionMeta;
}

/**
 * Определяет, что аргумент - это вариативный тип.
 * @param item - Всё, что угодно.
 * @private
 */
export function isUnionMeta<RuntimeInterface>(item: any): item is UnionMeta<RuntimeInterface> {
    return item instanceof UnionMeta;
}

/**
 * Определяет, что аргумент - это тип "виджет".
 * @param meta - Всё, что угодно.
 * @private
 */
export function isWidgetMeta<PropsRuntimeInterface extends object = any>(
    meta: Meta<unknown>
): meta is WidgetMeta<PropsRuntimeInterface> {
    return meta instanceof WidgetMeta;
}

/**
 * Создаёт необязательный тип "объект".
 * @param descriptor - Мета-описание объекта.
 * @private
 */
export function meta<RuntimeInterface extends object>(
    descriptor: IObjectMeta<RuntimeInterface> & { required: false }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): ObjectMeta<RuntimeInterface | undefined>;

/**
 * Создаёт тип "объект".
 * @param descriptor - Мета-описание объекта.
 * @private
 */
export function meta<RuntimeInterface extends object>(
    descriptor: IObjectMeta<RuntimeInterface>
): ObjectMeta<RuntimeInterface>;

/**
 * Создаёт необязательный тип "массив".
 * @param descriptor - Мета-описание массива.
 * @private
 */
export function meta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
>(
    descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface> & {
        required: false;
    }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): ArrayMeta<RuntimeInterface | undefined, ItemRuntimeInterface>;

/**
 * Создаёт тип "массив".
 * @param descriptor - Мета-описание массива.
 * @private
 */
export function meta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
>(
    descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface>
): ArrayMeta<RuntimeInterface, ItemRuntimeInterface>;

/**
 * Создаёт необязательный тип "функция".
 * @param descriptor - Мета-описание функции.
 * @private
 */
export function meta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(
    descriptor: IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> & {
        required: false;
    }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): FunctionMeta<RuntimeInterface | undefined, R, A, B, C, D, E>;

/**
 * Создаёт тип "функция".
 * @param descriptor - Мета-описание функции.
 * @private
 */
export function meta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(
    descriptor: IFunctionMeta<RuntimeInterface, R, A, B, C, D, E>
): FunctionMeta<RuntimeInterface, R, A, B, C, D, E>;

/**
 * Создаёт необязательный тип "обещание".
 * @param descriptor - Мета-описание "обещания".
 * @private
 */
export function meta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
>(
    descriptor: IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> & {
        required: false;
    }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): PromiseMeta<RuntimeInterface | undefined, ResolvedRuntimeInterface>;

/**
 * Создаёт тип "обещание".
 * @param descriptor - Мета-описание "обещания".
 * @private
 */
export function meta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
>(
    descriptor: IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface>
    // @ts-ignore By default RuntimeInterface cannot be undefined
): PromiseMeta<RuntimeInterface, ResolvedRuntimeInterface>;

/**
 * Создаёт тип "виджет".
 * @param descriptor - Мета-описание виджета.
 * @private
 */
export function meta<ComponentPropsInterface extends object>(
    descriptor: IWidgetMeta<ComponentPropsInterface>
): WidgetMeta<ComponentPropsInterface>;

/**
 * Создаёт необязательный базовый тип.
 * @param descriptor - Базовое мета-описание.
 * @private
 */
export function meta<RuntimeInterface extends void | null | boolean | number | string>(
    descriptor: IMeta<RuntimeInterface> & { required: false }
): Meta<RuntimeInterface | undefined>;

/**
 * Создаёт базовый тип.
 * @param [descriptor] - Базовое мета-описание.
 * @private
 */
export function meta<RuntimeInterface extends void | null | boolean | number | string>(
    descriptor?: IMeta<RuntimeInterface>
): Meta<RuntimeInterface>;

/**
 * Ни чего не создаёт, просто возвращает аргумент как результат.
 * @remark
 * Необходимо для унификации функции `meta`, чтобы разработчик мог передавать как мета-описание, так и тип,
 *   зная, что на выходе всегда будет тип.
 * @param meta - Любой экземпляр мета-описания.
 * @private
 */
export function meta(meta: Meta<any>): typeof meta;

/**
 * @deprecated функционал находится в Meta.meta
 * Реализация всех объявленных выше вариантов использования.
 * @param [descriptor] - Мета-описание.
 * @remark
 * @private
 */
export function meta(descriptor: any = {}): any {
    throw new Error(`Неверное мета-описание: ${JSON.stringify(descriptor)}`);
}

/**
 * Переносит все атрибуты в указанную категорию.
 * @param name - Название категории.
 * @param attributes - Атрибуты объекта.
 * @public
 */
export function category<
    RuntimeInterface extends object,
    Attributes extends IObjectMetaAttributes<RuntimeInterface> = IObjectMetaAttributes<RuntimeInterface>
>(name: string, attributes: Attributes): Attributes {
    const result: any = {};
    Object.keys(attributes || {}).forEach((attributeName) => {
        const attribute = (attributes || {})[attributeName];
        result[attributeName] = attribute ? Meta.meta(attribute).category(name) : null;
    });
    return result;
}

/**
 * Переносит все атрибуты в указанную группу.
 * @param uid - id группы
 * @param name - Название группы.
 * @param attributes - Атрибуты объекта.
 * @public
 */
export function group<
    RuntimeInterface extends object,
    Attributes extends IObjectMetaAttributes<RuntimeInterface> = IObjectMetaAttributes<RuntimeInterface>
    >(uid: string, name: string, attributes: Attributes): Attributes;
export function group<
    RuntimeInterface extends object,
    Attributes extends IObjectMetaAttributes<RuntimeInterface> = IObjectMetaAttributes<RuntimeInterface>
>(uid: string, attributes: Attributes): Attributes;
export function group<
    RuntimeInterface extends object,
    Attributes extends IObjectMetaAttributes<RuntimeInterface> = IObjectMetaAttributes<RuntimeInterface>
>(uid: string, x: string | Attributes, y?: Attributes): Attributes {
    const attributes = typeof x === 'string' ? y : x;
    const name = typeof x === 'string' ? x : undefined;

    const result: any = {};

    Object.keys(attributes || {}).forEach((attributeName) => {
        const attribute = (attributes || {})[attributeName];
        result[attributeName] = attribute ? Meta.meta(attribute).group(uid, name) : null;
    });
    return result;
}
