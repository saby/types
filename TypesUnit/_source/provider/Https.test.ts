import Https from 'Types/_source/provider/Https';

describe('Types/_source/provider/Https', () => {
    interface IFetchOptions {
        body: string;
    }

    function getSuccessResponse(res: boolean) {
        return {
            ok: true,
            json: () => {
                return new Promise((resolve) => {
                    resolve(res);
                });
            },
        };
    }

    function stubFetch(url: string, options: IFetchOptions): Promise<object> {
        return new Promise((resolve, reject) => {
            switch (url) {
                case 'api/bar/get':
                    resolve(
                        getSuccessResponse(
                            Object.keys(options).length === 1 && options.hasOwnProperty('method')
                        )
                    );
                    return;

                case 'api/bar/post':
                    resolve(
                        getSuccessResponse(
                            Object.keys(options).length === 2 &&
                                options.hasOwnProperty('method') &&
                                options.hasOwnProperty('body')
                        )
                    );
                    return;

                case 'api/bar/destroy?id=1234':
                    resolve(getSuccessResponse(true));
                    return;

                case encodeURI('api/bar/destroy?firstName=Ivan&lastName=Ivanov'):
                    resolve(getSuccessResponse(true));
                    return;

                case 'api/bar/update':
                    resolve(
                        getSuccessResponse(
                            options.body === '{"firstName":"Ivan","lastName":"Ivanov"}'
                        )
                    );
                    return;

                case 'api/bar/customRequest':
                    resolve(
                        getSuccessResponse(
                            options.body === '{"firstName":"Ivan","lastName":"Ivanov"}'
                        )
                    );
                    return;

                default:
                    reject(`Url "${url}" is undefined`);
            }
        });
    }

    let https: Https;

    beforeEach(() => {
        https = new Https({
            endpoint: {
                address: 'api/bar',
            },
            httpMethodBinding: {
                destroy: 'GET',
            },
            transport: stubFetch as typeof fetch,
        });
    });

    test('transport options should have only method for GET request', () => {
        //@ts-ignore
        return https.call('get', null, null, 'GET').then((result) => {
            expect(result).toBe(true);
        });
    });

    test('transport options should have method and body for POST request', () => {
        //@ts-ignore
        return https.call('post', {}, null, 'POST').then((result) => {
            expect(result).toBe(true);
        });
    });

    describe('.call()', () => {
        test('should send GET request', () => {
            //@ts-ignore
            return https.call('destroy', { id: 1234 }).then((result) => {
                expect(result).toBe(true);
            });
        });

        test('should send GET request with two parameters', () => {
            return (
                https
                    //@ts-ignore
                    .call('destroy', {
                        firstName: 'Ivan',
                        lastName: 'Ivanov',
                    })
                    .then((result) => {
                        expect(result).toBe(true);
                    })
            );
        });

        test('should send POST request with two parameters', () => {
            return (
                https
                    //@ts-ignore
                    .call('update', {
                        firstName: 'Ivan',
                        lastName: 'Ivanov',
                    })
                    .then((result) => {
                        expect(result).toBe(true);
                    })
            );
        });

        test('should send custom request', () => {
            return https
                .call(
                    //@ts-ignore
                    'customRequest',
                    {
                        firstName: 'Ivan',
                        lastName: 'Ivanov',
                    },
                    undefined,
                    'POST'
                )
                .then((result) => {
                    expect(result).toBe(true);
                });
        });
    });
});
