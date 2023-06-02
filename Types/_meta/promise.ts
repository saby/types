import type {
    IMeta,
} from './baseMeta';
import {
    Meta,
    MetaClass,
} from './baseMeta';



/**
 * Интерфейс мета-описания "обещания".
 * @public
 * @see IMeta
 */
export interface IPromiseMeta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.promise;

    /**
     * Тип или мета-описание значения, возвращаемого промисом.
     * @public
     * @see IMeta
     */
    readonly result?:
        | IMeta<ResolvedRuntimeInterface>
        | Meta<ResolvedRuntimeInterface>
        | null;
}

/**
 * Класс, реализующий тип "обещание".
 * @public
 * @see Meta
 * @see IPromiseMeta
 */
export class PromiseMeta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
> extends Meta<RuntimeInterface> {
    /**
     * Nbg значения, возвращаемого промисом.
     * @remark
     * `null` означает, что Promise ничего не возвращает.
     * @public
     * @see Meta
     */
    protected _result: Meta<ResolvedRuntimeInterface> | null;

    /**
     * Начальное значение для редактора.
     * @remark
     * Для типа "обещание" значение по-умолчанию всегда равно `undefined`.
     * @public
     * @see PromiseMeta.defaultValue
     * @see PromiseMeta.getDefaultValue
     */
    protected _defaultValue: undefined;

    /**
     * Конструктор типа "обещание".
     * @param descriptor - Мета-описание "обещания".
     * @public
     * @see IPromiseMeta
     */
    constructor(
        descriptor: IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> = {
            is: MetaClass.promise,
        }
    ) {
        super(descriptor);
        this._defaultValue = undefined;
        this._result = descriptor.result
            ? Meta.meta(descriptor.result as Meta<ResolvedRuntimeInterface>)
            : null;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.promise,
            result: this._result,
        };
    }

    result<
        NewResolvedRuntimeInterface,
        NewRuntimeInterface extends Promise<NewResolvedRuntimeInterface>
    >(
        result: Meta<NewResolvedRuntimeInterface>
    ): PromiseMeta<NewRuntimeInterface, NewResolvedRuntimeInterface> {
        return this.clone({ result } as any) as any;
    }

    /**
     * Возвращает тип возвращаемого значения промиса.
     * @remark
     * `null` означает, что Promise ничего не возвращает.
     */
    getResult(): Meta<ResolvedRuntimeInterface> | null {
        return this._result;
    }

    /**
     * Помечает тип обязательным.
     * @remark
     * Перегрузка в `PromiseMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see PromiseMeta.required
     * @see PromiseMeta.optional
     */
    required(): PromiseMeta<
        Exclude<RuntimeInterface, undefined>,
        ResolvedRuntimeInterface
    > {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным.
     * @remark
     * Перегрузка в `PromiseMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see PromiseMeta.required
     * @see PromiseMeta.required
     */
    optional(): PromiseMeta<
        RuntimeInterface | undefined,
        ResolvedRuntimeInterface
    > {
        return super.optional() as any;
    }

    /**
     * Меняет значение по-умолчанию.
     * @remark
     * Переданное значение игнорируется, т.к. тип "обещание" не имеет значения по-умолчанию.
     * @public
     * @see PromiseMeta.defaultValue
     * @see PromiseMeta.getDefaultValue
     */
    defaultValue(ignore: any): this {
        return this;
    }

    /**
     * Возвращает значение по-умолчанию.
     * @remark
     * Всегда возвращается `undefined`, т.к. тип "обещание" не имеет значения по-умолчанию.
     * @public
     * @see PromiseMeta.defaultValue
     * @see PromiseMeta.defaultValue
     */
    getDefaultValue(): undefined {
        return undefined;
    }
}

/**
 * Определяет, что аргумент - это мета-описание "обещания".
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isPromiseMetaDescriptor<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface
>(
    descriptor: any
): descriptor is IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> {
    return descriptor?.is === MetaClass.promise;
}

Meta.registerChildMeta(PromiseMeta, isPromiseMetaDescriptor);
