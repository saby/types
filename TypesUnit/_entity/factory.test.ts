import { cast, serialize } from 'Types/_entity/factory';
import {
    ArrayField,
    DateTimeField,
    DictionaryField,
    EnumField,
    Field,
    FlagsField,
    MoneyField,
    RealField,
    UniversalField,
} from 'Types/_entity/format';
import { Model } from 'Types/entity';
import JsonAdapter from 'Types/_entity/adapter/Json';
import TheDate from 'Types/_entity/applied/Date';
import Time from 'Types/_entity/applied/Time';
import DateTime from 'Types/_entity/applied/DateTime';
import TimeInterval from 'Types/_entity/applied/TimeInterval';
import { RecordSet, List, Flags, Enum } from 'Types/collection';
import dateToSql, { MODE } from 'Types/_formatter/dateToSql';

interface IStubbedDate extends Date {
    tzoStub?: jest.SpiedFunction<any>;
}

function getFormatMock(type: string): Field {
    const format = {
        getType(): string {
            return type;
        },
    };
    return format as Field;
}

function getUniversalFormatMock(type: string): UniversalField {
    return { type } as UniversalField;
}

function patchTzo(date: IStubbedDate, offset: number): void {
    date.tzoStub = jest.spyOn(date, 'getTimezoneOffset').mockClear().mockReturnValue(offset);
}

function revertTzo(date: IStubbedDate): void {
    date.tzoStub?.mockRestore();
    delete date.tzoStub;
}

