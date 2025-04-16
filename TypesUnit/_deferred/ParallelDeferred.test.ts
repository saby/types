//@ts-ignore
import * as ParallelDeferred from 'Types/ParallelDeferred';
import { Deferred } from 'Types/deferred';
import 'Types/PromiseAPIDeferred';

describe('Types/ParallelDeferred', () => {
    describe('.getResult()', () => {
        test('should return Deferred', () => {
            const pd = new ParallelDeferred();
            expect(pd.getResult()).toBeInstanceOf(Deferred);
        });
    });

    describe('.done()', () => {
        test('should call result callback', () => {
            const pd = new ParallelDeferred();
            let callsCount = 0;

            pd.done()
                .getResult()
                .addCallback(() => {
                    callsCount++;
                });

            expect(callsCount).toBe(1);
            expect(pd.getStepsCount()).toBe(0);
        });

        test('should pass empty object to the result callback by default', () => {
            const pd = new ParallelDeferred();
            let given;

            pd.done()
                .getResult()
                .addCallback(function (result) {
                    given = result;
                });

            expect(given).toEqual({});
            expect(pd.getStepsCount()).toBe(0);
        });

        test('should pass data to the result callback', () => {
            const pd = new ParallelDeferred();
            const expectData = 10;
            let given;

            pd.done(expectData)
                .getResult()
                .addCallback(function (result) {
                    given = result;
                });

            expect(given).toBe(expectData);
            expect(pd.getStepsCount()).toBe(0);
        });

        test('should pass data to the result callback after all steps done', () => {
            const d1 = new Deferred();
            const d2 = new Deferred();
            //@ts-ignore
            const pd = new ParallelDeferred({ steps: [d1, d2] });
            const expectData = 10;
            let given;

            pd.done(expectData)
                .getResult()
                .addCallback(function (result) {
                    given = result;
                });

            expect(pd.getStepsCount()).toEqual(2);
            expect(pd.getStepsDone()).toEqual(0);
            expect(pd.getStepsSuccess()).toEqual(0);
            expect(given).not.toBeDefined();

            d1.callback();

            expect(pd.getStepsCount()).toEqual(2);
            expect(pd.getStepsDone()).toEqual(1);
            expect(pd.getStepsSuccess()).toEqual(1);
            expect(given).not.toBeDefined();

            d2.callback();

            expect(pd.getStepsCount()).toEqual(2);
            expect(pd.getStepsDone()).toEqual(2);
            expect(pd.getStepsSuccess()).toEqual(2);
            expect(given).toBe(expectData);
        });

        test('should pass data of all the steps as array to the callback', () => {
            const d1 = new Deferred();
            const d2 = new Deferred();
            const pd = new ParallelDeferred();
            let hasError = false;
            let given: string[] = [];

            //@ts-ignore
            pd.push(d1).push(d2);
            pd.done()
                .getResult()
                .addCallbacks(
                    function (result) {
                        //@ts-ignore
                        given = result;
                    },
                    () => {
                        hasError = true;
                    }
                );

            d1.callback('res1');
            d2.callback('res2');

            expect(given[0]).toEqual('res1');
            expect(given[1]).toEqual('res2');
            expect(hasError).toBe(false);
        });

        test('should pass data of all the steps as object to the callback', () => {
            const d1 = new Deferred();
            const d2 = new Deferred();
            const pd = new ParallelDeferred();
            let hasError = false;
            let given: { [key: string]: string } = {};

            pd.push(d1, 'd1').push(d2, 'd2');
            pd.done()
                .getResult()
                .addCallbacks(
                    function (result) {
                        //@ts-ignore
                        given = result;
                    },
                    () => {
                        hasError = true;
                    }
                );

            d1.callback('res1');
            d2.callback('res2');

            expect(given.d1).toEqual('res1');
            expect(given.d2).toEqual('res2');
            expect(hasError).toBe(false);
        });

        test('should pass data to the errback at first error', () => {
            const d1 = new Deferred();
            const d2 = new Deferred();
            //@ts-ignore
            const pd = new ParallelDeferred({ steps: [d1, d2] });
            let hasSuccess = false;
            let errorsCount = 0;
            const expectData = new Error();
            let given;

            pd.done()
                .getResult()
                .addCallbacks(
                    () => {
                        hasSuccess = true;
                    },
                    function (error) {
                        given = error;
                        errorsCount++;
                    }
                );

            d1.callback();
            d2.errback(expectData);

            expect(given).toBe(expectData);
            expect(errorsCount).toEqual(1);
            expect(hasSuccess).toBe(false);
            expect(pd.getStepsCount()).toEqual(2);
            expect(pd.getStepsDone()).toEqual(2);
            expect(pd.getStepsSuccess()).toEqual(1);
        });

        test('should pass data to the errback at first error without awaiting for other steps', () => {
            const d1 = new Deferred();
            const d2 = new Deferred();
            //@ts-ignore
            const pd = new ParallelDeferred({ steps: [d1, d2] });
            let hasSuccess = false;
            let errorsCount = 0;
            const expectData = 'Oops!';
            let given: { [key: string]: string } = {};

            pd.done()
                .getResult()
                .addCallbacks(
                    () => {
                        hasSuccess = true;
                    },
                    function (error) {
                        //@ts-ignore
                        given = error;
                        errorsCount++;
                    }
                );

            d1.errback(expectData);

            expect(given.message).toEqual(expectData);
            expect(errorsCount).toEqual(1);
            expect(hasSuccess).toBe(false);
            expect(pd.getStepsCount()).toEqual(2);
            expect(pd.getStepsDone()).toEqual(1);
            expect(pd.getStepsSuccess()).toEqual(0);
        });

        test('should pass data to the callback with each success or error', () => {
            const d1 = new Deferred();
            const d2 = new Deferred();
            const pd = new ParallelDeferred({
                //@ts-ignore
                steps: [d1, d2],
                stopOnFirstError: false,
            });
            let hasError = false;
            let successCount = 0;
            const expectSuccess = 'Done';
            const expectError = new Error();
            let givenSuccess;
            let givenError;

            pd.done()
                .getResult()
                .addCallbacks(
                    //@ts-ignore
                    function (result) {
                        //@ts-ignore
                        givenSuccess = result[0];
                        //@ts-ignore
                        givenError = result[1];
                        successCount++;
                    },
                    () => {
                        hasError = true;
                    }
                );

            d1.callback(expectSuccess);
            d2.errback(expectError);

            expect(givenSuccess).toBe(expectSuccess);
            expect(givenError).toBe(expectError);
            expect(successCount).toEqual(1);
            expect(hasError).toBe(false);
            expect(pd.getStepsCount()).toEqual(2);
            expect(pd.getStepsDone()).toEqual(2);
            expect(pd.getStepsSuccess()).toEqual(1);
        });
    });

    describe('.push()', () => {
        test('should return itself', () => {
            const pd = new ParallelDeferred();
            //@ts-ignore
            expect(pd.push(new Deferred())).toBe(pd);
        });

        test('should add a step', () => {
            const pd = new ParallelDeferred();

            //@ts-ignore
            pd.push(new Deferred());
            expect(pd.getStepsCount()).toEqual(1);

            //@ts-ignore
            pd.push(new Deferred());
            expect(pd.getStepsCount()).toEqual(2);
        });

        test('should work with a Promise', () => {
            const pd = new ParallelDeferred();

            //@ts-ignore
            pd.push(new Deferred());
            //@ts-ignore
            pd.push(
                new Promise(function (r) {
                    r('a');
                })
            );
            //@ts-ignore
            pd.push(new Deferred());
            expect(pd.getStepsCount()).toEqual(3);
        });

        test('should throw an Error if id passed twice', () => {
            const pd = new ParallelDeferred();
            pd.push(new Deferred(), 0);
            pd.push(new Deferred(), 1);
            expect(() => {
                pd.push(new Deferred(), 0);
            }).toThrow();
        });
    });

    describe('.getStepsCount()', () => {
        test('should return 0 by default', () => {
            const pd = new ParallelDeferred();
            expect(pd.getStepsCount()).toEqual(0);
        });
    });
});
