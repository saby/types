import RecordSetTableAdapter from 'Types/_entity/adapter/RecordSetTable';
import { Record, Model } from 'Types/entity';
import fieldsFactory, { IDeclaration } from 'Types/_entity/format/fieldsFactory';
import { RecordSet } from 'Types/collection';
import 'Types/_entity/adapter/Sbis';

describe('Types/_entity/adapter/RecordSetTable', () => {
    let format: IDeclaration[];
    let data: RecordSet;
    let adapter: RecordSetTableAdapter;

    beforeEach(() => {
        format = [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'string' },
        ];

        data = new RecordSet({
            format,
            rawData: [
                {
                    id: 1,
                    name: 'Smith',
                },
                {
                    id: 2,
                    name: 'Green',
                },
                {
                    id: 3,
                    name: 'Geller',
                },
            ],
        });

        adapter = new RecordSetTableAdapter(data);
    });

    describe('.constructor()', () => {
        test('should throw TypeError for invalid data', () => {
            expect(() => {
                adapter = new RecordSetTableAdapter([] as any);
            }).toThrow();
            expect(() => {
                adapter = new RecordSetTableAdapter({} as any);
            }).toThrow();
        });
    });

    describe('.getFields()', () => {
        test('should return fields list', () => {
            const fields = adapter.getFields();
            for (let i = 0; i < format.length; i++) {
                expect(fields[i]).toEqual(format[i].name);
            }
        });

        test('should return empty list for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const fields = adapter.getFields();
            expect(fields.length === 0).toBe(true);
        });

        test('should return fields list without model properties', () => {
            //@ts-ignore
            const Foo = (opts) => {
                return new Model({
                    ...{
                        properties: {
                            foo: {
                                get: () => {
                                    return 'bar';
                                },
                            },
                        },
                    },
                    ...opts,
                });
            };

            const data = new RecordSet({
                model: Foo,
                rawData: [
                    {
                        id: 1,
                        name: 'Sample',
                    },
                ],
            });

            const adapter = new RecordSetTableAdapter(data);

            expect(adapter.getFields()).toEqual(['id', 'name']);
        });
    });

    describe('.getCount()', () => {
        test('should return records count', () => {
            expect(adapter.getCount()).toEqual(data.getCount());
        });

        test('should return 0 for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(adapter.getCount() === 0).toBe(true);
        });
    });

    describe('.add()', () => {
        test('should append a record', () => {
            const count = data.getCount();
            const rec = new Record({
                rawData: { id: 9, name: 'foo' },
            });

            //@ts-ignore
            adapter.add(rec, undefined);
            expect(data.at(count).get('name')).toBe('foo');
        });

        test('should prepend a record', () => {
            const rec = new Record({
                rawData: { id: 9, name: 'foo' },
            });
            adapter.add(rec, 0);
            expect(data.at(0).get('name')).toBe('foo');
        });

        test('should insert a record', () => {
            const rec = new Record({
                rawData: { id: 9, name: 'foo' },
            });
            adapter.add(rec, 1);
            expect(data.at(1).get('name')).toBe('foo');
        });

        test('should initialize RecordSet for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Record();
            //@ts-ignore
            adapter.add(rec, undefined);
            expect(adapter.getData()).toBeInstanceOf(RecordSet);
        });

        test('should take adapter from record if empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Record({
                format: [],
                adapter: 'Types/entity:adapter.Sbis',
            });
            //@ts-ignore
            adapter.add(rec, undefined);
            expect(adapter.getData().getAdapter()).toBe(rec.getAdapter());
        });

        test('should take keyProperty from record if empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Model({
                format: [],
                adapter: 'Types/entity:adapter.Sbis',
                keyProperty: 'id',
            });
            //@ts-ignore
            adapter.add(rec, undefined);
            expect(adapter.getData().getKeyProperty()).toBe(rec.getKeyProperty());
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                const rec = new Record();
                adapter.add(rec, 100);
            }).toThrow();
            expect(() => {
                const rec = new Record();
                adapter.add(rec, -1);
            }).toThrow();
        });
    });

    describe('.at()', () => {
        test('should return valid record', () => {
            expect(data.at(0)).toBe(adapter.at(0));
        });

        test('should return undefined on invalid position', () => {
            expect(adapter.at(-1)).not.toBeDefined();
            expect(adapter.at(99)).not.toBeDefined();
        });

        test('should return undefined for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(adapter.at(0)).not.toBeDefined();
        });
    });

    describe('.remove()', () => {
        test('should remove the record', () => {
            const rec = adapter.at(0);
            adapter.remove(0);
            expect(rec).not.toEqual(adapter.at(0));
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                adapter.remove(-1);
            }).toThrow();
            expect(() => {
                adapter.remove(99);
            }).toThrow();
        });

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                adapter.remove(0);
            }).toThrow();
        });
    });

    describe('.replace()', () => {
        test('should replace the record', () => {
            const rec = new Record({
                rawData: { id: 9, name: 'foo' },
            });
            adapter.replace(rec, 0);
            expect(data.at(0).get('name')).toBe('foo');
        });

        test('should throw an error on invalid position', () => {
            const rec = new Record();
            expect(() => {
                adapter.replace(rec, -1);
            }).toThrow();
            expect(() => {
                adapter.replace(rec, 99);
            }).toThrow();
        });

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const rec = new Record();
            expect(() => {
                adapter.replace(rec, 0);
            }).toThrow();
        });
    });

    describe('.move()', () => {
        test('should place Smith after Green', () => {
            adapter.move(0, 2);
            expect('Green').toBe(adapter.at(0)?.get('name'));
            expect('Geller').toBe(adapter.at(1)?.get('name'));
            expect('Smith').toBe(adapter.at(2)?.get('name'));
        });

        test('should place Geller after Smith', () => {
            adapter.move(2, 0);
            expect('Geller').toBe(adapter.at(0)?.get('name'));
            expect('Smith').toBe(adapter.at(1)?.get('name'));
            expect('Green').toBe(adapter.at(2)?.get('name'));
        });

        test('should move Green to the end', () => {
            adapter.move(1, 2);
            expect('Green').toBe(adapter.at(2)?.get('name'));
            expect('Geller').toBe(adapter.at(1)?.get('name'));
        });

        test('should not move Green', () => {
            adapter.move(1, 1);
            expect('Green').toBe(adapter.at(1)?.get('name'));
        });

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                adapter.move(0, 0);
            }).toThrow();
        });
    });

    describe('.merge()', () => {
        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                //@ts-ignore
                adapter.merge(0, 0, undefined);
            }).toThrow();
        });
    });

    describe('.copy()', () => {
        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                adapter.copy(0);
            }).toThrow();
        });
    });

    describe('.copy()', () => {
        test('should copy the record', () => {
            const copy = adapter.copy(1);
            expect(copy.isEqual(data.at(1))).toBe(true);
        });

        test('should insert a copy after the original', () => {
            const copy = adapter.copy(1);
            expect(copy.get('id') > 0).toBe(true);
            expect(copy.get('id')).toBe(data.at(2).get('id'));
        });
    });

    describe('.clear()', () => {
        test('should return an empty table', () => {
            expect(data.getCount() > 0).toBe(true);
            adapter.clear();
            expect(adapter.getData().getCount()).toBe(0);
        });

        test('should return a same instance', () => {
            adapter.clear();
            expect(data).toBe(adapter.getData());
        });

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                adapter.clear();
            }).toThrow();
        });
    });

    describe('.getData()', () => {
        test('should return raw data', () => {
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.getFormat()', () => {
        test('should return type name for inner recordset', () => {
            const data = new RecordSet({
                rawData: {
                    d: [
                        [1, 'Smith'],
                        [2, 'Green'],
                        [3, 'Geller'],
                    ],
                    s: [
                        { n: 'id', t: 'Число целое' },
                        { n: 'name', t: 'Строка' },
                    ],
                    tp: 'User',
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetTableAdapter(data);
            const typeName = adapter.getTypeName();

            expect(typeName).toBe('User');
        });

        test('should return type name for inner recordset with default type', () => {
            const typeName = adapter.getTypeName();
            expect(typeName).toBe('record');
        });
    });

    describe('.getTypeName()', () => {
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
            expect(data.getFormat().at(0).getName()).toBe(fieldName);
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
            for (let i = 0; i < adapter.getCount(); i++) {
                expect(adapter.at(i)?.get(fieldName)).toBe(def);
                expect(data.at(i).get(fieldName)).toBe(def);
            }
        });

        test('should throw an error for already exists field', () => {
            expect(() => {
                adapter.addField(
                    fieldsFactory({
                        type: 'string',
                        name: 'id',
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

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            const field = fieldsFactory({
                type: 'string',
                name: 'id',
            });
            expect(() => {
                adapter.addField(field, undefined);
            }).toThrow();
        });
    });

    describe('.removeField()', () => {
        test('should remove exists field', () => {
            const name = 'id';
            adapter.removeField(name);
            for (let i = 0; i < adapter.getCount(); i++) {
                expect(adapter.at(i)?.get(name)).not.toBeDefined();
                expect(data.at(i).get(name)).not.toBeDefined();
            }
            expect(() => {
                adapter.getFormat(name);
            }).toThrow();
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.removeField('Some');
            }).toThrow();
        });

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                adapter.removeField('id');
            }).toThrow();
        });
    });

    describe('.removeFieldAt()', () => {
        const getRawData = () => {
            return {
                d: [
                    [1, 'Smith'],
                    [2, 'Green'],
                    [3, 'Geller'],
                ],
                s: [
                    { n: 'id', t: 'Число целое' },
                    { n: 'name', t: 'Строка' },
                ],
            };
        };

        test('should remove exists field', () => {
            const data = new RecordSet({
                format,
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetTableAdapter(data);
            const oldF = adapter.getFields();

            adapter.removeFieldAt(0);
            const newF = adapter.getFields();
            expect(oldF[0]).not.toEqual(newF[0]);
            expect(oldF[1]).toBe(newF[0]);
            expect(() => {
                adapter.getFormat(oldF[0]);
            }).toThrow();
        });

        test('should throw an error', () => {
            const data = new RecordSet({
                rawData: getRawData(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const adapter = new RecordSetTableAdapter(data);

            expect(() => {
                adapter.removeFieldAt(-1);
            }).toThrow();
            expect(() => {
                adapter.removeFieldAt(10);
            }).toThrow();
        });

        test('should throw TypeError for empty data', () => {
            const adapter = new RecordSetTableAdapter();
            expect(() => {
                adapter.removeFieldAt(0);
            }).toThrow();
        });
    });
});
