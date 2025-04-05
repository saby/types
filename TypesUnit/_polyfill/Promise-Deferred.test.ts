import { Deferred } from 'Types/deferred';
import 'Types/PromiseAPIDeferred';

const testRes = { foo: 'bar' };
const ASYNC_FUNC_MS = 9;

describe('Promise-Deferred', () => {
    describe('Promise -> Deferred -> Promise', () => {
        test('Promise - addCallback - then', (done) => {
            Promise.resolve(testRes)
                //@ts-ignore
                .addCallback((res) => res)
                //@ts-ignore
                .then((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });

        test('Promise - addErrback - catch', (done) => {
            const testError = new Error('Promise - addErrback - catch');
            Promise.reject(testError)
                //@ts-ignore
                .addErrback((err) => err)
                //@ts-ignore
                .catch((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });

        test('Ошибка из Promise пробрасывается через все callback`и в errback', (done) => {
            const testError = new Error(
                'Ошибка из Promise пробрасывается через все callback`и в errback'
            );
            const promise = new Promise((_resolve, reject) => {
                setTimeout(() => reject(testError), ASYNC_FUNC_MS);
            }).catch((e) => {
                throw e;
            });
            promise
                //@ts-ignore
                .addCallback((res) => res)
                .addCallbacks(
                    () => {
                        expect(false).toBe(true);
                    },
                    //@ts-ignore
                    (err) => {
                        expect(err).toEqual(testError);
                    }
                )
                .then(done, done);
        });

        test('Ошибка из Promise пробрасывается через addBoth, addCallback в errback', (done) => {
            const testError = new Error(
                'Ошибка из Promise пробрасывается через addBoth, addCallback в errback'
            );
            const promise = new Promise((_resolve, reject) => {
                setTimeout(() => reject(testError), ASYNC_FUNC_MS);
            }).catch((e) => {
                throw e;
            });
            promise
                //@ts-ignore
                .addBoth((res) => res)
                .addCallback(() => {
                    expect(false).toBe(true);
                })
                .addCallbacks(
                    () => {
                        expect(false).toBe(true);
                    },
                    //@ts-ignore
                    (err) => {
                        expect(err).toEqual(testError);
                    }
                )
                .then(done, done);
        });

        test('Результат из Promise пробрасывается через все errback`и в callback', (done) => {
            const promise = new Promise((resolve) => {
                setTimeout(() => resolve(testRes), ASYNC_FUNC_MS);
            }).catch((e) => {
                throw e;
            });
            promise
                //@ts-ignore
                .addErrback((err) => err)
                .addCallbacks(
                    //@ts-ignore
                    (res) => {
                        expect(res).toEqual(testRes);
                    },
                    () => {
                        expect(false).toBe(true);
                    }
                )
                .then(done, done);
        });

        test('Результат из Promise пробрасывается через addBoth, errback в callback', (done) => {
            const promise = new Promise((resolve) => {
                setTimeout(() => resolve(testRes), ASYNC_FUNC_MS);
            }).catch((e) => {
                throw e;
            });
            promise
                //@ts-ignore
                .addBoth((res) => res)
                //@ts-ignore
                .addErrback((err) => err)
                .addCallbacks(
                    //@ts-ignore
                    (res) => {
                        expect(res).toEqual(testRes);
                    },
                    () => {
                        expect(false).toBe(true);
                    }
                )
                .then(done, done);
        });
    });

    describe('Deferred -> Promise -> Deferred', () => {
        test('Deferred - then - addCallback', (done) => {
            Deferred.success(testRes)
                .then((res) => res)
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .addBoth(done);
        });

        test('Deferred - catch - addErrback', (done) => {
            const testError = new Error('Deferred - catch - addErrback');
            Deferred.fail(testError)
                .catch((err) => {
                    throw err;
                })
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .addBoth(done);
        });
    });
});
