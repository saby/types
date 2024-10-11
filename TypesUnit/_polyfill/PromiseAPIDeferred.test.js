/* global define, describe, it, assert */
define(['Types/deferred', 'Types/PromiseAPIDeferred'], function (defferedLib) {
   'use strict';

   describe('PromiseAPIDeferred', () => {
      const emptyFunc = () => { };
      const testRes = { foo: 'bar' };
      const ASYNC_FUNC_MS = 9;

      describe('.addCallback()', () => {
         let resolvedPromise;

         beforeEach(() => {
            resolvedPromise = Promise.resolve(testRes);
         });

         it('promise.addCallback() возвращает Deferred', () => {
            assert.instanceOf(resolvedPromise.addCallback(null), defferedLib.Deferred);
         });

         it('promise.addCallback() получает результат promise', (done) => {
            resolvedPromise
               .addCallback((res) => { assert.deepEqual(res, testRes); })
               .then(done, done);
         });

         it('Из обработчика addCallback будет возвращен Error, должен стрельнуть errback', (done) => {
            const testError = new Error('Из обработчика addCallback будет возвращен Error, должен стрельнуть errback');
            resolvedPromise
               .addCallback(() => testError)
               .addErrback((err) => { assert.deepEqual(err, testError); })
               .then(done, done);
         });

         it('promise.then().addCallback() получает асинхронный результат', (done) => {
            resolvedPromise
               .then((res) => new Promise(resolve => setTimeout(() => resolve(res), ASYNC_FUNC_MS)))
               .addCallback((res) => { assert.deepEqual(res, testRes); })
               .then(done, done);
         });
      });

      describe('.addErrback()', () => {

         it('promise.addErrback() возвращает Deferred', () => {
            const testError = new Error('promise.addErrback() возвращает Deferred');
            assert.instanceOf(Promise.reject(testError).addErrback(emptyFunc), defferedLib.Deferred);
         });

         it('promise.addErrback(err) перехватывает ошибку из promise', (done) => {
            const testError = new Error('promise.addErrback(err) перехватывает ошибку из promise');
            Promise.reject(testError)
               .addErrback((err) => { assert.deepEqual(err, testError); })
               .then(done, done);
         });

         it('promise.then().addErrback() перехватывает асинхронную ошибку', (done) => {
            const testError = new Error('promise.then().addErrback() перехватывает асинхронную ошибку');
            Promise.reject(testError)
               .then((err) => new Promise(reject => setTimeout(() => reject(err), ASYNC_FUNC_MS)))
               .addErrback((err) => { assert.deepEqual(err, testError); })
               .then(done, done);
         });
      });

      describe('.addCallbacks()', () => {
         it('promise.addCallbacks() возвращает Deferred', () => {
            assert.instanceOf(Promise.resolve().addCallbacks(null, null), defferedLib.Deferred);
         });

         describe('callback', () => {
            let resolvedPromise;

            beforeEach(() => {
               resolvedPromise = Promise.resolve(testRes);
            });

            it('promise.addCallbacks(res, err) получает результат promise', (done) => {
               resolvedPromise
                  .addCallbacks(res => { assert.deepEqual(res, testRes); }, () => { assert.fail(null, null, 'Мы не должны были попасть в errback'); })
                  .then(done, done);
            });

            it('promise.then().addCallback() получает асинхронный результат', (done) => {
               resolvedPromise
                  .then((res) => new Promise(resolve => setTimeout(() => resolve(res), ASYNC_FUNC_MS)))
                  .addCallbacks((res) => { assert.deepEqual(res, testRes); }, null)
                  .then(done, done);
            });

            it('Из обработчика addCallbacks будет возвращен Error, должен стрельнуть errback', (done) => {
               const testError = new Error('Из обработчика addCallbacks будет возвращен Error, должен стрельнуть errback');
               resolvedPromise
                  .addCallbacks(() => testError, () => { assert.fail(null, null, 'Мы не должны были попасть в errback'); })
                  .addErrback(err => assert.deepEqual(err, testError))
                  .then(done, done);
            });
         });

         describe('errback', () => {

            it('promise.addCallbacks(res, err) перехватывает ошибку promise', (done) => {
               const testError = new Error('promise.addCallbacks(res, err) перехватывает ошибку promise');
               Promise.reject(testError)
                  .addCallbacks(() => { assert.fail(null, null, 'Мы не должны были попасть в callback'); }, (err) => { assert.deepEqual(err, testError); })
                  .then(done, done);
            });

            it('promise.then().addCallback() перехватывает асинхронную ошибку', (done) => {
               const testError = new Error('promise.then().addCallback() перехватывает асинхронную ошибку');
               Promise.reject(testError)
                  .then(err => new Promise(reject => setTimeout(() => reject(err), ASYNC_FUNC_MS)))
                  .addCallbacks(() => { assert.fail(null, null, 'Мы не должны были попасть в callback'); }, (err) => { assert.deepEqual(err, testError); })
                  .then(done, done);
            });
         });
      });

      describe('.addBoth()', () => {
         it('promise.addBoth() возвращает Deferred', () => {
            assert.instanceOf(Promise.resolve().addBoth(null), defferedLib.Deferred);
         });

         describe('callback', () => {
            let resolvedPromise;

            beforeEach(() => {
               resolvedPromise = Promise.resolve(testRes);
            });

            it('promise.addBoth(res) получает результат promise', (done) => {
               resolvedPromise
                  .addBoth((res) => { assert.deepEqual(res, testRes); })
                  .then(done, done);
            });

            it('promise.then().addBoth() получает асинхронный результат', (done) => {
               resolvedPromise
                  .then((res) => new Promise(resolve => setTimeout(() => resolve(res), ASYNC_FUNC_MS)))
                  .addBoth((res) => { assert.deepEqual(res, testRes); })
                  .then(done, done);
            });

            it('Из обработчика addBoth будет возвращен Error, должен стрельнуть errback', (done) => {
               const testError = new Error('Из обработчика addBoth будет возвращен Error, должен стрельнуть errback');
               resolvedPromise
                  .addBoth(() => testError)
                  .addErrback((err) => { assert.deepEqual(err, testError); })
                  .then(done, done);
            });
         });

         describe('errback', () => {
            it('promise.addBoth(err) перехватывает ошибку promise', (done) => {
               const testError = new Error('promise.addBoth(err) перехватывает ошибку promise');
               Promise.reject(testError)
                  .addBoth((err) => { assert.deepEqual(err, testError); })
                  .then(done, done);
            });

            it('promise.then().addBoth() перехватывает асинхронную ошибку', (done) => {
               const testError = new Error('promise.then().addBoth() перехватывает асинхронную ошибку');
               Promise.reject(testError)
                  .then((err) => new Promise(reject => setTimeout(() => reject(err), ASYNC_FUNC_MS)))
                  .addBoth((err) => { assert.deepEqual(err, testError); })
                  .then(done, done);
            });

         });
      });

      describe('.callback()', () => {
         it('promise.callback() выбрасывает исключение', () => {
            try {
               new Promise(emptyFunc).callback()
            } catch (err) {
               assert.instanceOf(err, Error);
            }
         });
      });

      describe('.errback()', () => {
         it('promise.errback() выбрасывает исключение', () => {
            try {
               new Promise(emptyFunc).errback()
            } catch (err) {
               assert.instanceOf(err, Error);
            }
         });
      });

      describe('.dependOn()', () => {
         let master;
         let promise;

         beforeEach(() => {
            master = new defferedLib.Deferred();
            promise = new Promise(emptyFunc).dependOn(master);
         });

         it('promise.dependOn() callback вызван при соотвествтующем событии в "master"-Deferred', (done) => {
            promise
               .addCallback((res) => { assert.deepEqual(res, testRes); })
               .then(done, done);
            master.callback(testRes);
         });

         it('promise.dependOn() errback вызван при соотвествтующем событии в "master"-Deferred', (done) => {
            const testError = new Error('promise.dependOn() errback вызван при соотвествтующем событии в "master"-Deferred');
            promise
               .addErrback((err) => { assert.deepEqual(err, testError); })
               .then(done, done);
            master.errback(testError).addErrback(null);
         });

         it('promise.dependOn() зависит от Deferred.success()', (done) => {
            new Promise(emptyFunc)
               .dependOn(defferedLib.Deferred.success(testRes))
               .addCallback((res) => { assert.deepEqual(res, testRes); })
               .then(done, done);
         });

         it('promise.dependOn() от Promise выбрасывает исключение', (done) => {
            new Promise(emptyFunc)
               .dependOn(Promise.resolve(testRes))
               .catch((e) => { assert.instanceOf(e, Error); })
               .then(done, done)
         });
      });

      describe('.createDependent()', () => {
         it('callback зависимого промиса вызван при соотвествтующем событии в "master"-Promise', (done) => {
            Promise.resolve(testRes)
               .createDependent()
               .addCallback((res) => { assert.deepEqual(res, testRes); })
               .then(done, done);
         });

         it('errback зависимого промиса вызван при соотвествтующем событии в "master"-Promise', (done) => {
            const testError = new Error('errback зависимого промиса вызван при соотвествтующем событии в "master"-Promise');
            Promise.reject(testError)
               .createDependent()
               .addErrback((err) => { assert.deepEqual(err, testError); })
               .then(done, done);
         });
      });

      describe('.cancel()', () => {
         it('Вызов cancel() у Promise вовращает undefined', () => {
            try {
               new Promise(emptyFunc).cancel()
            } catch (err) {
               assert.instanceOf(err, Error);
            }
         });
      });

      describe('.getResult()', () => {
         it('Вызов getResult() у Promise вовращает undefined', () => {
            assert.isUndefined(new Promise(emptyFunc).getResult());
         });
      });

      describe('.isSuccessful()', () => {
         it('Вызов isSuccessful() у Promise вовращает undefined', () => {
            assert.isUndefined(new Promise(emptyFunc).isSuccessful());
         });
      });
   });
});
