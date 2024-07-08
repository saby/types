import { EntityMarker } from '../_declarations';
import { Deferred } from 'Types/deferred';

// @ts-ignore
const DeferredCanceledError = globalThis.DeferredCanceledError;

/**
 * Миксин, позволяющий загружать некоторые зависимости лениво.
 * @public
 */
export default abstract class LazyMixin {
    readonly '[Types/_source/LazyMixin]': EntityMarker;

    /**
     * Список зависимостей, которые нужно загружать лениво
     */
    protected _additionalDependencies: string[];

    /**
     * Загружает дополнительные зависимости
     * @param [callback] Функция обратного вызова при успешной загрузке зависимостей
     * @protected
     */
    protected _loadAdditionalDependencies(
        // eslint-disable-next-line @typescript-eslint/ban-types
        callback?: (ready: Deferred<any>) => void
        // eslint-disable-next-line @typescript-eslint/ban-types
    ): Deferred<any> {
        const deps = this._additionalDependencies;
        const depsLoaded = deps.reduce((prev, curr) => {
            return prev && require.defined(curr);
        }, true);
        const result = new Deferred();

        if (depsLoaded) {
            if (callback) {
                callback.call(this, result);
            } else {
                result.callback();
            }
        } else {
            // XXX: this case isn't covering by tests because all dependencies are always loaded in tests
            require(deps, () => {
                // Don't call callback() if deferred has been cancelled during require
                if (
                    callback &&
                    (!result.isReady() || !(result.getResult() instanceof DeferredCanceledError))
                ) {
                    callback.call(this, result);
                } else {
                    result.callback();
                }
            }, (error: Error) => {
                return result.errback(error);
            });
        }

        return result;
    }

    /**
     * Связывает два деферреда, назначая результат работы ведущего результатом ведомого.
     * @param master Ведущий
     * @param slave Ведомый
     * @protected
     */
    protected _connectAdditionalDependencies(
        // eslint-disable-next-line @typescript-eslint/ban-types
        master: Deferred<any>,
        // eslint-disable-next-line @typescript-eslint/ban-types
        slave: Deferred<any>
    ): void {
        // Cancel master on slave cancelling
        if (!slave.isCallbacksLocked()) {
            slave.addErrback((err) => {
                if (err instanceof DeferredCanceledError) {
                    master.cancel();
                }
                return err;
            });
        }

        // Connect master's result with slave's result
        master.addCallbacks(
            (result) => {
                slave.callback(result);
                return result;
            },
            (err) => {
                slave.errback(err);
                return err;
            }
        );
    }
}

Object.assign(LazyMixin.prototype, {
    '[Types/_source/LazyMixin]': true,
    _additionalDependencies: ['Types/source', 'Types/entity', 'Types/collection'],
});
