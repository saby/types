import { ReactNode } from 'react';
import {
    ArrayMeta,
    FunctionMeta,
    Meta,
    MetaClass,
    ObjectMeta,
    PromiseMeta,
    UnionMeta,
    WidgetMeta,
} from './meta';

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
export const UnionType = new UnionMeta<void>({ is: MetaClass.union });
export const WidgetType = new WidgetMeta<object>({
    is: MetaClass.widget,
    id: 'widget',
});
