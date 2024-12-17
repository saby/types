import { assert } from 'chai';
import { stub } from 'sinon';
import debounce from 'Types/_function/debounce';

describe('Types/_formatter/debounce', () => {
    let stubTimeout;
    let stubClear;

    beforeEach(() => {
        stubTimeout = stub(globalThis, 'setTimeout').callsFake((callback) => {
            //@ts-ignore
            return callback();
        });
        stubClear = stub(globalThis, 'clearTimeout').callsFake(() => {
            // void
        });
    });

    afterEach(() => {
        stubTimeout.restore();
        stubClear.restore();
    });

    it('should call method with given arguments later', () => {
        let given;
        const decorator = debounce(
            (...args) => {
                return (given = args);
            },
            10,
            true
        );
        const expected = ['a', 'b', 'c'];

        decorator(...expected);
        assert.equal(stubTimeout.getCall(0).args[1], 10);
        assert.deepEqual(given, expected);
    });

    it('should immediately call method with given arguments', () => {
        let given;
        const decorator = debounce(
            (...args) => {
                return (given = args);
            },
            10,
            true
        );
        const expected = ['a', 'b', 'c'];

        decorator(...expected);
        assert.deepEqual(given, expected);
    });

    it('should call method once', () => {
        let value = 0;
        const decorator = debounce(() => {
            return value++;
        }, 10);

        decorator();
        assert.equal(value, 1);
    });

    it('should call method once if argument "first" is true', () => {
        let value = 0;
        const decorator = debounce(
            () => {
                return value++;
            },
            10,
            true
        );
        decorator();
        assert.equal(value, 1);
    });

    it('should call method twice in 1 series if argument "first" is true', () => {
        let value = 0;
        const seriesState = {
            firstCalled: false,
            sequentialCall: false,
        };
        const decorator = debounce(
            () => {
                return value++;
            },
            10,
            true,
            seriesState
        );

        decorator();

        seriesState.firstCalled = true;
        seriesState.sequentialCall = true;

        decorator();
        assert.equal(value, 2);
    });

    it('should set default state if series is finish', () => {
        let value = 0;
        const seriesState = {
            firstCalled: true,
            sequentialCall: true,
        };
        const decorator = debounce(
            () => {
                return value++;
            },
            10,
            true,
            seriesState
        );

        decorator();
        assert.equal(value, 1);
        assert.isFalse(seriesState.firstCalled);
        assert.isFalse(seriesState.sequentialCall);
    });
});
