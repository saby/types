import Restful from 'Types/_source/Restful';
import Model from 'Types/_entity/Model';
import Record from 'Types/_entity/Record';
import Query from 'Types/_source/Query';

interface IFetchOptions {
    body: string;
}

describe('Types/_source/Restful', () => {
    let testContext: any;

    beforeAll(() => {
        testContext = {};
    });

    function getSuccessResponse(res: unknown) {
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
                case 'api/foo/create':
                    resolve(
                        getSuccessResponse({
                            firstName: '',
                        })
                    );
                    return;

                case 'api/foo/read?key=1':
                    resolve(
                        getSuccessResponse({
                            firstName: 'Ivan',
                        })
                    );
                    return;

                case 'api/foo/update':
                    resolve(getSuccessResponse(options.body === '{"data":{"firstName":"Sergey"}}'));
                    return;

                case 'api/foo/destroy':
                    resolve(getSuccessResponse(options.body === '{"keys":1234}'));
                    return;

                case 'api/foo/query':
                    if (
                        options.body ===
                        '{"select":{},"from":"","where":{},"orderBy":[],"offset":0}'
                    ) {
                        resolve(
                            getSuccessResponse([
                                {
                                    firstName: 'Ivan',
                                },
                            ])
                        );
                    } else {
                        resolve(getSuccessResponse({}));
                    }
                    return;

                case 'api/foo/merge':
                    resolve(getSuccessResponse(options.body === '{"from":"foo","to":"bar"}'));
                    return;

                case 'api/foo/copy':
                    if (options.body === '{"key":1234}') {
                        resolve(
                            getSuccessResponse({
                                firstName: 'Sergey',
                            })
                        );
                    } else {
                        resolve(getSuccessResponse({}));
                    }
                    return;

                case 'api/foo/move':
                    resolve(getSuccessResponse(options.body === '{"from":"foo","to":"bar"}'));
                    return;

                case 'api/foo/checkUser':
                    resolve(
                        getSuccessResponse(
                            options.body === '{"firstName":"Ivan","lastName":"Ivanov"}'
                        )
                    );
                    return;

                case 'api/foo/register?id=1234':
                    resolve(getSuccessResponse(true));
                    return;

                default:
                    reject(`Url "${url}" is undefined`);
            }
        });
    }

    let restful: Restful;

    beforeEach(() => {
        jest.spyOn(Restful.prototype, 'providerOptions', 'get')
            .mockClear()
            .mockImplementation(function (): object {
                return {
                    httpMethodBinding: testContext._$httpMethodBinding,
                    transport: stubFetch,
                };
            });

        restful = new Restful({
            endpoint: {
                address: 'api/foo',
            },
            binding: {
                create: 'create',
                update: 'update',
                read: 'read',
                destroy: 'destroy',
                query: 'query',
                copy: 'copy',
                merge: 'merge',
                move: 'move',
            },
        });
    });

    describe('.create()', () => {
        test('should return an empty model', () => {
            return restful.create().then((model) => {
                expect(model instanceof Model).toBe(true);
                expect(model.get('firstName')).toBe('');
            });
        });
    });

    describe('.read()', () => {
        test('should return valid model', () => {
            return restful.read(1).then((model) => {
                expect(model instanceof Model).toBe(true);
                expect(model.get('firstName')).toBe('Ivan');
            });
        });
    });

    describe('.update()', () => {
        test('should send all record fields', () => {
            const record = new Record({
                rawData: {
                    firstName: 'Sergey',
                },
            });

            return restful.update(record).then((result) => {
                expect(result).toBe(true);
            });
        });
    });

    describe('.destroy()', () => {
        test('should send primary key value', () => {
            return restful.destroy(1234).then((result) => {
                expect(result).toBe(true);
            });
        });
    });

    describe('.query()', () => {
        test('should send query', () => {
            const query = new Query();

            return restful.query(query).then((dataset) => {
                const orders = dataset.getAll();
                expect(orders.getCount()).toBe(1);
                //@ts-ignore
                expect(orders.at(0).get('firstName')).toBe('Ivan');
            });
        });
    });

    describe('.merge()', () => {
        test('should send two keys', () => {
            const from = 'foo';
            const to = 'bar';

            return restful.merge(from, to).then((result) => {
                expect(result).toBe(true);
            });
        });
    });

    describe('.copy()', () => {
        test('should copy model', () => {
            return restful.copy(1234).then((copy) => {
                expect(copy).toBeInstanceOf(Model);
                expect(copy.get('firstName')).toEqual('Sergey');
            });
        });
    });

    describe('.move()', () => {
        test('should send two keys', () => {
            const from = 'foo';
            const to = 'bar';

            return restful.move(from, to).then((result) => {
                expect(result).toBe(true);
            });
        });
    });

    describe('.invoke()', () => {
        test('should send user info', () => {
            const user = {
                firstName: 'Ivan',
                lastName: 'Ivanov',
            };

            return restful.invoke('checkUser', 'POST', user).then((result) => {
                expect(result).toBe(true);
            });
        });

        test('should register user', () => {
            const user = {
                id: 1234,
            };

            return restful.invoke('register', 'GET', user).then((result) => {
                expect(result).toBe(true);
            });
        });
    });
});
