/* global define, describe, it, assert */
define([
   'Env/Env',
   'Types/deferred',
   'Types/PromiseAPIDeferred'
], function (
   Env,
   defferedLib,
) {

   describe('Types/deferred:Deferred', function () {
      describe('.constructor()', function () {
         it('should create instance of Promise', function () {
            var inst = new defferedLib.Deferred();
            assert.instanceOf(inst, Promise);
         });
      });

      describe('.isReady()', function () {
         it('should return false if checked with chain and next is not ready yet', function () {
            var prev = new defferedLib.Deferred(),
               next = new defferedLib.Deferred();

            prev.addCallback(function () {
               return next;
            });

            prev.callback();
            assert.isFalse(prev.isReady(true));
         });

         it('should return true if checked without chain and next is not ready yet', function () {
            var prev = new defferedLib.Deferred(),
               next = new defferedLib.Deferred();

            prev.addCallback(function () {
               return next;
            });

            prev.callback();
            assert.isTrue(prev.isReady());
         });
      });

      describe('.cancel()', function () {
         it('should set the result as an Error with "canceled" property', function () {
            var def = new defferedLib.Deferred();
            def.cancel();

            assert.instanceOf(def.getResult(), Error);
            assert.instanceOf(def.getResult(), defferedLib.DeferredCanceledError);
            assert.isTrue(def.getResult().canceled);
         });

         it('Deferred from Promise should call promise.abort()', function (done) {
            const promise = new Promise(() => {});
            const def = defferedLib.Deferred.fromPromise(promise);
            promise.abort = done;
            def.cancel();
         });
      });

      describe('.callback()', function () {
         it('should set the result', function () {
            var def = new defferedLib.Deferred(),
               result = {};
            def.callback(result);

            assert.strictEqual(def.getResult(), result);
         });
      });

      describe('.errback()', function() {
         it('should set the error from string', function() {
            var def = new defferedLib.Deferred();
            var result = 'Oops!';
            var lastError;
            def.addErrback(function(err) {
               lastError = err;
               return err;
            });
            def.errback(result);

            assert.strictEqual(def.getResult().message, result);
            assert.strictEqual(lastError.message, result);
         });

         it('should set the error from Error instance', function() {
            var def = new defferedLib.Deferred();
            var result = new Error('Oops!');
            var lastError;
            def.addErrback(function(err) {
               lastError = err;
               return err;
            });
            def.errback(result);

            assert.strictEqual(def.getResult(), result);
            assert.strictEqual(lastError, result);
         });

         it('should wite an error in logger if there is no error handler', function() {
            if (Env.constants.isBrowserPlatform) {
               this.skip();
               return;
            }

            var logger = {
               error: sinon.spy()
            };
            var def = new defferedLib.Deferred({
               logger: logger,
               loggerAwait: function(callack) {
                  callack();
               }
            });

            def.errback('Oops!');

            assert.isTrue(logger.error.calledTwice);

            var firstArgs = logger.error.firstCall.args;
            assert.equal(firstArgs[0], 'Deferred');
            assert.equal(firstArgs[1], 'There is no callbacks attached to handle error');
            assert.include(firstArgs[2].message, 'Oops!');
            assert.include(firstArgs[2].stack, 'Deferred.test.js');


            var secondArgs = logger.error.secondCall.args;
            assert.equal(secondArgs[0], 'Deferred');
            assert.equal(secondArgs[1], 'Unhandled error');
            assert.include(secondArgs[2].message, 'Oops!');
            assert.include(secondArgs[2].stack, 'Deferred.test.js');
         });
      });

      describe('.addCallback()', function () {
         it('should replace result with returned value', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo',
               second = 'bar';

            def.addCallback(function () {
               return second;
            });
            def.callback(first);

            assert.equal(def.getResult(), second);
         });

         it('should replace result with undefined', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo';

            def.addCallback(function () {});
            def.callback(first);

            assert.isUndefined(def.getResult());
         });

         it('should not replace cancelled error with returned value', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo';

            def.addCallback(function () {
               return first;
            });
            def.cancel();

            assert.instanceOf(def.getResult(), Error);
         });

         it('should not replace cancelled error with undefined', function () {
            var def = new defferedLib.Deferred();

            def.addCallback(function () {});
            def.cancel();

            assert.instanceOf(def.getResult(), Error);
         });

         it('Deferred дожидается Promise, возвращенного из addCallback-обработчика', (done) => {
            const testRes = { 'foo': 'bar' };
            defferedLib.Deferred.success()
               .addCallback(() => Promise.resolve(testRes))
               .addCallback((res) => {
                  if (res instanceof Promise) {
                     assert.fail(typeof res, 'object', 'Deferred не дождался результата Promise, а вернул его как результат!')
                  }
                  assert.deepEqual(res, testRes);
               }).then(done, done);
         });

         it('Deferred дожидается Promise, Resolved Promise из addErrback-обработчика попадает в Callback', (done) => {
            const testRes = { 'foo': 'bar' };
            defferedLib.Deferred.fail()
               .addErrback(() => Promise.resolve(testRes))
               .addErrback(() => assert.fail('addErrback сработал на Resolved Promise!'))
               .addCallback((res) => {
                  if (res instanceof Promise) {
                     assert.fail(typeof res, 'object', 'Deferred не дождался результата Promise, а вернул его как результат!')
                  }
                  assert.deepEqual(res, testRes);
               }).then(done, done);
         });
      });

      describe('.addErrback()', function () {
         it('should replace result with returned value', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo',
               second = 'bar';

            def.addErrback(function () {
               return second;
            });
            def.errback(first);

            assert.equal(def.getResult(), second);
         });

         it('should replace result with undefined', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo';

            def.addErrback(function () {});
            def.errback(first);

            assert.isUndefined(def.getResult());
         });

         it('should get error with empty message', function (done) {
            var def = new defferedLib.Deferred();

            def.addErrback(function (error) {
               assert.strictEqual(error.message, '');
               done()
            });
            def.errback();
         });

         it('should replace cancelled error with returned value', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo';

            def.addErrback(function () {
               return first;
            });
            def.cancel();

            assert.equal(def.getResult(), first);
         });

         it('should replace cancelled error with undefined', function () {
            var def = new defferedLib.Deferred(),
               first = 'foo';

            def.addErrback(function () {});
            def.cancel();

            assert.isUndefined(def.getResult());
         });

         it('Deferred дожидается Promise, возвращенного из addErrback-обработчика', (done) => {
            const testError = new Error('Deferred дожидается Promise, возвращенного из addErrback-обработчика');
            defferedLib.Deferred.fail()
               .addErrback(() => Promise.reject(testError))
               .addErrback((err) => {
                  if (err instanceof Promise) {
                     assert.fail(typeof err, 'object', 'Deferred не дождался результата Promise, а вернул его как результат!')
                  }
                  assert.deepEqual(err, testError);
               }).then(done, done);
         });

         it('Deferred дожидается Promise, Rejected Promise из addCallback-обработчика попадает в Errback', (done) => {
            const testError = new Error('Deferred дожидается Promise, Rejected Promise из addCallback-обработчика попадает в Errback');
            defferedLib.Deferred.success()
               .addCallback(() => Promise.reject(testError))
               .addCallback(() => assert.fail('addCallback сработал на Rejected Promise!'))
               .addErrback((err) => {
                  if (err instanceof Promise) {
                     assert.fail(typeof err, 'object', 'Deferred не дождался результата Promise, а вернул его как результат!')
                  }
                  assert.deepEqual(err, testError);
               }).then(done, done);
         });
      });

      describe('.dependOn()', function () {
         it('should leave the result as an Error in cancelled slave after master callback', function () {
            var master = new defferedLib.Deferred(),
               slave = new defferedLib.Deferred(),
               masterResult = {};

            slave.dependOn(master);
            slave.cancel();
            master.callback(masterResult);

            assert.strictEqual(master.getResult(), masterResult);
            assert.instanceOf(slave.getResult(), Error);
            assert.isTrue(slave.getResult().canceled);
         });

         it('should force the result as an Error after master callback with cancelled slave', function () {
            var resolvedlog = Env.IoC.resolve('ILogger'),
               logErrors = [];
            Env.IoC.bind('ILogger', {
               warn: resolvedlog.warn,
               error: function (error, message, originError) {
                  logErrors.push({
                     error: error,
                     message: message,
                     originError: originError
                  });
               },
               log: resolvedlog.log,
               info: resolvedlog.info
            });
            var master = new defferedLib.Deferred(),
               slave = new defferedLib.Deferred(),
               masterResult = {},
               slaveResult = {};

            slave.dependOn(master);
            slave.addBoth(function () {
               return slaveResult;
            });
            slave.cancel();
            master.callback(masterResult);

            Env.IoC.bind('ILogger', resolvedlog);

            assert.instanceOf(master.getResult(), Error);
            assert.strictEqual(slave.getResult(), slaveResult);
            assert.isTrue(logErrors.length === 1 && logErrors[0].message === 'Callback function throwing an error: Deferred is already fired with state "success"');
         });
      });
   });

   describe('Types/deferred:Deferred <-> Promise', function () {
      describe('.toPromise()', function () {
         it('Value from deferred have to transfering to promise', function (done) {
            var RESPONSE_VALUE = 'deferred response';
            var def = new defferedLib.Deferred();
            var promise = defferedLib.Deferred.toPromise(def);
            promise.then(function (res) {
               assert.equal(res, RESPONSE_VALUE);
            }).then(done, done);
            def.callback(RESPONSE_VALUE);
         });

         it('Error from deferred have to transfering to promise', function (done) {
            var myError = new Error();
            var def = new defferedLib.Deferred();
            var promise = defferedLib.Deferred.toPromise(def);
            promise.catch(function (err) {
               assert.equal(err, myError);
            }).then(done, done);
            def.errback(myError);
         });

         it('Callback before: Value from deferred have to transfering to promise', function (done) {
            var RESPONSE_VALUE = 'deferred response';
            var def = new defferedLib.Deferred();
            var promise = defferedLib.Deferred.toPromise(def);
            def.callback(RESPONSE_VALUE);
            promise.then(function (res) {
               assert.equal(res, RESPONSE_VALUE);
            }).then(done, done);
         });

         it('Errback before: Error from deferred have to transfering to promise', function (done) {
            var myError = new Error();
            var def = new defferedLib.Deferred();
            var promise = defferedLib.Deferred.toPromise(def);
            def.errback(myError);
            promise.catch(function (err) {
               assert.equal(err, myError);
            }).then(done, done);
         });
      });

      describe('.fromPromise()', function () {
         it('Value from promise have to transfering to deferred', function (done) {
            var RESPONSE_VALUE = 'promise response';
            var promise = new Promise(function (resolve) {
               setTimeout(function () {
                  resolve(RESPONSE_VALUE);
               }, 10);
            });

            defferedLib.Deferred.fromPromise(promise).addCallbacks(function (res) {
               assert.equal(res, RESPONSE_VALUE);
               done();
            }, function (err) {
               done(err);
            });
         });

         it('Error from promise have to transfering to deferred', function (done) {
            var myError = new Error();
            var promise = new Promise(function (_, reject) {
               setTimeout(function () {
                  reject(myError);
               }, 10);
            });

            defferedLib.Deferred.fromPromise(promise).addErrback(function (res) {
               assert.equal(res, myError);
               done();
            }).addErrback(function (err) {
               done(err);
            });
         });

         it('Link to Promise-parent saved', function () {
            const promise = Promise.resolve();
            const def = defferedLib.Deferred.fromPromise(promise);
            assert.deepEqual(def._parentPromise, promise)
         });
      });
   });

   describe('Types/deferred:Deferred Promise API', () => {
      const testRes = {foo: 'bar'};

      describe('then', () => {
         it('Метод then возвращает Promise', () => { assert.instanceOf(defferedLib.Deferred.success().then(null), Promise); });

         it('Метод then добавляет обработчик на успех', (done) => {
            const def = new defferedLib.Deferred();
            def.then((res) => { assert.deepEqual(res, testRes); }).then(done, done);
            def.callback(testRes)
         });

         it('Метод then добавляет обработчик на ошибку', (done) => {
            const testError = new Error('Метод then добавляет обработчик на ошибку');
            const def = new defferedLib.Deferred();
            def.then(null, (err) => { assert.deepEqual(err, testError); }).then(done, done);
            def.errback(testError)
         });

         it('Метод then пробрасывает значение в цепочку Deferred', (done) => {
            const def = new defferedLib.Deferred();
            def.then((res) => { assert.deepEqual(res, testRes); });
            def.addCallback((res) => { assert.deepEqual(res, testRes); }).then(done, done);
            def.callback(testRes);
         });

         it('Метод then пробрасывает ошибку в цепочку Deferred', (done) => {
            const testError = new Error('Метод then пробрасывает ошибку в цепочку Deferred');
            const def = new defferedLib.Deferred();
            def.then(null, (err) => { assert.deepEqual(err, testError); });
            def.addErrback((err) => { assert.deepEqual(err, testError); }).then(done, done);
            def.errback(testError);
         });

         it('Метод then возвращает Promise, который перехватывает errback Deferred через catch ', (done) => {
            const testError = new Error('Метод then возвращает Promise, который перехватывает errback Deferred через catch');
            const promise = new defferedLib.Deferred().errback(testError).then();
            promise.catch((err) => { assert.deepEqual(err, testError); }).then(done, done);
         });

         it('Метод then возвращает Promise, который перехватывает errback Deferred через addErrback', (done) => {
            const testError = new Error('Метод then возвращает Promise, который перехватывает errback Deferred через addErrback');
            const promise = new defferedLib.Deferred().errback(testError).then();
            promise.addErrback((err) => { assert.deepEqual(err, testError); }).then(done, done);
         });
      });

      describe('catch', () => {
         it('Метод catch возвращает Promise', () => {
            assert.instanceOf(defferedLib.Deferred.fail().catch(() => { }), Promise);
         });

         it('Второй метод catch не срабатывает', (done) => {
            defferedLib.Deferred.fail()
               .catch(() => { })
               .catch((err) => { assert.fail(err, null, 'Второй метод catch не должен срабатывать'); })
               .then(done, done);
         });

         it('Метод catch добавляет обработчик на выброс исключения', (done) => {
            const testError = new Error('Метод catch добавляет обработчик на выброс исключения');
            const def = new defferedLib.Deferred();
            def.catch((err) => { assert.deepEqual(err, testError); }).then(done, done);
            def.errback(testError)
         });

         it('Метод catch пробрасывает ошибку в цепочку Deferred', (done) => {
            const testError = new Error('Метод catch пробрасывает ошибку в цепочку Deferred');
            const def = new defferedLib.Deferred();
            def.catch((err) => { assert.deepEqual(err, testError); })
            def.addErrback((err) => { assert.deepEqual(err, testError); }).then(done, done);
            def.errback(testError);
         });

         it('Метод catch возвращает Promise, который перехватывает callback Deferred через then', (done) => {
            const promise = new defferedLib.Deferred().callback(testRes).catch();
            promise.then((res) => { assert.deepEqual(res, testRes); }).then(done, done);
         });

         it('Метод catch возвращает Promise, который перехватывает callback Deferred через addCallback', (done) => {
            const promise = new defferedLib.Deferred().callback(testRes).catch();
            promise.addCallback((res) => { assert.deepEqual(res, testRes); }).then(done, done);
         });
      });

      describe('finally', () => {
         it('should return an instance of Promise', () => {
            assert.instanceOf(defferedLib.Deferred.success().finally(null), Promise);
         });

         it('should resolve chained promise on deferred success', () => {
            const def = new defferedLib.Deferred();

            const promise = def.finally((res) => {
               assert.isUndefined(res);
            }).then((res) => {
               assert.strictEqual(res, testRes);
            }).catch((err) => {
               throw new Error(`Shouldn\'t get here but ${err}`);
            });
            def.callback(testRes);

            return promise;
         });

         it('should reject chained promise on deferred error', () => {
            const testError = new Error('Foo');
            const def = new defferedLib.Deferred();
            const promise = def.finally((res) => {
               assert.isUndefined(res);
            }).then((res) => {
               throw new Error(`Shouldn\'t get here but ${res}`);
            }).catch((err) => {
               assert.strictEqual(err, testError);
            });
            def.errback(testError)

            return promise;
         });

         it('should resolve chained promise on deferred success with itsown callback', () => {
            const def = new defferedLib.Deferred();

            const promise = def.finally((res) => {
               assert.isUndefined(res);
            }).then((res) => {
               assert.strictEqual(res, testRes);
            }).catch((err) => {
               throw new Error(`Shouldn\'t get here but ${err}`);
            });

            def.addBoth((res) => {
               assert.strictEqual(res, testRes);
            });
            def.callback(testRes);

            return promise;
         });

         it('should reject chained promise on deferred error with itsown callback', () => {
            const testError = new Error('Foo');
            const def = new defferedLib.Deferred();
            const promise = def.finally((res) => {
               assert.isUndefined(res);
            }).then((res) => {
               throw new Error(`Shouldn\'t get here but ${res}`);
            }).catch((err) => {
               assert.strictEqual(err, testError);
            });

            def.addBoth((err) => {
               assert.strictEqual(err, testError);
            });
            def.errback(testError);

            return promise;
         });
      });
   });
});
