/* eslint-disable max-classes-per-file */
import { Record, FormatDescriptor } from 'Types/entity';
import { RecordSet, ObservableList } from 'Types/collection';
import Format from 'Types/_collection/format/Format';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import RecordSetAdapter from 'Types/_entity/adapter/RecordSet';
import { IRecordFormat } from 'Types/_entity/adapter/SbisFormatMixin';
import ArrayField from 'Types/_entity/format/ArrayField';
import DateTimeField from 'Types/_entity/format/DateTimeField';
import IntegerField from 'Types/_entity/format/IntegerField';
import fieldsFactory, { FormatDeclaration } from 'Types/_entity/format/fieldsFactory';
import ManyToMany from 'Types/_entity/relation/ManyToMany';
import DateTime from 'Types/_entity/applied/DateTime';
import TheDate from 'Types/_entity/applied/Date';
import Time from 'Types/_entity/applied/Time';
import { ExtendDate, IExtendDateConstructor } from 'Types/_declarations';
import logger from 'Types/_util/logger';

import 'Types/_collection/Enum';
import 'Types/_collection/Flags';
import 'Core/Date';
import Enum from 'Types/_collection/Enum';

interface IData {
    max: number;
    title: string;
    id: number;
}

function getRecordData(): IData {
    return {
        max: 10,
        title: 'A',
        id: 1,
    };
}

function getRecordSbisData(): IRecordFormat {
    return {
        _type: 'record',
        d: [1, 'A', 10, { d: [], s: [] }],
        s: [
            {
                n: 'id',
                t: 'Число целое',
            },
            {
                n: 'title',
                t: 'Строка',
            },
            {
                n: 'max',
                t: 'Число целое',
            },
            {
                n: 'rec',
                t: 'Запись',
            },
        ],
    };
}

function getRecordFormat(): FormatDeclaration {
    return [
        { name: 'id', type: 'integer' },
        { name: 'title', type: 'string' },
        { name: 'max', type: 'integer' },
        { name: 'rec', type: 'record' },
    ];
}

function getRecord(data?: IData): Record<IData> {
    return new Record({
        rawData: data || getRecordData(),
    });
}

