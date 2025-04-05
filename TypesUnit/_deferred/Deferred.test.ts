import { Deferred, DeferredCanceledError } from 'Types/deferred';
import { IoC, constants } from 'Env/Env';
import 'Types/PromiseAPIDeferred';

describe('Types/deferred:Deferred', () => {
    describe('.constructor()', () => {
        test('should create instance of Promise', () => {
            const inst = new Deferred();
            expect(inst).toBeInstanceOf(Promise);
        });
    });

    describe('.isReady()', () => {
        test('should return false if checked with chain and next is not ready yet', () => {
            const prev = new Deferred();
            const next = new Deferred();

            prev.addCallback(() => {
                return next;
            });

            prev.callback();
            expect(prev.isReady(true)).toBe(false);
        });

        test('should return true if checked without chain and next is not ready yet', () => {
            const prev = new Deferred();
            const next = new Deferred();

            prev.addCallback(() => {
                return next;
            });

            prev.callback();
            expect(prev.isReady()).toBe(true);
        });
    });

    describe('.cancel()', () => {
        test('should set the result as an Error with "canceled" property', () => {
            const def = new Deferred();
            def.cancel();

            expect(def.getResult()).toBeInstanceOf(Error);
            expect(def.getResult()).toBeInstanceOf(DeferredCanceledError);
            //@ts-ignore
            expect(def.getResult().canceled).toBe(true);
        });

        test('Deferred from Promise should call promise.abort()', (done) => {
            const promise = new Promise(() => {
                /*noop*/
            });
            const def = Deferred.fromPromise(promise);
            //@ts-ignore
            promise.abort = done;
            def.cancel();
        });
    });

    describe('.callback()', () => {
        test('should set the result', () => {
            const def = new Deferred();
            const result = {};
            def.callback(result);

            expect(def.getResult()).toBe(result);
        });
    });

    describe('.errback()', () => {
        test('should set the error from string', () => {
            const def = new Deferred();
            const result = 'Oops!';
            let lastError;
            def.addErrback(function (err) {
                lastError = err;
                return err;
            });
            def.errback(result);

            //@ts-ignore
            expect(def.getResult().message).toBe(result);
            //@ts-ignore
            expect(lastError.message).toBe(result);
        });

        test('should set the error from Error instance', () => {
            const def = new Deferred();
            const result = new Error('Oops!');
            let lastError;
            def.addErrback(function (err) {
                lastError = err;
                return err;
            });
            def.errback(result);

            expect(def.getResult()).toBe(result);
            expect(lastError).toBe(result);
        });

        test('should wite an error in logger if there is no error handler', () => {
            if (constants.isBrowserPlatform) {
                //@ts-ignore
                this.skip();
                return;
            }

            const logger = {
                error: jest.fn(),
            };
            const def = new Deferred({
                //@ts-ignore
                logger,
                //@ts-ignore
                loggerAwait(callack) {
                    callack();
                },
            });

            def.errback('Oops!');

            //@ts-ignore
            expect(logger.error.mock.calls.length).toBe(2);

            const firstArgs = logger.error.mock.calls[0];
            expect(firstArgs[0]).toEqual('Deferred');
            expect(firstArgs[1]).toEqual('There is no callbacks attached to handle error');
            expect(firstArgs[2].message).toContain('Oops!');
            expect(firstArgs[2].stack).toContain('Deferred.test.');

            const secondArgs = logger.error.mock.calls[1];
            expect(secondArgs[0]).toEqual('Deferred');
            expect(secondArgs[1]).toEqual('Unhandled error');
            expect(secondArgs[2].message).toContain('Oops!');
            expect(secondArgs[2].stack).toContain('Deferred.test.');
        });
    });

    describe('.addCallback()', () => {
        test('should replace result with returned value', () => {
            const def = new Deferred();
            const first = 'foo';
            const second = 'bar';

            def.addCallback(() => {
                return second;
            });
            def.callback(first);

            expect(def.getResult()).toEqual(second);
        });

        test('should replace result with undefined', () => {
            const def = new Deferred();
            const first = 'foo';

            def.addCallback(() => {
                /*noop*/
            });
            def.callback(first);

            expect(def.getResult()).not.toBeDefined();
        });

        test('should not replace cancelled error with returned value', () => {
            const def = new Deferred();
            const first = 'foo';

            def.addCallback(() => {
                return first;
            });
            def.cancel();

            expect(def.getResult()).toBeInstanceOf(Error);
        });

        test('should not replace cancelled error with undefined', () => {
            const def = new Deferred();

            def.addCallback(() => {
                /*noop*/
            });
            def.cancel();

            expect(def.getResult()).toBeInstanceOf(Error);
        });

        test('Deferred дожидается Promise, возвращенного из addCallback-обработчика', (done) => {
            const testRes = { foo: 'bar' };
            //@ts-ignore
            Deferred.success()
                .addCallback(() => Promise.resolve(testRes))
                .addCallback((res) => {
                    if (res instanceof Promise) {
                        expect(false).toBe(true);
                    }
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });

        test('Deferred дожидается Promise, Resolved Promise из addErrback-обработчика попадает в Callback', (done) => {
            const testRes = { foo: 'bar' };
            //@ts-ignore
            Deferred.fail()
                .addErrback(() => Promise.resolve(testRes))
                .addErrback(() => expect(false).toBe(true))
                .addCallback((res) => {
                    if (res instanceof Promise) {
                        expect(false).toBe(true);
                    }
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });
    });

    describe('.addErrback()', () => {
        test('should replace result with returned value', () => {
            const def = new Deferred();
            const first = 'foo';
            const second = 'bar';

            //@ts-ignore
            def.addErrback(() => {
                return second;
            });
            def.errback(first);

            expect(def.getResult()).toEqual(second);
        });

        test('should replace result with undefined', () => {
            const def = new Deferred();
            const first = 'foo';

            def.addErrback(() => {
                /*noop*/
            });
            def.errback(first);

            expect(def.getResult()).not.toBeDefined();
        });

        test('should get error with empty message', (done) => {
            const def = new Deferred();

            def.addErrback(function (error) {
                expect(error.message).toBe('');
                done();
            });
            def.errback();
        });

        test('should replace cancelled error with returned value', () => {
            const def = new Deferred();
            const first = 'foo';

            //@ts-ignore
            def.addErrback(() => {
                return first;
            });
            def.cancel();

            expect(def.getResult()).toEqual(first);
        });

        test('should replace cancelled error with undefined', () => {
            const def = new Deferred();

            def.addErrback(() => {
                /*noop*/
            });
            def.cancel();

            expect(def.getResult()).not.toBeDefined();
        });

        test('Deferred дожидается Promise, возвращенного из addErrback-обработчика', (done) => {
            const testError = new Error(
                'Deferred дожидается Promise, возвращенного из addErrback-обработчика'
            );
            //@ts-ignore
            Deferred.fail()
                .addErrback(() => Promise.reject(testError))
                .addErrback((err) => {
                    if (err instanceof Promise) {
                        expect(false).toBe(true);
                    }
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });

        test('Deferred дожидается Promise, Rejected Promise из addCallback-обработчика попадает в Errback', (done) => {
            const testError = new Error(
                'Deferred дожидается Promise, Rejected Promise из addCallback-обработчика попадает в Errback'
            );
            //@ts-ignore
            Deferred.success()
                .addCallback(() => Promise.reject(testError))
                .addCallback(() => expect(false).toBe(true))
                .addErrback((err) => {
                    if (err instanceof Promise) {
                        expect(false).toBe(true);
                    }
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });
    });

    describe('.dependOn()', () => {
        test('should leave the result as an Error in cancelled slave after master callback', () => {
            const master = new Deferred();
            const slave = new Deferred();
            const masterResult = {};

            slave.dependOn(master);
            slave.cancel();
            master.callback(masterResult);

            expect(master.getResult()).toBe(masterResult);
            expect(slave.getResult()).toBeInstanceOf(Error);
            //@ts-ignore
            expect(slave.getResult().canceled).toBe(true);
        });

        test('should force the result as an Error after master callback with cancelled slave', () => {
            const resolvedlog = IoC.resolve('ILogger');
            const logErrors: Error[] = [];

            IoC.bind('ILogger', {
                warn: resolvedlog.warn,
                //@ts-ignore
                error(error, message, originError) {
                    logErrors.push({
                        //@ts-ignore
                        error,
                        message,
                        originError,
                    });
                },
                log: resolvedlog.log,
                info: resolvedlog.info,
            });
            const master = new Deferred();
            const slave = new Deferred();
            const masterResult = {};
            const slaveResult = {};

            slave.dependOn(master);
            slave.addBoth(() => {
                return slaveResult;
            });
            slave.cancel();
            master.callback(masterResult);

            IoC.bind('ILogger', resolvedlog);

            expect(master.getResult()).toBeInstanceOf(Error);
            expect(slave.getResult()).toBe(slaveResult);
            expect(
                logErrors.length === 1 &&
                    logErrors[0].message ===
                        'Callback function throwing an error: Deferred is already fired with state "success"'
            ).toBe(true);
        });
    });
});

describe('Types/deferred:Deferred <-> Promise', () => {
    describe('.toPromise()', () => {
        test('Value from deferred have to transfering to promise', (done) => {
            const RESPONSE_VALUE = 'deferred response';
            const def = new Deferred();
            const promise = Deferred.toPromise(def);
            promise
                .then(function (res) {
                    expect(res).toEqual(RESPONSE_VALUE);
                })
                .then(done, done);
            def.callback(RESPONSE_VALUE);
        });

        test('Error from deferred have to transfering to promise', (done) => {
            const myError = new Error();
            const def = new Deferred();
            const promise = Deferred.toPromise(def);
            promise
                .catch(function (err) {
                    expect(err).toEqual(myError);
                })
                .then(done, done);
            def.errback(myError);
        });

        test('Callback before: Value from deferred have to transfering to promise', (done) => {
            const RESPONSE_VALUE = 'deferred response';
            const def = new Deferred();
            const promise = Deferred.toPromise(def);
            def.callback(RESPONSE_VALUE);
            promise
                .then(function (res) {
                    expect(res).toEqual(RESPONSE_VALUE);
                })
                .then(done, done);
        });

        test('Errback before: Error from deferred have to transfering to promise', (done) => {
            const myError = new Error();
            const def = new Deferred();
            const promise = Deferred.toPromise(def);
            def.errback(myError);
            promise
                .catch(function (err) {
                    expect(err).toEqual(myError);
                })
                .then(done, done);
        });
    });

    describe('.fromPromise()', () => {
        test('Value from promise have to transfering to deferred', (done) => {
            const RESPONSE_VALUE = 'promise response';
            const promise = new Promise(function (resolve) {
                setTimeout(() => {
                    resolve(RESPONSE_VALUE);
                }, 10);
            });

            Deferred.fromPromise(promise).addCallbacks(
                function (res) {
                    expect(res).toEqual(RESPONSE_VALUE);
                    done();
                },
                function (err) {
                    done(err);
                }
            );
        });

        test('Error from promise have to transfering to deferred', (done) => {
            const myError = new Error();
            const promise = new Promise(function (_, reject) {
                setTimeout(() => {
                    reject(myError);
                }, 10);
            });

            Deferred.fromPromise(promise)
                .addErrback(function (res) {
                    expect(res).toEqual(myError);
                    done();
                })
                .addErrback(function (err) {
                    done(err);
                });
        });

        test('Link to Promise-parent saved', () => {
            const promise = Promise.resolve();
            const def = Deferred.fromPromise(promise);
            //@ts-ignore
            expect(def._parentPromise).toEqual(promise);
        });
    });
});

describe('Types/deferred:Deferred Promise API', () => {
    const testRes = { foo: 'bar' };

    describe('then', () => {
        test('Метод then возвращает Promise', () => {
            //@ts-ignore
            expect(Deferred.success().then(null)).toBeInstanceOf(Promise);
        });

        test('Метод then добавляет обработчик на успех', (done) => {
            const def = new Deferred();
            def.then((res) => {
                expect(res).toEqual(testRes);
            }).then(done, done);
            def.callback(testRes);
        });

        test('Метод then добавляет обработчик на ошибку', (done) => {
            const testError = new Error('Метод then добавляет обработчик на ошибку');
            const def = new Deferred();
            def.then(null, (err) => {
                expect(err).toEqual(testError);
            }).then(done, done);
            def.errback(testError);
        });

        test('Метод then пробрасывает значение в цепочку Deferred', (done) => {
            const def = new Deferred();
            def.then((res) => {
                expect(res).toEqual(testRes);
            });
            def.addCallback((res) => {
                expect(res).toEqual(testRes);
            }).then(done, done);
            def.callback(testRes);
        });

        test('Метод then пробрасывает ошибку в цепочку Deferred', (done) => {
            const testError = new Error('Метод then пробрасывает ошибку в цепочку Deferred');
            const def = new Deferred();
            def.then(null, (err) => {
                expect(err).toEqual(testError);
            });
            def.addErrback((err) => {
                expect(err).toEqual(testError);
            }).then(done, done);
            def.errback(testError);
        });

        test('Метод then возвращает Promise, который перехватывает errback Deferred через catch ', (done) => {
            const testError = new Error(
                'Метод then возвращает Promise, который перехватывает errback Deferred через catch'
            );
            const promise = new Deferred().errback(testError).then();
            promise
                .catch((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });

        test('Метод then возвращает Promise, который перехватывает errback Deferred через addErrback', (done) => {
            const testError = new Error(
                'Метод then возвращает Promise, который перехватывает errback Deferred через addErrback'
            );
            const promise = new Deferred().errback(testError).then();
            promise
                //@ts-ignore
                .addErrback((err) => {
                    expect(err).toEqual(testError);
                })
                .then(done, done);
        });
    });

    describe('catch', () => {
        test('Метод catch возвращает Promise', () => {
            //@ts-ignore
            expect(
                //@ts-ignore
                Deferred.fail().catch(() => {
                    /*noop*/
                })
            ).toBeInstanceOf(Promise);
        });

        test('Второй метод catch не срабатывает', (done) => {
            //@ts-ignore
            Deferred.fail()
                .catch(() => {
                    /*noop*/
                })
                .catch(() => {
                    expect(false).toBe(true);
                })
                .then(done, done);
        });

        test('Метод catch добавляет обработчик на выброс исключения', (done) => {
            const testError = new Error('Метод catch добавляет обработчик на выброс исключения');
            const def = new Deferred();
            def.catch((err) => {
                expect(err).toEqual(testError);
            }).then(done, done);
            def.errback(testError);
        });

        test('Метод catch пробрасывает ошибку в цепочку Deferred', (done) => {
            const testError = new Error('Метод catch пробрасывает ошибку в цепочку Deferred');
            const def = new Deferred();
            def.catch((err) => {
                expect(err).toEqual(testError);
            });
            def.addErrback((err) => {
                expect(err).toEqual(testError);
            }).then(done, done);
            def.errback(testError);
        });

        test('Метод catch возвращает Promise, который перехватывает callback Deferred через then', (done) => {
            //@ts-ignore
            const promise = new Deferred().callback(testRes).catch();
            promise
                .then((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });

        test('Метод catch возвращает Promise, который перехватывает callback Deferred через addCallback', (done) => {
            //@ts-ignore
            const promise = new Deferred().callback(testRes).catch();
            promise
                //@ts-ignore
                .addCallback((res) => {
                    expect(res).toEqual(testRes);
                })
                .then(done, done);
        });
    });

    describe('finally', () => {
        test('should return an instance of Promise', () => {
            //@ts-ignore
            expect(Deferred.success().finally(null)).toBeInstanceOf(Promise);
        });

        test('should resolve chained promise on deferred success', () => {
            const def = new Deferred();

            const promise = def
                //@ts-ignore
                .finally((res) => {
                    expect(res).not.toBeDefined();
                })
                .then((res) => {
                    expect(res).toBe(testRes);
                })
                .catch((err) => {
                    throw new Error(`Shouldn't get here but ${err}`);
                });
            def.callback(testRes);

            return promise;
        });

        test('should reject chained promise on deferred error', () => {
            const testError = new Error('Foo');
            const def = new Deferred();
            const promise = def
                //@ts-ignore
                .finally((res) => {
                    expect(res).not.toBeDefined();
                })
                .then((res) => {
                    throw new Error(`Shouldn't get here but ${res}`);
                })
                .catch((err) => {
                    expect(err).toBe(testError);
                });
            def.errback(testError);

            return promise;
        });

        test('should resolve chained promise on deferred success with itsown callback', () => {
            const def = new Deferred();

            const promise = def
                //@ts-ignore
                .finally((res) => {
                    expect(res).not.toBeDefined();
                })
                .then((res) => {
                    expect(res).toBe(testRes);
                })
                .catch((err) => {
                    throw new Error(`Shouldn't get here but ${err}`);
                });

            //@ts-ignore
            def.addBoth((res) => {
                expect(res).toBe(testRes);
            });
            def.callback(testRes);

            return promise;
        });

        test('should reject chained promise on deferred error with itsown callback', () => {
            const testError = new Error('Foo');
            const def = new Deferred();
            const promise = def
                //@ts-ignore
                .finally((res) => {
                    expect(res).not.toBeDefined();
                })
                .then((res) => {
                    throw new Error(`Shouldn't get here but ${res}`);
                })
                .catch((err) => {
                    expect(err).toBe(testError);
                });

            //@ts-ignore
            def.addBoth((err) => {
                expect(err).toBe(testError);
            });
            def.errback(testError);

            return promise;
        });
    });
});
