import jsonize from 'Types/_source/jsonize';
import Record from 'Types/_entity/Record';
import RecordSet from 'Types/_collection/RecordSet';
import DataSet from 'Types/_source/DataSet';
import DateTime from 'Types/_entity/applied/DateTime';
import TheDate from 'Types/_entity/applied/Date';
import Time from 'Types/_entity/applied/Time';
import { ExtendDate, IExtendDateConstructor } from 'Types/_declarations';
import 'Core/Date';

class ScalarWrapper<T> {
    private value: T;
    constructor(value: T) {
        this.value = value;
    }
    valueOf(): T {
        return this.value;
    }
}

class ComplexObject<T> {
    value: T;
    constructor(value: T) {
        this.value = value;
    }
}

describe('Types/_source/jsonize', () => {
    describe('.jsonize()', () => {
        test('should clone the data', () => {
            const data = {
                a: 1,
                b: '2',
                c: false,
                d: true,
                e: null,
                f: [1, false, true, null, [2], { foo: 'bar' }],
                g: { g1: 2, g2: 'q' },
            };
            expect(jsonize(data)).toEqual(data);
        });

        test("should return the clone of Record's raw data", () => {
            const rawData = { foo: 'bar' };
            const data = {
                rec: new Record({ rawData }),
            };

            expect(jsonize<{ rec: typeof rawData }>(data).rec).toEqual(rawData);
        });

        test("should return the clone of RecordSet's raw data", () => {
            const rawData = [{ foo: 'bar' }];
            const data = {
                rs: new RecordSet({ rawData }),
            };

            expect(jsonize<{ rs: typeof rawData }>(data).rs).toEqual(rawData);
        });

        test("should return the clone of DataSet's raw data", () => {
            const rawData = [[{ foo: 'bar' }]];
            const data = {
                ds: new DataSet({ rawData }),
            };

            expect(jsonize<{ ds: typeof rawData }>(data).ds).toEqual(rawData);
        });

        test('should return wrapped scalar value', () => {
            const foo = new ScalarWrapper('bar');
            expect(jsonize<string>(foo)).toEqual('bar');
        });

        test('should throw TypeError for unsupported complex object', () => {
            const foo = new ComplexObject('bar');

            expect(() => {
                jsonize(foo);
            }).toThrow();
        });

        test('should process special DateTime type', () => {
            const dateTime = new DateTime(2019, 6, 12);

            expect(jsonize<string>(dateTime).substr(0, 22)).toEqual('2019-07-12 00:00:00+03');
        });

        test('should process special Date type', () => {
            const date = new TheDate(2019, 6, 12);

            expect(jsonize<string>(date)).toEqual('2019-07-12');
        });

        test('should process special Time type', () => {
            const time = new Time(2019, 6, 12, 16, 7, 14);

            expect(jsonize<string>(time).substr(0, 8)).toEqual('16:07:14');
        });

        test("should process special Date type inside Record's raw data", () => {
            const date = new TheDate(2019, 6, 12);
            const rawData = { foo: date };
            const record = new Record({ rawData });

            expect(jsonize<{ foo: string }>(record)).toEqual({
                foo: '2019-07-12',
            });
        });

        test('should return Date as full string using "datetime" serialization mode', () => {
            const year = 2023;
            const month = 7;
            const day = 11;
            const hour = 10;
            const minute = 22;
            const seconds = 33;
            const date = new Date(year, month, day, hour, minute, seconds) as ExtendDate;

            if (date.setSQLSerializationMode) {
                date.setSQLSerializationMode(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATETIME
                );
                expect(jsonize<string>(date).startsWith('2023-08-11 10:22:33')).toBe(true);
            }
        });

        test("should return shared Record's raw data if there is nothing to process", () => {
            const rawData = { foo: 'bar' };
            const record = new Record({ rawData });

            expect(jsonize<{ foo: string }>(record)).toBe(rawData);
        });

        test('should return Date as string use default serialization mode', () => {
            const year = 2016;
            const month = 11;
            const day = 12;
            const date = new Date(year, month, day);

            expect(jsonize<string>(date)).toEqual('2016-12-12');
        });

        test('should return Date as string use "datetime" serialization mode', () => {
            const year = 2016;
            const month = 11;
            const day = 12;
            const date = new Date(year, month, day) as ExtendDate;

            if (date.setSQLSerializationMode) {
                date.setSQLSerializationMode(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATETIME
                );
                expect(jsonize<string>(date).startsWith('2016-12-12 00:00:00')).toBe(true);
            }
        });
    });
});
