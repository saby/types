import { createSandbox } from 'sinon';
import { assert } from 'chai';
import wrapTimeout from 'Types/_promise/wrapTimeout';
import { URL, fetch } from 'Browser/Transport';

describe('Types/_promise/wrapTimeout', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = createSandbox({
            useFakeTimers: true,
        });
        sandbox.stub(URL, 'getQueryParam').returns(undefined);
        sandbox.stub(fetch.Errors, 'HTTP').callsFake((err) => {
            return err;
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should resolve promise', () => {
        let resPromise;
        const promise = wrapTimeout(
            new Promise((resolve, reject) => {
                resPromise = () => {
                    resolve('done');
                };
            }),
            1000
        ).then(
            (res) => {
                assert.strictEqual(res, 'done');
            },
            () => {
                assert.fail('Promise should was resolve');
            }
        );

        sandbox.clock.tick(500);
        resPromise();

        return promise;
    });

    it('should reject promise by timeout', () => {
        return new Promise((resolve, reject) => {
            let resPromise;

            wrapTimeout(
                new Promise((resolve) => {
                    resPromise = () => {
                        resolve('done');
                    };
                }),
                1000
            ).then(
                () => {
                    reject('Promise should was reject');
                },
                (err) => {
                    try {
                        assert.strictEqual(err.message, 'Promise timeout');
                        assert.strictEqual(err.url, undefined);
                        assert.strictEqual(err.httpError, 504);

                        resolve('done');
                    } catch (err) {
                        reject(err);
                    }
                }
            );

            sandbox.clock.tick(1100);
            resPromise();
        });
    });
});
