import type { IFunctionMeta, IAnyFunction, Metas } from './function';
import { Meta, MetaClass } from './baseMeta';
import { FunctionMeta } from './function';

export interface IRemoteProcedureMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void,
> extends IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> {}

/**
 * Класс, реализующий тип "функция удаленного вызово".
 * @public
 * @see Meta
 * @see IAnyFunction
 * @see IRemoteProcedureMeta
 */
export class RemoteProcedureMeta<
        RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
        R extends any = void,
        A extends any = void,
        B extends any = void,
        C extends any = void,
        D extends any = void,
        E extends any = void,
    >
    extends FunctionMeta<RuntimeInterface, R, A, B, C, D, E>
    implements IRemoteProcedureMeta<RuntimeInterface, R, A, B, C, D, E>
{
    protected _arguments?: Metas<A, B, C, D, E>[];

    constructor(
        descriptor: IRemoteProcedureMeta<RuntimeInterface, R, A, B, C, D, E> = {
            is: MetaClass.function,
        }
    ) {
        super(descriptor);
        if (this._editor?.loader || this._editor?.component) {
            Object.entries(this._arguments).forEach(([key, value]) => {
                if (value) {
                    this._arguments[key] = value.clone({
                        origin: { meta: this, key },
                    });
                }
            });
        }
        if (this.getOrigin()) {
            Object.entries(this._arguments).forEach(([key, value]) => {
                if (value) {
                    this._arguments[key] = value.clone({
                        origin: { ...this.getOrigin() },
                    });
                }
            });
        }
    }
}
