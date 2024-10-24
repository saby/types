import type { ReactNode } from 'react';
import type { TStyleAttributes } from './widget';
import { Meta, MetaClass } from './baseMeta';
import { ArrayMeta } from './array';
import { FunctionMeta } from './function';
import { PromiseMeta } from './promise';
import { VariantMeta } from './variant';
import { ObjectMeta } from './object';
import { WidgetMeta } from './widget';
import { PageMeta } from './page';
import { RemoteProcedureMeta } from './remoteProcedure';
import * as rk from 'i18n!Meta';

/**
 * Примитив "неизвестно".
 * @public
 * @see IMeta
 */
export const UnknownType = new Meta<unknown>({
    is: MetaClass.primitive,
    id: 'unknown',
});
/**
 * Примитив "любой".
 * @public
 * @see IMeta
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AnyType = new Meta<any>({ is: MetaClass.primitive, id: 'any' });
/**
 * Примитив "заголовок-сущность".
 * @public
 * @see IMeta
 */
export const ContentType = new Meta<ReactNode>({
    is: MetaClass.primitive,
    id: 'content',
});
/**
 * Примитив "отстутствует".
 * @public
 * @see IMeta
 */
export const VoidType = new Meta<void>({ is: MetaClass.primitive, id: 'void' });
/**
 * Примитив "неопределенный".
 * @public
 * @see IMeta
 */
export const NullType = new Meta<null>({ is: MetaClass.primitive, id: 'null' });
/**
 * Примитив "неопределенный".
 * @public
 * @see IMeta
 */
export const UndefinedType = new Meta<undefined>({
    is: MetaClass.primitive,
    id: 'undefined',
});
/**
 * Примитив "логический".
 * @public
 * @see IMeta
 * @see MetaClass
 */
export const BooleanType = new Meta<boolean>({
    is: MetaClass.primitive,
    id: 'boolean',
});
/**
 * Примитив "числовой".
 * @public
 * @see IMeta
 */
export const NumberType = new Meta<number>({
    is: MetaClass.primitive,
    id: 'number',
});
/**
 * Примитив "строковый".
 * @public
 * @see IMeta
 */
export const StringType = new Meta<string>({
    is: MetaClass.primitive,
    id: 'string',
});
/**
 * Примитив "дата и время".
 * @public
 * @see IMeta
 */
export const DateType = new Meta<Date>({ is: MetaClass.primitive, id: 'date' });
/**
 * Мета-тип "объект".
 * @public
 * @see IObjectMeta
 */
export const ObjectType = new ObjectMeta<object>({
    is: MetaClass.object,
    id: 'object',
});
/**
 * Мета-тип "обещание".
 * @public
 * @see IPromiseMeta
 */
export const PromiseType = new PromiseMeta<Promise<void>>({
    is: MetaClass.promise,
    id: 'promise',
});
/**
 * Мета-тип "функция".
 * @public
 * @see IFunctionMeta
 */
export const FunctionType = new FunctionMeta<() => void>({
    is: MetaClass.function,
    id: 'function',
});
/**
 * Мета-тип "rpc-функция".
 * @public
 * @see IRemoteProcedureMeta
 */
export const RemoteProcedureType = new RemoteProcedureMeta<() => void>({
    is: MetaClass.rpc,
    id: 'rpc',
});
/**
 * Мета-тип "массив".
 * @public
 * @see IArrayMeta
 */
export const ArrayType = new ArrayMeta<void[]>({
    is: MetaClass.array,
    id: 'array',
    arrayOf: VoidType,
});
/**
 * Мета-тип "вариативный".
 * @public
 * @see IVariantMeta
 */
export const VariantType = new VariantMeta<object>({
    is: MetaClass.variant,
    id: 'variant',
    invariant: 'type',
});
export const CSSType = new Meta<string>({
    is: MetaClass.primitive,
    id: 'css',
});
/**
 * Мета-тип "виджет".
 * @public
 * @see IWidgetMeta
 */
export const WidgetType = new WidgetMeta<object>({
    is: MetaClass.widget,
    id: 'widget',
    styles: {
        height: CSSType.title(rk('Высота')).optional().hidden(),
        minHeight: CSSType.title(rk('Минимальная высота')).optional().hidden(),
        maxHeight: CSSType.title(rk('Максимальная высота')).optional().hidden(),
        width: CSSType.title(rk('Ширина')).optional().hidden(),
        minWidth: CSSType.title(rk('Минимальная ширина')).optional().hidden(),
        maxWidth: CSSType.title(rk('Максимальная ширина')).optional().hidden(),
    } as TStyleAttributes,
});
/**
 * Мета-тип "ресурс".
 * @public
 * @see IVariantMeta
 */
export const ResourceType = new VariantMeta<{ type: string; value: string }>({
    is: MetaClass.variant,
    id: 'resource',
    invariant: 'type',
    inherits: ['variant'],
});
/**
 * Мета-тип "страница".
 * @public
 * @see IPageMeta
 */
export const PageType = new PageMeta<object>({
    is: MetaClass.page,
    id: 'page',
});
