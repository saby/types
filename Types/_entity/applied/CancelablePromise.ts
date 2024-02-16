/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { protect } from '../../util';

const $isCanceled = protect('isCanceled') as symbol;

/**
 * Специальная ошибка, означающая, чтоб Promise завершён из-за отмены.
 * @public
 */
export class PromiseCanceledError extends Error implements Error {
    readonly isCanceled: boolean = true;
    readonly name: string = 'PromiseCanceledError';

    constructor(readonly message: string) {
        super(message);
    }
}

/**
 * Обертка для функции Промис, которая позволяет разрешать её экземпляры, как отменённые.
 * @remark
 * В следующем примере сделаем экземпляр отмененным:
 * <pre>
 *     import {CancelablePromise} from 'Types/entity';
 *
 *     const promiseToDealWith = new Promise((resolve) => setTimeout(resolve, 1000));
 *
 *     // Сделаем отмененный Промис
 *     const cancelable = new CancelablePromise(promiseToDealWith);
 *
 *     // Посмотрим обёртку Промиса
 *     cancelable.promise
 *         .then(() => console.log('resolved'))
 *         .catch((err) => console.log('canceled', err.isCanceled, err.message));
 *
 *     // Отменим Промис
 *     cancelable.cancel('That\'s way too long');
 * </pre>
 * @public
 */

/*
 * Wrapper for Promise which makes it possible to treat promise instance as canceled.
 * @remark
 * Let's make the promise instance cancelable
 * <pre>
 *     import {CancelablePromise} from 'Types/entity';
 *
 *     const promiseToDealWith = new Promise((resolve) => setTimeout(resolve, 1000));
 *
 *     // Make cancelable promise
 *     const cancelable = new CancelablePromise(promiseToDealWith);
 *
 *     // Watch the promise wrapper
 *     cancelable.promise
 *         .then(() => console.log('resolved'))
 *         .catch((err) => console.log('canceled', err.isCanceled, err.message));
 *
 *     // Cancel the promise
 *     cancelable.cancel('That\'s way too long');
 * </pre>
 * @class Types/_entity/applied/CancelablePromise
 * @public
 * @author Буранов А.Р.
 */
export default class CancelablePromise<T> {
    readonly promise: Promise<T>;
    protected _chained: Promise<T | void>;

    constructor(origin: Promise<T>) {
        this.promise = new Promise((resolve, reject) => {
            this._chained = origin
                .then((result) => {
                    return this[$isCanceled] ? reject(this[$isCanceled]) : resolve(result);
                })
                .catch((error) => {
                    return this[$isCanceled] ? reject(this[$isCanceled]) : reject(error);
                });
        });
    }

    cancel(reason?: string): void {
        this[$isCanceled] = new PromiseCanceledError(reason || 'Unknown reason');
    }
}
