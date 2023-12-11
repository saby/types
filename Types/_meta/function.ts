import type { IMeta } from './baseMeta';

import { Meta, MetaClass } from './baseMeta';

/**
 * Интерфейс описания аргументов для IFunctionMeta.
 * @remark
 * Интерфейс используется для описания любой функции с количеством аргументов не более 5.
 * @public
 * @see IAnyFunction
 * @see IFunctionArguments
 * @see FunctionMeta
 */
export type IMetas<A, B, C, D, E> = A extends void
    ? []
    : B extends void
    ? [IMeta<A>]
    : C extends void
    ? [IMeta<A>, IMeta<B>]
    : D extends void
    ? [IMeta<A>, IMeta<B>, IMeta<C>]
    : E extends void
    ? [IMeta<A>, IMeta<B>, IMeta<C>, IMeta<D>]
    : [IMeta<A>, IMeta<B>, IMeta<C>, IMeta<D>, IMeta<E>];

/**
 * Интерфейс описания аргументов для FunctionMeta.
 * @remark
 * Интерфейс используется для описания любой функции с количеством аргументов не более 5.
 * @public
 * @see IAnyFunction
 * @see IFunctionArguments
 * @see FunctionMeta
 */
export type Metas<A, B, C, D, E> = A extends void
    ? []
    : B extends void
    ? [Meta<A>]
    : C extends void
    ? [Meta<A>, Meta<B>]
    : D extends void
    ? [Meta<A>, Meta<B>, Meta<C>]
    : E extends void
    ? [Meta<A>, Meta<B>, Meta<C>, Meta<D>]
    : [Meta<A>, Meta<B>, Meta<C>, Meta<D>, Meta<E>];

/**
 * Интерфейс любой функции.
 * @remark
 * Интерфейс описывает любую функцию с количеством аргументов не более 5.
 * @public
 * @see IMetas
 * @see IFunctionArguments
 * @see FunctionMeta
 */
export type IAnyFunction<
    R = void,
    A = void,
    B = void,
    C = void,
    D = void,
    E = void
> = A extends void
    ? () => R
    : B extends void
    ? (a: A) => R
    : C extends void
    ? (a: A, b: B) => R
    : D extends void
    ? (a: A, b: B, c: C) => R
    : E extends void
    ? (a: A, b: B, c: C, d: D) => R
    : (a: A, b: B, c: C, d: D, e: E) => R;

/**
 * Интерфейс аргументов любой функции.
 * @remark
 * Количество аргументов не может быть больше 5.
 * @public
 * @see IAnyFunction
 * @see IMetas
 * @see FunctionMeta
 */
export type IFunctionArguments<A = void, B = void, C = void, D = void, E = void> = A extends void
    ? []
    : B extends void
    ? [A]
    : C extends void
    ? [A, B]
    : D extends void
    ? [A, B, C]
    : E extends void
    ? [A, B, C, D]
    : [A, B, C, D, E];

/**
 * Интерфейс мета-описания функции.
 * @public
 * @see IMeta
 * @see IAnyFunction
 */
export interface IFunctionMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.function;

    /**
     * Список типов или мета-описаний аргументов функции.
     */
    readonly arguments?: IMetas<A, B, C, D, E> | Metas<A, B, C, D, E>;

    /**
     * Тип или мета-описание результата функции.
     */
    readonly result?: IMeta<R> | Meta<R>;
}

/**
 * Класс, реализующий тип "функция".
 * @public
 * @see Meta
 * @see IAnyFunction
 * @see IFunctionMeta
 */
