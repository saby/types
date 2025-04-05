import debounce from 'Types/_function/debounce';

describe('Types/_formatter/debounce', () => {
    let stubTimeout: jest.SpiedFunction<typeof setTimeout>;
    let stubClear: jest.SpiedFunction<typeof clearTimeout>;

    beforeEach(() => {
        stubTimeout = jest
            .spyOn(globalThis, 'setTimeout')
            .mockClear()
            //@ts-ignore
            .mockImplementation((callback) => {
                //@ts-ignore
                return callback();
            });
        stubClear = jest
            .spyOn(globalThis, 'clearTimeout')
            .mockClear()
            //@ts-ignore
            .mockImplementation(() => {
                // void
            });
    });

    afterEach(() => {
        stubTimeout.mockRestore();
        stubClear.mockRestore();
    });

    test('should call method with given arguments later', () => {
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
        expect(stubTimeout.mock.calls[0][1]).toEqual(10);
        expect(given).toEqual(expected);
    });

    test('should immediately call method with given arguments', () => {
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
        expect(given).toEqual(expected);
    });

    test('should call method once', () => {
        let value = 0;
        const decorator = debounce(() => {
            return value++;
        }, 10);

        decorator();
        expect(value).toEqual(1);
    });

    test('should call method once if argument "first" is true', () => {
        let value = 0;
        const decorator = debounce(
            () => {
                return value++;
            },
            10,
            true
        );
        decorator();
        expect(value).toEqual(1);
    });

    test('should call method twice in 1 series if argument "first" is true', () => {
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
        expect(value).toEqual(2);
    });

    test('should set default state if series is finish', () => {
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
        expect(value).toEqual(1);
        expect(seriesState.firstCalled).toBe(false);
        expect(seriesState.sequentialCall).toBe(false);
    });
});
