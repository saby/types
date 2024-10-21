define([
   'Types/ParallelDeferred',
   'Types/deferred'
], function (
   ParallelDeferred,
   defferedLib
) {
   describe('Types/ParallelDeferred', function () {
      describe('.getResult()', function () {
         it('should return Deferred', function () {
            var pd = new ParallelDeferred();
            assert.instanceOf(pd.getResult(), defferedLib.Deferred);
         });
      });

      describe('.done()', function () {
         it('should call result callback', function () {
            var pd = new ParallelDeferred(),
               callsCount = 0;

            pd.done().getResult().addCallback(function () {
               callsCount++;
            });

            assert.strictEqual(callsCount, 1);
            assert.strictEqual(pd.getStepsCount(), 0);
         });

         it('should pass empty object to the result callback by default', function () {
            var pd = new ParallelDeferred(),
               given;

            pd.done().getResult().addCallback(function (result) {
               given = result;
            });

            assert.deepEqual(given, {});
            assert.strictEqual(pd.getStepsCount(), 0);
         });

         it('should pass data to the result callback', function () {
            var pd = new ParallelDeferred(),
               expect = 10,
               given;

            pd.done(expect).getResult().addCallback(function (result) {
               given = result;
            });

            assert.strictEqual(given, expect);
            assert.strictEqual(pd.getStepsCount(), 0);
         });

         it('should pass data to the result callback after all steps done', function () {
            var d1 = new defferedLib.Deferred(),
               d2 = new defferedLib.Deferred(),
               pd = new ParallelDeferred({steps: [d1, d2]}),
               expect = 10,
               given;

            pd.done(expect).getResult().addCallback(function (result) {
               given = result;
            });

            assert.equal(pd.getStepsCount(), 2);
            assert.equal(pd.getStepsDone(), 0);
            assert.equal(pd.getStepsSuccess(), 0);
            assert.isUndefined(given);

            d1.callback();

            assert.equal(pd.getStepsCount(), 2);
            assert.equal(pd.getStepsDone(), 1);
            assert.equal(pd.getStepsSuccess(), 1);
            assert.isUndefined(given);

            d2.callback();

            assert.equal(pd.getStepsCount(), 2);
            assert.equal(pd.getStepsDone(), 2);
            assert.equal(pd.getStepsSuccess(), 2);
            assert.strictEqual(given, expect);
         });

         it('should pass data of all the steps as array to the callback', function () {
            var d1 = new defferedLib.Deferred(),
               d2 = new defferedLib.Deferred(),
               pd = new ParallelDeferred(),
               hasError = false,
               expect = new Error(),
               given;

            pd.push(d1).push(d2);
            pd.done().getResult().addCallbacks(function (result) {
               given = result;
            }, function () {
               hasError = true;
            });

            d1.callback('res1');
            d2.callback('res2');

            assert.equal(given[0], 'res1');
            assert.equal(given[1], 'res2');
            assert.isFalse(hasError);
         });

         it('should pass data of all the steps as object to the callback', function () {
            var d1 = new defferedLib.Deferred(),
               d2 = new defferedLib.Deferred(),
               pd = new ParallelDeferred(),
               hasError = false,
               expect = new Error(),
               given;

            pd.push(d1, 'd1').push(d2, 'd2');
            pd.done().getResult().addCallbacks(function (result) {
               given = result;
            }, function () {
               hasError = true;
            });

            d1.callback('res1');
            d2.callback('res2');

            assert.equal(given.d1, 'res1');
            assert.equal(given.d2, 'res2');
            assert.isFalse(hasError);
         });

         it('should pass data to the errback at first error', function () {
            var d1 = new defferedLib.Deferred(),
               d2 = new defferedLib.Deferred(),
               pd = new ParallelDeferred({steps: [d1, d2]}),
               hasSuccess = false,
               errorsCount = 0,
               expect = new Error(),
               given;

            pd.done().getResult().addCallbacks(function () {
               hasSuccess = true;
            }, function (error) {
               given = error;
               errorsCount++;
            });

            d1.callback();
            d2.errback(expect);

            assert.strictEqual(given, expect);
            assert.equal(errorsCount, 1);
            assert.isFalse(hasSuccess);
            assert.equal(pd.getStepsCount(), 2);
            assert.equal(pd.getStepsDone(), 2);
            assert.equal(pd.getStepsSuccess(), 1);
         });

         it('should pass data to the errback at first error without awaiting for other steps', function () {
            var d1 = new defferedLib.Deferred(),
               d2 = new defferedLib.Deferred(),
               pd = new ParallelDeferred({steps: [d1, d2]}),
               hasSuccess = false,
               errorsCount = 0,
               expect = 'Oops!',
               given;

            pd.done().getResult().addCallbacks(function () {
               hasSuccess = true;
            }, function (error) {
               given = error;
               errorsCount++;
            });

            d1.errback(expect);

            assert.equal(given.message, expect);
            assert.equal(errorsCount, 1);
            assert.isFalse(hasSuccess);
            assert.equal(pd.getStepsCount(), 2);
            assert.equal(pd.getStepsDone(), 1);
            assert.equal(pd.getStepsSuccess(), 0);
         });

         it('should pass data to the callback with each success or error', function () {
            var d1 = new defferedLib.Deferred(),
               d2 = new defferedLib.Deferred(),
               pd = new ParallelDeferred({
                  steps: [d1, d2],
                  stopOnFirstError: false
               }),
               hasError = false,
               successCount = 0,
               expectSuccess = 'Done',
               expectError = new Error(),
               givenSuccess,
               givenError;

            pd.done().getResult().addCallbacks(function (result) {
               givenSuccess = result[0];
               givenError = result[1];
               successCount++;
            }, function () {
               hasError = true;
            });

            d1.callback(expectSuccess);
            d2.errback(expectError);

            assert.strictEqual(givenSuccess, expectSuccess);
            assert.strictEqual(givenError, expectError);
            assert.equal(successCount, 1);
            assert.isFalse(hasError);
            assert.equal(pd.getStepsCount(), 2);
            assert.equal(pd.getStepsDone(), 2);
            assert.equal(pd.getStepsSuccess(), 1);
         });

      });

      describe('.push()', function () {
         it('should return itself', function () {
            var pd = new ParallelDeferred();
            assert.strictEqual(pd.push(new defferedLib.Deferred()), pd);
         });

         it('should add a step', function () {
            var pd = new ParallelDeferred();

            pd.push(new defferedLib.Deferred());
            assert.equal(pd.getStepsCount(), 1);

            pd.push(new defferedLib.Deferred());
            assert.equal(pd.getStepsCount(), 2);
         });

         it('should work with a Promise', function() {
            var pd = new ParallelDeferred();

            pd.push(new defferedLib.Deferred());
            pd.push(new Promise(function(r) {
               r('a');
            }));
            pd.push(new defferedLib.Deferred());
            assert.equal(pd.getStepsCount(), 3);
         });

         it('should throw an Error if id passed twice', function () {
            var pd = new ParallelDeferred();
            pd.push(new defferedLib.Deferred(), 0);
            pd.push(new defferedLib.Deferred(), 1);
            assert.throws(function() {
               pd.push(new defferedLib.Deferred(), 0);
            }, Error);
         });
      });

      describe('.getStepsCount()', function () {
         it('should return 0 by default', function () {
            var pd = new ParallelDeferred();
            assert.equal(pd.getStepsCount(), 0);
         });
      });
   });
});
