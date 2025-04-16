import DataSet from 'Types/_source/DataSet';
import Model from 'Types/_entity/Model';
import JsonAdapter from 'Types/_entity/adapter/Json';
import RecordSet from 'Types/_collection/RecordSet';
// @ts-ignore
import * as coreExtend from 'Core/core-extend';

describe('Types/_source/DataSet', () => {
    let list: { id: number; lastname: string }[];

    beforeEach(() => {
        list = [
            {
                id: 1,
                lastname: 'Иванов',
            },
            {
                id: 2,
                lastname: 'Петров',
            },
            {
                id: 3,
                lastname: 'Сидоров',
            },
        ];
    });

    describe('.writable', () => {
        test('should return true by defalt', () => {
            const ds = new DataSet();
            expect(ds.writable).toBe(true);
        });

        test('should return value from option', () => {
            const ds = new DataSet({
                writable: false,
            });
            expect(ds.writable).toBe(false);
        });

        test('should overwrite value', () => {
            const ds = new DataSet();
            ds.writable = false;
            expect(ds.writable).toBe(false);
        });
    });

    describe('.getAdapter()', () => {
        test('should return the adapter', () => {
            const adapter = new JsonAdapter();
            const ds = new DataSet({
                adapter,
            });
            expect(ds.getAdapter()).toBe(adapter);
        });

        test('should return default adapter', () => {
            const ds = new DataSet();
            expect(ds.getAdapter()).toBeInstanceOf(JsonAdapter);
        });
    });

    describe('.getModel()', () => {
        test('should return a given model', () => {
            const ds = new DataSet({
                model: Model,
            });
            expect(ds.getModel()).toBe(Model);
        });

        test('should return "Types/entity:Model"', () => {
            const ds = new DataSet();
            expect(ds.getModel()).toBe('Types/entity:Model');
        });
    });

    describe('.setModel()', () => {
        test('should set the model', () => {
            const MyModel = coreExtend.extend(Model, {});
            const ds = new DataSet();
            ds.setModel(MyModel);
            expect(ds.getModel()).toBe(MyModel);
        });
    });

    describe('.getListModule()', () => {
        test('should return a default list', () => {
            const ds = new DataSet();
            expect(ds.getListModule()).toBe('Types/collection:RecordSet');
        });

        test('should return the given list', () => {
            const MyList = coreExtend.extend(RecordSet, {});
            const ds = new DataSet({
                listModule: MyList,
            });
            expect(ds.getListModule()).toBe(MyList);
        });
    });

    describe('.setListModule()', () => {
        test('should set the model', () => {
            const MyList = coreExtend.extend(RecordSet, {});
            const ds = new DataSet();
            ds.setListModule(MyList);
            expect(ds.getListModule()).toBe(MyList);
        });
    });

    describe('.getKeyProperty()', () => {
        test('should return the key property', () => {
            const ds = new DataSet({
                keyProperty: '123',
            });
            expect(ds.getKeyProperty()).toBe('123');
        });

        test('should return an empty string', () => {
            const ds = new DataSet();
            expect(ds.getKeyProperty()).toBe('');
        });
    });

    describe('.setKeyProperty()', () => {
        test('should set the key property', () => {
            const ds = new DataSet();
            ds.setKeyProperty('987');
            expect(ds.getKeyProperty()).toBe('987');
        });
    });

    describe('.getAll()', () => {
        test('should return a recordset', () => {
            const ds = new DataSet();
            expect(ds.getAll()).toBeInstanceOf(RecordSet);
        });

        test('should return pass keyProperty to the model', () => {
            const ds = new DataSet({
                rawData: [{}],
                keyProperty: 'myprop',
            });
            expect(ds.getAll().at(0).getKeyProperty()).toBe('myprop');
        });

        test('should return a recordset of 2 by default', () => {
            const ds = new DataSet({
                rawData: [1, 2],
            });
            expect(ds.getAll().getCount()).toEqual(2);
        });

        test('should return a recordset of 2 from given property', () => {
            const ds = new DataSet({
                rawData: { some: { prop: [1, 2] } },
            });
            expect(ds.getAll('some.prop' as never).getCount()).toEqual(2);
        });

        test('should return an empty recordset from undefined property', () => {
            const ds = new DataSet({
                rawData: {},
            });
            expect(ds.getAll('some.prop' as never).getCount()).toEqual(0);
        });

        test('should return recordset with metadata from given property', () => {
            const ds = new DataSet({
                rawData: {
                    meta: { bar: 'foo' },
                },
                metaProperty: 'meta',
            });
            const meta = ds.getAll().getMetaData();

            expect(meta.bar).toBe('foo');
        });

        test('should throw an error', () => {
            const ds = new DataSet({
                rawData: {
                    d: [1],
                    s: [{ n: 'Id', t: 'Число целое' }],
                    _type: 'record',
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(() => {
                ds.getAll();
            }).toThrow();
        });
    });

    describe('.getRow()', () => {
        test('should return a model', () => {
            const ds = new DataSet();
            expect(ds.getRow()).toBeInstanceOf(Model);
        });

        test('should return a model by default', () => {
            const ds = new DataSet({
                rawData: { a: 1, b: 2 },
            });
            expect(ds.getRow()?.get('a')).toBe(1);
            expect(ds.getRow()?.get('b')).toBe(2);
        });

        test('should return writable model', () => {
            const ds = new DataSet();
            expect(ds.getRow()?.writable).toBe(true);
        });

        test('should return read only model', () => {
            const ds = new DataSet({
                writable: false,
            });
            expect(ds.getRow()?.writable).toBe(false);
        });

        test('should return a model with sbis adapter', () => {
            const data = {
                _type: 'record',
                d: ['Test'],
                s: [{ n: 'Name', t: 'Строка' }],
            };
            const ds = new DataSet({
                adapter: 'Types/entity:adapter.Sbis',
                rawData: data,
            });
            expect(ds.getRow()?.get('Name')).toEqual('Test');
        });

        test('should return a model from given property', () => {
            const ds = new DataSet({
                rawData: { some: { prop: { a: 1, b: 2 } } },
            });
            expect(ds.getRow('some.prop' as never)?.get('a')).toEqual(1);
            expect(ds.getRow('some.prop' as never)?.get('b')).toEqual(2);
        });

        test('should return an empty recordset from undefined property', () => {
            const ds = new DataSet({
                rawData: {},
            });
            expect(ds.getRow('some.prop' as never)).toBeInstanceOf(Model);
        });

        test('should return a first item of recordset', () => {
            const data: any = [{ a: 1 }, { a: 2 }];
            const ds = new DataSet({
                rawData: data,
            });
            data._type = 'recordset';
            expect(ds.getRow()?.get('a')).toEqual(1);
        });

        test('should return undefined from empty recordset', () => {
            const data: any = [];
            const ds = new DataSet({
                rawData: data,
            });
            data._type = 'recordset';
            expect(ds.getRow()).not.toBeDefined();
        });

        test('should set id property to model', () => {
            const ds = new DataSet({
                rawData: list,
                keyProperty: 'lastname',
            });
            expect(ds.getRow()?.getKeyProperty()).toEqual('lastname');
        });
    });

    describe('.getScalar()', () => {
        test('should return a default value', () => {
            const ds = new DataSet({
                rawData: 'qwe',
            });
            expect(ds.getScalar()).toEqual('qwe');
        });

        test('should return a value from given property', () => {
            const ds = new DataSet({
                rawData: {
                    some: {
                        propA: 'a',
                        propB: 'b',
                    },
                },
            });
            expect(ds.getScalar('some.propA' as never)).toEqual('a');
            expect(ds.getScalar('some.propB' as never)).toEqual('b');
        });

        test('should return undefined from undefined property', () => {
            const ds = new DataSet({
                rawData: {},
            });
            expect(ds.getScalar('some.prop' as never)).not.toBeDefined();
        });
    });

    describe('.hasProperty()', () => {
        test('should return true for defined property', () => {
            const ds = new DataSet({
                rawData: { a: { b: { c: {} } } },
            });
            expect(ds.hasProperty('a')).toBe(true);
            expect(ds.hasProperty('a.b')).toBe(true);
            expect(ds.hasProperty('a.b.c')).toBe(true);
            expect(ds.hasProperty('')).toBe(false);
            expect(ds.hasProperty()).toBe(false);
        });

        test('should return false for undefined property', () => {
            const ds = new DataSet({
                rawData: { a: { b: { c: {} } } },
            });
            expect(ds.hasProperty('e')).toBe(false);
            expect(ds.hasProperty('a.e')).toBe(false);
            expect(ds.hasProperty('a.b.e')).toBe(false);
        });
    });

    describe('.getProperty()', () => {
        test('should return defined property', () => {
            const data = { a: { b: { c: {} } } };
            const ds = new DataSet({
                rawData: data,
            });
            expect(ds.getProperty('a')).toBe(data.a);
            expect(ds.getProperty('a.b' as never)).toBe(data.a.b);
            expect(ds.getProperty('a.b.c' as never)).toBe(data.a.b.c);
            expect(ds.getProperty('' as never)).toBe(data);
            expect(ds.getProperty()).toBe(data);
        });

        test('should return undefined for undefined property', () => {
            const ds = new DataSet({
                rawData: { a: { b: { c: {} } } },
            });
            expect(ds.getProperty('e' as never)).not.toBeDefined();
            expect(ds.getProperty('a.e' as never)).not.toBeDefined();
            expect(ds.getProperty('a.b.e' as never)).not.toBeDefined();
        });
    });

    describe('.gestRawData()', () => {
        test('should return raw data', () => {
            const data = { a: { b: { c: {} } } };
            const ds = new DataSet({
                rawData: data,
            });
            expect(ds.getRawData()).toBe(data);
        });
    });

    describe('.setRawData()', () => {
        test('should set raw data', () => {
            const data = { a: { b: { c: {} } } };
            const ds = new DataSet();
            ds.setRawData(data);
            expect(ds.getRawData()).toBe(data);
        });
    });

    describe('.toJSON()', () => {
        test('should return valid signature', () => {
            const options = {
                rawData: { foo: 'bar' },
            };
            const ds = new DataSet(options);
            const json = ds.toJSON();

            expect(json?.$serialized$).toEqual('inst');
            expect(json?.module).toEqual('Types/source:DataSet');
            expect(json?.state.$options).toEqual(options);
        });
    });
});
