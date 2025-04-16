import Remote, { IOptions } from 'Types/_source/Remote';
import Query from 'Types/_source/Query';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';
import RecordSet from 'Types/_collection/RecordSet';
import * as di from 'Types/di';
import { Deferred } from 'Types/deferred';
import {
    CallChainItem,
    ICallChainItem,
    RootCallChainItem,
    RPCRequestParam,
    ICallHandler,
} from 'Types/source';
import { List } from 'Types/collection';

class RemoteTesting extends Remote {
    constructor(options?: IOptions) {
        super(options);
    }
}
Object.assign(RemoteTesting.prototype, {
    _moduleName: 'RemoteTesing',
});

class ProviderMock {
    '[Types/_source/provider/IAbstract]': true;
    result: any = null;
    lastName: string;
    lastArgs: any;
    callHandlers: ICallChainItem | undefined;

    call(
        name: string,
        args: any,
        _cache?: any,
        _httpMethod?: string,
        callHandlers?: ICallChainItem
    ): any {
        this.lastName = name;
        this.lastArgs = args;
        this.callHandlers = callHandlers;
        return Deferred.success(this.result);
    }
}

class DummyCallHandler implements ICallHandler {
    moduleName: string = 'DummyCallHandler';

    handle(request: RPCRequestParam): RPCRequestParam {
        return request;
    }
}

function createDataSource(provider: ProviderMock, newOptions?: IOptions) {
    const options = {
        endpoint: '/users/',
        provider,
        binding: {
            create: 'createUser',
            read: 'readUser',
            update: 'updateUser',
            destroy: 'deleteUser',
            query: 'getUsers',
            copy: 'copyUser',
            merge: 'mergeUsers',
        },
    };

    return new RemoteTesting({ ...options, ...newOptions });
}

