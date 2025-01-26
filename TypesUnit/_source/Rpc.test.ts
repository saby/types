import RpcSource from 'Types/_source/Rpc';
import { IOptions } from 'Types/_source/Remote';
import DataSet from 'Types/_source/DataSet';
//@ts-ignore
import * as coreExtend from 'Core/core-extend';
import { Deferred } from 'Types/deferred';

class TestSource extends RpcSource {
    constructor(options?: IOptions) {
        super(options);
    }
}

describe('Types/_source/Rpc', () => {
    const ProviderMock = coreExtend({
        result: null,
        call(name: string, args: any): any {
            this.lastName = name;
            this.lastArgs = args;
            return Deferred.success(this.result);
        },
    });

    const provider = new ProviderMock();

    let dataSource: TestSource;

    beforeEach(() => {
        dataSource = new TestSource({
            endpoint: '/users/',
            provider,
            binding: {
                query: 'getUsers',
                create: 'createUser',
                read: 'readUser',
                update: 'updateUser',
                destroy: 'deleteUser',
                copy: 'copyUser',
                merge: 'mergeUsers',
            },
        });
    });

    describe('.call()', () => {
        test('should send method name and arguments', () => {
            const dataSource = new TestSource({
                provider,
            });
            const method = 'foo';
            const args = ['bar', 'baz'];

            return dataSource.call(method, args).then(() => {
                expect(provider.lastName).toEqual(method);
                expect(provider.lastArgs).toEqual(args);
            });
        });

        test('should return writable DataSet', () => {
            const dataSource = new TestSource({
                provider,
            });

            provider.result = { foo: 'bar' };
            //@ts-ignore
            return dataSource.call(undefined).then((ds) => {
                expect(ds).toBeInstanceOf(DataSet);
                expect(ds.writable).toBe(true);
                expect(ds.getScalar('foo')).toEqual('bar');
            });
        });
    });

    describe('.getProvider()', () => {
        test('should return Provider', () => {
            expect(dataSource.getProvider()).toBeInstanceOf(ProviderMock);
        });
    });
});
