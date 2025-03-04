import CancelablePromise, { PromiseCanceledError } from 'Types/_entity/applied/CancelablePromise';

class TransparentCancelablePromise<T> extends CancelablePromise<T> {
    get chained(): Promise<T | void> {
        return this._chained;
    }
}

describe('Types/_entity/applied/CancelablePromise', () => {
    describe('PromiseCanceledError', () => {
        const message = 'test-message';
        const instance = new PromiseCanceledError(message);

        test('extends Error', () => {
            expect(instance).toBeInstanceOf(Error);
        });

        test('sets message in constructor', () => {
            expect(instance.message).toBe(message);
        });

        test('isCanceled is true', () => {
            expect(instance.isCanceled).toBe(true);
        });
    });

    describe('promise', () => {
        test('should return instance of Promise', () => {
            const origin = new Promise<void>((resolve) => {
                return resolve();
            });
            const instance = new CancelablePromise(origin);
            expect(instance.promise).toBeInstanceOf(Promise);
        });

        test('should proceed resolved promise', () => {
            const origin = new Promise((resolve) => {
                return resolve('ok');
            });
            const instance = new CancelablePromise(origin);
            return instance.promise.then((result) => {
                expect(result).toEqual('ok');
            });
        });

        test('should proceed rejected promise', () => {
            const origin = new Promise((_resolve, reject) => {
                return reject('fail');
            });
            const instance = new CancelablePromise(origin);
            return instance.promise
                .then(() => {
                    throw new Error("Shouldn't get here");
                })
                .catch((err) => {
                    expect(err).toEqual('fail');
                });
        });

        test('should catch a rejection in original chain', () => {
            const origin = new Promise((_resolve, reject) => {
                return reject(new Error('fail'));
            });
            const instance = new TransparentCancelablePromise(origin);
            return instance.chained;
        });
    });

    describe('.cancel()', () => {
        test('should cancel resolved promise with PromiseCanceledError', () => {
            const origin = new Promise<void>((resolve) => {
                return resolve();
            });
            const instance = new CancelablePromise(origin);
            instance.cancel();
            return instance.promise
                .then(() => {
                    throw new Error("Shouldn't get here");
                })
                .catch((err) => {
                    expect(err).toBeInstanceOf(PromiseCanceledError);
                    expect(err.isCanceled).toBe(true);
                });
        });

        test('should cancel resolved promise with given reason', () => {
            const origin = new Promise<void>((resolve) => {
                return resolve();
            });
            const instance = new CancelablePromise(origin);
            instance.cancel('Something wrong');
            return instance.promise
                .then(() => {
                    throw new Error("Shouldn't get here");
                })
                .catch((err) => {
                    expect(err.message).toEqual('Something wrong');
                });
        });

        test('should cancel rejected promise with PromiseCanceledError', () => {
            const origin = new Promise((_resolve, reject) => {
                return reject();
            });
            const instance = new CancelablePromise(origin);
            instance.cancel();
            return instance.promise
                .then(() => {
                    throw new Error("Shouldn't get here");
                })
                .catch((err) => {
                    expect(err).toBeInstanceOf(PromiseCanceledError);
                    expect(err.isCanceled).toBe(true);
                });
        });
    });
});
