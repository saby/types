import RecordSetRecordAdapter from 'Types/_entity/adapter/RecordSetRecord';
import { Record, Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';
import fieldsFactory, { IDeclaration } from 'Types/_entity/format/fieldsFactory';

describe('Types/_entity/adapter/RecordSetRecord', () => {
    let format: IDeclaration[];
    let data: Record;
    let adapter: RecordSetRecordAdapter;

    beforeEach(() => {
        format = [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'string' },
        ];

        data = new Record({
            format,
            rawData: {
                id: 1,
                name: 'Sample',
            },
        });

        adapter = new RecordSetRecordAdapter(data);
    });

    describe('.constructor()', () => {
        test('should throw TypeError for invalid data', () => {
            expect(() => {
                adapter = new RecordSetRecordAdapter([] as any);
            }).toThrow();

            expect(() => {
                adapter = new RecordSetRecordAdapter({} as any);
            }).toThrow();
        });
    });

    describe('.has()', () => {
        test('should return true for exists property', () => {
            expect(adapter.has('id')).toBe(true);
        });

        test('should return false for not exists property', () => {
            expect(adapter.has('some')).toBe(false);
        });

        test('should return false for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            expect(adapter.has('id')).toBe(false);
        });
    });

    describe('.get()', () => {
        test('should return the property value', () => {
            expect(1).toBe(adapter.get('id'));
            expect('Sample').toBe(adapter.get('name'));
        });

        test('should return undefined for not exists property', () => {
            expect(adapter.get('age')).not.toBeDefined();

            expect(new RecordSetRecordAdapter().get('age')).not.toBeDefined();

            //@ts-ignore
            expect(new RecordSetRecordAdapter(null).get('age')).not.toBeDefined();

            //@ts-ignore
            expect(new RecordSetRecordAdapter().get(undefined)).not.toBeDefined();
        });

        test('should return undefined for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            expect(adapter.get('id')).not.toBeDefined();
        });
    });

    describe('.set()', () => {
        test('should init raw data as Record', () => {
            const adapter = new RecordSetRecordAdapter();

            adapter.set('foo', 'bar');

            expect(adapter.getData()).toBeInstanceOf(Record);
            expect(adapter.getData().get('foo')).toBe('bar');
        });

        test('should set the exists property value', () => {
            adapter.set('id', 20);
            expect(20).toBe(data.get('id'));
        });

        test('should set the not exists property value', () => {
            const data = new Record({
                rawData: {
                    id: 1,
                    name: 'test',
                },
            });
            const adapter = new RecordSetRecordAdapter(data);

            adapter.set('a', 5);
            expect(5).toBe(data.get('a'));

            adapter.set('b', undefined);
            expect(data.get('b')).not.toBeDefined();
        });

        test('should create new Record from empty data if RecordSet given', () => {
            const rs = new RecordSet();
            //@ts-ignore
            const adapter = new RecordSetRecordAdapter(null, rs);

            adapter.set('id', 1);
            expect(adapter.get('id')).toBe(1);
            expect(adapter.getData()).toBeInstanceOf(Record);
        });

        test('should throw ReferenceError for invalid name', () => {
            expect(() => {
                //@ts-ignore
                adapter.set(undefined, undefined);
            }).toThrow();

            expect(() => {
                adapter.set('', undefined);
            }).toThrow();

            expect(() => {
                adapter.set(0 as any, undefined);
            }).toThrow();
        });
    });

    describe('.clear()', () => {
        test('should become an empty record', () => {
            adapter.clear();
            let hasFields = false;
            adapter.getData().each(() => {
                hasFields = true;
            });
            expect(hasFields).toBe(false);
        });

        test('should return a same instance', () => {
            adapter.clear();
            expect(data).toBe(adapter.getData());
        });

        test('should init empty data as Record', () => {
            const adapter = new RecordSetRecordAdapter();
            adapter.clear();
            expect(adapter.getData()).toBeInstanceOf(Record);
        });
    });

    describe('.getData()', () => {
        test('should return raw data', () => {
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.getTableData()', () => {
        test('should return data passed to the constructor', () => {
            const tableData = new RecordSet();
            const localAdapter = new RecordSetRecordAdapter(data, tableData);
            expect(localAdapter.getTableData()).toBe(tableData);
        });
    });

    describe('.getFields()', () => {
        test('should return fields list', () => {
            expect(adapter.getFields()).toEqual(['id', 'name']);
        });

        test('should return empty list for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            expect(adapter.getFields().length === 0).toBe(true);
        });

        test('should return fields list without model properties', () => {
            const data = new Model({
                properties: {
                    foo: {
                        //@ts-ignore
                        get: () => {
                            return 'bar';
                        },
                    },
                },
                rawData: {
                    id: 1,
                    name: 'Sample',
                },
            });
            const adapter = new RecordSetRecordAdapter(data);

            expect(adapter.getFields()).toEqual(['id', 'name']);
        });
    });

    describe('.getFormat()', () => {
        test('should return exists field format', () => {
            const format = adapter.getFormat('id');
            expect(format.getName()).toBe('id');
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.getFormat('Some');
            }).toThrow();
        });
    });

    describe('.getTypeName()', () => {
        test('should return type name for inner record', () => {
            const data = new Record({
                rawData: {
                    d: [1, 'Foo'],
                    s: [
                        {
                            n: 'id',
                            t: 'string',
                        },
                        {
                            n: 'login',
                            t: 'string',
                        },
                    ],
                    tp: 'User',
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetRecordAdapter(data);
            const typeName = adapter.getTypeName();

            expect(typeName).toBe('User');
        });

        test('should return type name for inner record with default type', () => {
            const data = new Record({
                rawData: {
                    d: [1, 'Foo'],
                    s: [
                        {
                            n: 'id',
                            t: 'string',
                        },
                        {
                            n: 'login',
                            t: 'string',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetRecordAdapter(data);
            const typeName = adapter.getTypeName();

            expect(typeName).toBe('record');
        });
    });

    describe('.setTypeName()', () => {
        test('should throw error', () => {
            expect(() => {
                adapter.setTypeName('TestType');
            }).toThrow();
        });
    });

    describe('.addField()', () => {
        test('should add a new field', () => {
            const fieldName = 'New';
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });

            adapter.addField(field, 0);
            expect(adapter.getFormat(fieldName).getName()).toBe(fieldName);
        });

        test('should use a field default value', () => {
            const fieldName = 'New';
            const def = 'abc';

            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: fieldName,
                    defaultValue: def,
                }),
                0
            );
            expect(adapter.get(fieldName)).toBe(def);
            expect(data.get(fieldName)).toBe(def);
        });

        test('should throw an error for already exists field', () => {
            expect(() => {
                adapter.addField(
                    fieldsFactory({
                        type: 'string',
                        name: 'name',
                    }),
                    0
                );
            }).toThrow();
        });

        test('should throw an error for not a field', () => {
            expect(() => {
                //@ts-ignore
                adapter.addField(undefined, undefined);
            }).toThrow();
            expect(() => {
                //@ts-ignore
                adapter.addField(null, undefined);
            }).toThrow();
        });

        test('should init empty data and add a field in there', () => {
            const adapter = new RecordSetRecordAdapter();
            const field = fieldsFactory({
                type: 'string',
                name: 'id',
            });

            adapter.addField(field, 0);
            expect(adapter.getData().getFormat().getFieldIndex('id')).toBe(0);
        });
    });

    describe('.removeField()', () => {
        test('should remove exists field', () => {
            const name = 'id';
            const oldFields = adapter.getFields();
            adapter.removeField(name);
            expect(adapter.get(name)).not.toBeDefined();
            expect(adapter.getFields().indexOf(name)).toBe(-1);
            expect(adapter.getFields().length).toBe(oldFields.length - 1);
            expect(() => {
                adapter.getFormat(name);
            }).toThrow();
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.removeField('Some');
            }).toThrow();
        });

        test('should throw ReferenceError for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            expect(() => {
                adapter.removeField('id');
            }).toThrow();
        });
    });

    describe('.removeFieldAt()', () => {
        const getRawData = () => {
            return {
                d: [1, 'Sample'],
                s: [
                    { n: 'id', t: 'Число целое' },
                    { n: 'name', t: 'Строка' },
                ],
            };
        };

        test('should remove exists field', () => {
            const data = new Record({
                format,
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetRecordAdapter(data);
            const oldF = adapter.getFields();

            adapter.removeFieldAt(0);
            const newF = adapter.getFields();
            expect(oldF[0]).not.toEqual(newF[0]);
            expect(oldF[1]).toBe(newF[0]);
            expect(() => {
                adapter.getFormat(oldF[0]);
            }).toThrow();
        });

        test('should throw an error for not exists position', () => {
            const data = new Record({
                format,
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetRecordAdapter(data);

            expect(() => {
                adapter.removeFieldAt(-1);
            }).toThrow();
            expect(() => {
                adapter.removeFieldAt(10);
            }).toThrow();
        });

        test('should throw Error for empty data', () => {
            const adapter = new RecordSetRecordAdapter();
            expect(() => {
                adapter.removeFieldAt(0);
            }).toThrow();
        });
    });
});