describe('Types/_source/Remote', () => {
    let dataSource: RemoteTesting;
    let provider: ProviderMock;

    beforeEach(() => {
        provider = new ProviderMock();

        dataSource = createDataSource(provider);
    });

    describe('.constructor()', () => {
        test('should merge property _$passing value from prototype with option', () => {
            const passing = {
                create: () => {
                    return {};
                },
                read: () => {
                    return {};
                },
            };
            const source = new RemoteTesting({
                passing,
            });

            //@ts-ignore
            const passingOption = source['_$' + 'passing'];
            //@ts-ignore
            const passingProto = Remote.prototype['_$' + 'passing'];

            expect(passingOption.create).toBe(passing.create);
            expect(passingOption.read).toBe(passing.read);
            expect(passingOption.update).toBe(passingProto.update);
            expect(passingOption.destroy).toBe(passingProto.destroy);
        });

        describe('beforeProviderCallCallback', () => {
            test('should change service arguments as an object', () => {
                dataSource = createDataSource(provider, {
                    callbacks: {
                        beforeProviderCall: 'TypesUnit/_source/TestCallbackModule:firstCallback',
                    },
                });
                const serviceArgs = { a: 1, b: 2 };
                const expectArgs: any = {
                    meta: { a: 9, c: 3 },
                };

                dataSource.create(serviceArgs);

                expect(provider.lastArgs).toEqual(expectArgs);
                expect(serviceArgs).toEqual(expectArgs.meta);
            });

            test('should change service arguments as an array', () => {
                dataSource = createDataSource(provider, {
                    callbacks: {
                        beforeProviderCall: 'TypesUnit/_source/TestCallbackModule:secondCallback',
                    },
                });
                const serviceArgs = [1, 2];
                const expectArgs = {
                    meta: [1, 2, 'new'],
                };

                //@ts-ignore
                dataSource.create(serviceArgs);

                expect(provider.lastArgs).toEqual(expectArgs);
                expect(serviceArgs).toEqual(expectArgs.meta);
            });
        });
    });

    describe('.getEndpoint()', () => {
        test('should return normalized endpoint from String', () => {
            const source = new RemoteTesting({
                endpoint: 'Test',
            });
            const ep = source.getEndpoint();
            expect(ep.contract).toEqual('Test');
        });

        test('should return value passed to the constructor', () => {
            const source = new RemoteTesting({
                endpoint: {
                    contract: 'Test',
                    address: '//stdin',
                },
            });
            const ep = source.getEndpoint();
            expect(ep.contract).toEqual('Test');
            expect(ep.address).toEqual('//stdin');
        });

        test('should return merged value of the prototype and the constructor', () => {
            const source = new RemoteTesting({
                endpoint: { contract: 'foo' },
            });
            //@ts-ignore
            const endpointProto = Remote.prototype['_$' + 'endpoint'];

            expect(source.getEndpoint()).not.toEqual(endpointProto);
            expect(source.getEndpoint().contract).toEqual('foo');
        });

        test('should return value of the subclass', () => {
            class SubRemoteSource extends Remote {
                _$endpoint = { address: 'bar' };

                constructor() {
                    super();
                }
            }
            const source = new SubRemoteSource();

            //@ts-ignore
            expect(source.getEndpoint().address).toEqual('bar');
        });
    });

    describe('.getBinding()', () => {
        test('should return value passed to the constructor', () => {
            const binding = {
                create: 'c',
                read: 'r',
                update: 'u',
                destroy: 'd',
            };
            const source = new RemoteTesting({
                binding,
            });
            expect(source.getBinding().create).toBe(binding.create);
            expect(source.getBinding().read).toBe(binding.read);
            expect(source.getBinding().update).toBe(binding.update);
            expect(source.getBinding().destroy).toBe(binding.destroy);
        });

        test('should return merged value of the prototype and the constructor', () => {
            const source = new RemoteTesting({
                binding: { read: 'foo' },
            });

            expect(source.getBinding().create).toEqual('create');
            expect(source.getBinding().read).toEqual('foo');
        });
    });

    describe('.setBinding()', () => {
        test('should set the new value', () => {
            const binding = {
                create: 'c',
                read: 'r',
                update: 'u',
                destroy: 'd',
            };
            const source = new RemoteTesting();

            source.setBinding(binding);
            expect(source.getBinding()).toEqual(binding);
        });
    });

    describe('.getProvider()', () => {
        test('should throw an Error by default', () => {
            const source = new RemoteTesting();
            expect(() => {
                source.getProvider();
            }).toThrow();
        });

        test('should return Provider', () => {
            expect(dataSource.getProvider()).toBeInstanceOf(ProviderMock);
        });
    });

    describe('.getCallHandlers()', () => {
        test('should return empty call handlers list', () => {
            expect(dataSource.getCallHandlers()).toBeInstanceOf(List);
        });

        test('should return call handlers chain', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            expect(dataSource.getCallHandlers()).toBeInstanceOf(List);
            expect(dataSource.getCallHandlers().getCount() > 0).toBe(true);
        });

        test('should have empty chain if list of handlers NOT specified', () => {
            const dataSource = new RemoteTesting({
                provider,
            });

            const value = 'foo';

            return dataSource.read(value).then(() => {
                expect(provider.callHandlers).toBeInstanceOf(RootCallChainItem);
            });
        });

        test('should have prepared handlers chain if list of handlers specified', () => {
            const callHandlers = new List<ICallHandler>({
                items: [new DummyCallHandler()],
            });

            const dataSource = new RemoteTesting({
                provider,
                callHandlers,
            });

            const value = 'foo';

            return dataSource.read(value).then(() => {
                expect(provider.callHandlers).toBeInstanceOf(CallChainItem);
                const nextHandler = provider.callHandlers?.getNext();
                expect(nextHandler).toBeInstanceOf(RootCallChainItem);
            });
        });
    });

    describe('.create()', () => {
        test('should return writable Record', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            provider.result = { foo: 'bar' };

            return dataSource.create().then((record) => {
                expect(record).toBeInstanceOf(Record);
                expect(record.writable).toBe(true);
                expect(record.get('foo')).toEqual('bar');
            });
        });
    });

    describe('.read()', () => {
        test('should send primary key value', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const value = 'foo';

            provider.result = { foo: 'bar' };
            return dataSource.read(value).then((record) => {
                const sent = provider.lastArgs.key;
                expect(sent).toEqual('foo');

                expect(record).toBeInstanceOf(Record);
                expect(record.writable).toBe(true);
                expect(record.get('foo')).toEqual('bar');
            });
        });
    });

    describe('.update()', () => {
        test('should send all record fields', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const record = new Record({
                rawData: { a: 1, b: 2, c: 3 },
            });

            return dataSource.update(record).then(() => {
                const sent = provider.lastArgs.data;
                expect(sent.a).toEqual(1);
                expect(sent.b).toEqual(2);
                expect(sent.c).toEqual(3);
            });
        });

        test('should send only changed record fields and key property', () => {
            const dataSource = new RemoteTesting({
                provider,
                keyProperty: 'a',
                options: {
                    updateOnlyChanged: true,
                },
            });
            const record = new Record({
                rawData: { a: 1, b: 2, c: 3 },
            });

            record.set('b', 20);
            return dataSource.update(record).then(() => {
                const sent = provider.lastArgs.data;
                expect(sent.a).toEqual(1);
                expect(sent.b).toEqual(20);
                expect(sent.c).not.toBeDefined();
            });
        });

        test('should send only changed model fields and key property (source priority)', () => {
            const dataSource = new RemoteTesting({
                provider,
                keyProperty: 'a',
                options: {
                    updateOnlyChanged: true,
                },
            });
            const model = new Model({
                keyProperty: 'c',
                rawData: { a: 1, b: 2, c: 3 },
            });

            model.set('b', 20);
            return dataSource.update(model).then(() => {
                const sent = provider.lastArgs.data;
                expect(sent.a).toEqual(1);
                expect(sent.b).toEqual(20);
                expect(sent.c).not.toBeDefined();
                expect(model.isChanged()).toBe(false);
            });
        });

        test('should send only primary key', () => {
            const dataSource = new RemoteTesting({
                provider,
                options: {
                    updateOnlyChanged: true,
                },
            });
            const model = new Model({
                keyProperty: 'a',
                rawData: { a: 1, b: 2, c: 3 },
            });

            return dataSource.update(model).then(() => {
                const sent = provider.lastArgs.data;

                expect(sent.hasOwnProperty('a')).toBe(true);
                expect(sent.hasOwnProperty('b')).toBe(false);
                expect(sent.hasOwnProperty('c')).toBe(false);
                expect(model.isChanged()).toBe(false);
            });
        });

        test('should send all records', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const data = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
            const rs = new RecordSet({
                rawData: data,
            });

            return dataSource.update(rs).then(() => {
                const sent = provider.lastArgs.data;
                expect(sent.length).toEqual(data.length);
            });
        });

        test('should send only changed records', () => {
            const dataSource = new RemoteTesting({
                provider,
                keyProperty: 'id',
                options: {
                    updateOnlyChanged: true,
                },
            });
            const rs = new RecordSet({
                rawData: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
            });

            rs.at(0).set('a', 1);
            rs.at(2).set('a', 2);
            return dataSource.update(rs).then(() => {
                const sent = provider.lastArgs.data;

                expect(sent.length).toEqual(2);

                expect(sent[0].id).toEqual(1);
                expect(sent[0].a).toEqual(1);

                expect(sent[1].id).toEqual(3);
                expect(sent[1].a).toEqual(2);
            });
        });
    });

    describe('.destroy()', () => {
        test('should send primary key value', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const value = 'foo';

            return dataSource.destroy(value).then(() => {
                const sent = provider.lastArgs.keys;
                expect(sent).toEqual('foo');
            });
        });
    });

    describe('.query()', () => {
        test('should send query', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const query = new Query();

            return dataSource.query(query).then(() => {
                expect(Object.keys(provider.lastArgs).length).toEqual(6);
            });
        });
    });

    describe('.merge()', () => {
        test('should send two keys', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const from = 'foo';
            const to = 'bar';

            return dataSource.merge(from, to).then(() => {
                expect(provider.lastArgs.from).toEqual(from);
                expect(provider.lastArgs.to).toEqual(to);
            });
        });
    });

    describe('.copy()', () => {
        test('should copy model', () => {
            const id = 'test';
            const data = { a: 1 };
            provider.result = data;

            return dataSource.copy(id).then((copy) => {
                expect(copy).toBeInstanceOf(Model);
                expect(provider.lastName).toEqual('copyUser');
                expect(provider.lastArgs.key).toEqual('test');
                expect(copy.getRawData()).toEqual(data);
            });
        });
    });

    describe('.move()', () => {
        test('should send two keys', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const from = 'foo';
            const to = 'bar';

            return dataSource.move(from, to).then(() => {
                expect(provider.lastArgs.from).toEqual(from);
                expect(provider.lastArgs.to).toEqual(to);
            });
        });
    });

    describe('.subscribe()', () => {
        describe('onBeforeProviderCall', () => {
            test('should receive service name', () => {
                let lastName: string;
                const handler = (_e: unknown, name: string) => {
                    lastName = name;
                };

                dataSource.subscribe('onBeforeProviderCall', handler);
                return dataSource.query().then(() => {
                    dataSource.unsubscribe('onBeforeProviderCall', handler);

                    expect(lastName).toBe(dataSource.getBinding().query);
                });
            });

            test('should receive service name and arguments', () => {
                const serviceArgs = {
                    meta: [{}, [], 'a', 1, 0, false, true, null],
                };
                let lastName: string;
                let lastArgs: object;
                //@ts-ignore
                const handler = (e, name, args) => {
                    lastName = name;
                    lastArgs = args;
                };
                dataSource.subscribe('onBeforeProviderCall', handler);
                //@ts-ignore
                return dataSource.create(serviceArgs.meta).then(() => {
                    dataSource.unsubscribe('onBeforeProviderCall', handler);

                    expect(lastName).toBe(dataSource.getBinding().create);
                    expect(lastArgs).toEqual(serviceArgs);
                });
            });

            test('should change service arguments as an object', () => {
                //@ts-ignore
                const handler = (e, name, args) => {
                    args.meta.a = 9;
                    delete args.meta.b;
                    args.meta.c = 3;
                };
                const serviceArgs = { a: 1, b: 2 };
                const expectArgs: any = {
                    meta: { a: 9, c: 3 },
                };

                dataSource.subscribe('onBeforeProviderCall', handler);
                dataSource.create(serviceArgs);
                dataSource.unsubscribe('onBeforeProviderCall', handler);

                expect(provider.lastArgs).toEqual(expectArgs);
                expect(serviceArgs).toEqual(expectArgs.meta);
            });

            test('should change service arguments as an array', () => {
                //@ts-ignore
                const handler = (e, name, args) => {
                    args.meta.push('new');
                };
                const serviceArgs = [1, 2];
                const expectArgs = {
                    meta: [1, 2, 'new'],
                };

                dataSource.subscribe('onBeforeProviderCall', handler);
                //@ts-ignore
                dataSource.create(serviceArgs);
                dataSource.unsubscribe('onBeforeProviderCall', handler);

                expect(provider.lastArgs).toEqual(expectArgs);
                expect(serviceArgs).toEqual(expectArgs.meta);
            });

            test('should change service arguments and leave original untouched', () => {
                //@ts-ignore
                const handler = (e, name, args) => {
                    const result = { ...args[0] };
                    result.a = 9;
                    delete result.b;
                    result.c = 3;
                    e.setResult(result);
                };
                const serviceArgs = { a: 1, b: 2 };
                const serviceArgsCopy = { a: 1, b: 2 };
                const expectArgs: any = { a: 9, c: 3 };
                dataSource.subscribe('onBeforeProviderCall', handler);
                dataSource.create(serviceArgs);
                dataSource.unsubscribe('onBeforeProviderCall', handler);
                expect(provider.lastArgs).toEqual(expectArgs);
                expect(serviceArgs).toEqual(serviceArgsCopy);
            });
        });
    });

    describe('.toJSON()', () => {
        test('should serialize "provider" option', () => {
            class Foo {}
            di.register('Foo', Foo);
            const source = new RemoteTesting({
                provider: 'Foo',
            });
            const provider = source.getProvider();
            const json = source.toJSON();

            di.unregister('Foo');

            expect(provider).toBeInstanceOf(Foo);
            expect(json.state.$options?.provider).toEqual('Foo');
        });

        test('should serialize "passing" option exactly as it was passed to the constructor', () => {
            const read = () => {
                return {};
            };
            const source = new RemoteTesting({
                passing: {
                    read,
                },
            });
            const json = source.toJSON();

            expect(json.state.$options?.passing).toEqual({
                read,
            });
        });
    });

    describe('.hasCallHandler()', () => {
        test('should return false for handler with empty moduleName', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            const emptyHandler: ICallHandler = {
                moduleName: '',
                handle: (request: any): any => {
                    return request;
                },
            };

            const result = dataSource.hasCallHandler(emptyHandler);
            expect(result).toBe(false);
        });

        test('should return false for handler with non-existing moduleName', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            const handler: ICallHandler = {
                moduleName: 'TestHandler',
                handle: (request: any): any => {
                    return request;
                },
            };

            const result = dataSource.hasCallHandler(handler);
            expect(result).toBe(false);
        });

        test('should return true for handler that exists', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            const handler: ICallHandler = {
                moduleName: 'DummyCallHandler',
                handle: (request: any): any => {
                    return request;
                },
            };

            const result = dataSource.hasCallHandler(handler);
            expect(result).toBe(true);
        });

        test('should return true for same instance of handler', () => {
            const handler = new DummyCallHandler();

            dataSource.callHandlers.add(handler);
            const result = dataSource.hasCallHandler(handler);

            expect(result).toBe(true);
        });
    });
});
