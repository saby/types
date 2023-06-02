import { assert } from 'chai';
import Remote, { IOptions } from 'Types/_source/Remote';
import Query from 'Types/_source/Query';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';
import RecordSet from 'Types/_collection/RecordSet';
import * as di from 'Types/di';
import {Deferred} from 'Types/deferred';
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
    callHandlers: ICallChainItem;

    call(
        name: string,
        args: any,
        cache?: any,
        httpMethod?: string,
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

    afterEach(() => {
        dataSource = undefined;
        provider = undefined;
    });

    describe('.constructor()', () => {
        it('should merge property _$passing value from prototype with option', () => {
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

            const passingOption = source['_$' + 'passing'];
            const passingProto = Remote.prototype['_$' + 'passing'];

            assert.strictEqual(passingOption.create, passing.create);
            assert.strictEqual(passingOption.read, passing.read);
            assert.strictEqual(passingOption.update, passingProto.update);
            assert.strictEqual(passingOption.destroy, passingProto.destroy);
        });

        context('beforeProviderCallCallback', () => {
            it('should change service arguments as an object', () => {
                dataSource = createDataSource(provider, {
                    callbacks: {
                        beforeProviderCall:
                            'TypesUnit/_source/TestCallbackModule:firstCallback',
                    },
                });
                const serviceArgs = { a: 1, b: 2 };
                const expectArgs: any = {
                    meta: { a: 9, c: 3 },
                };

                dataSource.create(serviceArgs);

                assert.deepEqual(provider.lastArgs, expectArgs);
                assert.deepEqual(serviceArgs, expectArgs.meta);
            });

            it('should change service arguments as an array', () => {
                dataSource = createDataSource(provider, {
                    callbacks: {
                        beforeProviderCall:
                            'TypesUnit/_source/TestCallbackModule:secondCallback',
                    },
                });
                const serviceArgs = [1, 2];
                const expectArgs = {
                    meta: [1, 2, 'new'],
                };

                dataSource.create(serviceArgs);

                assert.deepEqual(provider.lastArgs, expectArgs);
                assert.deepEqual(serviceArgs, expectArgs.meta);
            });
        });
    });

    describe('.getEndpoint()', () => {
        it('should return normalized endpoint from String', () => {
            const source = new RemoteTesting({
                endpoint: 'Test',
            });
            const ep = source.getEndpoint();
            assert.equal(ep.contract, 'Test');
        });

        it('should return value passed to the constructor', () => {
            const source = new RemoteTesting({
                endpoint: {
                    contract: 'Test',
                    address: '//stdin',
                },
            });
            const ep = source.getEndpoint();
            assert.equal(ep.contract, 'Test');
            assert.equal(ep.address, '//stdin');
        });

        it('should return merged value of the prototype and the constructor', () => {
            const source = new RemoteTesting({
                endpoint: { contract: 'foo' },
            });
            const endpointProto = Remote.prototype['_$' + 'endpoint'];

            assert.notEqual(source.getEndpoint(), endpointProto);
            assert.equal(source.getEndpoint().contract, 'foo');
        });

        it('should return value of the subclass', () => {
            class SubRemoteSource extends Remote {
                _$endpoint = { address: 'bar' };

                constructor() {
                    super();
                }
            }
            const source = new SubRemoteSource();

            //@ts-ignore
            assert.equal(source.getEndpoint().address, 'bar');
        });
    });

    describe('.getBinding()', () => {
        it('should return value passed to the constructor', () => {
            const binding = {
                create: 'c',
                read: 'r',
                update: 'u',
                destroy: 'd',
            };
            const source = new RemoteTesting({
                binding,
            });
            assert.strictEqual(source.getBinding().create, binding.create);
            assert.strictEqual(source.getBinding().read, binding.read);
            assert.strictEqual(source.getBinding().update, binding.update);
            assert.strictEqual(source.getBinding().destroy, binding.destroy);
        });

        it('should return merged value of the prototype and the constructor', () => {
            const source = new RemoteTesting({
                binding: { read: 'foo' },
            });

            assert.equal(source.getBinding().create, 'create');
            assert.equal(source.getBinding().read, 'foo');
        });
    });

    describe('.setBinding()', () => {
        it('should set the new value', () => {
            const binding = {
                create: 'c',
                read: 'r',
                update: 'u',
                destroy: 'd',
            };
            const source = new RemoteTesting();

            source.setBinding(binding);
            assert.deepEqual(source.getBinding(), binding);
        });
    });

    describe('.getProvider()', () => {
        it('should throw an Error by default', () => {
            const source = new RemoteTesting();
            assert.throws(() => {
                source.getProvider();
            });
        });

        it('should return Provider', () => {
            assert.instanceOf(dataSource.getProvider(), ProviderMock);
        });
    });

    describe('.getCallHandlers()', () => {
        it('should return empty call handlers list', () => {
            assert.instanceOf(dataSource.getCallHandlers(), List);
        });

        it('should return call handlers chain', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            assert.instanceOf(dataSource.getCallHandlers(), List);
            assert.isTrue(dataSource.getCallHandlers().getCount() > 0);
        });

        it('should have empty chain if list of handlers NOT specified', () => {
            const dataSource = new RemoteTesting({
                provider,
            });

            const value = 'foo';

            return dataSource.read(value).then((record) => {
                assert.instanceOf(provider.callHandlers, RootCallChainItem);
            });
        });

        it('should have prepared handlers chain if list of handlers specified', () => {
            const callHandlers = new List<ICallHandler>({
                items: [new DummyCallHandler()],
            });

            const dataSource = new RemoteTesting({
                provider,
                callHandlers,
            });

            const value = 'foo';

            return dataSource.read(value).then((record) => {
                assert.instanceOf(provider.callHandlers, CallChainItem);
                const nextHandler = provider.callHandlers.getNext();
                assert.instanceOf(nextHandler, RootCallChainItem);
            });
        });
    });

    describe('.create()', () => {
        it('should return writable Record', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            provider.result = { foo: 'bar' };

            return dataSource.create().then((record) => {
                assert.instanceOf(record, Record);
                assert.isTrue(record.writable);
                assert.equal(record.get('foo'), 'bar');
            });
        });
    });

    describe('.read()', () => {
        it('should send primary key value', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const value = 'foo';

            provider.result = { foo: 'bar' };
            return dataSource.read(value).then((record) => {
                const sent = provider.lastArgs.key;
                assert.equal(sent, 'foo');

                assert.instanceOf(record, Record);
                assert.isTrue(record.writable);
                assert.equal(record.get('foo'), 'bar');
            });
        });
    });

    describe('.update()', () => {
        it('should send all record fields', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const record = new Record({
                rawData: { a: 1, b: 2, c: 3 },
            });

            return dataSource.update(record).then(() => {
                const sent = provider.lastArgs.data;
                assert.equal(sent.a, 1);
                assert.equal(sent.b, 2);
                assert.equal(sent.c, 3);
            });
        });

        it('should send only changed record fields and key property', () => {
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
                assert.equal(sent.a, 1);
                assert.equal(sent.b, 20);
                assert.isUndefined(sent.c);
            });
        });

        it('should send only changed model fields and key property (source priority)', () => {
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
                assert.equal(sent.a, 1);
                assert.equal(sent.b, 20);
                assert.isUndefined(sent.c);
                assert.isFalse(model.isChanged());
            });
        });

        it('should send only primary key', () => {
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

                assert.isTrue(sent.hasOwnProperty('a'));
                assert.isFalse(sent.hasOwnProperty('b'));
                assert.isFalse(sent.hasOwnProperty('c'));
                assert.isFalse(model.isChanged());
            });
        });

        it('should send all records', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const data = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
                { id: 5 },
            ];
            const rs = new RecordSet({
                rawData: data,
            });

            return dataSource.update(rs).then(() => {
                const sent = provider.lastArgs.data;
                assert.equal(sent.length, data.length);
            });
        });

        it('should send only changed records', () => {
            const dataSource = new RemoteTesting({
                provider,
                keyProperty: 'id',
                options: {
                    updateOnlyChanged: true,
                },
            });
            const rs = new RecordSet({
                rawData: [
                    { id: 1 },
                    { id: 2 },
                    { id: 3 },
                    { id: 4 },
                    { id: 5 },
                ],
            });

            rs.at(0).set('a', 1);
            rs.at(2).set('a', 2);
            return dataSource.update(rs).then(() => {
                const sent = provider.lastArgs.data;

                assert.equal(sent.length, 2);

                assert.equal(sent[0].id, 1);
                assert.equal(sent[0].a, 1);

                assert.equal(sent[1].id, 3);
                assert.equal(sent[1].a, 2);
            });
        });
    });

    describe('.destroy()', () => {
        it('should send primary key value', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const value = 'foo';

            return dataSource.destroy(value).then(() => {
                const sent = provider.lastArgs.keys;
                assert.equal(sent, 'foo');
            });
        });
    });

    describe('.query()', () => {
        it('should send query', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const query = new Query();

            return dataSource.query(query).then(() => {
                assert.deepEqual(Object.keys(provider.lastArgs).length, 6);
            });
        });
    });

    describe('.merge()', () => {
        it('should send two keys', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const from = 'foo';
            const to = 'bar';

            return dataSource.merge(from, to).then(() => {
                assert.equal(provider.lastArgs.from, from);
                assert.equal(provider.lastArgs.to, to);
            });
        });
    });

    describe('.copy()', () => {
        it('should copy model', () => {
            const id = 'test';
            const data = { a: 1 };
            provider.result = data;

            return dataSource.copy(id).then((copy) => {
                assert.instanceOf(copy, Model);
                assert.equal(provider.lastName, 'copyUser');
                assert.equal(provider.lastArgs.key, 'test');
                assert.deepEqual(copy.getRawData(), data);
            });
        });
    });

    describe('.move()', () => {
        it('should send two keys', () => {
            const dataSource = new RemoteTesting({
                provider,
            });
            const from = 'foo';
            const to = 'bar';

            return dataSource.move(from, to).then(() => {
                assert.equal(provider.lastArgs.from, from);
                assert.equal(provider.lastArgs.to, to);
            });
        });
    });

    describe('.subscribe()', () => {
        context('onBeforeProviderCall', () => {
            it('should receive service name', () => {
                let lastName;
                const handler = (e, name) => {
                    lastName = name;
                };

                dataSource.subscribe('onBeforeProviderCall', handler);
                return dataSource.query().then(() => {
                    dataSource.unsubscribe('onBeforeProviderCall', handler);

                    assert.strictEqual(lastName, dataSource.getBinding().query);
                });
            });

            it('should receive service name and arguments', () => {
                const serviceArgs = {
                    meta: [{}, [], 'a', 1, 0, false, true, null],
                };
                let lastName;
                let lastArgs;
                const handler = (e, name, args) => {
                    lastName = name;
                    lastArgs = args;
                };
                dataSource.subscribe('onBeforeProviderCall', handler);
                return dataSource.create(serviceArgs.meta).then(() => {
                    dataSource.unsubscribe('onBeforeProviderCall', handler);

                    assert.strictEqual(
                        lastName,
                        dataSource.getBinding().create
                    );
                    assert.deepEqual(lastArgs, serviceArgs);
                });
            });

            it('should change service arguments as an object', () => {
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

                assert.deepEqual(provider.lastArgs, expectArgs);
                assert.deepEqual(serviceArgs, expectArgs.meta);
            });

            it('should change service arguments as an array', () => {
                const handler = (e, name, args) => {
                    args.meta.push('new');
                };
                const serviceArgs = [1, 2];
                const expectArgs = {
                    meta: [1, 2, 'new'],
                };

                dataSource.subscribe('onBeforeProviderCall', handler);
                dataSource.create(serviceArgs);
                dataSource.unsubscribe('onBeforeProviderCall', handler);

                assert.deepEqual(provider.lastArgs, expectArgs);
                assert.deepEqual(serviceArgs, expectArgs.meta);
            });

            it('should change service arguments and leave original untouched', () => {
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
                assert.deepEqual(provider.lastArgs, expectArgs);
                assert.deepEqual(serviceArgs, serviceArgsCopy);
            });
        });
    });

    describe('.toJSON()', () => {
        it('should serialize "provider" option', () => {
            class Foo {}
            di.register('Foo', Foo);
            const source = new RemoteTesting({
                provider: 'Foo',
            });
            const provider = source.getProvider();
            const json = source.toJSON();

            di.unregister('Foo');

            assert.instanceOf(provider, Foo);
            assert.equal(json.state.$options.provider, 'Foo');
        });

        it('should serialize "passing" option exactly as it was passed to the constructor', () => {
            const read = () => {
                return {};
            };
            const source = new RemoteTesting({
                passing: {
                    read,
                },
            });
            const json = source.toJSON();

            assert.deepEqual(json.state.$options.passing, {
                read,
            });
        });
    });

    describe('.hasCallHandler()', () => {
        it('should return false for handler with empty moduleName', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            const emptyHandler: ICallHandler = {
                moduleName: '',
                handle: (request: any): any => {
                    return request;
                },
            };

            const result = dataSource.hasCallHandler(emptyHandler);
            assert.isFalse(result);
        });

        it('should return false for handler with non-existing moduleName', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            const handler: ICallHandler = {
                moduleName: 'TestHandler',
                handle: (request: any): any => {
                    return request;
                },
            };

            const result = dataSource.hasCallHandler(handler);
            assert.isFalse(result);
        });

        it('should return true for handler that exists', () => {
            dataSource.callHandlers.add(new DummyCallHandler());
            const handler: ICallHandler = {
                moduleName: 'DummyCallHandler',
                handle: (request: any): any => {
                    return request;
                },
            };

            const result = dataSource.hasCallHandler(handler);
            assert.isTrue(result);
        });

        it('should return true for same instance of handler', () => {
            const handler = new DummyCallHandler();

            dataSource.callHandlers.add(handler);
            const result = dataSource.hasCallHandler(handler);

            assert.isTrue(result);
        });
    });
});