export class FunctionMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
> extends Meta<RuntimeInterface> {
    /**
     * Начальное значение для редактора.
     * @remark
     * Для типа "функции" значение по-умолчанию всегда равно `undefined`.
     * @public
     * @see FunctionMeta.defaultValue
     * @see FunctionMeta.getDefaultValue
     */
    protected _defaultValue: undefined;

    /**
     * Список типов аргументов функции.
     * @protected
     */
    protected _arguments?: Metas<A, B, C, D, E>;

    /**
     * Тип результата функции.
     * @protected
     */
    protected _result?: Meta<R>;

    /**
     * Конструктор типа "функция".
     * @param descriptor - Мета-описание функции.
     * @public
     * @see IFunctionMeta
     */
    constructor(
        descriptor: IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> = {
            is: MetaClass.function,
        }
    ) {
        super(descriptor);

        this._defaultValue = undefined;
        this._arguments = descriptor.arguments?.map(Meta.meta) || ([] as any);
        this._result = descriptor.result ? (Meta.meta(descriptor.result as any) as any) : undefined;
    }

    /**
     * Удаляет аргументы функции.
     */
    arguments(): FunctionMeta<IAnyFunction<R>, R>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     */
    arguments<NewA>(a: Meta<NewA>): FunctionMeta<IAnyFunction<R, NewA>, R, NewA>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     */
    arguments<NewA, NewB>(
        a: Meta<NewA>,
        b: Meta<NewB>
    ): FunctionMeta<IAnyFunction<R, NewA, NewB>, R, NewA, NewB>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     * @param c
     */
    arguments<NewA, NewB, NewC>(
        a: Meta<NewA>,
        b: Meta<NewB>,
        c: Meta<NewC>
    ): FunctionMeta<IAnyFunction<R, NewA, NewB, NewC>, R, NewA, NewB, NewC>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     * @param c
     * @param d
     */
    arguments<NewA, NewB, NewC, NewD>(
        a: Meta<NewA>,
        b: Meta<NewB>,
        c: Meta<NewC>,
        d: Meta<NewD>
    ): FunctionMeta<IAnyFunction<R, NewA, NewB, NewC, NewD>, R, NewA, NewB, NewC, NewD>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     * @param c
     * @param d
     * @param e
     */
    arguments<NewA, NewB, NewC, NewD, NewE>(
        a: Meta<NewA>,
        b: Meta<NewB>,
        c: Meta<NewC>,
        d: Meta<NewD>,
        e: Meta<NewE>
    ): FunctionMeta<IAnyFunction<R, NewA, NewB, NewC, NewD, NewE>, R, NewA, NewB, NewC, NewD, NewE>;

    /**
     * Меняет типы аргументов функции.
     * @param [a]
     * @param [b]
     * @param [c]
     * @param [d]
     * @param [e]
     */
    arguments(a?: any, b?: any, c?: any, d?: any, e?: any): any {
        return this.clone({
            arguments: [a, b, c, d, e].filter(Boolean),
        } as any) as any;
    }

    /**
     * Возвращает список типов аргументов функции.
     */
    getArguments(): Metas<A, B, C, D, E> | undefined {
        return this._arguments;
    }

    /**
     * Меняет тип результата функции.
     * @param result
     */
    result<NewRuntimeInterface extends IAnyFunction<NewR, A, B, C, D, E>, NewR extends any = never>(
        result?: Meta<NewR>
    ): FunctionMeta<NewRuntimeInterface, NewR, A, B, C, D, E> {
        return this.clone({ result } as any) as any;
    }

    /**
     * Возвращает тип результата функции.
     */
    getResult(): Meta<R> | undefined {
        return this._result;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.function,
            arguments: this._arguments,
            result: this._result,
        };
    }

    /**
     * Помечает тип обязательным.
     * @remark
     * Перегрузка в `FunctionMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see FunctionMeta.required
     * @see FunctionMeta.optional
     */
    required(): FunctionMeta<Exclude<RuntimeInterface, undefined>, R, A, B, C, D, E> {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным.
     * @remark
     * Перегрузка в `FunctionMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see FunctionMeta.required
     * @see FunctionMeta.optional
     */
    optional(): FunctionMeta<RuntimeInterface | undefined, R, A, B, C, D, E> {
        return super.optional() as any;
    }

    /**
     * Меняет значение по-умолчанию.
     * @remark
     * Переданное значение игнорируется, т.к. тип "функция" не имеет значения по-умолчанию.
     * @public
     * @see FunctionMeta.defaultValue
     * @see FunctionMeta.getDefaultValue
     */
    defaultValue(ignore: any): this {
        return this;
    }

    /**
     * Возвращает значение по-умолчанию.
     * @remark
     * Всегда возвращается `undefined`, т.к. тип "функция" не имеет значения по-умолчанию.
     * @public
     * @see IFunctionMeta.defaultValue
     * @see FunctionMeta.defaultValue
     */
    getDefaultValue(): undefined {
        return undefined;
    }
}

/**
 * Определяет, что аргумент - это мета-описание функции.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isFunctionMetaDescriptor<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(descriptor: any): descriptor is IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
    return descriptor?.is === MetaClass.function;
}

Meta.registerChildMeta(FunctionMeta, isFunctionMetaDescriptor);
