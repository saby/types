import type { IFunctionMeta, IAnyFunction, Metas } from './function';
import { MetaClass, MetaOrigin } from './baseMeta';
import { FunctionMeta } from './function';

export interface IRemoteProcedureMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void,
> extends IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
    readonly is: MetaClass.rpc;
}

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
> extends FunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
    protected _arguments?: Metas<A, B, C, D, E>;

    constructor(
        descriptor: IRemoteProcedureMeta<RuntimeInterface, R, A, B, C, D, E> = {
            is: MetaClass.rpc,
        }
    ) {
        super(descriptor);
        if (this._arguments && (this._editor?.loader || this._editor?.component)) {
            Object.entries(this._arguments).forEach(([key, value]) => {
                const index = Number(key);

                if (this._arguments && value) {
                    this._arguments[index] = value.clone({
                        origin: { meta: this, key },
                    });
                }
            });
        }
        if (this._arguments && this.getOrigin()) {
            Object.entries(this._arguments).forEach(([key, value]) => {
                const index = Number(key);

                if (this._arguments && value) {
                    this._arguments[index] = value.clone({
                        origin: { ...this.getOrigin() } as MetaOrigin,
                    });
                }
            });
        }
    }
}
