import RecordSetAdapter from 'Types/_entity/adapter/RecordSet';
import RecordSetTableAdapter from 'Types/_entity/adapter/RecordSetTable';
import RecordSetRecordAdaprter from 'Types/_entity/adapter/RecordSetRecord';
import { RecordSet } from 'Types/collection';
import { Record, Model } from 'Types/entity';

describe('Types/_entity/adapter/RecordSet', () => {
    let data: RecordSet;
    let adapter: RecordSetAdapter;

    beforeEach(() => {
        data = new RecordSet({
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

        adapter = new RecordSetAdapter();
    });

    describe('.forTable()', () => {
        test('should return table adapter', () => {
            expect(adapter.forTable()).toBeInstanceOf(RecordSetTableAdapter);
        });

        test('should pass data to the table adapter', () => {
            expect(adapter.forTable(data).getData()).toBe(data);
        });
    });

    describe('.forRecord()', () => {
        test('should return record adapter', () => {
            expect(adapter.forRecord()).toBeInstanceOf(RecordSetRecordAdaprter);
        });

        test('should pass data to the record adapter', () => {
            const data = new Record();
            expect(adapter.forRecord(data).getData()).toBe(data);
        });

        test('should pass data reference to the record adapter as table data', () => {
            const items = new RecordSet();
            adapter.dataReference = items;

            const item = new Record();
            const itemAdapter = adapter.forRecord(item);

            expect(itemAdapter.getTableData()).toBe(items);
        });

        describe('when enclosed model used', () => {
            class ModelA extends Model {
                protected _$properties: {} = {
                    propA: {
                        get: () => {
                            return 'A';
                        },
                    },
                };
            }

            class ModelB extends Model {
                protected _$properties: {} = {
                    propB: {
                        get: () => {
                            return 'B';
                        },
                    },
                };
            }

            let model: ModelA;

            beforeEach(() => {
                model = new ModelA({
                    rawData: new ModelB({
                        rawData: {
                            propC: 'C',
                        },
                    }),
                    adapter: new RecordSetAdapter(),
                });
            });

            test('should return the property value', () => {
                expect(model.get('propA')).toBe('A');
                expect(model.get('propB')).toBe('B');
                expect(model.get('propC')).toBe('C');
            });

            test('should return the property value format is defined', () => {
                const model = new ModelA({
                    format: [],
                    rawData: new ModelB({
                        format: [
                            {
                                name: 'propC',
                                type: 'string',
                            },
                        ],
                        rawData: {
                            propC: 'C',
                        },
                    }),
                    adapter: new RecordSetAdapter(),
                });

                expect(model.get('propA')).toBe('A');
                expect(model.get('propB')).toBe('B');
                expect(model.get('propC')).toBe('C');
            });

            test('should cast it to date', () => {
                const model = new ModelA({
                    format: [{ name: 'date', type: 'date' }],
                    rawData: new ModelB({
                        format: [
                            {
                                name: 'date',
                                type: 'date',
                            },
                        ],
                        rawData: {
                            date: '2016-01-01',
                        },
                    }),
                    adapter: new RecordSetAdapter(),
                });

                expect(model.get('date')).toEqual(new Date(2016, 0, 1));
            });
        });
    });

    describe('.getKeyField()', () => {
        test('should return option keyProperty for recordset', () => {
            expect(adapter.getKeyField(data)).toBe(data.getKeyProperty());
        });

        test('should return option keyProperty for model', () => {
            const data = new Model({
                keyProperty: 'test',
            });
            expect(adapter.getKeyField(data)).toBe('test');
        });
    });

    describe('.getProperty()', () => {
        test('should return the property value', () => {
            expect(3).toBe(adapter.getProperty(data, 'count'));

            expect(adapter.getProperty(data, 'total')).not.toBeDefined();

            //@ts-ignore
            expect(adapter.getProperty(data, undefined)).not.toBeDefined();
        });

        test('should return undefined on invalid data', () => {
            //@ts-ignore
            expect(adapter.getProperty({}, undefined)).not.toBeDefined();

            //@ts-ignore
            expect(adapter.getProperty('' as any, undefined)).not.toBeDefined();

            //@ts-ignore
            expect(adapter.getProperty(0 as any, undefined)).not.toBeDefined();

            //@ts-ignore
            expect(adapter.getProperty(undefined, undefined)).not.toBeDefined();
        });
    });

    describe('.setProperty()', () => {
        test('should set the property value', () => {
            adapter.setProperty(data, 'keyProperty', 'name');
            expect('name').toBe(data.getKeyProperty());
        });

        test('should throw an error if property does not exist', () => {
            expect(() => {
                adapter.setProperty(data, 'some', 'value');
            }).toThrow();
        });
    });

    describe('.dataReference', () => {
        test('should return undefined by default', () => {
            expect(adapter.dataReference).not.toBeDefined();
        });

        test('should keep given reference', () => {
            adapter.dataReference = data;
            expect(adapter.dataReference).toBe(data);
        });
    });
});
