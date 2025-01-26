import isFullInterval from 'Types/_entity/compare/isFullInterval';
import { Units as dateUnits } from 'Types/_entity/compare/dateDifference';

describe('Types/_entity/compare/isFullInterval', () => {
    test('should return true if interval is a full day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 1, 23, 59);
        expect(isFullInterval(begin, end, dateUnits.Day)).toBe(true);
    });

    test('should return true if interval is a full 3 days', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 4, 23, 59);
        expect(isFullInterval(begin, end, dateUnits.Day)).toBe(true);
    });

    test('should return false if interval is less day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 1, 22, 0);
        expect(isFullInterval(begin, end, dateUnits.Day)).toBe(false);
    });

    test('should return false if interval is more day but less 3 days', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 3, 1, 0);
        expect(isFullInterval(begin, end, dateUnits.Day)).toBe(false);
    });

    test('should return true if interval is a full month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-31');
        expect(isFullInterval(begin, end, dateUnits.Month)).toBe(true);
    });

    test('should return false if interval is less month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-05');
        expect(isFullInterval(begin, end, dateUnits.Month)).toBe(false);
    });

    test('should return false if interval is more month but less two month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-02-05');
        expect(isFullInterval(begin, end, dateUnits.Month)).toBe(false);
    });

    test('should return true if interval is a full year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-12-31');
        expect(isFullInterval(begin, end, dateUnits.Year)).toBe(true);
    });

    test('should return false if interval is more year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2021-01-31');
        expect(isFullInterval(begin, end, dateUnits.Year)).toBe(false);
    });

    test('should return false if interval is less year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-11-01');
        expect(isFullInterval(begin, end, dateUnits.Year)).toBe(false);
    });
});
