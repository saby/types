import SbisTable from 'Types/_entity/adapter/SbisTable';
import SbisFieldType from 'Types/_entity/adapter/SbisFieldType';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';
import IntegerField from 'Types/_entity/format/IntegerField';
import StringField from 'Types/_entity/format/StringField';
import { IFieldFormat, ITableFormat, ISerializable } from 'Types/_entity/adapter/SbisFormatMixin';

describe('Types/_entity/adapter/SbisTable', () => {
    const getFormat = (): IFieldFormat[] => {
        return [
            { n: 'id', t: 'Число целое' },
            { n: 'lastname', t: 'Строка' },
        ];
    };

    let data: ITableFormat;
    let adapter: SbisTable;

    beforeEach(() => {
        data = {
            d: [
                [1, 'Smith'],
                [2, 'Green'],
                [3, 'Geller'],
                [4, 'Bing'],
                [5, 'Tribbiani'],
                [6, 'Buffay'],
                [7, 'Tyler'],
            ],
            s: getFormat(),
        };

        adapter = new SbisTable(data);
    });

    describe('.getMetaDataDescriptor()', () => {
        test('should return an empty array for empty data', () => {
            const data = null;
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor.length).toEqual(0);
        });

        test('should return results field', () => {
            const data = {
                d: [],
                r: { d: [], s: [] },
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor[0].getName()).toEqual('results');
            expect(descriptor[0].getType()).toEqual('record');
        });

        test('should return path field', () => {
            const data = {
                d: [],
                p: { d: [], s: [] },
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor[0].getName()).toEqual('path');
            expect(descriptor[0].getType()).toEqual('recordset');
        });

        test('should return total field for Number', () => {
            const data = {
                n: 1,
                d: [],
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor[0].getName()).toEqual('total');
            expect(descriptor[0].getType()).toEqual('integer');

            expect(descriptor[1].getName()).toEqual('more');
            expect(descriptor[1].getType()).toEqual('integer');
        });

        test('should return total field for Boolean', () => {
            const data = {
                n: true,
                d: [],
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor[0].getName()).toEqual('total');
            expect(descriptor[0].getType()).toEqual('boolean');

            expect(descriptor[1].getName()).toEqual('more');
            expect(descriptor[1].getType()).toEqual('boolean');
        });

        test('should return total field for Object', () => {
            const data = {
                n: {
                    after: false,
                    before: true,
                },
                d: [],
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor[0].getName()).toEqual('total');
            expect(descriptor[0].getType()).toEqual('object');

            expect(descriptor[1].getName()).toEqual('more');
            expect(descriptor[1].getType()).toEqual('object');
        });

        test('should return total field for RecordSet', () => {
            const data = {
                n: {
                    _type: 'recordset',
                    d: [],
                    s: [],
                },
                d: [],
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor[0].getName()).toEqual('total');
            expect(descriptor[0].getType()).toEqual('recordset');

            expect(descriptor[1].getName()).toEqual('more');
            expect(descriptor[1].getType()).toEqual('recordset');
        });

        test('should return meta fields', () => {
            const format = getFormat();
            const data = {
                m: {
                    d: [1, 'foo'],
                    s: format,
                },
                d: [],
            };
            //@ts-ignore
            const adapter = new SbisTable(data);
            const descriptor = adapter.getMetaDataDescriptor();

            expect(descriptor.length).toEqual(format.length);

            //@ts-ignore
            descriptor.forEach((field, index) => {
                expect(field.getName()).toEqual(format[index].n);
                //@ts-ignore
                expect(SbisFieldType[field.getType()]).toEqual(format[index].t);
            });
        });
    });

    describe('.clone()', () => {
        test('should return new instance', () => {
            expect(adapter.clone() !== adapter).toBeTruthy();
            expect(adapter.clone()).toBeInstanceOf(SbisTable);
        });

        test('should return shared raw data if shallow', () => {
            expect(adapter.clone(true).getData()).toBe(data);
        });

        test('should return cloned raw data if not shallow', () => {
            const clone = adapter.clone();
            expect(clone.getData() !== data).toBeTruthy();
            expect(clone.getData()).toEqual(data);
        });
    });

    describe('.getFields()', () => {
        test('should return fields list', () => {
            expect(adapter.getFields()).toEqual(['id', 'lastname']);
        });
    });

    describe('.getCount()', () => {
        test('should return records count', () => {
            expect(7).toBe(adapter.getCount());

            expect(0).toBe(new SbisTable({} as any).getCount());

            expect(0).toBe(new SbisTable('' as any).getCount());

            expect(0).toBe(new SbisTable(0 as any).getCount());

            expect(0).toBe(new SbisTable().getCount());
        });
    });

    describe('.add()', () => {
        test('should append a record', () => {
            adapter.add(
                {
                    d: [30, 'Огурцов'],
                    s: getFormat(),
                },
                //@ts-ignore
                undefined
            );

            expect(8).toBe(data.d.length);

            expect(30).toBe(data.d[data.d.length - 1][0]);

            expect('Огурцов').toBe(data.d[data.d.length - 1][1]);
        });

        test('should prepend a record', () => {
            adapter.add({ d: [40, 'Перцов'], s: getFormat() }, 0);

            expect(8).toBe(data.d.length);

            expect(40).toBe(data.d[0][0]);

            expect('Перцов').toBe(data.d[0][1]);
        });

        test('should insert a record', () => {
            adapter.add(
                {
                    d: [50, 'Горохов'],
                    s: getFormat(),
                },
                2
            );

            expect(8).toBe(data.d.length);

            expect(50).toBe(data.d[2][0]);

            expect('Горохов').toBe(data.d[2][1]);
        });

        test('should insert the first record', () => {
            const format = [{ n: 'id', t: 'Число целое' }];
            const data = {
                d: [],
                s: format,
            };
            const adapter = new SbisTable(data);

            adapter.add({ d: [5], s: format }, 0);
            expect(1).toBe(data.d.length);
            expect(5).toBe(data.d[0][0]);
        });

        test('should insert the last record', () => {
            const format = [{ n: 'id', t: 'Число целое' }];
            const data = {
                d: [[1], [2]],
                s: format,
            };
            const adapter = new SbisTable(data);

            adapter.add({ d: [33], s: format }, 2);
            expect(3).toBe(data.d.length);
            expect(33).toBe(data.d[2][0]);
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                adapter.add({ d: [30, 'aaa'], s: getFormat() }, 100);
            }).toThrow();
            expect(() => {
                adapter.add({ d: [30, 'aaa'], s: getFormat() }, -1);
            }).toThrow();
        });

        test('should normalize the value', () => {
            const table = { d: [], s: [{ n: 'foo', t: 'Запись' }] };
            const adapter = new SbisTable(table);
            const rec = { d: [null], f: 0, s: [{ n: 'foo', t: 'Запись' }] };

            adapter.add(rec, 0);
            expect(Object.keys(rec)).not.toContain('f');
        });

        test("should take the format from the record if don't have own", () => {
            const table = { d: [], s: [] };
            const adapter = new SbisTable(table);
            const format = [{ n: 'id', t: 'Число целое' }];
            const rec = { d: [1], s: format };

            adapter.add(rec, 0);
            expect(table.s).toBe(rec.s);
        });

        test('should share own format with the record', () => {
            const getFormat = () => {
                return [{ n: 'id', t: 'Число целое' }];
            };
            const format = getFormat();
            const table = { d: [], s: format };
            const adapter = new SbisTable(table);
            const rec = { d: [1], s: getFormat() };

            adapter.add(rec, 0);
            expect(rec.s).toBe(table.s);
        });

        test('should add a record with different columns count', () => {
            const format = getFormat();
            const count = data.d.length;

            format.push({ n: 'test', t: 'Строка' });
            //@ts-ignore
            adapter.add({ d: [30, 'Огурцов'], s: format }, undefined);

            expect(1 + count).toBe(data.d.length);
        });

        test('should add a record with different columns name', () => {
            const format = getFormat();
            const count = data.d.length;

            format[0].n = 'test';
            //@ts-ignore
            adapter.add({ d: [30, 'Огурцов'], s: format }, undefined);

            expect(1 + count).toBe(data.d.length);
        });

        test('should add a record with different columns type', () => {
            const format = getFormat();
            const count = data.d.length;

            format[0].t = 'test';
            //@ts-ignore
            adapter.add({ d: [30, 'Огурцов'], s: format }, undefined);

            expect(1 + count).toBe(data.d.length);
        });

        test("should take the format from the record if don't have own and not empty owns format", () => {
            const table = {
                d: [],
                s: [{ n: 'id', t: 'Строка' }],
            };
            const adapter = new SbisTable(table);
            const format = [{ n: 'id', t: 'Число целое' }];
            const rec = { d: [1], s: format };

            adapter.add(rec, 0);
            expect(table.s).toBe(rec.s);
        });
    });

    describe('.at()', () => {
        test('should return valid record', () => {
            expect(1).toBe(adapter.at(0)?.d[0] as any);
            expect(3).toBe(adapter.at(2)?.d[0] as any);
        });

        test('should return undefined on invalid position', () => {
            expect(adapter.at(-1)).not.toBeDefined();
            expect(adapter.at(99)).not.toBeDefined();
        });

        test('should return undefined on invalid data', () => {
            //@ts-ignore
            expect(new SbisTable({} as any).at(undefined)).not.toBeDefined();
            //@ts-ignore
            expect(new SbisTable('' as any).at(undefined)).not.toBeDefined();
            //@ts-ignore
            expect(new SbisTable(0 as any).at(undefined)).not.toBeDefined();
            //@ts-ignore
            expect(new SbisTable().at(undefined)).not.toBeDefined();
        });
    });

    describe('.remove()', () => {
        test('should remove the record', () => {
            adapter.remove(0);
            expect(2).toBe(data.d[0][0]);

            adapter.remove(2);
            expect(5).toBe(data.d[2][0]);

            adapter.remove(4);
            expect(data.d[4]).not.toBeDefined();
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                adapter.remove(-1);
            }).toThrow();
            expect(() => {
                adapter.remove(99);
            }).toThrow();
        });
    });

    describe('.merge()', () => {
        test('should merge two records', () => {
            adapter.merge(0, 1);
            expect('Green').toBe(data.d[0][1]);
        });
    });

    describe('.copy()', () => {
        test('should copy the record', () => {
            const copy = adapter.copy(1);
            expect(copy).toEqual(data.d[1]);
        });

        test('should insert a copy after the original', () => {
            const copy = adapter.copy(1);
            expect(copy).toBe(data.d[2]);
        });
    });

    describe('.replace()', () => {
        test('should replace the record', () => {
            adapter.replace({ d: [11], s: getFormat() }, 0);
            expect(11).toBe(data.d[0][0]);

            adapter.replace({ d: [12], s: getFormat() }, 4);
            expect(12).toBe(data.d[4][0]);
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                //@ts-ignore
                adapter.replace({ d: [13] }, -1);
            }).toThrow();
            expect(() => {
                //@ts-ignore
                adapter.replace({ d: [14] }, 99);
            }).toThrow();
        });

        test('should normalize the value', () => {
            const table = { d: [null], s: [{ n: 'foo', t: 'Запись' }] };
            //@ts-ignore
            const adapter = new SbisTable(table);
            const rec = { d: [null], f: 0, s: [{ n: 'foo', t: 'Запись' }] };

            adapter.replace(rec, 0);
            expect(Object.keys(rec)).not.toContain('f');
        });

        test('should replace s in raw data', () => {
            const s = [{ n: 'id', t: 'Число целое' }];
            const adapter = new SbisTable({ d: [[1]], s: [] });
            adapter.replace({ d: [11], s }, 0);
            expect(adapter.getData().s).toBe(s);
        });

        test('should set s in record', () => {
            const record = { d: [], s: getFormat() };
            adapter.replace(record, 0);
            expect(record.s).toBe(adapter.getData().s);
        });
    });

    describe('.move()', () => {
        test('should move Smith instead Geller', () => {
            adapter.move(0, 2);
            expect('Green').toBe(data.d[0][1]);
            expect('Geller').toBe(data.d[1][1]);
            expect('Smith').toBe(data.d[2][1]);
        });

        test('should move Geller instead Smith', () => {
            adapter.move(2, 0);
            expect('Geller').toBe(data.d[0][1]);
            expect('Smith').toBe(data.d[1][1]);
            expect('Green').toBe(data.d[2][1]);
        });

        test('should move Green to the end', () => {
            adapter.move(1, 6);
            expect('Green').toBe(data.d[6][1]);
            expect('Tyler').toBe(data.d[5][1]);
        });

        test('should not move Green', () => {
            adapter.move(1, 1);
            expect('Green').toBe(data.d[1][1]);
            expect('Buffay').toBe(data.d[5][1]);
        });
    });

    describe('.clear()', () => {
        test('should return an empty table', () => {
            expect(data.d.length > 0).toBe(true);
            expect(data.s.length > 0).toBe(true);
            adapter.clear();
            expect(adapter.getData().d.length).toBe(0);
            expect(adapter.getData().s).toBe(data.s);
        });

        test('should return a same instance', () => {
            adapter.clear();
            expect(data).toBe(adapter.getData());
        });
    });

    describe('.getData()', () => {
        test('should return raw data', () => {
            expect(adapter.getData()).toBe(data);
        });

        test('should return return data with custom toJSON() method', () => {
            const recordAdapter = new SbisTable({
                d: [],
                s: [],
            });
            const enhancedData = recordAdapter.getData() as unknown as ISerializable;

            expect(typeof enhancedData.toJSON).toBe('function');
        });
    });

    describe('.getFormat()', () => {
        test('should return integer field format', () => {
            const format = adapter.getFormat('id');
            expect(format).toBeInstanceOf(IntegerField);
            expect(format.getName()).toBe('id');
        });

        test('should return string field format', () => {
            const format = adapter.getFormat('lastname');
            expect(format).toBeInstanceOf(StringField);
            expect(format.getName()).toBe('lastname');
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.getFormat('Some');
            }).toThrow();
        });
    });

    describe('.addField()', () => {
        test('should add a new field', () => {
            const fieldName = 'New';
            const fieldPos = 1;
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });
            adapter.addField(field, fieldPos);
            expect(adapter.getFormat(fieldName).getName()).toBe(fieldName);
            for (let i = 0; i < adapter.getCount(); i++) {
                expect(adapter.at(i)?.s[fieldPos].n).toBe(fieldName);
            }
        });

        test('should use a field default value', () => {
            const fieldName = 'New';
            const fieldPos = 1;
            const def = 'abc';
            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: fieldName,
                    defaultValue: def,
                }),
                fieldPos
            );
            for (let i = 0; i < adapter.getCount(); i++) {
                expect(adapter.at(i)?.d[fieldPos] as any).toBe(def);
            }
        });

        test('should throw an error for already exists field', () => {
            expect(() => {
                adapter.addField(
                    fieldsFactory({
                        type: 'string',
                        name: 'id',
                    })
                );
            }).toThrow();
        });

        test('should throw an error for not a field', () => {
            expect(() => {
                //@ts-ignore
                adapter.addField(undefined);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                adapter.addField(null);
            }).toThrow();

            expect(() => {
                adapter.addField({
                    type: 'string',
                    name: 'New',
                } as any);
            }).toThrow();
        });
    });

    describe('.removeField()', () => {
        test('should remove exists field', () => {
            const name = 'id';
            const index = 0;
            const newFields = adapter.getData().s.slice();
            const newData = adapter
                .getData()
                .d.slice()
                .map((item) => {
                    item.slice().splice(index, 1);
                    return item;
                });

            adapter.removeField(name);
            newFields.splice(index, 1);

            expect([...adapter.getData().s]).toEqual(newFields);
            expect(adapter.getData().d).toEqual(newData);
            for (let i = 0; i < adapter.getCount(); i++) {
                expect([...(adapter.at(i)?.s || [])]).toEqual(newFields);
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
    });

    describe('.removeFieldAt()', () => {
        test('should remove exists field', () => {
            const name = 'id';
            const index = 0;
            const newFields = adapter
                .getData()
                .s.slice()
                .splice(index - 1, 1);
            const newData = adapter
                .getData()
                .d.slice()
                .map((item) => {
                    item.slice().splice(index, 1);
                    return item;
                });

            adapter.removeFieldAt(index);
            expect([...adapter.getData().s]).toEqual(newFields);
            expect(adapter.getData().d).toEqual(newData);
            for (let i = 0; i < adapter.getCount(); i++) {
                expect([...(adapter.at(i)?.s || [])]).toEqual(newFields);
            }
            expect(() => {
                adapter.getFormat(name);
            }).toThrow();
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.removeFieldAt(9);
            }).toThrow();
        });
    });

    describe('getTypeName()', () => {
        test('should return type name', () => {
            const table = {
                d: [],
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
            };
            const adapter = new SbisTable(table);

            const typeName = adapter.getTypeName();
            expect(typeName).toBe('User');
        });
        test('should return default type name for recordset', () => {
            const table = {
                d: [],
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
            };
            const adapter = new SbisTable(table);

            const typeName = adapter.getTypeName();
            expect(typeName).toBe('record');
        });
    });

    describe('getTypeName()', () => {
        test('should set typename on rawData', () => {
            adapter.setTypeName('TestType');

            expect(adapter.getTypeName()).toBe('TestType');

            const rawData = adapter.getData();

            expect(rawData.tp).toEqual('TestType');
        });
    });
});
