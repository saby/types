import dateToSql, { MODE } from 'Types/_formatter/dateToSql';
import { DateTime } from 'Types/entity';

describe('Types/_formatter/dateToSql', () => {
    let stubGetTimezoneOffset: jest.SpiedFunction<Date['getTimezoneOffset']>;

    function patchTzo(date: Date, offset: number): void {
        stubGetTimezoneOffset = jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(offset);
    }

    function revertTzo(): void {
        stubGetTimezoneOffset.mockRestore();
    }

    test('should return date and time if mode is not defined', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, 0);
        expect(dateToSql(dt)).toStrictEqual('2010-02-20 23:59:09+00');
        revertTzo();
    });

    test('should return date and time', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, 0);
        expect(dateToSql(dt, MODE.DATETIME)).toStrictEqual('2010-02-20 23:59:09+00');
        revertTzo();
    });

    test('should return positive timezone for negative offset', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, -60);
        expect(dateToSql(dt)).toStrictEqual('2010-02-20 23:59:09+01');
        revertTzo();
    });

    test('should return negative timezone for positive offset', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, 60);
        expect(dateToSql(dt)).toStrictEqual('2010-02-20 23:59:09-01');
        revertTzo();
    });

    test('should return timezone without minutes', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, 10 * 60);
        expect(dateToSql(dt)).toStrictEqual('2010-02-20 23:59:09-10');
        revertTzo();
    });

    test('should return timezone with minutes', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, 10 * 60 + 20);
        expect(dateToSql(dt)).toStrictEqual('2010-02-20 23:59:09-10:20');
        revertTzo();
    });

    test('should return date and time whith milisenconds if there are defined', () => {
        const dt = new Date(1443099268981);
        patchTzo(dt, 0);
        expect(dateToSql(dt, MODE.DATETIME)).toStrictEqual('2015-09-24 15:54:28.981+00');
        revertTzo();
    });

    test('should return date', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        expect(dateToSql(dt, MODE.DATE)).toStrictEqual('2010-02-20');
    });

    test('should return time', () => {
        const dt = new Date(2010, 1, 20, 23, 59, 9);
        patchTzo(dt, 0);
        expect(dateToSql(dt, MODE.TIME)).toStrictEqual('23:59:09+00');
        revertTzo();
    });

    test('should return time without offset for date before Unix epoch', () => {
        const dt = new Date(0, 0, 1, 18, 0, 0);
        expect(dateToSql(dt, MODE.TIME)).toStrictEqual('18:00:00');
    });

    test('should format with date and time by default', () => {
        const date = new Date(2001, 2, 3, 4, 5, 6);
        patchTzo(date, 60);
        expect(dateToSql(date)).toStrictEqual('2001-03-03 04:05:06-01');
        revertTzo();
    });

    test('should format with date and time', () => {
        const date = new Date(2001, 2, 3, 4, 5, 6);
        patchTzo(date, 60);
        expect(dateToSql(date, MODE.DATETIME)).toStrictEqual('2001-03-03 04:05:06-01');
        revertTzo();
    });

    test('should format with date and time and milliseconds', () => {
        const date = new Date(2001, 2, 3, 4, 5, 6, 7);
        patchTzo(date, 0);
        expect(dateToSql(date, MODE.DATETIME)).toStrictEqual('2001-03-03 04:05:06.007+00');
        revertTzo();
    });

    test('should format with date', () => {
        const date = new Date(2001, 2, 3);
        expect(dateToSql(date, MODE.DATE)).toStrictEqual('2001-03-03');
    });

    test('should format with time', () => {
        const date = new Date(2001, 2, 3, 4, 5, 6);
        patchTzo(date, 60);
        expect(dateToSql(date, MODE.TIME)).toStrictEqual('04:05:06-01');
        revertTzo();
    });

    test('should format with time and milliseconds', () => {
        const date = new Date(2001, 2, 3, 4, 5, 6, 70);
        patchTzo(date, 0);
        expect(dateToSql(date, MODE.TIME)).toStrictEqual('04:05:06.070+00');
        revertTzo();
    });

    test('should format with TZ an DateTime object', () => {
        const date = new DateTime(2001, 2, 3, 4, 5, 6);
        patchTzo(date, 0);
        expect(dateToSql(date, MODE.DATETIME)).toStrictEqual('2001-03-03 04:05:06+00');
        revertTzo();
    });

    test('should format without TZ an DateTime (withoutTimezone option activated)', () => {
        const date = new DateTime(2001, 2, 3, 4, 5, 6, true);
        patchTzo(date, 0);
        expect(dateToSql(date, MODE.DATETIME)).toStrictEqual('2001-03-03 04:05:06');
        revertTzo();
    });
});
