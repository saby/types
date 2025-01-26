import wrapTimeout from 'Types/_promise/wrapTimeout';
import { URL, fetch } from 'Browser/Transport';

describe('Types/_promise/wrapTimeout', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        //@ts-ignore
        jest.spyOn(URL, 'getQueryParam').mockReturnValue(undefined);
        //@ts-ignore
        jest.spyOn(fetch.Errors, 'HTTP').mockImplementation((err) => {
            return err;
        });
    });

    test('should resolve promise', () => {
        let resPromise: () => void;
        const promise = wrapTimeout(
            new Promise((resolve) => {
                resPromise = () => {
                    resolve('done');
                };
            }),
            1000
        ).then(
            (res) => {
                expect(res).toBe('done');
            },
            () => {
                expect(false).toBe(true);
            }
        );

        jest.advanceTimersByTime(500);
        //@ts-ignore
        resPromise();

        return promise;
    });

    test('should reject promise by timeout', () => {
        return new Promise((resolve, reject) => {
            let resPromise: () => void;

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
                        expect(err.message).toBe('Promise timeout');
                        expect(err.url).toBe(undefined);
                        expect(err.httpError).toBe(504);

                        resolve('done');
                    } catch (err) {
                        reject(err);
                    }
                }
            );

            jest.advanceTimersByTime(1100);
            //@ts-ignore
            resPromise();
        });
    });
});