describe('Types/_entity/Record', () => {
    const getFormatDeclaration = () => {
        return [
            {
                name: 'id',
                type: 'integer',
            },
            {
                name: 'title',
                type: 'string',
            },
            {
                name: 'descr',
                type: 'string',
                defaultValue: '-',
            },
            {
                name: 'main',
                type: 'boolean',
                defaultValue: true,
            },
        ];
    };

    let recordData: IData;
    let record: Record<IData>;

    beforeEach(() => {
        recordData = getRecordData();
        record = getRecord(recordData);
    });

    describe('.constructor()', () => {
        test('should throw TypeError if option "owner" value is not a RecordSet', () => {
            let result;
            expect(() => {
                result = new Record({
                    owner: {} as any,
                });
            }).toThrow();

            expect(result).not.toBeDefined();
        });

        test('should create writable record by default', () => {
            const record = new Record();
            expect(record.writable).toBe(true);
        });

        test('should create read only record with option value', () => {
            const record = new Record({
                writable: false,
            });
            expect(record.writable).toBe(false);
        });

        test('should set typeName into adapter', () => {
            const record = new Record({
                typeName: 'TestType',
            });

            expect(record.getTypeName()).toBe('TestType');
        });
    });

    describe('.destroy()', () => {
        test('should destroy only instances of Types/_entity/DestroyableMixin', () => {
            interface IDestroyableMock {
                destroy(): void;
            }
            interface IRecord {
                foo: IDestroyableMock;
                bar: Record<object>;
            }

            const root = new Record<IRecord>();
            let destroyed = false;
            const foo: IDestroyableMock = {
                destroy: () => {
                    destroyed = true;
                },
            };
            const bar = new Record();

            root.set('foo', foo);
            root.set('bar', bar);

            root.destroy();
            expect(root.destroyed).toBe(true);
            expect(destroyed).toBe(false);
            expect(bar.destroyed).toBe(true);
        });

        test("shouldn't destroy same child twice", () => {
            const root = new Record();
            const foo = new Record();
            const bar = new Record();
            root.set('foo', foo);
            foo.set('bar', bar);
            root.set('bar', bar);

            root.destroy();
            expect(root.destroyed).toBe(true);
            expect(foo.destroyed).toBe(true);
            expect(bar.destroyed).toBe(true);
        });
    });

    describe('.get()', () => {
        test('should return a value from the raw data', () => {
            record.get('title').substr(0);
            expect(record.get('max')).toBe(recordData.max);
            expect(record.get('title')).toBe(recordData.title);
            expect(record.get('id')).toBe(recordData.id);
        });

        test('should return a value with given type', () => {
            class MyNumber extends Number {
                constructor(protected value: number) {
                    super();
                }
                valueOf(): number {
                    return this.value;
                }
            }

            const record = new Record<{ foo: MyNumber }>({
                format: [{ name: 'foo', type: MyNumber }],
                rawData: {
                    foo: 1000,
                },
            });

            const value = record.get('foo');
            expect(value).toBeInstanceOf(MyNumber);
            expect(Number(value)).toEqual(1000);
        });

        test('should return a single instance for Object', () => {
            const record = new Record<{ rec: Record<object> }>({
                adapter: new SbisAdapter(),
                rawData: getRecordSbisData(),
            });
            const value = record.get('rec');

            expect(value).toBeInstanceOf(Record);
            expect(record.get('rec')).toBe(value);
            expect(record.get('rec')).toBe(value);
        });

        test('should return cached field value', () => {
            const values = [1, 2, 3];
            const model = new Record<{ foo: number }>({
                cacheMode: Record.CACHE_MODE_ALL,
                rawData: {
                    get foo(): number {
                        return values.pop() as number;
                    },
                },
            });

            expect(model.get('foo')).toBe(3);
            expect(values.length).toBe(2);
            expect(model.get('foo')).toBe(3);
            expect(values.length).toBe(2);
        });

        test("should return value from the raw data if it's even not defined in the format", () => {
            const record = new Record({
                format: [{ name: 'a', type: 'integer' }],
                rawData: {
                    a: 1,
                    b: 2,
                },
            });

            expect(record.get('a')).toBe(1);
            expect(record.get('b')).toBe(2);
        });

        test('should inherit the field format from the recordset format', () => {
            const rs = new RecordSet<object, Record>({
                format: [
                    {
                        name: 'created',
                        type: 'date',
                        defaultValue: new Date(),
                    },
                ],
            });

            rs.add(
                new Record({
                    rawData: {
                        created: '2015-01-02 10:11:12',
                    },
                })
            );
            const record = rs.at(0);
            const format = record.getFormat();

            expect(format.at(0).getName()).toBe('created');
            expect(format.at(0).getType()).toBe('date');

            expect(record.get('created')).toBeInstanceOf(Date);
        });

        test('should create inner record with different mediator', () => {
            class MediatorRecord extends Record {
                get mediator(): ManyToMany {
                    return this._getMediator();
                }
            }

            const record = new MediatorRecord({
                format: [{ name: 'foo', type: MediatorRecord }],
                rawData: {
                    foo: {
                        bar: 'baz',
                    },
                },
            });

            expect(record.mediator).toBeInstanceOf(ManyToMany);
            expect(record.mediator !== record.get('foo').mediator).toBeTruthy();
        });
    });

    describe('.getOriginal()', () => {
        test('should force getOriginal() on parent record return an same sub record after changes', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            const original = record.getOriginal('subrec');
            expect(original).toEqual(subRecord);
        });

        test('should return original value for field', () => {
            const originalMax = record.get('max');
            const originalTitle = record.get('title');
            record.set('max', 15);
            record.set('title', 'B');

            expect(record.getOriginal('max')).toBe(originalMax);
            expect(record.getOriginal('title')).toBe(originalTitle);
        });

        test('should keep Enum object from raw data if accepted value undefined', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [
                        {
                            n: 'enum',
                            t: {
                                n: 'Перечисляемое',
                                s: { 0: 'one', 1: 'two' },
                            },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });
            const enumObject = record.get('enum');

            record.get('enum').set(1);

            expect(record.getOriginal('enum')).toEqual(enumObject);
        });
    });

    describe('.set()', () => {
        test('should set value', () => {
            record.set('max', 13);
            expect(record.get('max')).toBe(13);
        });

        test('should set values', () => {
            record.set({
                max: 13,
                title: 'test',
            });
            expect(record.get('max')).toBe(13);
            expect(record.get('title')).toBe('test');
        });

        test('should revert changed value with old scalar', () => {
            const old = record.get('title');

            record.set('title', 'foo');
            expect(record.getChanged()).toContain('title');

            record.set('title', old);
            expect(record.getChanged()).not.toContain('title');
        });

        test('should revert changed value with old Object-wrapper', () => {
            const old = new Date();
            const record = new Record({
                rawData: { foo: old },
            });

            record.set('foo', new Date(0, 0, 0));
            expect(record.getChanged()).toContain('foo');

            record.set('foo', old);
            expect(record.getChanged()).not.toContain('foo');
        });

        test("should update raw data if child's record raw data replaced", () => {
            const root = new Record({
                format: [{ name: 'rec', type: 'record' }],
                rawData: { rec: { foo: 'bar' } },
            });
            const rec = root.get('rec');

            rec.setRawData({ foo: 'baz' });

            expect(root.getRawData().rec.foo).toEqual('baz');
        });

        test('should update raw data for Array', () => {
            const record = new Record({
                format: [{ name: 'foo', type: 'array', kind: 'string' }],
                rawData: {
                    foo: ['bar'],
                },
            });

            const foo = record.get('foo');
            foo.push('new');
            record.set('foo', foo);

            const data = record.getRawData();
            expect(data.foo[0]).toBe('bar');
            expect(data.foo[1]).toBe('new');
        });

        test("should set value to the raw data if it's even not defined in the format", () => {
            const record = new Record({
                format: [{ name: 'a', type: 'integer' }],
            });

            record.set('a', 1);
            expect(record.getRawData().a).toBe(1);

            record.set('b', 2);
            expect(record.getRawData().b).toBe(2);
        });

        test('should set value if field is not defined in raw data but defined in format', () => {
            const data = {
                d: [1],
                s: [{ n: 'a', t: 'Число целое' }],
            };
            const record = new Record({
                format: { b: 'integer' },
                adapter: new SbisAdapter(),
                rawData: data,
            });

            record.set('a', 10);
            expect(record.getRawData().d[0]).toBe(10);

            record.set('b', 2);
            expect(record.getRawData().d[1]).toBe(2);
        });

        test('should throw an TypeError if adapters are incompatible', () => {
            const record = new Record();
            const sub = new Record({
                adapter: new SbisAdapter(),
            });

            expect(() => {
                record.set('sub', sub);
            }).toThrow();
        });

        test("should don't throw an TypeError if adapters incompatible but object already aggregated", () => {
            const sub = new Record({
                adapter: new SbisAdapter(),
                format: [{ name: 'foo', type: 'string' }],
            });
            const record = new Record({
                rawData: {
                    sub,
                },
            });

            sub.set('foo', 'bar');
            expect(record.get('sub').get('foo')).toBe('bar');
        });

        test('should mark cached field as changed', () => {
            const record = new Record({
                rawData: { date: '2016-10-10' },
                format: [{ name: 'date', type: 'date' }],
            });
            const curr = new Date();

            record.set('date', curr);
            expect(record.get('date')).toBe(curr);
            expect(record.isChanged('date')).toBe(true);
        });

        test("should don't change cached field", () => {
            const record = new Record({
                rawData: { date: '2016-10-10' },
                format: [{ name: 'date', type: 'date' }],
            });
            const prev = record.get('date');

            record.set('date', prev);
            expect(record.get('date')).toBe(prev);
            expect(record.isChanged('date')).toBe(false);
        });

        test('should return the same instance of Object', () => {
            const record = new Record<{ obj: object }>();
            const obj = {};
            record.set('obj', obj);
            expect(record.get('obj')).toBe(obj);
        });

        test('should change value if it is RecordSet', () => {
            const record = new Record();
            const oldRs = new RecordSet();
            const newRs = new RecordSet();

            record.addField({ name: 'rs', type: 'recordset', defaultValue: null }, 0, oldRs);

            record.set('rs', newRs);
            expect(record.get('rs')).toBe(newRs);
        });

        test('should change value if it is Enum with same index but different dictionary', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [
                        {
                            n: 'enum',
                            t: {
                                n: 'Перечисляемое',
                                s: { 0: 'one', 1: 'two' },
                            },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });

            const dictionary = { 0: 'one', 1: 'two', 2: 'three' };
            const newEnum = new Enum({
                index: 0,
                dictionary,
            });

            record.set('enum', newEnum);

            expect(record.getChanged()).toContain('enum');
            expect(record.get('enum').getDictionary()).toEqual(dictionary);
        });

        test('should set value after set raw data null if record has format', () => {
            const record = new Record({
                format: [{ name: 'name', type: 'string' }],
                adapter: new SbisAdapter(),
            });
            record.setRawData(null);

            expect(() => {
                record.set('name', 'name');
            }).not.toThrow();
        });

        test('should set value and keep it changed if same recordset was set', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    rs: 'recordset',
                },
                rawData: {
                    id: 'foo',
                    rs: [
                        {
                            id: 'foo',
                        },
                    ],
                },
            });

            record.get('rs').at(0).set('id', 'bar');

            const changed = record.getChanged();

            // set same recordset back to it's field
            record.set('rs', record.get('rs'));

            expect(record.getChanged()).toEqual(changed);
        });
    });

    describe('.subscribe()', () => {
        test('should trigger event handler from "handlers" option', () => {
            let triggered = false;
            const onPropertyChange = () => {
                triggered = true;
            };
            const record = new Record({
                handlers: { onPropertyChange },
            });

            record.set('foo', 'bar');
            record.destroy();

            expect(triggered).toBe(true);
        });

        test('should trigger onPropertyChange if value changed', () => {
            let name;
            let newV;
            //@ts-ignore
            record.subscribe('onPropertyChange', (e, properties) => {
                for (const key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        name = key;
                        newV = properties[key];
                    }
                }
            });
            record.set('max', 13);
            expect(name).toBe('max');
            expect(newV).toBe(13);
        });

        test('should not trigger onPropertyChange in read only mode', () => {
            const record = new Record({
                writable: false,
                rawData: recordData,
            });

            let triggered = false;
            record.subscribe('onPropertyChange', () => {
                triggered = true;
            });

            record.set('max', 13);
            expect(triggered).toBe(false);
        });

        test('should trigger onPropertyChange if values changed', () => {
            let name;
            let newV;
            //@ts-ignore
            record.subscribe('onPropertyChange', (e, properties) => {
                for (const key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        name = key;
                        newV = properties[key];
                    }
                }
            });

            record.set({
                max: 13,
                title: 'new',
            });

            expect(name).toBe('title');
            expect(newV).toBe('new');
        });

        test('should trigger onPropertyChange one by one', () => {
            const record = new Record();

            const expectData = ['f1', 'f2', 'f3'];
            const order: string[] = [];
            //@ts-ignore
            record.subscribe('onPropertyChange', (e, properties) => {
                record.set('f2', 'v2');
                record.set('f3', 'v3');
                for (const k in properties) {
                    if (properties.hasOwnProperty(k)) {
                        order.push(k);
                    }
                }
            });
            record.set('f1', 'v1');

            expect(order).toEqual(expectData);
        });

        test('should not trigger onPropertyChange if value not changed', () => {
            let name;
            let newV;
            //@ts-ignore
            record.subscribe('onPropertyChange', (e, properties) => {
                for (const key in properties) {
                    if (properties.hasOwnProperty(key)) {
                        name = key;
                        newV = properties[key];
                    }
                }
            });

            record.set('max', record.get('max'));

            expect(name).not.toBeDefined();
            expect(newV).not.toBeDefined();
        });

        test('should not trigger onPropertyChange if value is the same instance', () => {
            let firedCount = 0;
            const instance = {};
            const handler = () => {
                firedCount++;
            };

            const record = new Record();
            record.set('instance', instance);
            record.subscribe('onPropertyChange', handler);
            record.set('instance', instance);
            record.unsubscribe('onPropertyChange', handler);

            expect(firedCount).toEqual(0);
        });

        test('should trigger onPropertyChange with deep changed item', () => {
            const sub = new Record();
            const list = new ObservableList();
            const top = new Record();

            top.set('list', list);
            list.add(sub);

            let given;
            //@ts-ignore
            const handler = (event, map) => {
                given = map;
            };

            top.subscribe('onPropertyChange', handler);
            sub.set('test', 'ok');
            top.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(given.list).toBe(list);
        });

        test('should trigger onStateChange handler from "handlers" option', () => {
            let triggered = false;

            const onStateChange = () => {
                triggered = true;
            };
            const record = new Record({
                handlers: { onStateChange },
                rawData: {
                    foo: 'bar',
                },
            });
            // Record without Recordset is in Detached state
            record.setState('Unchanged');

            record.set('foo', 'test');
            record.destroy();

            expect(triggered).toBe(true);
        });

        test('should trigger onStateChange handler from subscribe', () => {
            let triggered = false;

            const onStateChange = () => {
                triggered = true;
            };
            const record = new Record({
                rawData: {
                    foo: 'bar',
                },
            });

            // Record without Recordset is in Detached state
            record.setState('Unchanged');

            record.subscribe('onStateChange', onStateChange);
            record.set('foo', 'test');
            record.unsubscribe('onStateChange', onStateChange);

            expect(triggered).toBe(true);
        });
    });

    describe('.setEventRaising()', () => {
        test('should disable and then enable onPropertyChange', () => {
            let fired;
            const handler = () => {
                return (fired = true);
            };

            const record = new Record();
            record.subscribe('onPropertyChange', handler);

            record.setEventRaising(false);
            fired = false;
            record.set('foo', 'bar');
            expect(fired).toBe(false);

            record.setEventRaising(true);
            fired = false;
            record.set('foo', 'baz');
            expect(fired).toBe(true);

            record.unsubscribe('onCollectionItemChange', handler);
        });

        test('should throw an error if analize=true', () => {
            const record = new Record();
            expect(() => {
                record.setEventRaising(false, true);
            }).toThrow();
        });
    });

    describe('.getChanged()', () => {
        test('should return a changed value', () => {
            record.set('max', 15);
            record.set('title', 'B');
            expect(record.getChanged()).toContain('max');
            expect(record.getChanged()).toContain('title');
        });

        test('should return result without saved field on save same Number as String', () => {
            const record = new Record({
                format: {
                    foo: 'integer',
                },
                rawData: {
                    foo: 1,
                },
            });

            const foo = record.get('foo');
            expect(typeof foo).toBe('number');
            record.set('foo', String(foo));
            expect(record.getChanged()).not.toContain('foo');
        });

        test('should return result without saved field on save same Enum value', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [
                        {
                            n: 'enum',
                            t: {
                                n: 'Перечисляемое',
                                s: { 0: 'one', 1: 'two' },
                            },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });
            record.set('enum', 0);
            expect(record.getChanged()).not.toContain('enum');
        });

        test('should return result without saved field on old Enum value', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [
                        {
                            n: 'enum',
                            t: {
                                n: 'Перечисляемое',
                                s: { 0: 'one', 1: 'two' },
                            },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });
            record.set('enum', 1);
            record.set('enum', 0);
            expect(record.getChanged()).not.toContain('enum');
        });

        test('should return result without saved field on save same Flag value', () => {
            const record = new Record({
                rawData: {
                    d: [[true, false]],
                    s: [
                        {
                            n: 'flags',
                            t: { n: 'Флаги', s: { 0: 'one', 1: 'two' } },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });

            record.get('flags').set('two', false);

            expect(record.getChanged()).not.toContain('flags');
        });

        test('should return result without saved field on old Flag value', () => {
            const record = new Record({
                rawData: {
                    d: [[true, false]],
                    s: [
                        {
                            n: 'flags',
                            t: { n: 'Флаги', s: { 0: 'one', 1: 'two' } },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });

            const oldValue = record.get('flags').get('two');

            record.get('flags').set('two', true);
            record.get('flags').set('two', oldValue);

            expect(record.getChanged()).not.toContain('flags');
        });
    });

    describe('.acceptChanges()', () => {
        test('should reset "Changed" state to "Unchanged"', () => {
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges();
            expect(record.getState()).toBe(Record.RecordState.UNCHANGED);
        });

        test('should reset "Added" state to "Unchanged"', () => {
            record.setState(Record.RecordState.ADDED);
            record.acceptChanges();
            expect(record.getState()).toBe(Record.RecordState.UNCHANGED);
        });

        test('should reset "Deleted" state to "Detached"', () => {
            record.setState(Record.RecordState.DELETED);
            record.acceptChanges();
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });

        test('should keep "Detached" state', () => {
            record.setState(Record.RecordState.DETACHED);
            record.acceptChanges();
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });

        test('should throw an error on invalid argument', () => {
            expect(() => {
                //@ts-ignore
                record.acceptChanges(null);
            }).toThrow();

            expect(() => {
                record.acceptChanges(0 as any);
            }).toThrow();

            expect(() => {
                record.acceptChanges('foo' as any);
            }).toThrow();

            expect(() => {
                record.acceptChanges({} as any);
            }).toThrow();
        });

        test('should force getChanged() return an empty array', () => {
            record.set('max', 15);
            record.set('title', 'B');
            expect(record.getChanged().length).toBeGreaterThan(0);
            record.acceptChanges();
            expect(record.getChanged().length).toBe(0);
        });

        test('should force getChanged() on parent record return an array with sub record', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            expect(record.getChanged().indexOf('subrec')).not.toEqual(-1);
        });

        test('should force getChanged() on parent record return an array wo sub record after accepting changes', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            subRecord.acceptChanges();
            expect(record.getChanged().indexOf('subrec')).toEqual(-1);
        });

        test('should force getChanged() of parent record return an array without record field', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            expect(record.getChanged().indexOf('subrec')).toBeGreaterThan(-1);

            subRecord.acceptChanges(true);
            expect(record.getChanged().indexOf('subrec')).toEqual(-1);
        });

        test('should spread changes through the RecordSet to the top Record', () => {
            const top = new Record();
            const rs = new RecordSet({
                rawData: [{ foo: '' }],
            });
            const sub = rs.at(0);
            top.set('items', rs);

            sub.set('foo', 'bar');
            expect(top.isChanged('items')).toBe(true);

            sub.acceptChanges(true);
            expect(top.isChanged('items')).toBe(false);
        });

        test('should recursively accept changes on (record -> record) hierarchy', () => {
            const top = new Record();
            const bottom = new Record({
                rawData: { foo: 'bar' },
            });

            top.set('child', bottom);

            top.get('child').set('foo', 'test');

            expect(top.isChanged('child')).toBe(true);
            expect(bottom.isChanged('foo')).toBe(true);

            top.acceptChanges(false, true);

            expect(top.isChanged('child')).toBe(false);
            expect(bottom.isChanged('foo')).toBe(false);
        });

        test('should recursively accept changes on (record -> recordset -> record) hierarchy', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    recset: 'recordset',
                },
                rawData: {
                    id: 'foo',
                    recset: [
                        {
                            id: 'foo',
                        },
                    ],
                },
            });

            record.get('recset').at(0).set('id', 'bar');

            expect(record.isChanged('recset')).toBe(true);
            expect(record.get('recset').isChanged()).toBe(true);
            expect(record.get('recset').at(0).isChanged('id')).toBe(true);

            record.acceptChanges(false, true);

            expect(record.isChanged('recset')).toBe(false);
            expect(record.get('recset').isChanged()).toBe(false);
            expect(record.get('recset').at(0).isChanged('id')).toBe(false);
        });

        test('should accept changes only for given fields and keep the state', () => {
            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges(['max']);

            expect(record.getChanged().indexOf('max')).toBe(-1);
            expect(record.getChanged().indexOf('title')).toBe(0);
            expect(record.getState()).toBe(Record.RecordState.CHANGED);
        });

        test('should accept changes only for given fields and change the state to "Unchanged"', () => {
            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.acceptChanges(['max', 'title']);

            expect(record.getChanged().indexOf('max')).toBe(-1);
            expect(record.getChanged().indexOf('title')).toBe(-1);
            expect(record.getState()).toBe(Record.RecordState.UNCHANGED);
        });

        test('should keep Enum object from raw data if accepted value undefined', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [
                        {
                            n: 'enum',
                            t: {
                                n: 'Перечисляемое',
                                s: { 0: 'one', 1: 'two' },
                            },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });

            record.get('enum').set(1);
            expect(record.isChanged()).toBe(true);

            record.get('enum').set(0);
            expect(record.get('enum')).not.toBeNull();
        });

        test('should keep Enum object if accepted value undefined', () => {
            const record = new Record();
            const enumFormat = {
                name: 'enum',
                type: 'enum',
                dictionary: ['one', 'two'],
            };

            record.addField(enumFormat);
            record.set('enum', new Enum({ index: 0, ...enumFormat }));

            record.get('enum').set(1);
            expect(record.isChanged()).toBe(true);

            record.get('enum').set(0);
            expect(record.get('enum')).not.toBeNull();
        });

        test('should raise onStateChange event', () => {
            let triggered = false;
            const handler = () => {
                triggered = true;
            };
            record.subscribe('onStateChange', handler);
            record.acceptChanges();
            record.unsubscribe('onStateChange', handler);
            expect(triggered).toBe(true);
        });
    });

    describe('.rejectChanges()', () => {
        test('should reset "Changed" state to "Detached"', () => {
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges();
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });

        test('should reset "Changed" state to "Unchanged"', () => {
            record.setState(Record.RecordState.UNCHANGED);
            record.acceptChanges();

            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges();
            expect(record.getState()).toBe(Record.RecordState.UNCHANGED);
        });

        test('should throw an error on invalid argument', () => {
            expect(() => {
                //@ts-ignore
                record.rejectChanges(null);
            }).toThrow();

            expect(() => {
                record.rejectChanges(0 as any);
            }).toThrow();

            expect(() => {
                record.rejectChanges('foo' as any);
            }).toThrow();

            expect(() => {
                record.rejectChanges({} as any);
            }).toThrow();
        });

        test('should force get() return unchanged value', () => {
            const prev = {
                max: record.get('max'),
                title: record.get('title'),
            };
            record.set('max', 15);
            record.set('title', 'B');
            record.rejectChanges();
            expect(record.get('max')).toBe(prev.max);
            expect(record.get('title')).toBe(prev.title);
        });

        test('should spread changes through the RecordSet to the top Record', () => {
            const top = new Record();
            const rs = new RecordSet({
                rawData: [{ foo: '' }],
            });
            const sub = rs.at(0);
            top.set('items', rs);

            sub.set('foo', 'bar');
            expect(top.isChanged('items')).toBe(true);

            sub.rejectChanges(true);
            expect(top.isChanged('items')).toBe(false);
        });

        test('should recursively reject changes on (record -> record) hierarchy', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });

            record.get('subrec').set('id', 'foo');

            expect(record.isChanged('subrec')).toBe(true);
            expect(record.get('subrec').isChanged('id')).toBe(true);

            record.rejectChanges(false, true);

            expect(record.isChanged('subrec')).toBe(false);
            expect(record.get('subrec').isChanged('id')).toBe(false);
        });

        test('should recursively reject changes on (record -> recordset -> record) hierarchy', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    recset: 'recordset',
                },
                rawData: {
                    id: 'foo',
                    recset: [
                        {
                            id: 'foo',
                        },
                    ],
                },
            });

            record.get('recset').at(0).set('id', 'bar');

            expect(record.isChanged('recset')).toBe(true);
            expect(record.get('recset').isChanged()).toBe(true);
            expect(record.get('recset').at(0).isChanged('id')).toBe(true);

            record.rejectChanges(false, true);

            expect(record.isChanged('recset')).toBe(false);
            expect(record.get('recset').isChanged()).toBe(false);
            expect(record.get('recset').at(0).isChanged('id')).toBe(false);
        });

        test('should force getChanged() return an empty array', () => {
            record.set('max', 15);
            record.set('title', 'B');
            record.rejectChanges();
            expect(record.getChanged().length).toBe(0);
        });

        test('should force getChanged() on parent record return an array with sub record', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            expect(record.getChanged().indexOf('subrec')).not.toEqual(-1);
        });

        test('should force getChanged() on parent record return an array wo sub record after accepting changes', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            subRecord.rejectChanges();
            expect(record.getChanged().indexOf('subrec')).toEqual(-1);
        });

        test('should force getChanged() of parent record return an array without record field', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    subrec: 'record',
                },
                rawData: {
                    id: 'foo',
                    subrec: {
                        id: 'bar',
                    },
                },
            });
            const subRecord = record.get('subrec');

            subRecord.set('id', 'baz');
            expect(record.getChanged().indexOf('subrec')).toBeGreaterThan(-1);

            subRecord.rejectChanges(true);
            expect(record.getChanged().indexOf('subrec')).toEqual(-1);
        });

        test('should accept changes only for given fields and keep the state', () => {
            const prev = {
                max: record.get('max'),
                title: record.get('title'),
            };

            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges(['max']);

            expect(record.get('max')).toBe(prev.max);
            expect(record.get('title')).toBe('B');
            expect(record.getChanged().indexOf('max')).toBe(-1);
            expect(record.getChanged().indexOf('title')).toBe(0);
            expect(record.getState()).toBe(Record.RecordState.CHANGED);
        });

        test('should accept changes only for given fields and change the state to "Unchanged"', () => {
            const prev = {
                max: record.get('max'),
                title: record.get('title'),
            };

            record.set('max', 15);
            record.set('title', 'B');
            record.setState(Record.RecordState.CHANGED);
            record.rejectChanges(['max', 'title']);

            expect(record.get('max')).toBe(prev.max);
            expect(record.get('title')).toBe(prev.title);
            expect(record.getChanged().indexOf('max')).toBe(-1);
            expect(record.getChanged().indexOf('title')).toBe(-1);
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });

        test('should not throw error if given fields have never been changed', () => {
            const max = record.get('max');
            record.set('max', 15);
            record.setState(Record.RecordState.CHANGED);
            expect(() => {
                record.rejectChanges(['max', 'title']);
            }).not.toThrow();
            expect(record.get('max')).toBe(max);
        });

        test('should raise onStateChange event', () => {
            let triggered = false;
            const handler = () => {
                triggered = true;
            };
            record.subscribe('onStateChange', handler);
            record.rejectChanges();
            record.unsubscribe('onStateChange', handler);
            expect(triggered).toBe(true);
        });
    });

    describe('.has()', () => {
        test('should return true for defined field', () => {
            for (const key in recordData) {
                if (recordData.hasOwnProperty(key)) {
                    //@ts-ignore
                    expect(record.has(key)).toBe(true);
                }
            }
        });

        test('should return false for undefined field', () => {
            //@ts-ignore
            expect(record.has('blah')).toBe(false);
            //@ts-ignore
            expect(record.has('blah')).toBe(false);
        });
    });

    describe('.getEnumerator()', () => {
        test('should return fields in given order', () => {
            const enumerator = record.getEnumerator();
            const names = Object.keys(recordData);
            let i = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(names[i]);
                i++;
            }
        });

        test('should traverse all of fields', () => {
            const enumerator = record.getEnumerator();

            let count = Object.keys(recordData).length;
            expect(count > 0).toBe(true);

            while (enumerator.moveNext()) {
                count--;
            }
            expect(count).toBe(0);
        });
    });

    describe('.each()', () => {
        test('should return equivalent values', () => {
            record.each((name, value) => {
                expect(record.get(name)).toBe(value);
            });
        });

        test('should traverse all of fields', () => {
            let count = Object.keys(recordData).length;
            expect(count > 0).toBe(true);

            record.each(() => {
                count--;
            });
            expect(count).toBe(0);
        });
    });

    describe('.getRawData()', () => {
        test('should return the copy of data', () => {
            expect(recordData !== record.getRawData()).toBeTruthy();
            expect(recordData).toEqual(record.getRawData());
        });

        test('should return shared data', () => {
            expect(recordData).toBe(record.getRawData(true));
        });

        test("should return data with default values from subclass' own format", () => {
            class SubRecord extends Record {
                _$format: FormatDescriptor = getFormatDeclaration();
            }

            const record = new SubRecord();
            const data = record.getRawData();

            expect(data.id).toBe(0);
            expect(data.title).toBe(null);
            expect(data.descr).toBe('-');
            expect(data.main).toBe(true);
        });

        test('should return data with default values from injected format', () => {
            const record = new Record({
                format: getFormatDeclaration(),
            });
            const data = record.getRawData();

            expect(data.id).toBe(0);
            expect(data.title).toBe(null);
            expect(data.descr).toBe('-');
            expect(data.main).toBe(true);
        });

        test('should return data with default values from subclass', () => {
            class SubRecord extends Record {
                // Just subclass
            }

            const record = new SubRecord({
                format: getFormatDeclaration(),
            });
            const data = record.getRawData();

            expect(data.id).toBe(0);
            expect(data.title).toBe(null);
            expect(data.descr).toBe('-');
            expect(data.main).toBe(true);
        });

        test('should ignore option "format" value if "owner" passed', () => {
            const record = new Record({
                format: getFormatDeclaration(),
                owner: new RecordSet(),
            });
            expect(record.getRawData()).toBeNull();
        });

        test('should change raw data if Enum property changed', () => {
            const record = new Record({
                rawData: {
                    d: [0],
                    s: [
                        {
                            n: 'enum',
                            t: {
                                n: 'Перечисляемое',
                                s: { 0: 'one', 1: 'two' },
                            },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });

            record.get('enum').set(1);

            expect(record.getRawData().d[0]).toEqual(1);
            expect(record.isChanged('enum')).toBe(true);
        });

        test('should change raw data if Flags property changed', () => {
            const record = new Record({
                rawData: {
                    d: [[true, false]],
                    s: [
                        {
                            n: 'flags',
                            t: { n: 'Флаги', s: { 0: 'one', 1: 'two' } },
                        },
                    ],
                },
                adapter: new SbisAdapter(),
            });

            record.get('flags').set('two', true);

            expect(record.getRawData().d[0][1]).toEqual(true);
            expect(record.isChanged('flags')).toBe(true);
        });
    });

    describe('.setRawData()', () => {
        test('should set data', () => {
            const newRecord = new Record({
                rawData: {},
            });
            newRecord.setRawData(recordData);
            expect(newRecord.getRawData()).toEqual(recordData);
        });

        test('should trigger onPropertyChange with empty "properties" argument', () => {
            const given = { properties: undefined };
            //@ts-ignore
            const handler = (e, properties) => {
                given.properties = properties;
            };

            record.subscribe('onPropertyChange', handler);
            record.setRawData({ a: 1, b: 2 });
            record.unsubscribe('onPropertyChange', handler);

            expect(typeof given.properties).toBe('object');
            expect(given.properties).toEqual({});
        });
    });

    describe('.getAdapter()', () => {
        test('should return an adapter injected via constrictor', () => {
            const adapter = new SbisAdapter();
            record = new Record({ adapter });
            expect(record.getAdapter()).toBe(adapter);
        });
    });

    describe('.hasDeclaredFormat()', () => {
        test('should return false by default', () => {
            record = new Record();
            expect(record.hasDeclaredFormat()).toBe(false);
        });

        test('should return true if "format" option received', () => {
            record = new Record({ format: { foo: String } });
            expect(record.hasDeclaredFormat()).toBe(true);
        });
    });

    describe('.resetDeclaredFormat()', () => {
        test('should reset format taken from "format" option', () => {
            record = new Record({ format: { foo: String } });
            record.resetDeclaredFormat();
            expect(record.hasDeclaredFormat()).toBe(false);
        });
    });

    describe('.createDeclaredFormat()', () => {
        test('should generate format taken from "format" option with properties of calculated format', () => {
            record = new Record({ rawData: recordData });
            record.createDeclaredFormat();

            expect(record.getFormat().getCount()).toEqual(Object.keys(recordData).length);
            expect(record.hasDeclaredFormat()).toBe(true);
        });
    });

    describe('.getFormat()', () => {
        test('should build the empty format by default', () => {
            const record = new Record();
            const format = record.getFormat();
            expect(format.getCount()).toBe(0);
        });

        test('should build the format from raw data', () => {
            const format = record.getFormat();
            expect(format.getCount()).toBe(Object.keys(recordData).length);
            format.each((item) => {
                expect(recordData.hasOwnProperty(item.getName())).toBe(true);
            });
        });

        test('should build the record format from Array', () => {
            const format = [
                {
                    name: 'id',
                    type: 'integer',
                },
                {
                    name: 'title',
                    type: 'string',
                },
                {
                    name: 'max',
                    type: 'integer',
                },
                {
                    name: 'main',
                    type: 'boolean',
                },
            ];
            const record = new Record({
                format,
                rawData: recordData,
            });
            const recordFormat = record.getFormat();

            expect(recordFormat.getCount()).toBe(format.length);
            recordFormat.each((item, index) => {
                expect(item.getName()).toBe(format[index].name);
                expect((item.getType() as string).toLowerCase()).toBe(format[index].type);
            });
        });

        test('should accept the record format from instance', () => {
            const format = new Format({
                items: [new IntegerField({ name: 'id' })],
            });
            const record = new Record({
                //@ts-ignore
                format,
                rawData: recordData,
            });

            //@ts-ignore
            expect(format.isEqual(record.getFormat() as Format<IntegerField>)).toBe(true);
        });

        test('should set the field format from Object with declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: { type: 'integer' },
                },
                rawData: recordData,
            });
            const recordFormat = record.getFormat();

            expect(recordFormat.getCount()).toEqual(fields.length);
            recordFormat.each((item, index) => {
                expect(item.getName()).toBe(fields[index]);
                if (item.getName() === 'id') {
                    expect(item.getType()).toBe('integer');
                }
            });
        });

        test('should add the field format from Object with declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    foo: { type: 'integer' },
                },
                rawData: recordData,
            });
            const recordFormat = record.getFormat();

            expect(recordFormat.getCount()).toEqual(fields.length + 1);
            recordFormat.each((item, index) => {
                expect(item.getName()).toBe(fields[index] || 'foo');
            });
        });

        test('should set the field format from Object with string declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: 'integer',
                },
                rawData: recordData,
            });
            const recordFormat = record.getFormat();

            expect(recordFormat.getCount()).toEqual(fields.length);
            recordFormat.each((item, index) => {
                expect(item.getName()).toBe(fields[index]);
                if (item.getName() === 'id') {
                    expect(item.getType()).toBe('integer');
                }
            });
        });

        test('should set the field format from Object with custom type declaration', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: Date,
                },
                rawData: recordData,
            });
            const recordFormat = record.getFormat();

            expect(recordFormat.getCount()).toEqual(fields.length);
            recordFormat.each((item, index) => {
                expect(item.getName()).toBe(fields[index]);
                if (item.getName() === 'id') {
                    expect(item.getType()).toBe(Date);
                }
            });
        });

        test('should set the field format from Object with field instance', () => {
            const fields = Object.keys(recordData);
            const record = new Record({
                format: {
                    id: new IntegerField() as any,
                },
                rawData: recordData,
            });
            const recordFormat = record.getFormat();

            expect(recordFormat.getCount()).toEqual(fields.length);
            recordFormat.each((item, index) => {
                expect(item.getName()).toBe(fields[index]);
                if (item.getName() === 'id') {
                    expect(item.getType()).toBe('Integer');
                }
            });
        });

        test('should inherit from the recordset format', () => {
            const rs = new RecordSet<object, Record>({
                format: [
                    {
                        name: 'date',
                        type: 'date',
                        defaultValue: new Date(),
                    },
                ],
            });

            const record = new Record({
                rawData: {
                    date: '2015-01-02 10:11:12',
                },
            });
            rs.add(record);

            const format = record.getFormat();
            expect(format.at(0).getName()).toBe('date');
        });
    });

    describe('.getTypeName()', () => {
        test('should return type name from adapter', () => {
            const rawData = getRecordSbisData();
            rawData.tp = 'User';
            const typedRecord = new Record({ rawData, adapter: 'adapter.sbis' });

            const typeName = typedRecord.getTypeName();

            expect(typeName).toBe('User');
        });
    });

    describe('.isTyped()', () => {
        test('should return true for typed record', () => {
            const rawData = getRecordSbisData();
            rawData.tp = 'User';
            const typedRecord = new Record({ rawData, adapter: 'adapter.sbis' });

            expect(typedRecord.isTyped()).toBe(true);
        });

        test('should return false for non-typed record', () => {
            const rawData = getRecordSbisData();
            const typedRecord = new Record({ rawData, adapter: 'adapter.sbis' });

            expect(typedRecord.isTyped()).toBe(false);
        });

        test('should return false for JSON-based record', () => {
            const rawData = getRecordData();
            const typedRecord = new Record({ rawData });

            expect(typedRecord.isTyped()).toBe(false);
        });
    });

    describe('.addField()', () => {
        test('should add the field from the declaration', () => {
            const index = 1;
            const fieldName = 'login';
            const fieldDefault = 'user';

            record.addField(
                {
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                },
                index
            );

            expect(record.getFormat().at(index).getName()).toBe(fieldName);
            expect(record.getFormat().at(index).getDefaultValue()).toBe(fieldDefault);
            expect(record.get(fieldName as any)).toBe(fieldDefault);
            expect(record.getRawData()[fieldName]).toBe(fieldDefault);
        });

        test('should add the field from the instance', () => {
            const fieldName = 'login';
            const fieldDefault = 'username';
            record.addField(
                fieldsFactory({
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                })
            );
            const index = record.getFormat().getCount() - 1;

            expect(record.getFormat().at(index).getName()).toBe(fieldName);
            expect(record.getFormat().at(index).getDefaultValue()).toBe(fieldDefault);
            expect(record.get(fieldName as any)).toBe(fieldDefault);
            expect(record.getRawData()[fieldName]).toBe(fieldDefault);
        });

        test('should add the field with the value', () => {
            const fieldName = 'login';
            const fieldValue = 'root';
            record.addField(
                { name: fieldName, type: 'string', defaultValue: 'user' },
                0,
                fieldValue
            );

            expect(record.get(fieldName as any)).toBe(fieldValue);
            expect(record.getRawData()[fieldName]).toBe(fieldValue);
        });

        test('should throw an error if the field is already defined', () => {
            expect(() => {
                record.addField({ name: 'title', type: 'string' });
            }).toThrow();
        });

        test('should throw an error if add the field twice', () => {
            record.addField({ name: 'new', type: 'string' });
            expect(() => {
                record.addField({ name: 'new', type: 'string' });
            }).toThrow();
        });

        test('should throw an error if the record has an owner', () => {
            const rs = new RecordSet<object, Record>();
            rs.add(new Record());

            const record = rs.at(0);
            expect(() => {
                record.addField({ name: 'new', type: 'string' });
            }).toThrow();
        });

        test('should add the empty record field', () => {
            const fieldName = 'rec';
            record.addField({ name: fieldName, type: 'record' });

            expect(record.get(fieldName as any)).toBeNull();
            expect(record.getRawData()[fieldName]).toBeNull();
        });

        test('should add the filled record field', () => {
            const fieldName = 'rec';
            record.addField(
                { name: fieldName, type: 'record' },
                0,
                new Record({ rawData: { a: 1 } })
            );

            expect(record.get(fieldName as any).get('a')).toBe(1);
            expect(record.getRawData()[fieldName].a).toBe(1);
        });

        test('should add the empty recordset field', () => {
            const fieldName = 'rs';
            record.addField({ name: fieldName, type: 'recordset' });

            expect(record.get(fieldName as any)).toBeNull();
            expect(record.getRawData()[fieldName]).toBeNull();
        });

        test('should add the filled recordset field', () => {
            const fieldName = 'rs';
            record.addField(
                { name: fieldName, type: 'recordset' },
                0,
                new RecordSet({ rawData: [{ a: 1 }] })
            );

            expect(
                record
                    .get(fieldName as any)
                    .at(0)
                    .get('a')
            ).toBe(1);
            expect(record.getRawData()[fieldName][0].a).toBe(1);
        });

        test('should add a sbis hierarhy field', () => {
            const record1 = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    s: [
                        { n: 'parent', t: 'Идентификатор' },
                        { n: 'parent@', t: 'Логическое' },
                        { n: 'parent$', t: 'Логическое' },
                    ],
                    d: [[null], null, null],
                },
            });
            const record2 = new Record({
                adapter: new SbisAdapter(),
            });

            record1.getFormat().each((field) => {
                record2.addField(field, undefined, record1.get(field.getName()));
            });

            expect(record1.getRawData()).toEqual(record2.getRawData());
        });

        test('should affect only given record if its format is linked to another one', () => {
            const record = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    s: [
                        { n: 'first', t: 'Запись' },
                        { n: 'second', t: 'Запись' },
                    ],
                    d: [
                        {
                            s: [{ n: 'foo', t: 'Число целое' }],
                            f: 1,
                            d: [1],
                        },
                        {
                            f: 1,
                            d: [2],
                        },
                    ],
                },
            });

            const first = record.get('first');
            const second = record.get('second');
            first.addField({ name: 'bar', type: 'string' }, 0, 'abc');

            expect(first.get('foo')).toBe(1);
            expect(first.get('bar')).toBe('abc');

            expect(second.get('foo')).toBe(2);
            expect(second.get('bar')).not.toBeDefined();
        });

        test('should trigger onPropertyChange event with default value', () => {
            let result;
            //@ts-ignore
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.addField({ name: 'foo', type: 'string', defaultValue: 'bar' }, 0);
            record.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(result.foo).toEqual('bar');
        });

        test('should trigger onPropertyChange event with argument value', () => {
            let result;
            //@ts-ignore
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.addField({ name: 'foo', type: 'string', defaultValue: 'bar' }, 0, 'baz');
            record.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(result.foo).toEqual('baz');
        });

        test("should change owner's raw data", () => {
            const parent = new Record();
            const child = new Record();

            parent.set('foo', child);
            expect(parent.getRawData().foo).toBe(null);

            child.addField({ name: 'bar', type: 'string' });
            expect(parent.getRawData().foo).toEqual({ bar: null });
        });

        test('should break link with "format" option source', () => {
            const format = new Format();
            const record = new Record({ format });

            record.addField({ name: 'bar', type: 'string' });
            expect(record.getFormat(true)).not.toEqual(format);
        });
    });

    describe('.removeField()', () => {
        test('should remove the exists field', () => {
            const fieldName = 'title';
            const record = new Record({
                rawData: { title: 'test' },
                format: [{ name: fieldName, type: 'string' }],
            });
            record.removeField(fieldName);

            expect(record.getFormat().getFieldIndex(fieldName)).toBe(-1);
            expect(record.has(fieldName)).toBe(false);
            expect(record.get(fieldName)).not.toBeDefined();
            expect(record.getRawData()[fieldName]).not.toBeDefined();
        });

        test('should throw an error for not defined field', () => {
            expect(() => {
                record.removeField('some');
            }).toThrow();
        });

        test('should throw an error if remove the field twice', () => {
            const fieldName = 'title';
            const record = new Record({
                format: [{ name: fieldName, type: 'string' }],
            });
            record.removeField(fieldName);
            expect(() => {
                record.removeField(fieldName);
            }).toThrow();
        });

        test('should throw an error if the record has an owner', () => {
            const rs = new RecordSet<object, Record>();
            rs.add(
                new Record({
                    rawData: { a: 1 },
                })
            );

            const record = rs.at(0);
            expect(() => {
                record.removeField('a');
            }).toThrow();
        });

        test('should remove cached field value', () => {
            const value = { bar: 'baz' };
            const record = new Record({
                rawData: { foo: value },
            });

            expect(record.get('foo')).toBe(value);
            record.removeField('foo');
            expect(record.get('foo')).not.toBeDefined();
        });

        test('should remove field from changed', () => {
            const record = new Record();
            record.set('foo', 'bar');

            expect(record.isChanged('foo')).toBe(true);
            record.removeField('foo');
            expect(record.isChanged('foo')).toBe(false);
        });

        test('should trigger onPropertyChange event', () => {
            const record = new Record({
                rawData: { foo: 'bar' },
            });

            let result;
            //@ts-ignore
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.removeField('foo');
            record.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(result.hasOwnProperty('foo')).toBe(true);
            //@ts-ignore
            expect(result.foo).not.toBeDefined();
        });

        test("should change owner's raw data", () => {
            const parent = new Record();
            const child = new Record({ rawData: { bar: 'baz' } });

            parent.set('foo', child);
            expect(parent.getRawData().foo).toEqual({ bar: 'baz' });

            child.removeField('bar');
            expect(parent.getRawData().foo).toEqual({});
        });
    });

    describe('.removeFieldAt()', () => {
        test("should throw an error if adapter doesn't support fields indexes", () => {
            expect(() => {
                record.removeFieldAt(1);
            }).toThrow();
        });

        test('should remove the exists field', () => {
            const format = getRecordFormat();
            const fieldIndex = 1;
            //@ts-ignore
            const fieldName = format[fieldIndex].name;
            const record = new Record({
                format,
                adapter: new SbisAdapter(),
                rawData: getRecordSbisData(),
            });
            record.clone();
            record.removeFieldAt(fieldIndex);

            expect(record.getFormat().at(fieldIndex).getName()).not.toEqual(fieldName);
            expect(record.has(fieldName)).toBe(false);
            expect(record.get(fieldName)).not.toBeDefined();
            expect(record.getRawData()[fieldName]).not.toBeDefined();
        });

        test('should throw an error for not exists index', () => {
            expect(() => {
                const record = new Record({
                    adapter: new SbisAdapter(),
                });
                record.removeFieldAt(0);
            }).toThrow();
        });

        test('should throw an error if the record has an owner', () => {
            const originalRecord = new Record({
                adapter: new SbisAdapter(),
            });
            const rs = new RecordSet<object, Record>({
                adapter: new SbisAdapter(),
            });

            originalRecord.addField({ name: 'a', type: 'string' });
            originalRecord.removeFieldAt(0);

            originalRecord.addField({ name: 'a', type: 'string' });
            rs.add(originalRecord);

            const receivedRecord = rs.at(0);
            expect(() => {
                receivedRecord.removeFieldAt(0);
            }).toThrow();
        });

        test('should remove cached field value', () => {
            const value = { bar: 'baz' };
            const record = new Record({
                format: {
                    foo: 'object',
                },
                adapter: new SbisAdapter(),
            });

            record.set('foo', value);

            expect(record.get('foo')).toBe(value);
            record.removeFieldAt(0);
            expect(record.get('foo')).not.toBeDefined();
        });

        test('should remove field from changed', () => {
            const record = new Record({
                format: { foo: String },
                adapter: new SbisAdapter(),
            });
            record.set('foo', 'bar');

            expect(record.isChanged('foo')).toBe(true);
            record.removeFieldAt(0);
            expect(record.isChanged('foo')).toBe(false);
        });

        test('should trigger onPropertyChange event', () => {
            const record = new Record({
                format: {
                    foo: 'string',
                },
                adapter: new SbisAdapter(),
            });
            record.set('foo', 'bar');

            let result;
            //@ts-ignore
            const handler = (event, map) => {
                result = map;
            };

            record.subscribe('onPropertyChange', handler);
            record.removeFieldAt(0);
            record.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(result.hasOwnProperty('foo')).toBe(true);
            //@ts-ignore
            expect(result.foo).not.toBeDefined();
        });

        test("should change owner's raw data", () => {
            const parent = new Record({
                adapter: new SbisAdapter(),
                format: { foo: 'record' },
            });
            const child = new Record({
                adapter: new SbisAdapter(),
                format: { bar: 'string' },
            });
            child.set('bar', 'baz');

            parent.set('foo', child);
            expect(parent.getRawData().d[0].d).toEqual(['baz']);

            child.removeFieldAt(0);
            expect(parent.getRawData().d[0].d).toEqual([]);
        });
    });

    describe('.isChanged()', () => {
        test('should return false by default', () => {
            expect(record.isChanged('id')).toBe(false);
            expect(record.isChanged()).toBe(false);
        });

        test('should return false for undefined property', () => {
            expect(record.isChanged('not-exists-prop')).toBe(false);
        });

        test('should return true after field change', () => {
            record.set('id', 123);
            expect(record.isChanged('id')).toBe(true);
            expect(record.isChanged()).toBe(true);
        });

        test('should return true after set a new field', () => {
            record.set('aaa' as any, 321);
            expect(record.isChanged('aaa')).toBe(true);
            expect(record.isChanged()).toBe(true);
        });

        test('should return true for deep changed item', () => {
            const sub = new Record();
            const list = new ObservableList();
            const top = new Record();

            sub.set('test', 'v1');
            list.add(sub);
            top.set('list', list);
            top.acceptChanges();

            expect(top.isChanged('list')).toBe(false);
            sub.set('test', 'v2');
            expect(top.isChanged('list')).toBe(true);
        });

        test('should return false on original value set for (record -> recordset -> record) hierarchy', () => {
            const record = new Record({
                format: {
                    id: 'integer',
                    recset: 'recordset',
                },
                rawData: {
                    id: 'foo',
                    recset: [
                        {
                            id: 'foo',
                        },
                    ],
                },
            });

            const child = record.get('recset').at(0);
            const originalValue = child.get('id');

            child.set('id', 'bar');

            expect(record.isChanged('recset')).toBe(true);
            expect(record.get('recset').isChanged()).toBe(true);
            expect(record.get('recset').at(0).isChanged('id')).toBe(true);

            child.set('id', originalValue);

            expect(record.get('recset').at(0).isChanged('id')).toBe(false);
            expect(record.get('recset').isChanged()).toBe(false);
            expect(record.isChanged('recset')).toBe(false);
        });
    });

    describe('.isEqual()', () => {
        test('should work fine with invalid argument', () => {
            //@ts-ignore
            expect(record.isEqual(undefined)).toBe(false);
            //@ts-ignore
            expect(record.isEqual(null)).toBe(false);
            expect(record.isEqual(false as any)).toBe(false);
            expect(record.isEqual(true as any)).toBe(false);
            expect(record.isEqual(0 as any)).toBe(false);
            expect(record.isEqual(1 as any)).toBe(false);
            expect(record.isEqual('' as any)).toBe(false);
            expect(record.isEqual('a' as any)).toBe(false);
            expect(record.isEqual([] as any)).toBe(false);
            expect(record.isEqual({} as any)).toBe(false);
        });

        test('should return true for the same record', () => {
            const same = new Record({
                rawData: getRecordData(),
            });
            expect(record.isEqual(same)).toBe(true);
        });

        test('should return true for itself', () => {
            expect(record.isEqual(record)).toBe(true);

            record.set('max', 1 + record.get('max'));
            expect(record.isEqual(record)).toBe(true);
        });

        test('should return true for the clone', () => {
            expect(record.isEqual(record.clone())).toBe(true);
        });

        test('should return true for empties', () => {
            const record = new Record();
            expect(record.isEqual(new Record())).toBe(true);
        });

        test('should return false if field changed', () => {
            const same = new Record({
                rawData: getRecordData(),
            });
            same.set('title', 'B');
            expect(record.isEqual(same)).toBe(false);
        });

        test('should return true with shared raw data', () => {
            const anotherRecord = getRecord();
            expect(record.isEqual(anotherRecord)).toBe(true);
        });

        test('should return true with same raw data', () => {
            const anotherRecord = getRecord(getRecordData());
            expect(record.isEqual(anotherRecord)).toBe(true);
        });

        test('should return false with different raw data', () => {
            interface IExtData extends IData {
                someField?: string;
            }

            const dataA: IExtData = getRecordData();
            dataA.someField = 'someValue';
            const anotherRecordA = getRecord(dataA);
            expect(record.isEqual(anotherRecordA)).toBe(false);

            const dataB = getRecordData();
            for (const key in dataB) {
                if (dataB.hasOwnProperty(key)) {
                    //@ts-ignore
                    delete dataB[key];
                    break;
                }
            }
            const anotherRecordB = getRecord(dataB);
            expect(record.isEqual(anotherRecordB)).toBe(false);
        });

        test('should return false for changed and true for reverted back record', () => {
            const anotherRecord = getRecord(getRecordData());
            anotherRecord.set('max', 1 + record.get('max'));
            expect(record.isEqual(anotherRecord)).toBe(false);

            anotherRecord.set('max', record.get('max'));
            expect(record.isEqual(anotherRecord)).toBe(true);
        });

        test('should return true for same module and submodule', () => {
            class MyRecord extends Record {}
            const recordA = new Record();
            const recordB = new Record();
            const recordC = new MyRecord();

            expect(recordA.isEqual(recordB)).toBe(true);
            expect(recordA.isEqual(recordC)).toBe(true);
        });

        test('should return true with nested records', () => {
            const nestedRecordA = new Record({
                rawData: { foo: 'bar' },
            });
            const recordA = new Record({
                rawData: nestedRecordA,
                adapter: new RecordSetAdapter(),
            });

            const nestedRecordB = new Record({
                rawData: { foo: 'bar' },
            });
            const recordB = new Record({
                rawData: nestedRecordB,
                adapter: new RecordSetAdapter(),
                cow: true,
            });

            expect(recordA.isEqual(recordB)).toBe(true);
        });
    });

    describe('.clone()', () => {
        test('should not be same as original', () => {
            expect(record.clone()).not.toEqual(record);
            expect(record.clone(true)).not.toEqual(record);
        });

        test('should not be same as previous clone', () => {
            expect(record.clone() !== record.clone()).toBeTruthy();
        });

        test('should clone rawData', () => {
            const clone = record.clone();
            expect(record.getRawData() !== clone.getRawData()).toBeTruthy();
            expect(record.getRawData()).toEqual(clone.getRawData());
        });

        test('should clone changed fields', () => {
            const cloneA = record.clone();
            expect(cloneA.isChanged('id')).toBe(false);
            expect(record.isChanged('id')).toBe(cloneA.isChanged('id'));
            expect(record.isChanged()).toBe(cloneA.isChanged());
            expect(cloneA.isChanged()).toBe(false);

            record.set('a' as any, 1);
            const cloneB = record.clone();
            expect(record.isChanged('a')).toBe(cloneB.isChanged('a'));
            expect(cloneB.isChanged('a')).toBe(true);
            expect(record.isChanged('id')).toBe(cloneB.isChanged('id'));
            expect(cloneB.isChanged('id')).toBe(false);
            expect(record.isChanged()).toBe(cloneB.isChanged());
            expect(cloneB.isChanged()).toBe(true);
        });

        test('should give equal fields', () => {
            const clone = record.clone();
            record.each((name, value) => {
                expect(value).toBe(clone.get(name));
            });
            clone.each((name, value) => {
                expect(value).toBe(record.get(name));
            });
        });

        test('should clone state markers', () => {
            const cloneA = record.clone();
            expect(record.getState()).toBe(cloneA.getState());

            record.setState(Record.RecordState.DELETED);
            const cloneB = record.clone();
            expect(record.getState()).toBe(cloneB.getState());
        });

        test('should keep recordset format', () => {
            const rs = new RecordSet({
                format: {
                    foo: Date,
                },
                rawData: [{ foo: '2008-09-28' }],
            });
            const item = rs.at(0);
            const clone = item.clone();

            expect(clone.get('foo')).toBeInstanceOf(Date);
        });

        test('should make raw data unlinked from original', () => {
            const cloneA = record.clone();
            expect(cloneA.get('max')).toEqual(record.get('max'));
            cloneA.set('max', 1);
            expect(cloneA.get('max')).not.toEqual(record.get('max'));

            const cloneB = record.clone();
            expect(cloneB.get('max')).toEqual(record.get('max'));
            record.set('max', 12);
            expect(cloneB.get('max')).not.toEqual(record.get('max'));
        });

        test('should make raw data linked to original if shallow', () => {
            const clone = record.clone(true);
            expect(record.getRawData(true)).toBe(clone.getRawData(true));
        });

        test('should make data unlinked between several clones', () => {
            const cloneA = record.clone();
            const cloneB = record.clone();
            expect(cloneA.get('max')).toEqual(cloneB.get('max'));
            cloneA.set('max', 1);
            expect(cloneA.get('max')).not.toEqual(cloneB.get('max'));
        });

        test('should return equal rawData if data container signature presented', () => {
            const rawData = {
                _type: 'record',
                _mustRevive: true,
                s: [],
                d: [],
            };
            const record = new Record({
                rawData,
                adapter: new SbisAdapter(),
            });

            const clone = record.clone();
            expect(clone.getRawData(true)).toEqual(rawData);
        });
    });

    describe('.getOwner()', () => {
        test('should return null by default', () => {
            expect(record.getOwner()).toBeNull();
        });

        test('should return value passed to the constructor', () => {
            const owner = new RecordSet();
            const record = new Record({ owner });
            expect(record.getOwner()).toBe(owner);
        });
    });

    describe('.detach()', () => {
        test('should reset owner to the null', () => {
            const record = new Record({
                owner: new RecordSet(),
            });
            record.detach();
            expect(record.getOwner()).toBeNull();
        });

        test('should reset state to Detached', () => {
            const record = new Record({
                owner: new RecordSet(),
                state: Record.RecordState.UNCHANGED,
            });
            record.detach();
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });
    });

    describe('.getState()', () => {
        test('should return Detached by default', () => {
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });

        test('should return state passed to the constructor', () => {
            const record = new Record({
                state: Record.RecordState.UNCHANGED,
            });
            expect(record.getState()).toBe(Record.RecordState.UNCHANGED);
        });

        test('should return "Changed" from previous "Unchanged" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.UNCHANGED,
            });
            record.set('id', -1);
            expect(record.getState()).toBe(Record.RecordState.CHANGED);
        });

        test('should keep "Detached" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.DETACHED,
            });
            record.set('id', -1);
            expect(record.getState()).toBe(Record.RecordState.DETACHED);
        });

        test('should keep "Added" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.ADDED,
            });
            record.set('id', -1);
            expect(record.getState()).toBe(Record.RecordState.ADDED);
        });

        test('should keep "Deleted" after change any field value', () => {
            const record = new Record({
                state: Record.RecordState.DELETED,
            });
            record.set('id', -1);
            expect(record.getState()).toBe(Record.RecordState.DELETED);
        });
    });

    describe('.setState()', () => {
        test('should set the new state', () => {
            record.setState(Record.RecordState.DELETED);
            expect(record.getState()).toBe(Record.RecordState.DELETED);
        });
    });

    describe('.toJSON()', () => {
        test('should serialize a Record', () => {
            const options = (record as any)._getOptions();
            const json = record.toJSON();

            expect(json.module).toBe('Types/entity:Record');
            expect(typeof json.id).toBe('number');
            expect(json.id > 0).toBe(true);
            expect(json.state.$options).toEqual(options);
            expect((json.state as any)._changedFields).toEqual((record as any)._changedFields);
        });

        test('should serialize a Record with format', () => {
            const record = new Record({
                format: [{ name: 'id', type: 'integer' }],
            });
            const format = record.getFormat();
            const json = record.toJSON();

            //@ts-ignore
            expect(format.isEqual(json.state.$options.format as Format)).toBe(true);
        });

        test("should set subclass's module name from prototype", () => {
            class SubRecord extends Record {
                // Just subclass
            }
            Object.assign(SubRecord.prototype, {
                _moduleName: 'My.Sub',
            });

            const record = new SubRecord();
            const json = record.toJSON();
            expect(json.module).toBe('My.Sub');
        });

        test("should set subclass's module name from instance", () => {
            class SubRecord extends Record {
                protected _moduleName: string = 'My.Sub';
            }

            const record = new SubRecord();
            const json = record.toJSON();
            expect(json.module).toBe('My.Sub');
        });

        test("should throw an error if subclass's module name is not defined", () => {
            const loggerStub = jest.spyOn(logger, 'error').mockClear().mockImplementation();
            class Sub extends Record {}
            const record = new Sub();
            expect(() => {
                record.toJSON();
            }).not.toThrow();
            expect(loggerStub).toHaveBeenCalled();
        });

        test('should keep original raw data if old-fashioned extend used', () => {
            class SubRecord extends Record {
                _moduleName = 'SubRecord';
                foo = 'bar';
            }

            const getFirstData = () => {
                return { first: true };
            };
            const getSecondData = () => {
                return { second: true };
            };
            const record = new SubRecord({
                rawData: getFirstData(),
            });

            record.setRawData(getSecondData());
            expect(record.getRawData()).toEqual(getSecondData());
            record.toJSON();
            expect(record.getRawData()).toEqual(getSecondData());
        });

        test("should don't serialize writable property if old-fashioned extend used", () => {
            class SubRecord extends Record {
                _moduleName = 'SubRecord';
                foo = 'bar';
            }

            const record = new SubRecord({
                writable: false,
            });
            const json = record.toJSON();

            //@ts-ignore
            expect(json.state.$options.writable).not.toBeDefined();
        });
    });

    describe('::fromObject', () => {
        test('should make record from object with various adapter but with equal fields', () => {
            const data = {
                id: 1,
                title: 'title',
                selected: true,
                pid: null,
                lost: undefined,
            };
            const recordA = Record.fromObject(data);
            const recordB = Record.fromObject(data, new SbisAdapter());

            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    //@ts-ignore
                    expect(recordA.get(key as never)).toBe(data[key]);
                    //@ts-ignore
                    expect(recordB.get(key as never)).toBe(data[key]);
                }
            }
        });

        test('should return unchanged record', () => {
            const record = Record.fromObject({ foo: 'bar' });
            expect(record.isChanged()).toBe(false);
        });

        test('should create DateTime field from standard Date', () => {
            const record = Record.fromObject({ date: new Date() });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('datetime');
        });

        test('should create DateTime from special DateTime type', () => {
            const record = Record.fromObject({ date: new DateTime() });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('datetime');
        });

        test('should inherit withoutTimeZone flag from special DateTime type', () => {
            const date = new DateTime(true);
            const record = Record.fromObject({ date });
            const field = record.getFormat().at(0) as DateTimeField;

            expect(field.isWithoutTimeZone()).toBe(true);
        });

        test('should create DateTime from special Date type', () => {
            const record = Record.fromObject({ date: new TheDate() });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('date');
        });

        test('should create DateTime from special Time type', () => {
            const record = Record.fromObject({ date: new Time() });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('time');
        });

        test('should create Date field if SQL_SERIALIZE_MODE_DATETIME', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode(
                (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATETIME
            );
            const record = Record.fromObject({ date });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('datetime');
        });

        test('should create Date field if SQL_SERIALIZE_MODE_DATE', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode(
                (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE
            );
            const record = Record.fromObject({ date });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('date');
        });

        test('should create Time field if SQL_SERIALIZE_MODE_TIME', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode(
                (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME
            );
            const record = Record.fromObject({ date });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('time');
        });

        test('should create DateTime field if SQL_SERIALIZE_MODE_AUTO', () => {
            const date = new Date();

            (date as ExtendDate).setSQLSerializationMode(
                (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_AUTO
            );
            const record = Record.fromObject({ date });
            const field = record.getFormat().at(0);

            expect(field.getType()).toEqual('datetime');
        });

        test('should create Array field with kind of String', () => {
            const record = Record.fromObject({ foo: [1, '2'] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('string');
        });

        test('should create Array field with kind of String when it consist from null only', () => {
            const record = Record.fromObject({ foo: [null] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('string');
        });

        test('should create Array field with kind of Integer', () => {
            const record = Record.fromObject({ foo: [1, 2] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('integer');
        });

        test('should create Array field with kind of Integer when one item is null', () => {
            const record = Record.fromObject({ foo: [1, null] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('integer');
        });

        test('should create Array field with kind of Real', () => {
            const record = Record.fromObject({ foo: [1, 2.5] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('real');
        });

        test('should create Array field with kind of Boolean', () => {
            const record = Record.fromObject({ foo: [true, 'false'] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('boolean');
        });

        test('should create Array field with kind of DateTime', () => {
            const record = Record.fromObject({ foo: [new Date()] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('datetime');
        });

        test('should create Array field with kind of Array', () => {
            const value = [[1]];
            const record = Record.fromObject({ foo: value });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind() as unknown).toEqual({
                type: 'array',
                kind: 'integer',
            });
        });

        test('should create Array field with kind of first not null element', () => {
            const record = Record.fromObject({ foo: [null, 1] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('integer');
        });

        test('should create Array field with kind of first not undefined element', () => {
            const record = Record.fromObject({ foo: [null, false] });
            const field = record.getFormat().at(0) as ArrayField;

            expect(field.getType()).toEqual('array');
            expect(field.getKind()).toEqual('boolean');
        });
    });

    describe('::produceInstance()', () => {
        test('should return an instance with the given raw data', () => {
            const data = {};
            const instance = Record.produceInstance(data);

            expect(instance).toBeInstanceOf(Record);
            expect(instance.getRawData(true)).toBe(data);
        });

        test('should return an instance with the given adapter', () => {
            const adapter = new SbisAdapter();
            const instance = Record.produceInstance(null, { adapter });

            expect(instance).toBeInstanceOf(Record);
            expect(instance.getAdapter()).toBe(adapter);
        });

        test('should return an instance with inherited adapter', () => {
            const adapter = new SbisAdapter();
            class Foo extends Record {
                _$adapter = adapter;
            }

            const instance = Foo.produceInstance(null);

            expect(instance).toBeInstanceOf(Foo);
            expect(instance.getAdapter()).toBe(adapter);
        });
    });

    describe('.getVersion()', () => {
        test('should change version if has been changed a value', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [1],
                    s: [
                        {
                            n: 'id',
                            t: 'Число целое',
                        },
                    ],
                },
            });
            const version = rec.getVersion();

            rec.set('id', 5);
            expect(rec.getVersion()).not.toEqual(version);
        });

        test('should change version if has been changed a inner Record', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [
                        {
                            _type: 'record',
                            d: [1],
                            s: [
                                {
                                    n: 'id',
                                    t: 'Число целое',
                                },
                            ],
                        },
                    ],
                    s: [
                        {
                            n: 'record',
                            t: 'Запись',
                        },
                    ],
                },
            });
            const version = rec.getVersion();

            rec.get('record').set('id', 5);
            expect(rec.getVersion()).not.toEqual(version);
        });

        test('should change version if has been changed an inner RecordSet', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [
                        {
                            _type: 'recordset',
                            d: [[1], [2], [3], [4]],
                            s: [
                                {
                                    n: 'id',
                                    t: 'Число целое',
                                },
                            ],
                        },
                    ],
                    s: [
                        {
                            n: 'rs',
                            t: 'Выборка',
                        },
                    ],
                },
            });
            const version = rec.getVersion();

            rec.get('rs').at(0).set('id', 5);
            expect(rec.getVersion()).not.toEqual(version);
        });

        test('should change version if has been changed an inner Flags', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [[]],
                    s: [
                        {
                            n: 'foo',
                            t: { n: 'Флаги', s: { 0: 'one', 1: 'two' } },
                        },
                    ],
                },
            });

            const version = rec.getVersion();
            rec.get('foo').set('one', true);
            expect(rec.getVersion()).not.toEqual(version);
        });

        test('should change version if a field has been added in the format', () => {
            const rec = new Record({
                adapter: new SbisAdapter(),
                rawData: {
                    _type: 'record',
                    d: [1],
                    s: [
                        {
                            n: 'id',
                            t: 'Число целое',
                        },
                    ],
                },
            });
            const version = rec.getVersion();

            rec.addField({ name: 'name', type: 'string' });
            expect(rec.getVersion()).not.toEqual(version);
        });

        test('should change version if a field has been removed from the format', () => {
            const format = getRecordFormat();
            const rec = new Record({
                format,
                adapter: new SbisAdapter(),
                rawData: getRecordSbisData(),
            });
            const version = rec.getVersion();

            rec.removeField('max');
            expect(rec.getVersion()).not.toEqual(version);
        });
    });

    describe('::filter()', () => {
        test('should return only odd fields values', () => {
            const rawData = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5,
            };
            const record = new Record({
                rawData,
            });
            const expectData = [1, 3, 5];
            const result = Record.filter(record, (_name, value) => {
                return !!(value % 2);
            });

            let index = 0;
            result.each((_name, value) => {
                expect(value).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });

        test('should return all fields values', () => {
            const rawData = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5,
            };
            const record = new Record({
                rawData,
            });
            const expectData = [1, 2, 3, 4, 5];
            //@ts-ignore
            const result = Record.filter(record, undefined);

            let index = 0;
            result.each((_name, value) => {
                expect(value).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });
    });

    describe('::filterFields()', () => {
        test('should return only given fields', () => {
            const data = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5,
            };
            const record = new Record({
                rawData: data,
            });
            const fields = ['a', 'b', 'd'];
            const result = (Record as any).filterFields(record, fields);

            let index = 0;
            //@ts-ignore
            result.each((name, value) => {
                expect(fields).toContain(name);
                expect(name).toBe(fields[index]);
                expect(value).toBe(record.get(name));
                index++;
            });
            expect(index).toBe(fields.length);
        });

        test('should not return undefined fields', () => {
            const data = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5,
            };
            const record = new Record({
                rawData: data,
            });
            const fields = ['a', 'z', 'c'];
            const result = (Record as any).filterFields(record, fields);

            let index = 0;
            //@ts-ignore
            result.each((name, value) => {
                expect(fields).toContain(name);
                expect(value).toBe(record.get(name));
                index++;
            });
            expect(index).toBe(fields.length - 1);
        });
    });

    describe('.merge()', () => {
        test('should merge records', () => {
            const newRecord = new Record({
                rawData: {
                    title: 'new',
                    link: '123',
                },
            });
            newRecord.merge(record);
            expect(newRecord.get('id')).toBe(getRecordData().id);
        });

        test('should do nothing with itself', () => {
            const record = new Record({
                rawData: {
                    foo: 'bar',
                },
            });

            const setSpy = jest.spyOn(record, 'set').mockClear();
            record.merge(record);
            expect(setSpy).not.toHaveBeenCalled();
        });

        test('should stay unchanged with empty donor', () => {
            expect(record.isChanged()).toBe(false);
            const anotherRecord = new Record();
            record.merge(anotherRecord);
            expect(record.isChanged()).toBe(false);
        });

        test('should stay unchanged with same donor', () => {
            expect(record.isChanged()).toBe(false);
            const anotherRecord = new Record({
                rawData: {
                    max: recordData.max,
                },
            });
            record.merge(anotherRecord);
            expect(record.isChanged()).toBe(false);
        });

        test('should stay changed', () => {
            record.set('max', 2);
            expect(record.isChanged()).toBe(true);
            const anotherRecord = new Record({
                rawData: {
                    max: 157,
                },
            });
            record.merge(anotherRecord);
            expect(record.isChanged()).toBe(true);
        });

        test('should become changed with different donor', () => {
            expect(record.isChanged()).toBe(false);
            const anotherRecord = new Record({
                rawData: {
                    max: 157,
                },
            });
            record.merge(anotherRecord);
            expect(record.isChanged()).toBe(true);
        });

        test('should become changed with different donor', () => {
            const record = new Record({
                rawData: {
                    d: ['qwe'],
                    s: [
                        {
                            n: 'name',
                            t: 'Строка',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const anotherModel = new Record({
                rawData: {
                    d: ['qwe2', 'qwe3'],
                    s: [
                        {
                            n: 'name2',
                            t: 'Строка',
                        },
                        {
                            n: 'name',
                            t: 'Строка',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            record.merge(anotherModel);
            expect(record.get('name2')).toBe('qwe2');
            expect(record.get('name')).toBe('qwe3');
        });
    });
});
