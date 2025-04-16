import { Deferred } from 'Types/deferred';
import 'Types/PromiseAPIDeferred';

describe('PromiseAPIDeferred', () => {
    const emptyFunc = () => {
        /*noop*/
    };
    const testRes = { foo: 'bar' };
    const ASYNC_FUNC_MS = 9;

    describe('.addCallback()', () => {
        let resolvedPromise: Promise<object>;

        beforeEach(() => {
            resolvedPromise = Promise.resolve(testRes);
        });

        test('promise.addCallback() возвращает Deferred', () => {
            //@ts-ignore
            expect(resolvedPromise.addCallback(null)).toBeInstanceOf(Deferred);
        });

        test('promise.addCallback() получает результат promise', (done) => {
            resolvedPromise
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });

        test('Из обработчика addCallback будет возвращен Error, должен стрельнуть errback', (done) => {
            const testError = new Error(
                'Из обработчика addCallback будет возвращен Error, должен стрельнуть errback'
            );
            resolvedPromise
                //@ts-ignore
                .addCallback(() => testError)
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });

        test('promise.then().addCallback() получает асинхронный результат', (done) => {
            resolvedPromise
                .then(
                    (res) => new Promise((resolve) => setTimeout(() => resolve(res), ASYNC_FUNC_MS))
                )
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });
    });

    describe('.addErrback()', () => {
        test('promise.addErrback() возвращает Deferred', () => {
            const testError = new Error('promise.addErrback() возвращает Deferred');
            expect(
                //@ts-ignore
                Promise.reject(testError).addErrback(emptyFunc)
            ).toBeInstanceOf(Deferred);
        });

        test('promise.addErrback(err) перехватывает ошибку из promise', (done) => {
            const testError = new Error('promise.addErrback(err) перехватывает ошибку из promise');
            Promise.reject(testError)
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });

        test('promise.then().addErrback() перехватывает асинхронную ошибку', (done) => {
            const testError = new Error(
                'promise.then().addErrback() перехватывает асинхронную ошибку'
            );
            Promise.reject(testError)
                .then(
                    (err) => new Promise((reject) => setTimeout(() => reject(err), ASYNC_FUNC_MS))
                )
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });
    });

    describe('.addCallbacks()', () => {
        test('promise.addCallbacks() возвращает Deferred', () => {
            //@ts-ignore
            expect(Promise.resolve().addCallbacks(null, null)).toBeInstanceOf(Deferred);
        });

        describe('callback', () => {
            let resolvedPromise: Promise<object>;

            beforeEach(() => {
                resolvedPromise = Promise.resolve(testRes);
            });

            test('promise.addCallbacks(res, err) получает результат promise', (done) => {
                resolvedPromise
                    //@ts-ignore
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

            test('promise.then().addCallback() получает асинхронный результат', (done) => {
                resolvedPromise
                    .then(
                        (res) =>
                            new Promise((resolve) => setTimeout(() => resolve(res), ASYNC_FUNC_MS))
                    )
                    //@ts-ignore
                    .addCallbacks((res) => {
                        expect(res).toEqual(testRes);
                    }, null)
                    .then(done, done);
            });

            test('Из обработчика addCallbacks будет возвращен Error, должен стрельнуть errback', (done) => {
                const testError = new Error(
                    'Из обработчика addCallbacks будет возвращен Error, должен стрельнуть errback'
                );
                resolvedPromise
                    //@ts-ignore
                    .addCallbacks(
                        () => testError,
                        () => {
                            expect(false).toBe(true);
                        }
                    )
                    //@ts-ignore
                    .addErrback((err) => expect(err).toEqual(testError))
                    .then(done, done);
            });
        });

        describe('errback', () => {
            test('promise.addCallbacks(res, err) перехватывает ошибку promise', (done) => {
                const testError = new Error(
                    'promise.addCallbacks(res, err) перехватывает ошибку promise'
                );
                Promise.reject(testError)
                    //@ts-ignore
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

            test('promise.then().addCallback() перехватывает асинхронную ошибку', (done) => {
                const testError = new Error(
                    'promise.then().addCallback() перехватывает асинхронную ошибку'
                );
                Promise.reject(testError)
                    .then(
                        (err) =>
                            new Promise((reject) => setTimeout(() => reject(err), ASYNC_FUNC_MS))
                    )
                    //@ts-ignore
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
        });
    });

    describe('.addBoth()', () => {
        test('promise.addBoth() возвращает Deferred', () => {
            //@ts-ignore
            expect(Promise.resolve().addBoth(null)).toBeInstanceOf(Deferred);
        });

        describe('callback', () => {
            let resolvedPromise: Promise<object>;

            beforeEach(() => {
                resolvedPromise = Promise.resolve(testRes);
            });

            test('promise.addBoth(res) получает результат promise', (done) => {
                resolvedPromise
                    //@ts-ignore
                    .addBoth((res) => {
                        expect(res).toEqual(testRes);
                    })
                    .then(done, done);
            });

            test('promise.then().addBoth() получает асинхронный результат', (done) => {
                resolvedPromise
                    .then(
                        (res) =>
                            new Promise((resolve) => setTimeout(() => resolve(res), ASYNC_FUNC_MS))
                    )
                    //@ts-ignore
                    .addBoth((res) => {
                        expect(res).toEqual(testRes);
                    })
                    .then(done, done);
            });

            test('Из обработчика addBoth будет возвращен Error, должен стрельнуть errback', (done) => {
                const testError = new Error(
                    'Из обработчика addBoth будет возвращен Error, должен стрельнуть errback'
                );
                resolvedPromise
                    //@ts-ignore
                    .addBoth(() => testError)
                    //@ts-ignore
                    .addErrback((err) => {
                        expect(err).toEqual(testError);
                    })
                    .then(done, done);
            });
        });

        describe('errback', () => {
            test('promise.addBoth(err) перехватывает ошибку promise', (done) => {
                const testError = new Error('promise.addBoth(err) перехватывает ошибку promise');
                Promise.reject(testError)
                    //@ts-ignore
                    .addBoth((err) => {
                        expect(err).toEqual(testError);
                    })
                    .then(done, done);
            });

            test('promise.then().addBoth() перехватывает асинхронную ошибку', (done) => {
                const testError = new Error(
                    'promise.then().addBoth() перехватывает асинхронную ошибку'
                );
                Promise.reject(testError)
                    .then(
                        (err) =>
                            new Promise((reject) => setTimeout(() => reject(err), ASYNC_FUNC_MS))
                    )
                    //@ts-ignore
                    .addBoth((err) => {
                        expect(err).toEqual(testError);
                    })
                    .then(done, done);
            });
        });
    });

    describe('.callback()', () => {
        test('promise.callback() выбрасывает исключение', () => {
            try {
                //@ts-ignore
                new Promise(emptyFunc).callback();
            } catch (err) {
                expect(err).toBeInstanceOf(Error);
            }
        });
    });

    describe('.errback()', () => {
        test('promise.errback() выбрасывает исключение', () => {
            try {
                //@ts-ignore
                new Promise(emptyFunc).errback();
            } catch (err) {
                expect(err).toBeInstanceOf(Error);
            }
        });
    });

    describe('.dependOn()', () => {
        //@ts-ignore
        let master;
        let promise: Promise<object>;

        beforeEach(() => {
            master = new Deferred();
            //@ts-ignore
            promise = new Promise(emptyFunc).dependOn(master);
        });

        test('promise.dependOn() callback вызван при соотвествтующем событии в "master"-Deferred', (done) => {
            promise
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
            //@ts-ignore
            master.callback(testRes);
        });

        test('promise.dependOn() errback вызван при соотвествтующем событии в "master"-Deferred', (done) => {
            const testError = new Error(
                'promise.dependOn() errback вызван при соотвествтующем событии в "master"-Deferred'
            );
            promise
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
            //@ts-ignore
            master.errback(testError).addErrback(null);
        });

        test('promise.dependOn() зависит от Deferred.success()', (done) => {
            new Promise(emptyFunc)
                //@ts-ignore
                .dependOn(Deferred.success(testRes))
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });

        test('promise.dependOn() от Promise выбрасывает исключение', (done) => {
            new Promise(emptyFunc)
                //@ts-ignore
                .dependOn(Promise.resolve(testRes))
                //@ts-ignore
                .catch((e) => {
                    expect(e).toBeInstanceOf(Error);
                })
                .then(done, done);
        });
    });

    describe('.createDependent()', () => {
        test('callback зависимого промиса вызван при соотвествтующем событии в "master"-Promise', (done) => {
            Promise.resolve(testRes)
                //@ts-ignore
                .createDependent()
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });

        test('errback зависимого промиса вызван при соотвествтующем событии в "master"-Promise', (done) => {
            const testError = new Error(
                'errback зависимого промиса вызван при соотвествтующем событии в "master"-Promise'
            );
            Promise.reject(testError)
                //@ts-ignore
                .createDependent()
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });
    });

    describe('.cancel()', () => {
        test('Вызов cancel() у Promise вовращает undefined', () => {
            try {
                //@ts-ignore
                new Promise(emptyFunc).cancel();
            } catch (err) {
                expect(err).toBeInstanceOf(Error);
            }
        });
    });

    describe('.getResult()', () => {
        test('Вызов getResult() у Promise вовращает undefined', () => {
            //@ts-ignore
            expect(new Promise(emptyFunc).getResult()).not.toBeDefined();
        });
    });

    describe('.isSuccessful()', () => {
        test('Вызов isSuccessful() у Promise вовращает undefined', () => {
            //@ts-ignore
            expect(new Promise(emptyFunc).isSuccessful()).not.toBeDefined();
        });
    });
});
