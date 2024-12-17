/* global define, describe, it, assert */
define(['Types/deferred', 'Types/PromiseAPIDeferred'], function (defferedLib) {
   'use strict';

   const testRes = { foo: 'bar' };
   const ASYNC_FUNC_MS = 9;

   describe('Promise-Deferred', () => {
      describe('Promise -> Deferred -> Promise', () => {
         it('Promise - addCallback - then', (done) => {
            Promise.resolve(testRes)
               .addCallback((res) => res)
               .then((res) => { assert.deepEqual(res, testRes); })
               .then(done, done);
         });

         it('Promise - addErrback - catch', (done) => {
            const testError = new Error('Promise - addErrback - catch');
            Promise.reject(testError)
               .addErrback((err) => err)
               .catch((err) => { assert.deepEqual(err, testError); })
               .then(done, done);
         });

         it('Ошибка из Promise пробрасывается через все callback`и в errback', (done) => {
            const testError = new Error('Ошибка из Promise пробрасывается через все callback`и в errback');
            const promise = new Promise((resolve, reject) => {
               setTimeout(() => reject(testError), ASYNC_FUNC_MS);
            }).catch((e) => {
               throw e;
            });
            promise
               .addCallback((res) => res)
               .addCallbacks(
                  () => { assert.fail('Сработал callback на Rejected Promise!'); },
                  (err) => { assert.deepEqual(err, testError); }
               ).then(done, done);
         });

         it('Ошибка из Promise пробрасывается через addBoth, addCallback в errback', (done) => {
            const testError = new Error('Ошибка из Promise пробрасывается через addBoth, addCallback в errback');
            const promise = new Promise((resolve, reject) => {
               setTimeout(() => reject(testError), ASYNC_FUNC_MS);
            }).catch((e) => {
               throw e;
            });
            promise
               .addBoth((res) => res)
               .addCallback(() => { assert.fail('Сработал callback на Rejected Promise!'); })
               .addCallbacks(
                  () => { assert.fail('Сработал callback на Rejected Promise!'); },
                  (err) => { assert.deepEqual(err, testError); }
               ).then(done, done);
         });

         it('Результат из Promise пробрасывается через все errback`и в callback', (done) => {
            const promise = new Promise((resolve) => {
               setTimeout(() => resolve(testRes), ASYNC_FUNC_MS);
            }).catch((e) => { throw e; });
            promise
               .addErrback((err) => err)
               .addCallbacks(
                  (res) => { assert.deepEqual(res, testRes); },
                  () => { assert.fail('Сработал errlback на Resolved Promise!'); }
               ).then(done, done);
         });

         it('Результат из Promise пробрасывается через addBoth, errback в callback', (done) => {
            const promise = new Promise((resolve) => {
               setTimeout(() => resolve(testRes), ASYNC_FUNC_MS);
            }).catch((e) => { throw e; });
            promise
               .addBoth((res) => res)
               .addErrback((err) => err)
               .addCallbacks(
                  (res) => { assert.deepEqual(res, testRes); },
                  () => { assert.fail('Сработал errlback на Resolved Promise!'); }
               ).then(done, done);
         });
      });

      describe('Deferred -> Promise -> Deferred', () => {
         it('Deferred - then - addCallback', (done) => {
            defferedLib.Deferred.success(testRes)
               .then((res) => res)
               .addCallback((res) => { assert.deepEqual(res, testRes); })
               .addBoth(done);
         });

         it('Deferred - catch - addErrback', (done) => {
            const testError = new Error('Deferred - catch - addErrback');
            defferedLib.Deferred.fail(testError)
               .catch((err) => {
                  throw err;
               })
               .addErrback((err) => { assert.deepEqual(err, testError); })
               .addBoth(done);
         });
      });
   });
});
