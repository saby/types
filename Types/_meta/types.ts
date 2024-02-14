import type { ReactNode } from 'react';
import { Meta, MetaClass } from './baseMeta';
import { ArrayMeta } from './array';
import { FunctionMeta } from './function';
import { PromiseMeta } from './promise';
import { VariantMeta } from './variant';
import { ObjectMeta } from './object';
import { WidgetMeta } from './widget';

export const UnknownType = new Meta<unknown>({
    is: MetaClass.primitive,
    id: 'unknown',
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AnyType = new Meta<any>({ is: MetaClass.primitive, id: 'any' });
export const ContentType = new Meta<ReactNode>({
    is: MetaClass.primitive,
    id: 'content',
});
export const VoidType = new Meta<void>({ is: MetaClass.primitive, id: 'void' });
export const NullType = new Meta<null>({ is: MetaClass.primitive, id: 'null' });
export const UndefinedType = new Meta<undefined>({
    is: MetaClass.primitive,
    id: 'undefined',
});
export const BooleanType = new Meta<boolean>({
    is: MetaClass.primitive,
    id: 'boolean',
});
export const NumberType = new Meta<number>({
    is: MetaClass.primitive,
    id: 'number',
});
export const StringType = new Meta<string>({
    is: MetaClass.primitive,
    id: 'string',
});
export const DateType = new Meta<Date>({ is: MetaClass.primitive, id: 'date' });
export const ObjectType = new ObjectMeta<object>({
    is: MetaClass.object,
    id: 'object',
});
export const PromiseType = new PromiseMeta<Promise<void>>({
    is: MetaClass.promise,
    id: 'promise',
});
export const FunctionType = new FunctionMeta<() => void>({
    is: MetaClass.function,
    id: 'function',
});
export const ArrayType = new ArrayMeta<void[]>({
    is: MetaClass.array,
    id: 'array',
    arrayOf: VoidType,
});
export const VariantType = new VariantMeta<object>({
    is: MetaClass.variant,
    id: 'variant',
    invariant: 'type',
});
export const WidgetType = new WidgetMeta<object>({
    is: MetaClass.widget,
    id: 'widget',
});
export const ResourceType = new VariantMeta<{ type: string; value: string }>({
    is: MetaClass.variant,
    id: 'resource',
    invariant: 'type',
    inherits: ['variant'],
});
