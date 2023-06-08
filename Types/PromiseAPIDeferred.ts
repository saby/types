/* eslint-disable @typescript-eslint/ban-types */
import { Deferred, TCallback, TErrBack } from 'Types/deferred';

Object.defineProperties(Promise.prototype, {
    addCallback: { value: addCallback },
    addCallbacks: { value: addCallbacks },
    addErrback: { value: addErrback },
    addBoth: { value: addBoth },
    callback: { value: callback },
    cancel: { value: cancel },
    createDependent: { value: createDependent },
    dependOn: { value: dependOn },
    errback: { value: errback },
    getResult: { value: getResult },
    isCallbacksLocked: { value: isCallbacksLocked },
    isReady: { value: isReady },
    isSuccessful: { value: isSuccessful },
});

/**
 * Добавляет обработчик на успех
 */
function addCallback<T>(onFulfilled: TCallback<T>): DeferredFromPromise<T> {
    const def = new DeferredFromPromise<T>().addCallback(onFulfilled);
    return bindCallbacks(this, def);
}

/**
 * Добавляет обработчик на ошибку
 */
function addErrback<T>(onRejected: TErrBack<T>): DeferredFromPromise<T> {
    const def = new DeferredFromPromise<T>().addErrback(onRejected);
    return bindCallbacks(this, def);
}

/**
 * Добавляет обработчики: на успешный результат и на ошибку
 */
function addCallbacks<T>(
    onFulfilled: TCallback<T>,
    onRejected: TErrBack<T>
): DeferredFromPromise<T> {
    const def = new DeferredFromPromise<T>().addCallbacks(
        onFulfilled,
        onRejected
    );
    return bindCallbacks(this, def);
}

/**
 * Добавляет один обработчик на успех и на ошибку
 */
function addBoth<T>(
    onFulfilled: TCallback<T> | TErrBack<T>
): DeferredFromPromise<T> {
    const def = new DeferredFromPromise<T>().addBoth(onFulfilled);
    return bindCallbacks(this, def);
}

/**
 * Запускает на выполнение цепочку коллбэков.
 * @param {any|void} [res] результат асинхронной операции, передаваемой в коллбэк.
 */
function callback(): never {
    throw new Error('Нельзя вызвать метод callback у Promise');
}

/**
 * Запуск цепочки обработки err-бэков.
 * @param {any} [err] результат асинхронной операции.
 * @param {boolean} [checkCallback=false] включить проверку наличия callback обработки ошибок.
 */
function errback(): never {
    throw new Error('Нельзя вызвать метод errback у Promise');
}

/**
 * Объявляет данный текущий Deferred зависимым от другого.
 * Колбэк/Еррбэк текущего Deferred будет вызван
 * при соотвествтующем событии в "мастер"-Deferred.
 * @param {Deferred} master - Deferred от которого будет зависеть данный.
 */
function dependOn<T>(master: Promise<T> | Deferred<T>): Promise<T> {
    if (master instanceof Promise && !(master instanceof Deferred)) {
        return Promise.reject(
            new Error('Нельзя вызвать метод dependOn у Promise')
        );
    }
    let onFulfilled: (value: any) => void;
    let onReject: (error: Error) => void;

    const promise = new Promise(
        (resolve: (error: any) => never, reject: (error: any) => never) => {
            onFulfilled = resolve;
            onReject = reject;
        }
    );

    master.addCallbacks(
        (res) => {
            onFulfilled(res);
            return res;
        },
        (err) => {
            onReject(err);
            return err;
        }
    );
    return promise;
}

/**
 * Создаёт новый Promise, зависимый от этого.
 * Колбэк/Еррбэк этого нового Promise-а будут вызваны при соотвествтующем событии исходного.
 */
function createDependent<T>(): Promise<T> {
    return this.then(
        (value) => {
            return value;
        },
        (error) => {
            throw error;
        }
    );
}

/**
 * Показывает, не запрещено ли пользоваться методами, добавляющими обработчики:
 * addCallbacks/addCallback/addErrback/addBoth.
 * Не влияет на возможность вызова методов callback/errback.
 * @return {boolean} false - добавлять обработчики можно.
 */
function isCallbacksLocked(): boolean {
    return false;
}

/**
 * Проверяет возможность вызова методов callback/errback
 * @param {boolean} [withChain=false] Проверять, отработала ли цепочка обработчиков.
 * @returns {boolean} true
 */
function isReady(withChain: boolean = false): boolean {
    return true;
}

function cancel(): never {
    throw new Error('Вызыван метод cancel у Promise');
}

function getResult(): void {
    logWarn('Вызыван метод getResult у Promise');
}

function isSuccessful(): void {
    logWarn('Вызыван метод isSuccessful у Promise');
}

/**
 * Вывод ошибок в консоль
 * @param message текст ошибки
 */
function logWarn(message: string): void {
    import('Env/Env').then(({ IoC }) => {
        IoC.resolve('ILogger').warn(
            'Core/polyfill/PromiseAPIDeferred',
            message
        );
    });
}

/**
 * Skips log execution time for this callback
 * @param callback Callback to execute
 * @return Callback to execute which wouldn't be logged
 */
function skipLogExecutionTime(
    callback: (value: any) => any
): (value: any) => any {
    if ((Promise as any).skipLogExecutionTime) {
        return (Promise as any).skipLogExecutionTime(callback);
    }
    return callback;
}

function bindCallbacks<T>(
    promise: Promise<T>,
    deferred: DeferredFromPromise<T>
): DeferredFromPromise<T> {
    const noWarn = true;
    promise.then(
        skipLogExecutionTime((res) => {
            if (deferred.isReady()) {
                return;
            }
            if (res instanceof Error) {
                deferred.errback(res, noWarn);
                return;
            }
            deferred.callback(res, noWarn);
        }),
        skipLogExecutionTime((err) => {
            if (deferred.isReady()) {
                return;
            }
            deferred.errback(err, noWarn);
        })
    );
    return deferred;
}
class DeferredFromPromise<T> extends Deferred<T> {
    callback(result: any, noWarn: boolean = false): this {
        if (noWarn) {
            return super.callback(result);
        }
        DeferredFromPromise.warnForbiddenMethod('callback');
        return super.callback(result);
    }

    errback(error: any, noWarn: boolean = false): this {
        if (noWarn) {
            return super.errback(error);
        }
        DeferredFromPromise.warnForbiddenMethod('errback');
        return super.errback(error);
    }

    cancel(noWarn: boolean = false): this {
        if (noWarn) {
            return super.cancel();
        }
        DeferredFromPromise.warnForbiddenMethod('cancel');
        return super.cancel();
    }

    static warnForbiddenMethod(method: string): void {
        logWarn(`
            Вызван метод ${method} у deferred, полученного из Promise:
            повлиять на исходный Promise невозможно!
            `);
    }
}
