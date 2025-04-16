import BaseSource, { IOptions } from 'Types/_source/Base';
import JsonAdapter from 'Types/_entity/adapter/Json';

class TestSource extends BaseSource {
    protected _moduleName: string;

    constructor(options?: IOptions) {
        super(options);
    }
}
Object.assign(TestSource.prototype, {
    _moduleName: '[TestSource]',
});

describe('Types/_source/Base', () => {
    let source: TestSource;

    beforeEach(() => {
        source = new TestSource();
    });

    describe('.getAdapter()', () => {
        test('should return the JSON adapter by default', () => {
            const adapter = source.getAdapter();
            expect(adapter).toBeInstanceOf(JsonAdapter);
        });

        test('should return value passed to the constructor', () => {
            const adapter = new JsonAdapter();
            const source = new TestSource({
                adapter,
            });

            expect(source.getAdapter()).toBe(adapter);
        });
    });

    describe('.getModel()', () => {
        test('should return "Types/entity:Model" by default', () => {
            expect(source.getModel()).toEqual('Types/entity:Model');
        });

        test('should return value passed to the constructor', () => {
            const source = new TestSource({
                model: 'my.model',
            });

            expect(source.getModel()).toEqual('my.model');
        });
    });

    describe('.setModel()', () => {
        test('should set the new value', () => {
            source.setModel('my.model');
            expect(source.getModel()).toEqual('my.model');
        });
    });

    describe('.getListModule()', () => {
        test('should return "Types/collection:RecordSet" by default', () => {
            expect(source.getListModule()).toEqual('Types/collection:RecordSet');
        });

        test('should return value passed to the constructor', () => {
            const source = new TestSource({
                listModule: 'my.list',
            });

            expect(source.getListModule()).toEqual('my.list');
        });
    });

    describe('.setListModule()', () => {
        test('should set the new value', () => {
            source.setListModule('my.list');
            expect(source.getListModule()).toEqual('my.list');
        });
    });

    describe('.getKeyProperty()', () => {
        test('should return an empty string by default', () => {
            expect(source.getKeyProperty()).toBe('');
        });

        test('should return value passed to the constructor', () => {
            const source = new TestSource({
                keyProperty: 'test',
            });

            expect(source.getKeyProperty()).toEqual('test');
        });
    });

    describe('.setKeyProperty()', () => {
        test('should set the new value', () => {
            source.setKeyProperty('test');
            expect(source.getKeyProperty()).toEqual('test');
        });
    });

    describe('.getOptions()', () => {
        test('should return an Object by default', () => {
            expect(source.getOptions().debug).toBe(false);
        });

        test('should return value passed to the constructor', () => {
            const source = new TestSource({
                options: { debug: true },
            });

            expect(source.getOptions().debug).toBe(true);
        });

        test('should return merged value of the prototype and the constructor', () => {
            const source = new TestSource({
                options: { foo: 'bar' } as any,
            });

            expect(source.getOptions().debug).toBe(false);
            expect((source.getOptions() as any).foo).toEqual('bar');
        });
    });

    describe('.setOptions()', () => {
        test('should set new value', () => {
            const options = {
                debug: true,
                foo: 'bar',
            };
            source = new TestSource({ options });

            source.setOptions({ debug: true });
            expect(options.debug).toBe(true);
            expect(options.foo).toBe('bar');
        });

        test('should leave the prototype options untouched', () => {
            const source = new TestSource();

            expect((TestSource.prototype as any)._$options).toEqual(source.getOptions());
            source.setOptions({ debug: true });
            expect((TestSource.prototype as any)._$options).not.toEqual(source.getOptions());
        });
    });

    describe('.toJSON()', () => {
        test('should return valid signature', () => {
            const options = {};
            const source = new TestSource(options);
            const json = source.toJSON();

            expect(json.$serialized$).toEqual('inst');
            expect(json.module).toEqual('[TestSource]');
            expect(json.state.$options).toEqual(options);
        });
    });
});
