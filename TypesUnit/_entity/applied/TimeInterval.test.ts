import TimeInterval from 'Types/_entity/applied/TimeInterval';

interface IData {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

function getIntervalData(): IData {
    return {
        days: 1,
        hours: 2,
        minutes: 3,
        seconds: 4,
        milliseconds: 5,
    };
}

function getTimeInterval(): TimeInterval {
    return new TimeInterval(getIntervalData());
}

describe('Types/_entity/applied/TimeInterval', () => {
    let interval: TimeInterval;

    beforeEach(() => {
        interval = getTimeInterval();
    });

    describe('.constructor()', () => {
        test('should throw an Error for empty string', () => {
            expect(() => {
                return new TimeInterval('');
            }).toThrow();
        });
    });

    describe('.getDays()', () => {
        test('should return this day by default', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.getDays()).toEqual(0);
        });
    });

    describe('.addDays()', () => {
        test('should return previous day', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.addDays(-1).getDays()).toEqual(-1);
        });
    });

    describe('.subDays()', () => {
        test('should return next day', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.subDays(-1).getDays()).toEqual(1);
        });
    });

    describe('.addHours()', () => {
        test('should return previous hour', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.addHours(-1).getHours()).toEqual(-1);
        });
    });

    describe('.subHours()', () => {
        test('should return next hour', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.subHours(-1).getHours()).toEqual(1);
        });
    });

    describe('.getTotalHours()', () => {
        test('should return hours of all days', () => {
            expect(interval.getTotalHours()).toEqual(interval.getDays() * 24 + interval.getHours());
        });
    });

    describe('.addMinutes()', () => {
        test('should return previous minute', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.addMinutes(-1).getMinutes()).toEqual(-1);
        });
    });

    describe('.subMinutes()', () => {
        test('should return next minute', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.subMinutes(-1).getMinutes()).toEqual(1);
        });
    });

    describe('.getTotalMinutes()', () => {
        test('should return minutes of all hours', () => {
            expect(interval.getTotalMinutes()).toEqual(
                interval.getTotalHours() * 60 + interval.getMinutes()
            );
        });
    });

    describe('.addSeconds()', () => {
        test('should return previous second', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.addSeconds(-1).getSeconds()).toEqual(-1);
        });
    });

    describe('.subSeconds()', () => {
        test('should return next second', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.subSeconds(-1).getSeconds()).toEqual(1);
        });
    });

    describe('.getTotalSeconds()', () => {
        test('should return seconds of all minutes', () => {
            expect(interval.getTotalSeconds()).toEqual(
                interval.getTotalMinutes() * 60 + interval.getSeconds()
            );
        });
    });
    describe('.addMilliseconds()', () => {
        test('should return previous millisecond', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.addMilliseconds(-1).getMilliseconds()).toEqual(-1);
        });
    });

    describe('.subMilliseconds()', () => {
        test('should return next millisecond', () => {
            const tinterval = new TimeInterval();
            expect(tinterval.subMilliseconds(-1).getMilliseconds()).toEqual(1);
        });

        test('should revert initial value', () => {
            const tinterval = new TimeInterval('PT-0.01S');
            const sign = tinterval.toString();
            expect(tinterval.addMilliseconds(1.5).subMilliseconds(1.5).toString()).toEqual(sign);
        });
    });

    describe('.getTotalMilliseconds()', () => {
        test('should return millisecond of all seconds', () => {
            expect(interval.getTotalMilliseconds()).toEqual(
                interval.getTotalSeconds() * 1000 + interval.getMilliseconds()
            );
        });
    });

    describe('.addToDate()', () => {
        test('should add value to Date', () => {
            let date = new Date(0);
            interval = new TimeInterval({ days: 1 } as unknown as TimeInterval);

            date = interval.addToDate(date);
            expect(date.getTime()).toEqual(interval.getTotalMilliseconds());
        });
    });

    describe('.subFromDate()', () => {
        test('should reduce value from Date', () => {
            let date = new Date(0);
            interval = new TimeInterval({ days: 1 } as unknown as TimeInterval);

            date = interval.subFromDate(date);
            expect(date.getTime()).toEqual(-interval.getTotalMilliseconds());
        });
    });

    describe('.calc()', () => {
        let ti1: TimeInterval;
        let ti2: TimeInterval;

        beforeEach(() => {
            ti1 = new TimeInterval();
            ti2 = new TimeInterval(1);
        });

        test('should return false for "=="', () => {
            expect(ti1.calc('==', ti2)).toBe(false);
        });

        test('should return true for "!="', () => {
            expect(ti1.calc('!=', ti2)).toBe(true);
        });

        test('should return false for "gt="', () => {
            expect(ti1.calc('>=', ti2)).toBe(false);
        });

        test('should return true for "lt="', () => {
            expect(ti1.calc('<=', ti2)).toBe(true);
        });

        test('should return false for "gt"', () => {
            expect(ti1.calc('>', ti2)).toBe(false);
        });

        test('should return true for "lt"', () => {
            expect(ti1.calc('<', ti2)).toBe(true);
        });

        test('should return valid value for "+"', () => {
            expect(ti1.calc('+', ti2).toString()).toEqual('P0DT0H0M0.001S');
        });

        test('should return valid value for "-"', () => {
            expect(ti1.calc('-', ti2).toString()).toEqual('P0DT0H0M-0.001S');
        });

        test('should return valid value for "+="', () => {
            expect(ti1.calc('+=', ti2).toString()).toEqual('P0DT0H0M0.001S');
        });

        test('should return valid value for "-="', () => {
            expect(ti1.calc('-=', ti2).toString()).toEqual('P0DT0H0M-0.001S');
        });

        test('throw an Error for invalid value in "=="', () => {
            const arr = [
                { days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5 },
                [1, 2, 3, 4, 5],
                'P1DT2H3M4.005S',
                93784005,
                true,
                undefined,
                null,
            ];

            for (let i = 0; i < arr.length; i++) {
                expect(() => {
                    interval.calc('==', arr[i] as unknown as TimeInterval);
                }).toThrow();
            }
        });
    });

    describe('.clone()', () => {
        test('should return equal values', () => {
            const clone = interval.clone();
            expect(interval !== clone).toBeTruthy();
            expect(interval.toString()).toEqual(clone.toString());
        });
    });

    describe('.toObject()', () => {
        test('should return valid signature for given value', () => {
            expect(interval.toObject()).toEqual({
                days: 1,
                hours: 2,
                minutes: 3,
                seconds: 4,
                milliseconds: 5,
            });
        });
    });

    describe('.toString()', () => {
        test('should return valid signature for given value', () => {
            expect(interval.toString()).toEqual('P1DT2H3M4.005S');
        });

        test('should return valid signature for null', () => {
            const tinterval = new TimeInterval();
            //@ts-ignore
            expect(tinterval.set(null).toString()).toEqual('P0DT0H0M0S');
        });

        test('should return valid signature for each value type', () => {
            const tinterval = new TimeInterval();
            const arr = [
                [
                    {
                        days: 1,
                        hours: 2,
                        minutes: 3,
                        seconds: 4,
                        milliseconds: 5,
                    },
                    'Object',
                ],
                [[1, 2, 3, 4, 5], 'Array'],
                ['P1DT2H3M4.005S', 'String'],
                [93784005, 'Number'],
            ];

            for (let i = 0; i < arr.length; i++) {
                expect(tinterval.set(arr[i][0]).toString()).toEqual('P1DT2H3M4.005S');
            }
        });
    });

    describe('::toString()', () => {
        test('should return valid signature for each value type', () => {
            const arr = [
                [
                    {
                        days: 1,
                        hours: 2,
                        minutes: 3,
                        seconds: 4,
                        milliseconds: 5,
                    },
                    'Object',
                ],
                [[1, 2, 3, 4, 5], 'Array'],
                ['P1DT2H3M4.005S', 'String'],
                [93784005, 'Number'],
            ];

            for (let i = 0; i < arr.length; i++) {
                expect(TimeInterval.toString(arr[i][0])).toEqual('P1DT2H3M4.005S');
            }
        });
    });

    describe('.valueOf()', () => {
        test('should be relation to toString', () => {
            expect(interval.valueOf()).toBe(interval.toString());
        });
    });

    describe('.toJSON()', () => {
        test('should serialize a TimeInterval', () => {
            const json = interval.toJSON();

            expect(json?.module).toBe('Types/entity:TimeInterval');
            expect(typeof json?.id).toBe('number');
            expect((json?.id as number) > 0).toBe(true);
        });

        test('should save ISO time string into state', () => {
            const json = interval.toJSON();

            expect(json?.state.$options).toEqual('P1DT2H3M4.005S');
        });
    });

    describe('.fromJSON()', () => {
        test('should create TimeInterval from $options', () => {
            const timeString = 'P5DT2H2M56S';
            const instance = TimeInterval.fromJSON({
                $serialized$: 'inst',
                module: 'Types/entity:TimeInterval',
                id: 1,
                state: {
                    $options: timeString,
                },
            });

            expect(instance.toString()).toEqual(timeString);
        });
    });
});