describe('Types/_entity/factory', () => {
    describe('.cast()', () => {
        describe('for integer', () => {
            test('should return a Number', () => {
                expect(cast(1, 'integer')).toBe(1);
                expect(cast(1.12345, 'integer')).toBe(1);
                expect(cast('1', 'integer')).toBe(1);
                expect(cast('1a', 'integer')).toBe(1);
                expect(cast('0890', 'integer')).toBe(890);
            });

            test('should return null', () => {
                expect(cast('a', 'integer')).toBe(null);
                expect(cast('a1', 'integer')).toBe(null);
            });

            test('should return passed value', () => {
                expect(cast(null, 'integer')).toBeNull();
                expect(cast(undefined, 'integer')).not.toBeDefined();
            });
        });

        describe('for string', () => {
            test('should return passed value', () => {
                expect(cast('bar', 'string')).toBe('bar');
                expect(cast(1, 'string')).toBe(1);
                expect(cast(null, 'string')).toBeNull();
                expect(cast(undefined, 'string')).not.toBeDefined();
            });
        });

        describe('for link', () => {
            test('should return a Number', () => {
                expect(cast(1, 'link')).toBe(1);
                expect(cast('1', 'link')).toBe(1);
                expect(cast('1a', 'link')).toBe(1);
                expect(cast('0890', 'link')).toBe(890);
            });

            test('should return null', () => {
                expect(cast('a', 'link')).toBe(null);
                expect(cast('a1', 'link')).toBe(null);
            });

            test('should return passed value', () => {
                expect(cast(null, 'integer')).toBeNull();
                expect(cast(undefined, 'link')).not.toBeDefined();
            });
        });

        describe('for real and double', () => {
            test('should return a Number', () => {
                expect(cast(1.2, 'real')).toBe(1.2);
                expect(cast('1.2', 'real')).toBe(1.2);
                expect(cast('1a', 'real')).toBe(1);
                expect(cast('0890', 'real')).toBe(890);
            });

            test('should return null', () => {
                expect(cast('a', 'real')).toBe(null);
                expect(cast('a1', 'real')).toBe(null);
            });

            test('should return passed value', () => {
                expect(cast(null, 'real')).toBeNull();
                expect(cast(undefined, 'real')).not.toBeDefined();
            });
        });

        describe('for money', () => {
            test('should return a Number', () => {
                expect(cast(1.2, 'money')).toBe(1.2);
            });

            test('should return passed value', () => {
                expect(cast('1.2', 'money')).toBe('1.2');
                expect(cast('0890', 'money')).toBe('0890');
                expect(cast('1a', 'money')).toBe('1a');
                expect(cast('a', 'money')).toBe('a');
                expect(cast('a1', 'money')).toBe('a1');

                expect(cast(null, 'money')).toBeNull();
                expect(cast(undefined, 'money')).not.toBeDefined();
            });

            test('should return passed value if precision less or equal 3 ', () => {
                const format = getFormatMock('money') as RealField;
                format.getPrecision = () => {
                    return 3;
                };

                expect(cast(1.2, format.getType(), { format })).toBe(1.2);
            });

            test('should return formatted value if precision more then 3 ', () => {
                const format = getFormatMock('money') as RealField;
                format.getPrecision = () => {
                    return 4;
                };

                expect(cast(1.2, format.getType(), { format })).toBe('1.2000');
            });

            test('should return passed value if "large" flag is enabled ', () => {
                const format = getFormatMock('money') as MoneyField;
                format.isLarge = () => {
                    return true;
                };

                expect(cast('1.2', format.getType(), { format })).toBe('1.2');
            });
        });

        describe('for datetime, date and time', () => {
            test('should return special DateTime instance', () => {
                const datetime = '2015-09-24 15:54:28.981+03';
                const value: DateTime | null = cast(datetime, 'datetime');

                expect(value).toBeInstanceOf(DateTime);
                expect(value?.getTime()).toBe(1443099268981);
            });

            test('should translate withoutTimeZone flag from format instance to the DateTime instance', () => {
                const datetime = '2015-09-24 15:54:28.981+03';
                const format = new DateTimeField({ withoutTimeZone: true });
                const options = { format };
                const value: DateTime | null = cast(datetime, 'datetime', options);

                expect(value?.withoutTimeZone).toBe(true);
            });

            test('should return special Date instance', () => {
                const date = '2015-09-24';
                const value: TheDate | null = cast(date, 'date');

                expect(value).toBeInstanceOf(TheDate);
                expect(value?.getTime()).toBe(1443042000000);
            });

            test('should return array of Date', () => {
                const datetimes = ['2015-09-24 15:54:28.981+03'];
                const timestamps = datetimes.map((val) => {
                    return new Date(val).getTime();
                });
                const format = new ArrayField({ kind: 'datetime' });
                const options = { format };
                const values: DateTime[] | null = cast(datetimes, 'array', options);

                expect(
                    values?.map((value) => {
                        return value.getTime();
                    })
                ).toEqual(timestamps);
            });

            test('should return special Time instance', () => {
                const time = '15:54:28.981+03';
                const value: Time | null = cast(time, 'time');

                expect(value).toBeInstanceOf(Time);
                expect(value?.getHours()).toBe(15);
                expect(value?.getMinutes()).toBe(54);
                expect(value?.getSeconds()).toBe(28);
                expect(value?.getMilliseconds()).toBe(981);
                expect(value?.getTimezoneOffset()).toBe(-180);
            });

            test('should return special Time instance without timezone', () => {
                const time = '15:54:28.981';
                const value: Time | null = cast(time, 'time');

                expect(value).toBeInstanceOf(Time);
                expect(value?.getHours()).toBe(15);
                expect(value?.getMinutes()).toBe(54);
                expect(value?.getSeconds()).toBe(28);
                expect(value?.getMilliseconds()).toBe(981);
            });

            test('should return Infinity', () => {
                const time = 'infinity';
                const value = cast(time, 'date');

                expect(value).toBe(Infinity);
            });

            test('should return -Infinity', () => {
                const time = '-infinity';
                const value = cast(time, 'date');

                expect(value).toBe(-Infinity);
            });

            test('should return passed value', () => {
                const value = new Date();

                expect(cast(value, 'datetime')).toBe(value);
                expect(cast(null, 'datetime')).toBeNull();
                expect(cast(undefined, 'datetime')).not.toBeDefined();
            });
        });

        describe('for timeinterval', () => {
            test('should return a String', () => {
                const interval = new TimeInterval('P10DT0H0M0S');
                expect(cast(interval, 'timeinterval')).toBe('P10DT0H0M0S');
            });

            test('should return passed value', () => {
                expect(cast('P10DT0H0M0S', 'timeinterval')).toBe('P10DT0H0M0S');
                expect(cast(null, 'timeinterval')).toBeNull();
                expect(cast(undefined, 'timeinterval')).not.toBeDefined();
            });
        });

        describe('for array', () => {
            test('should return an Array of String from Field', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => {
                    return 'string';
                };
                const array = ['foo', 'bar'];

                expect(cast(array, format.getType(), { format })).toEqual(['foo', 'bar']);
            });

            test('should return an Array of Number from UniversalField', () => {
                const format = getUniversalFormatMock('array');
                format.meta = { kind: 'integer' };
                const array = ['1', '2a', 3];

                expect(cast(array, format.type, { format })).toEqual([1, 2, 3]);
            });

            test('should cast elements type to string', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => {
                    return 'string';
                };
                const array = ['1', 2, '3', null];

                expect(cast(array, format.getType(), { format })).toEqual(['1', '2', '3', null]);
            });

            test('should return an Array from scalar', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => {
                    return 'string';
                };

                expect(cast('foo', format.getType(), { format })).toEqual(['foo']);
            });

            test('should return passed value', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => {
                    return 'string';
                };

                expect(cast(null, format.getType(), { format })).toBeNull();
                expect(cast(undefined, format.getType(), { format })).not.toBeDefined();
            });
        });

        describe('for identity', () => {
            test('should return same value for Identity', () => {
                const value = ['bar'];
                expect(cast(value, 'identity')).toBe(value);
                expect(cast(null, 'identity')).toBeNull();
            });

            test('should return null', () => {
                expect(cast(null, 'identity')).toBeNull();
            });
        });

        describe('for hierarchy', () => {
            test('should return passed value', () => {
                expect(cast('bar', 'hierarchy')).toBe('bar');
                expect(cast(1, 'hierarchy')).toBe(1);
                expect(cast(null, 'hierarchy')).toBeNull();
                expect(cast(undefined, 'hierarchy')).not.toBeDefined();
            });
        });

        describe('for enum', () => {
            test('should return an Enum from Field', () => {
                const format = getFormatMock('enum') as DictionaryField;
                format.getDictionary = () => {
                    return ['one', 'two'];
                };

                const value: Enum<string> | null = cast(1, Enum, { format });
                expect(value).toBeInstanceOf(Enum);
                expect(value?.get()).toBe(1);
            });

            test('should return an Enum for null if dictionary contains null', () => {
                const format = new EnumField({
                    dictionary: { null: 'null', 0: 'one', 1: 'two' },
                });

                const value: Enum<string> | null = cast(null, Enum, { format });
                expect(value).toBeInstanceOf(Enum);
                expect(value?.get()).toBe(null);
                expect(value?.getAsValue()).toBe('null');
            });

            test("should return null for null if dictionary don't contains null", () => {
                const format = getFormatMock('enum') as EnumField;
                format.getDictionary = () => {
                    return { 0: 'one', 1: 'two' };
                };

                const value = cast(null, Enum, { format });
                expect(value).toBeNull();
            });

            test('should return an Enum from UniversalField', () => {
                const format = getUniversalFormatMock('enum');
                format.meta = {
                    dictionary: ['one', 'two'],
                };

                const value: Enum<string> | null = cast(1, Enum, { format });
                expect(value).toBeInstanceOf(Enum);
                expect(value?.get()).toBe(1);
            });

            test('should return an Enum from UniversalField', () => {
                const format = getUniversalFormatMock('enum');
                format.meta = {
                    dictionary: ['one', 'two'],
                };

                const value: Enum<string> | null = cast(1, Enum, { format });
                expect(value).toBeInstanceOf(Enum);
                expect(value?.get()).toBe(1);
            });

            test('should return an Enum from shortcut', () => {
                const format = getFormatMock('enum') as EnumField;
                format.getDictionary = () => {
                    return [];
                };

                const value = cast(1, 'enum', { format });
                expect(value).toBeInstanceOf(Enum);
            });

            test('should return same instance for Enum', () => {
                const value = new Enum();

                expect(cast(value, Enum)).toBe(value);
            });

            test('should return passed value', () => {
                const format = getFormatMock('enum');
                expect(cast(null, Enum, { format })).toBeNull();
                expect(cast(undefined, Enum, { format })).not.toBeDefined();
            });
        });

        describe('for flags', () => {
            test('should return a Flags from Field', () => {
                const format = getFormatMock('flags') as EnumField;
                format.getDictionary = () => {
                    return ['one', 'two', 'three'];
                };

                const value: Flags<string> | null = cast([true, null, false], Flags, {
                    format,
                });
                expect(value).toBeInstanceOf(Flags);
                expect(value?.get('one')).toBe(true);
                expect(value?.get('two')).toBeNull();
                expect(value?.get('three')).toBe(false);
                expect(value?.get('four')).not.toBeDefined();
            });

            test('should return a Flags from UniversalField', () => {
                const format = getUniversalFormatMock('flags');
                format.meta = {
                    dictionary: ['one', 'two', 'three'],
                };

                const value: Flags<string> | null = cast([true, null, false], Flags, {
                    format,
                });
                expect(value).toBeInstanceOf(Flags);
                expect(value?.get('one')).toBe(true);
                expect(value?.get('two')).toBeNull();
                expect(value?.get('three')).toBe(false);
                expect(value?.get('four')).not.toBeDefined();
            });

            test('should return a Flags from shortcut', () => {
                const format = getFormatMock('flags') as FlagsField;
                format.getDictionary = () => {
                    return [];
                };

                const value = cast([true, null, false], 'flags', { format });
                expect(value).toBeInstanceOf(Flags);
            });

            test('should return same instance for Flags', () => {
                const value = new Flags();

                expect(cast(value, Flags)).toBe(value);
            });

            test('should return passed value', () => {
                const format = getFormatMock('flags');
                expect(cast(null, Flags, { format })).toBeNull();
                expect(cast(undefined, Flags, { format })).not.toBeDefined();
            });
        });

        describe('for record', () => {
            test('should return a Model from UniversalField', () => {
                const value: Model | null = cast({ foo: 'bar' }, Model, {
                    format: getUniversalFormatMock('record'),
                    adapter: new JsonAdapter(),
                });

                expect(value).toBeInstanceOf(Model);
                expect(value?.getAdapter()).toBeInstanceOf(JsonAdapter);
                expect(value?.get('foo')).toBe('bar');
            });

            test('should return a Model from shortcut', () => {
                const value: Model | null = cast({ foo: 'bar' }, 'record', {
                    format: getUniversalFormatMock('record'),
                    adapter: new JsonAdapter(),
                });

                expect(value).toBeInstanceOf(Model);
                expect(value?.get('foo')).toBe('bar');
            });

            test('should return same instance for Record', () => {
                const value = new Model();
                expect(cast(value, 'record')).toBe(value);
            });

            test('should return passed value', () => {
                expect(
                    cast(null, 'record', {
                        format: getUniversalFormatMock('record'),
                        adapter: new JsonAdapter(),
                    })
                ).toBeNull();

                expect(
                    cast(undefined, 'record', {
                        format: getUniversalFormatMock('record'),
                        adapter: new JsonAdapter(),
                    })
                ).not.toBeDefined();
            });
        });

        describe('for recordset', () => {
            test('should return a RecordSet from UniversalField', () => {
                const value: RecordSet | null = cast([{ foo: 'bar' }], RecordSet, {
                    format: getUniversalFormatMock('recordset'),
                    adapter: new JsonAdapter(),
                });

                expect(value).toBeInstanceOf(RecordSet);
                expect(value?.getAdapter()).toBeInstanceOf(JsonAdapter);
                expect(value?.getCount()).toBe(1);
                expect(value?.at(0).get('foo')).toBe('bar');
            });

            test('should return a RecordSet from shortcut', () => {
                const value: RecordSet | null = cast([{ foo: 'bar' }], 'recordset', {
                    format: getUniversalFormatMock('recordset'),
                    adapter: new JsonAdapter(),
                });

                expect(value).toBeInstanceOf(RecordSet);
                expect(value?.at(0).get('foo')).toBe('bar');
            });

            test('should return same instance for RecordSet', () => {
                const value = new RecordSet();
                expect(cast(value, RecordSet)).toBe(value);
            });

            test('should return passed value', () => {
                expect(
                    cast(null, 'recordset', {
                        format: getUniversalFormatMock('recordset'),
                        adapter: new JsonAdapter(),
                    })
                ).toBeNull();

                expect(
                    cast(undefined, 'recordset', {
                        format: getUniversalFormatMock('recordset'),
                        adapter: new JsonAdapter(),
                    })
                ).not.toBeDefined();
            });

            test('should return a RecordSet with the injected model', () => {
                const SomeModel = () => {
                    return {};
                };
                const format = {
                    name: 'foo',
                    type: 'recordset',
                } as UniversalField;
                const value: RecordSet | null = cast([], RecordSet, {
                    format,
                    adapter: new JsonAdapter(),
                    model: SomeModel,
                });

                expect(value?.getModel()).toBe(SomeModel);
            });
        });

        describe('for only type constructor', () => {
            test('should return a Number', () => {
                const value = cast(10, Number);
                expect(value).toBeInstanceOf(Number);
                //@ts-ignore
                expect(+value).toEqual(10);
            });

            test('should return a Date', () => {
                const value: Date | null = cast('2001-02-03', Date);

                expect(value).toBeInstanceOf(Date);
                expect(value?.getFullYear()).toEqual(2001);
                expect(value?.getMonth()).toEqual(1);
                expect(value?.getDate()).toEqual(3);
            });
        });
    });

    describe('.serialize()', () => {
        describe('for integer', () => {
            test('should return a Number', () => {
                const format = getUniversalFormatMock('integer');
                expect(serialize(1, { format })).toBe(1);

                expect(serialize(1.12345, { format })).toBe(1);

                expect(serialize('1', { format })).toBe(1);

                expect(serialize('0890', { format })).toBe(890);
            });

            test('should return a Number from Object', () => {
                const obj = {};
                obj.valueOf = () => {
                    return 33;
                };

                expect(
                    serialize(obj, {
                        format: getUniversalFormatMock('integer'),
                    })
                ).toBe(33);
            });

            test('should return a Number from Array', () => {
                const arr = [1];
                expect(
                    serialize(arr, {
                        format: getUniversalFormatMock('integer'),
                    })
                ).toBe(1);
            });

            test('should return null', () => {
                const format = getUniversalFormatMock('integer');

                expect(serialize('1a', { format })).toBe(null);

                expect(serialize('a', { format })).toBe(null);

                expect(serialize('a1', { format })).toBe(null);
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('integer');

                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for string', () => {
            test('should return passed value', () => {
                //@ts-ignore
                expect(serialize('bar')).toBe('bar');
                //@ts-ignore
                expect(serialize(1)).toBe(1);
                //@ts-ignore
                expect(serialize(null)).toBeNull();
                //@ts-ignore
                expect(serialize(undefined)).not.toBeDefined();
            });
        });

        describe('for link', () => {
            test('should return a Number', () => {
                const format = getUniversalFormatMock('link');

                expect(serialize(1, { format })).toBe(1);

                expect(serialize('1', { format })).toBe(1);

                expect(serialize('1a', { format })).toBe(1);

                expect(serialize('0890', { format })).toBe(890);
            });

            test('should return NaN', () => {
                const format = getUniversalFormatMock('link');

                //@ts-ignore
                expect(isNaN(serialize('a', { format }))).toBe(true);
                //@ts-ignore
                expect(isNaN(serialize('a1', { format }))).toBe(true);
            });

            test('should return passed value', () => {
                //@ts-ignore
                expect(serialize(null)).toBeNull();
                expect(
                    serialize(undefined, {
                        format: getUniversalFormatMock('link'),
                    })
                ).not.toBeDefined();
            });
        });

        describe('for real and double', () => {
            test('should return passed value', () => {
                const format = getUniversalFormatMock('real');

                expect(serialize(1.2, { format })).toBe(1.2);

                expect(serialize('1.2', { format })).toBe('1.2');

                expect(serialize('1a', { format })).toBe('1a');

                expect(serialize('0890', { format })).toBe('0890');

                expect(serialize('a', { format })).toBe('a');

                expect(serialize('a1', { format })).toBe('a1');

                expect(serialize(null, { format })).toBeNull();

                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for money', () => {
            test('should return passed value', () => {
                const format = getUniversalFormatMock('money');

                expect(serialize('1.2', { format })).toBe('1.2');

                expect(serialize('0890', { format })).toBe('0890');

                expect(serialize('1a', { format })).toBe('1a');

                expect(serialize('a', { format })).toBe('a');

                expect(serialize('a1', { format })).toBe('a1');

                expect(serialize(null, { format })).toBeNull();

                expect(serialize(undefined, { format })).not.toBeDefined();
            });

            test('should return passed value if precision less or equal 3', () => {
                const format = getFormatMock('money') as MoneyField;
                format.getPrecision = () => {
                    return 3;
                };

                expect(serialize(1.2, { format })).toBe(1.2);
            });

            test('should return formatted value if precision more than 3', () => {
                const format = new MoneyField({
                    precision: 4,
                });

                expect(serialize(1.2, { format })).toBe('1.2000');
            });

            test('should return passed value if "large" flag is enabled', () => {
                const format = getFormatMock('money') as MoneyField;
                format.isLarge = () => {
                    return true;
                };

                expect(serialize('1.2', { format })).toBe('1.2');
            });
        });

        describe('for datetime, date and time', () => {
            test('should return a String with time zone for datetime', () => {
                const datetime = new Date(1443099268981);
                const format = getUniversalFormatMock('datetime');

                expect(serialize(datetime, { format })).toBe('2015-09-24 15:54:28.981+03');
            });

            test('should return a String without timezone for datetime and UniversalField', () => {
                const datetime = new Date(2001, 3, 15);
                const format = getUniversalFormatMock('datetime');
                format.meta = {
                    withoutTimeZone: true,
                };

                expect(serialize(datetime, { format })).toBe('2001-04-15 00:00:00');
            });

            test('should return a String without timezone for datetime and DateTimeField', () => {
                const format = new DateTimeField({
                    withoutTimeZone: true,
                });
                const datetime = new Date(2001, 3, 15);

                expect(serialize(datetime, { format })).toBe('2001-04-15 00:00:00');
            });

            test('should return a String without timezone if timezome offset contains not integer hours', () => {
                const format = new DateTimeField({
                    withoutTimeZone: true,
                });
                const datetime = new Date(2001, 0, 1, 10, 20, 30);
                patchTzo(datetime, 30);

                expect(datetime.getTimezoneOffset()).toBe(30);
                expect(serialize(datetime, { format })).toBe('2001-01-01 10:20:30');

                revertTzo(datetime);
            });

            test('should return a String for date', () => {
                const datetime = new Date(1443099268981);
                const format = getUniversalFormatMock('date');

                expect(serialize(datetime, { format })).toBe('2015-09-24');
            });

            test('should return a String for time without timezone', () => {
                const datetime = new Date(1443099268981);
                const format = getUniversalFormatMock('time');

                expect(serialize(datetime, { format })).toBe('15:54:28.981');
            });

            test('should return a String for Infinity', () => {
                expect(
                    serialize(Infinity, {
                        format: getUniversalFormatMock('date'),
                    })
                ).toEqual('infinity');
            });

            test('should return a String for -Infinity', () => {
                expect(
                    serialize(-Infinity, {
                        format: getUniversalFormatMock('date'),
                    })
                ).toEqual('-infinity');
            });

            test('should return a String with current date for empty string', () => {
                expect(serialize('', { format: getUniversalFormatMock('date') })).toBe(
                    dateToSql(new Date(), MODE.DATE)
                );
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('datetime');

                expect(serialize('bar', { format })).toBe('bar');
                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for timeinterval', () => {
            test('should return a String', () => {
                const interval = new TimeInterval('P10DT0H0M0S');
                expect(
                    serialize(interval, {
                        format: getUniversalFormatMock('timeinterval'),
                    })
                ).toBe('P10DT0H0M0S');
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('timeinterval');

                expect(serialize('P10DT0H0M0S', { format })).toBe('P10DT0H0M0S');
                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for array', () => {
            test('should return an Array of String from Field', () => {
                const format = getFormatMock('array') as ArrayField;
                format.getKind = () => {
                    return 'string';
                };

                const array = ['foo', 'bar'];

                expect(serialize(array, { format })).toEqual(['foo', 'bar']);
            });

            test('should return an Array of Number from UniversalField', () => {
                const format = getUniversalFormatMock('array');
                format.meta = {
                    kind: 'integer',
                };

                const array = ['1', '2a', 3];

                expect(serialize(array, { format })).toEqual([1, null, 3]);
            });

            test('should return an Array from scalar', () => {
                const format = new ArrayField({
                    kind: 'string',
                });

                expect(serialize('foo', { format })).toEqual(['foo']);
            });

            test('should return passed value', () => {
                const format = getFormatMock('array');

                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for identity', () => {
            test('should return passed value', () => {
                const format = getUniversalFormatMock('identity');

                expect(serialize('foo', { format })).toEqual('foo');

                expect(serialize(['foo'], { format })).toEqual(['foo']);
            });

            test('should return null', () => {
                expect(
                    serialize(null, {
                        format: getUniversalFormatMock('identity'),
                    })
                ).toBeNull();
            });
        });

        describe('for hierarchy', () => {
            test('should return passed value', () => {
                const format = getUniversalFormatMock('hierarchy');

                expect(serialize('bar', { format })).toBe('bar');

                expect(serialize(1, { format })).toBe(1);

                expect(serialize(null, { format })).toBeNull();

                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for enum', () => {
            test('should return Number from Enum', () => {
                const value = new Enum({
                    dictionary: ['one', 'two'],
                    index: 1,
                });

                expect(
                    serialize(value, {
                        format: getUniversalFormatMock('enum'),
                    })
                ).toBe(1);
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('enum');

                expect(serialize('bar', { format })).toBe('bar');

                expect(serialize(null, { format })).toBeNull();

                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for flags', () => {
            test('should return an Array from Flags', () => {
                const value = new Flags({
                    dictionary: ['one', 'two', 'three'],
                    values: [null, true, false],
                });

                expect(
                    serialize(value, {
                        format: getUniversalFormatMock('flags'),
                    })
                ).toEqual([null, true, false]);
            });

            test('should return an Array from Array', () => {
                const value = [true, null, false];

                expect(
                    serialize(value, {
                        format: getUniversalFormatMock('flags'),
                    })
                ).toBe(value);
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('flags');

                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for record', () => {
            test("should return Model's raw data", () => {
                const rawData = { foo: 'bar' };
                const value = new Model({ rawData });

                expect(
                    serialize(value, {
                        format: getUniversalFormatMock('record'),
                    })
                ).toBe(rawData);
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('record');

                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });

        describe('for recordset', () => {
            test("should return RecordSet's raw data", () => {
                const rawData = [{ foo: 'bar' }];
                const value = new RecordSet({ rawData });

                expect(
                    serialize(value, {
                        format: getUniversalFormatMock('recordset'),
                    })
                ).toBe(rawData);
            });

            test('should return build RecordSet from List', () => {
                const data = { foo: 'bar' };
                const rec = new Model({ rawData: data });
                const value = new List({ items: [rec] });
                const format = getUniversalFormatMock('recordset');

                expect(serialize(value, { format })).toEqual([data]);
            });

            test('should return passed value', () => {
                const format = getUniversalFormatMock('recordset');

                expect(serialize(null, { format })).toBeNull();
                expect(serialize(undefined, { format })).not.toBeDefined();
            });
        });
    });
});
