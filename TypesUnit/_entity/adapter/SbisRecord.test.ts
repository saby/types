import SbisRecord from 'Types/_entity/adapter/SbisRecord';
import {
    IArrayFieldType,
    IDateTimeFieldType,
    IDictFieldType,
    IFieldType,
    IMoneyFieldType,
    IRealFieldType,
    IRecordFormat,
} from 'Types/_entity/adapter/SbisFormatMixin';
import * as fieldFormat from 'Types/_entity/format';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';
import {
    IDateTimeMeta,
    IDictionaryMeta,
    IMoneyMeta,
    IArrayMeta,
} from 'Types/_entity/format/UniversalField';
import FlagsField from 'Types/_entity/format/FlagsField';
import { RecordSet } from 'Types/collection';
import { ISerializable } from 'Types/_entity/SerializableMixin';

describe('Types/_entity/adapter/SbisRecord', () => {
    let data: IRecordFormat;
    let adapter: SbisRecord;

    beforeEach(() => {
        data = {
            d: [1, 'Smith', 'John', 'Gordon'],
            s: [
                { n: 'id', t: 'Число целое' },
                { n: 'lastname', t: 'Строка' },
                { n: 'firstname', t: 'Строка' },
                { n: 'middlename', t: 'Строка' },
            ],
        };

        adapter = new SbisRecord(data);
    });

    describe('.constructor()', () => {
        test('should throw an error on invalid data', () => {
            let adapter;

            expect(() => {
                adapter = new SbisRecord([] as any);
            }).toThrow();

            expect(() => {
                adapter = new SbisRecord(new Date() as any);
            }).toThrow();

            expect(() => {
                adapter = new SbisRecord({
                    _type: 'recordset',
                } as any);
            }).toThrow();

            expect(adapter).not.toBeDefined();
        });

        test('should normalize shared formats', () => {
            const data = {
                f: 1,
                d: [
                    {
                        f: 2,
                        d: [
                            {
                                f: 1,
                                d: [null],
                            },
                        ],
                        s: [{ n: 'bar', t: 'Строка' }],
                    },
                ],
                s: [{ n: 'foo', t: 'Строка' }],
            };
            const adapter = new SbisRecord(data);

            expect(adapter.getData()).toEqual({
                d: [
                    {
                        d: [
                            {
                                d: [null],
                                s: [{ n: 'foo', t: 'Строка' }],
                            },
                        ],
                        s: [{ n: 'bar', t: 'Строка' }],
                    },
                ],
                s: [{ n: 'foo', t: 'Строка' }],
            });
        });

        test('should skip not exact format', () => {
            const data = {
                f: 1,
                d: [
                    {
                        f: 123,
                    },
                ],
                s: [{ n: 'foo', t: 'JSON-объект' }],
            };
            const adapter = new SbisRecord(data);

            expect(adapter.getData()).toEqual({
                d: [
                    {
                        f: 123,
                    },
                ],
                s: [{ n: 'foo', t: 'JSON-объект' }],
            });
        });

        test('should define writable property for shared format', () => {
            const adapter = new SbisRecord({
                f: 1,
                d: [
                    {
                        f: 1,
                        d: [[null]],
                    },
                ],
                s: [{ n: 'foo', t: 'Строка' }],
            });
            const data = adapter.getData();
            const formatDescriptor = Object.getOwnPropertyDescriptor(data.d[0], 's');

            expect(formatDescriptor?.writable).toBe(true);
        });
    });

    describe('.clone()', () => {
        test('should return new instance', () => {
            expect(adapter.clone() !== adapter).toBeTruthy();
            expect(adapter.clone()).toBeInstanceOf(SbisRecord);
        });

        test('should clone an empty instance', () => {
            const adapter = new SbisRecord();
            const data = adapter.getData();
            expect(adapter.clone().getData()).toBe(data);
        });

        test('should clone an instance with null', () => {
            //@ts-ignore
            const adapter = new SbisRecord(null);
            expect(adapter.clone().getData()).toBeNull();
        });

        test('should return shared raw data if shallow', () => {
            expect(adapter.clone(true).getData()).toBe(data);
        });

        test('should return cloned raw data if not shallow', () => {
            const clone = adapter.clone();
            expect(clone.getData() !== data).toBeTruthy();
            expect(clone.getData()).toEqual(data);
        });

        test('should return raw data with shared "s" if not shallow', () => {
            expect(adapter.clone().getData().s).toBe(data.s);
        });
    });

    describe('.get()', () => {
        test('should return the property value', () => {
            expect(1).toBe(adapter.get('id'));
            expect('Smith').toBe(adapter.get('lastname'));
            expect(adapter.get('Должность')).not.toBeDefined();
            //@ts-ignore
            expect(adapter.get(undefined)).not.toBeDefined();
            expect(new SbisRecord({} as any).get('Должность')).not.toBeDefined();
            //@ts-ignore
            expect(new SbisRecord('' as any).get(undefined)).not.toBeDefined();
            //@ts-ignore
            expect(new SbisRecord(0 as any).get(undefined)).not.toBeDefined();
            //@ts-ignore
            expect(new SbisRecord().get(undefined)).not.toBeDefined();
        });

        test('should return type "Идентификатор" as is from Array with Number', () => {
            const data = {
                d: [[1]],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);

            expect(adapter.get('id')).toBe(1);
        });

        test('should return type "Идентификатор" as is from Array with Number and String', () => {
            const data = {
                d: [[1, 'foo']],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);

            expect(adapter.get('id')).toBe('1,foo');
        });

        test('should return type "Идентификатор" as is from Array with null', () => {
            const data = {
                d: [[null]],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);

            expect(adapter.get('id')).toBe(null);
        });

        test('should return type "Запись" with linked format', () => {
            const data = {
                f: 0,
                s: [{ n: 'rec', t: 'Запись' }],
                d: [{ f: 0, d: [null] }],
            };
            const adapter = new SbisRecord(data);
            const recData = adapter.get('rec');
            const recAdapter = new SbisRecord(recData);

            expect(recData.s).toEqual([...data.s]);
            expect(recAdapter.get('rec')).toBeNull();
        });
    });

    describe('.set()', () => {
        test('should set the value', () => {
            adapter.set('id', 20);
            expect(20).toBe(data.d[0]);
        });

        test('should normalize the value', () => {
            const data = {
                d: [null],
                s: [{ n: 'foo', t: 'Запись' }],
            };
            const adapter = new SbisRecord(data);
            const value = { d: [], f: 0, s: [] };

            adapter.set('foo', value);
            const storedValue = adapter.get('foo');
            expect(Object.keys(storedValue)).not.toContain('f');
        });

        test('should set type "Идентификатор" from Array', () => {
            const data = {
                d: [[null]],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);

            adapter.set('id', [1]);
            expect(data.d[0]).toEqual([1]);
        });

        test('should set type "Идентификатор" from Array with null', () => {
            const data = {
                d: [null],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);

            adapter.set('id', [null]);
            expect(data.d[0]).toEqual([null]);
        });

        test('should set type "Идентификатор" from null', () => {
            const data = {
                d: [[null]],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);

            adapter.set('id', null);
            expect(data.d[0]).toEqual([null]);
        });

        test('should throw an error on undefined property', () => {
            expect(() => {
                adapter.set('а', 5);
            }).toThrow();
            expect(() => {
                adapter.set('б', undefined);
            }).toThrow();
        });

        test('should throw an error on invalid data', () => {
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
        test('should return an empty record', () => {
            expect(data.d.length > 0).toBe(true);
            expect(data.s.length > 0).toBe(true);
            adapter.clear();
            expect(adapter.getData().d.length).toBe(0);
            expect(adapter.getData().s.length).toBe(0);
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
    });

    describe('.getFields()', () => {
        test('should return fields list', () => {
            expect(adapter.getFields()).toEqual(['id', 'lastname', 'firstname', 'middlename']);
        });
    });

    describe('.getFormat()', () => {
        test('should return Integer field format', () => {
            const format = adapter.getFormat('id');
            expect(format).toBeInstanceOf(fieldFormat.IntegerField);
            expect(format.getName()).toBe('id');
        });

        test('should return Real field format', () => {
            const data = {
                d: [100.9999],
                s: [
                    {
                        n: 'real',
                        t: { n: 'Число вещественное', p: 20 },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.RealField>('real');

            expect(format).toBeInstanceOf(fieldFormat.RealField);
            expect(format.getPrecision()).toBe(20);
        });

        test('should return Money field format', () => {
            const data = {
                d: [100.9999],
                s: [
                    {
                        n: 'money',
                        t: { n: 'Деньги', p: 2 },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.RealField>('money');

            expect(format).toBeInstanceOf(fieldFormat.MoneyField);
            expect(format.getPrecision()).toBe(2);
        });

        test('should return String field format', () => {
            const format = adapter.getFormat('lastname');
            expect(format).toBeInstanceOf(fieldFormat.StringField);
            expect(format.getName()).toBe('lastname');
        });

        test('should return XML field format', () => {
            const data = {
                d: ['<?xml version="1.1" encoding="UTF-8"?>'],
                s: [
                    {
                        n: 'xml',
                        t: 'XML-файл',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('xml');
            expect(format).toBeInstanceOf(fieldFormat.XmlField);
        });

        test('should return DateTime with time zone field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'dt',
                        t: 'Дата и время',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DateTimeField>('dt');
            expect(format).toBeInstanceOf(fieldFormat.DateTimeField);
            expect(format.isWithoutTimeZone()).toBe(false);
        });

        test('should return DateTime without time zone field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'dt',
                        t: {
                            n: 'Дата и время',
                            tz: false,
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DateTimeField>('dt');

            expect(format.isWithoutTimeZone()).toBe(true);
        });

        test('should return Date field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'date',
                        t: 'Дата',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('date');
            expect(format).toBeInstanceOf(fieldFormat.DateField);
        });

        test('should return Time field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'time',
                        t: 'Время',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('time');
            expect(format).toBeInstanceOf(fieldFormat.TimeField);
        });

        test('should return TimeInterval field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'timeint',
                        t: 'Временной интервал',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('timeint');
            expect(format).toBeInstanceOf(fieldFormat.TimeIntervalField);
        });

        test('should return Link field format', () => {
            const adapter = new SbisRecord({
                d: [0],
                s: [{ n: 'id', t: 'Связь' }],
            });
            const format = adapter.getFormat('id');
            expect(format).toBeInstanceOf(fieldFormat.LinkField);
        });

        test('should return Identity field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'id',
                        t: 'Идентификатор',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('id');
            expect(format).toBeInstanceOf(fieldFormat.IdentityField);
        });

        test('should return Enum field format', () => {
            const data = {
                d: [1],
                s: [
                    {
                        n: 'enum',
                        t: {
                            n: 'Перечисляемое',
                            s: {
                                0: 'one',
                                1: 'two',
                            },
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DictionaryField>('enum');
            expect(format).toBeInstanceOf(fieldFormat.EnumField);
            expect(format.getDictionary()).toEqual(data.s[0].t.s);
        });

        test('should return Flags field format', () => {
            const data = {
                d: [1],
                s: [
                    {
                        n: 'flags',
                        t: {
                            n: 'Флаги',
                            s: {
                                0: 'one',
                                1: 'two',
                            },
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.DictionaryField>('flags');
            expect(format).toBeInstanceOf(fieldFormat.FlagsField);
            expect(format.getDictionary()).toEqual(data.s[0].t.s);
        });

        test('should return Record field format', () => {
            const data = {
                d: [{ d: [], s: [] }],
                s: [
                    {
                        n: 'rec',
                        t: 'Запись',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('rec');
            expect(format).toBeInstanceOf(fieldFormat.RecordField);
        });

        test('should return RecordSet field format', () => {
            const data = {
                d: [{ d: [], s: [] }],
                s: [
                    {
                        n: 'rs',
                        t: 'Выборка',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('rs');
            expect(format).toBeInstanceOf(fieldFormat.RecordSetField);
        });

        test('should return Binary field format', () => {
            const data = {
                d: [''],
                s: [
                    {
                        n: 'bin',
                        t: 'Двоичное',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('bin');
            expect(format).toBeInstanceOf(fieldFormat.BinaryField);
        });

        test('should return UUID field format', () => {
            const data = {
                d: [''],
                s: [
                    {
                        n: 'uuid',
                        t: 'UUID',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('uuid');
            expect(format).toBeInstanceOf(fieldFormat.UuidField);
        });

        test('should return RPC-File field format', () => {
            const data = {
                d: [''],
                s: [
                    {
                        n: 'file',
                        t: 'Файл-rpc',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat('file');
            expect(format).toBeInstanceOf(fieldFormat.RpcFileField);
        });

        test('should return Array field format', () => {
            const data = {
                d: [''],
                s: [
                    {
                        n: 'arr',
                        t: {
                            n: 'Массив',
                            t: 'Логическое',
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getFormat<fieldFormat.ArrayField>('arr');
            expect(format).toBeInstanceOf(fieldFormat.ArrayField);
            expect(format.getKind()).toBe('boolean');
        });

        test('should return String field format for unknown type', () => {
            const adapter = new SbisRecord({
                d: [0],
                s: [{ n: 'id', t: 'Foo' }],
            });
            const format = adapter.getFormat('id');
            expect(format).toBeInstanceOf(fieldFormat.StringField);
            expect(format.getName()).toBe('id');
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.getFormat('Some');
            }).toThrow();
        });

        test('should return format for reused data', () => {
            const data = {
                d: [1],
                s: [{ n: 'foo', t: 'Число целое' }],
            };

            const adapterA = new SbisRecord(data);
            expect(adapterA.getFormat('foo').getType()).toBe('integer');

            data.d.push(2);
            data.s.push({ n: 'bar', t: 'Строка' });
            const adapterB = new SbisRecord(data);
            expect(adapterB.getFormat('bar').getType()).toBe('string');
        });

        test('should return the format after adding it', () => {
            const data: any = {};
            const adapter = new SbisRecord(data);
            const field = fieldsFactory({
                type: 'string',
                name: 'foo',
            });
            adapter.addField(field);

            expect(data.s[0].n).toEqual('foo');
        });
    });

    describe('getTypeName()', () => {
        test('should return type name', () => {
            const data = {
                d: [100, 'foo'],
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
            const adapter = new SbisRecord(data);
            const typeName = adapter.getTypeName();

            expect(typeName).toBe('User');
        });

        test('should return default type name for record', () => {
            const data = {
                d: [100, 'foo'],
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
            const adapter = new SbisRecord(data);
            const typeName = adapter.getTypeName();

            expect(typeName).toBe('record');
        });
    });

    describe('setTypeName()', () => {
        test('should set typename on rawData', () => {
            adapter.setTypeName('TestType');

            expect(adapter.getTypeName()).toBe('TestType');

            const rawData = adapter.getData();

            expect(rawData.tp).toEqual('TestType');
        });
    });

    describe('.getSharedFormat()', () => {
        test('should return Money format with large property as true', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: {
                            n: 'Деньги',
                            l: true,
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect((format.meta as IMoneyMeta).large).toBe(true);
        });

        test('should return Money format with large property as false', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: 'Деньги',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect((format.meta as IMoneyMeta).large).toBe(false);
        });

        test('should return DateTime with time zone field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'dt',
                        t: 'Дата и время',
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('dt');

            expect((format.meta as IDateTimeMeta).withoutTimeZone).toBe(false);
        });

        test('should return DateTime without time zone field format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'dt',
                        t: {
                            n: 'Дата и время',
                            tz: false,
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('dt');

            expect((format.meta as IDateTimeMeta).withoutTimeZone).toBe(true);
        });

        test('should return Enum field format', () => {
            const declaration = {
                n: 'enum',
                t: {
                    n: 'Перечисляемое',
                    s: {
                        0: 'one',
                        1: 'two',
                    },
                },
            };
            const data = {
                d: [1],
                s: [declaration],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('enum');

            expect(format.name).toEqual('enum');
            expect(format.type).toEqual('enum');
            expect((format.meta as IDictionaryMeta).dictionary).toEqual(declaration.t.s);
            expect((format.meta as IDictionaryMeta).localeDictionary).not.toBeDefined();
        });

        test('should return localized Enum field format', () => {
            const declaration = {
                n: 'enum',
                t: {
                    n: 'Перечисляемое',
                    s: {
                        0: 'one',
                        1: 'two',
                    },
                    sl: {
                        0: 'uno',
                        1: 'dos',
                    },
                },
            };
            const data = {
                d: [1],
                s: [declaration],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('enum');

            expect(format.name).toEqual('enum');
            expect(format.type).toEqual('enum');
            expect((format.meta as IDictionaryMeta).dictionary).toEqual(declaration.t.s);
            expect((format.meta as IDictionaryMeta).localeDictionary).toEqual(declaration.t.sl);
        });

        test('should return Array of Money format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: {
                            n: 'Массив',
                            t: 'Деньги',
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect(format.type).toEqual('array');
            expect((format.meta as IArrayMeta).kind).toEqual('money');
            expect((format.meta as IMoneyMeta).large).toBe(false);
        });

        test('should return Array of Money format with "precision" property', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: {
                            n: 'Массив',
                            t: 'Деньги',
                            p: 3,
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect(format.type).toEqual('array');
            expect((format.meta as IArrayMeta).kind).toEqual('money');
            expect((format.meta as IMoneyMeta).precision).toEqual(3);
        });

        test('should return Array of Money format with "large" property', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: {
                            n: 'Массив',
                            t: 'Деньги',
                            l: true,
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect(format.type).toEqual('array');
            expect((format.meta as IArrayMeta).kind).toEqual('money');
            expect((format.meta as IMoneyMeta).large).toBe(true);
        });

        test('should return Array of DateTime format', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: {
                            n: 'Массив',
                            t: 'Дата и время',
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect(format.type).toEqual('array');
            expect((format.meta as IArrayMeta).kind).toEqual('datetime');
            expect((format.meta as IDateTimeMeta).withoutTimeZone).toBe(false);
        });

        test('should return Array of DateTime format with "withoutTimeZone" property', () => {
            const data = {
                d: [123],
                s: [
                    {
                        n: 'foo',
                        t: {
                            n: 'Массив',
                            t: 'Дата и время',
                            tz: false,
                        },
                    },
                ],
            };
            const adapter = new SbisRecord(data);
            const format = adapter.getSharedFormat('foo');

            expect(format.type).toEqual('array');
            expect((format.meta as IArrayMeta).kind).toEqual('datetime');
            expect((format.meta as IDateTimeMeta).withoutTimeZone).toBe(true);
        });
    });

    describe('.addField()', () => {
        test('should add a Boolean field', () => {
            const fieldName = 'New';
            const fieldIndex = 1;
            const field = fieldsFactory({
                type: 'boolean',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.getFormat(fieldName).getName()).toBe(fieldName);
            expect(adapter.getFields()[fieldIndex]).toBe(fieldName);
            expect(adapter.get(fieldName)).toBeNull();
            expect(adapter.getData().s[fieldIndex].t).toBe('Логическое');
        });

        test('should add an Integer field', () => {
            const fieldName = 'New';
            const fieldIndex = 1;
            const field = fieldsFactory({
                type: 'integer',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Число целое');
        });

        test('should add a Real field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'real',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Число вещественное');
        });

        test('should add a Real field with custom precision', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const precision = 4;
            const field = fieldsFactory({
                type: 'real',
                name: fieldName,
                precision,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Число вещественное');
        });

        test('should add a Money field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'money',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Деньги');
        });

        test('should add a Money field with custom precision', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const precision = 3;
            const field = fieldsFactory({
                type: 'money',
                name: fieldName,
                precision,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            const format = adapter.getData().s[fieldIndex];
            expect((format.t as IFieldType).n).toBe('Деньги');
            expect((format.t as IRealFieldType).p).toBe(3);
        });

        test('should add a Money field with large flag', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'money',
                name: fieldName,
                large: true,
            });
            adapter.addField(field, fieldIndex);

            const format = adapter.getData().s[fieldIndex];
            expect((format.t as IFieldType).n).toBe('Деньги');
            expect((format.t as IMoneyFieldType).l).toBe(true);
        });

        test('should add a String field', () => {
            const fieldName = 'New';
            const fieldIndex = 2;
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBeNull();
            expect(adapter.getData().s[fieldIndex].t).toBe('Строка');
        });

        test('should add a deprecated Text field as String field', () => {
            const fieldName = 'New';
            const fieldIndex = 2;
            const field = fieldsFactory({
                type: 'text',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBeNull();
            expect(adapter.getData().s[fieldIndex].t).toBe('Строка');
        });

        test('should add a XML field', () => {
            const fieldName = 'New';
            const fieldIndex = 3;
            const field = fieldsFactory({
                type: 'xml',
                name: fieldName,
            });

            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe('');
            expect(adapter.getData().s[fieldIndex].t).toBe('XML-файл');
        });

        test('should add a DateTime field with time zone', () => {
            const fieldName = 'New';
            const fieldIndex = 3;
            const field = fieldsFactory({
                type: 'datetime',
                name: fieldName,
            });

            adapter.addField(field, fieldIndex);
            const result = adapter.getData().s[fieldIndex];

            expect(adapter.get(fieldName)).toBe(null);
            expect(result.t).toBe('Дата и время');
        });

        test('should add an empty DateTime field without time zone', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'datetime',
                name: fieldName,
                withoutTimeZone: true,
            });

            adapter.addField(field, fieldIndex);
            const result = adapter.getData().s[fieldIndex];

            expect(adapter.get(fieldName)).toBe(null);
            expect((result.t as IFieldType).n).toBe('Дата и время');
            expect((result.t as IDateTimeFieldType).tz).toBe(false);
        });

        test('should add a DateTime field without time zone use default value', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const fieldValue = new Date(2018, 7, 15, 16, 50, 33);
            const field = fieldsFactory({
                type: 'datetime',
                name: fieldName,
                withoutTimeZone: true,
                defaultValue: fieldValue,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toEqual('2018-08-15 16:50:33');
        });

        test('should add a Date field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'date',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Дата');
        });

        test('should add a Time field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'time',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Время');
        });

        test('should add a TimeInterval field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'timeinterval',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe('P0DT0H0M0S');
            expect(adapter.getData().s[fieldIndex].t).toBe('Временной интервал');
        });

        test('should add a Identity field', () => {
            const fieldName = 'New';
            const fieldIndex = 4;
            const field = fieldsFactory({
                type: 'identity',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(data.d[fieldIndex]).toEqual([null]);
            expect(adapter.getData().s[fieldIndex].t).toBe('Идентификатор');
        });

        test('should add an Enum field with Array dictionary', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'enum',
                name: fieldName,
                defaultValue: 1,
                dictionary: ['1st', '2nd'],
            });
            const expectedDict = { 0: '1st', 1: '2nd' };
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(1);
            const format = adapter.getData().s[fieldIndex];
            expect((format.t as IFieldType).n).toBe('Перечисляемое');
            expect((format.t as IDictFieldType).s).toEqual(expectedDict);
        });

        test('should add an Enum field with Object dictionary', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'enum',
                name: fieldName,
                defaultValue: 1,
                dictionary: { 0: '1st', 1: '2nd' },
            });
            const expectedDict = { 0: '1st', 1: '2nd' };
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(1);
            const format = adapter.getData().s[fieldIndex];
            expect((format.t as IFieldType).n).toBe('Перечисляемое');
            expect((format.t as IDictFieldType).s).toEqual(expectedDict);
        });

        test('should add a Flags field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory<FlagsField>({
                type: 'flags',
                name: fieldName,
                defaultValue: [1],
                dictionary: { 0: '1st', 1: '2nd' },
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toEqual([1]);
            const format = adapter.getData().s[fieldIndex];
            expect((format.t as IFieldType).n).toBe('Флаги');
            expect((format.t as IDictFieldType).s).toBe(field.getDictionary());
        });

        test('should add a Record field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'record',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Запись');
        });

        test('should add a RecordSet field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'recordset',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Выборка');
        });

        test('should add a RecordSet field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: RecordSet,
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Выборка');
        });

        test('should add a Binary field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'binary',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Двоичное');
        });

        test('should add a UUID field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'uuid',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);
            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('UUID');
        });

        test('should add a RPC-File field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'rpcfile',
                name: fieldName,
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            expect(adapter.getData().s[fieldIndex].t).toBe('Файл-rpc');
        });

        test('should add a deprecated Hierarchy field as Identity field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'hierarchy',
                name: fieldName,
                kind: 'Identity',
            });
            adapter.addField(field, fieldIndex);

            expect(data.d[fieldIndex]).toEqual([null]);
            expect(adapter.getData().s[fieldIndex].t).toBe('Идентификатор');
        });

        test('should add an Array field', () => {
            const fieldName = 'New';
            const fieldIndex = 0;
            const field = fieldsFactory({
                type: 'array',
                name: fieldName,
                kind: 'Boolean',
            });
            adapter.addField(field, fieldIndex);

            expect(adapter.get(fieldName)).toBe(null);
            const format = adapter.getData().s[fieldIndex];
            expect((format.t as IFieldType).n).toBe('Массив');
            expect((format.t as IArrayFieldType).t).toBe('Логическое');
        });

        test('should throw TypeError if array elements type is not supported', () => {
            const field = new fieldFormat.ArrayField({
                type: 'array',
                name: 'foo',
                kind: { type: 'array', kind: 'integer' } as unknown as string,
            });

            expect(() => {
                adapter.addField(field, 0);
            }).toThrow();
        });

        test('should use a field default value', () => {
            const fieldName = 'New';
            const def = 'abc';
            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: fieldName,
                    defaultValue: def,
                })
            );

            expect(adapter.get(fieldName)).toBe(def);
        });

        test('should initialize serializable data', () => {
            //@ts-ignore
            const adapter = new SbisRecord(null);
            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: 'foo',
                })
            );
            const data = adapter.getData() as unknown as ISerializable;

            expect(typeof data.toJSON).toBe('function');
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
            const newFields = adapter.getFields();
            const newData = adapter.getData().d.slice();

            adapter.removeField(name);
            newFields.splice(index, 1);
            newData.splice(index, 1);

            expect(adapter.get(name)).not.toBeDefined();
            expect(adapter.getFields()).toEqual(newFields);
            expect(adapter.getData().d).toEqual(newData);
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
            const newFields = adapter.getFields();
            const newData = adapter.getData().d.slice();

            adapter.removeFieldAt(0);
            newFields.splice(index, 1);
            newData.splice(index, 1);

            expect(adapter.get(name)).not.toBeDefined();
            expect(adapter.getFields()).toEqual(newFields);
            expect(adapter.getData().d).toEqual(newData);
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
});
