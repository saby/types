import { assert } from 'chai';
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

    afterEach(() => {
        interval = undefined;
    });

    describe('.constructor()', () => {
        it('should throw an Error for empty string', () => {
            assert.throws(() => {
                return new TimeInterval('');
            });
        });
    });

    describe('.getDays()', () => {
        it('should return this day by default', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.getDays(), 0);
        });
    });

    describe('.addDays()', () => {
        it('should return previous day', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.addDays(-1).getDays(), -1);
        });
    });

    describe('.subDays()', () => {
        it('should return next day', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.subDays(-1).getDays(), 1);
        });
    });

    describe('.addHours()', () => {
        it('should return previous hour', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.addHours(-1).getHours(), -1);
        });
    });

    describe('.subHours()', () => {
        it('should return next hour', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.subHours(-1).getHours(), 1);
        });
    });

    describe('.getTotalHours()', () => {
        it('should return hours of all days', () => {
            assert.equal(
                interval.getTotalHours(),
                interval.getDays() * 24 + interval.getHours()
            );
        });
    });

    describe('.addMinutes()', () => {
        it('should return previous minute', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.addMinutes(-1).getMinutes(), -1);
        });
    });

    describe('.subMinutes()', () => {
        it('should return next minute', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.subMinutes(-1).getMinutes(), 1);
        });
    });

    describe('.getTotalMinutes()', () => {
        it('should return minutes of all hours', () => {
            assert.equal(
                interval.getTotalMinutes(),
                interval.getTotalHours() * 60 + interval.getMinutes()
            );
        });
    });

    describe('.addSeconds()', () => {
        it('should return previous second', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.addSeconds(-1).getSeconds(), -1);
        });
    });

    describe('.subSeconds()', () => {
        it('should return next second', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.subSeconds(-1).getSeconds(), 1);
        });
    });

    describe('.getTotalSeconds()', () => {
        it('should return seconds of all minutes', () => {
            assert.equal(
                interval.getTotalSeconds(),
                interval.getTotalMinutes() * 60 + interval.getSeconds()
            );
        });
    });
    describe('.addMilliseconds()', () => {
        it('should return previous millisecond', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.addMilliseconds(-1).getMilliseconds(), -1);
        });
    });

    describe('.subMilliseconds()', () => {
        it('should return next millisecond', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.subMilliseconds(-1).getMilliseconds(), 1);
        });

        it('should revert initial value', () => {
            const tinterval = new TimeInterval('PT-0.01S');
            const sign = tinterval.toString();
            assert.equal(
                tinterval.addMilliseconds(1.5).subMilliseconds(1.5).toString(),
                sign
            );
        });
    });

    describe('.getTotalMilliseconds()', () => {
        it('should return millisecond of all seconds', () => {
            assert.equal(
                interval.getTotalMilliseconds(),
                interval.getTotalSeconds() * 1000 + interval.getMilliseconds()
            );
        });
    });

    describe('.addToDate()', () => {
        it('should add value to Date', () => {
            let date = new Date(0);
            interval = new TimeInterval({ days: 1 } as unknown as TimeInterval);

            date = interval.addToDate(date);
            assert.equal(date.getTime(), interval.getTotalMilliseconds());
        });
    });

    describe('.subFromDate()', () => {
        it('should reduce value from Date', () => {
            let date = new Date(0);
            interval = new TimeInterval({ days: 1 } as unknown as TimeInterval);

            date = interval.subFromDate(date);
            assert.equal(date.getTime(), -interval.getTotalMilliseconds());
        });
    });

    describe('.calc()', () => {
        let ti1;
        let ti2;

        beforeEach(() => {
            ti1 = new TimeInterval();
            ti2 = new TimeInterval(1);
        });

        afterEach(() => {
            ti1 = undefined;
            ti2 = undefined;
        });

        it('should return false for "=="', () => {
            assert.isFalse(ti1.calc('==', ti2));
        });

        it('should return true for "!="', () => {
            assert.isTrue(ti1.calc('!=', ti2));
        });

        it('should return false for "gt="', () => {
            assert.isFalse(ti1.calc('>=', ti2));
        });

        it('should return true for "lt="', () => {
            assert.isTrue(ti1.calc('<=', ti2));
        });

        it('should return false for "gt"', () => {
            assert.isFalse(ti1.calc('>', ti2));
        });

        it('should return true for "lt"', () => {
            assert.isTrue(ti1.calc('<', ti2));
        });

        it('should return valid value for "+"', () => {
            assert.equal(ti1.calc('+', ti2).toString(), 'P0DT0H0M0.001S');
        });

        it('should return valid value for "-"', () => {
            assert.equal(ti1.calc('-', ti2).toString(), 'P0DT0H0M-0.001S');
        });

        it('should return valid value for "+="', () => {
            assert.equal(ti1.calc('+=', ti2).toString(), 'P0DT0H0M0.001S');
        });

        it('should return valid value for "-="', () => {
            assert.equal(ti1.calc('-=', ti2).toString(), 'P0DT0H0M-0.001S');
        });

        it('throw an Error for invalid value in "=="', () => {
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
                assert.throws(() => {
                    interval.calc('==', arr[i] as unknown as TimeInterval);
                });
            }
        });
    });

    describe('.clone()', () => {
        it('should return equal values', () => {
            const clone = interval.clone();
            assert.notEqual(interval, clone);
            assert.equal(interval.toString(), clone.toString());
        });
    });

    describe('.toObject()', () => {
        it('should return valid signature for given value', () => {
            assert.deepEqual(interval.toObject(), {
                days: 1,
                hours: 2,
                minutes: 3,
                seconds: 4,
                milliseconds: 5,
            });
        });
    });

    describe('.toString()', () => {
        it('should return valid signature for given value', () => {
            assert.equal(interval.toString(), 'P1DT2H3M4.005S');
        });

        it('should return valid signature for null', () => {
            const tinterval = new TimeInterval();
            assert.equal(tinterval.set(null).toString(), 'P0DT0H0M0S');
        });

        it('should return valid signature for each value type', () => {
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
                assert.equal(
                    tinterval.set(arr[i][0]).toString(),
                    'P1DT2H3M4.005S',
                    'at ' + arr[i][1]
                );
            }
        });
    });

    describe('::toString()', () => {
        it('should return valid signature for each value type', () => {
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
                assert.equal(
                    TimeInterval.toString(arr[i][0]),
                    'P1DT2H3M4.005S',
                    'at ' + arr[i][1]
                );
            }
        });
    });

    describe('.valueOf()', () => {
        it('should be relation to toString', () => {
            assert.strictEqual(interval.valueOf(), interval.toString());
        });
    });

    describe('.toJSON()', () => {
        it('should serialize a TimeInterval', () => {
            const json = interval.toJSON();

            assert.strictEqual(json.module, 'Types/entity:TimeInterval');
            assert.isNumber(json.id);
            assert.isTrue(json.id > 0);
        });

        it('should save ISO time string into state', () => {
            const json = interval.toJSON();

            assert.equal(json.state.$options, 'P1DT2H3M4.005S');
        });
    });

    describe('.fromJSON()', () => {
        it('should create TimeInterval from $options', () => {
            const timeString = 'P5DT2H2M56S';
            const instance = TimeInterval.fromJSON({
                $serialized$: 'inst',
                module: 'Types/entity:TimeInterval',
                id: 1,
                state: {
                    $options: timeString,
                },
            });

            assert.equal(instance.toString(), timeString);
        });
    });
});
