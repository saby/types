import dateInterval from 'Types/_entity/compare/dateInterval';
import { Units as dateUnits } from 'Types/_entity/compare/dateDifference';

describe('Types/_entity/compare/dateInterval', () => {
    test('should return 1 for the same dates if interval is a day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 2, 0, 0);
        expect(dateInterval(begin, end, dateUnits.Day)).toBe(1);
    });

    test('should return 0 for the same dates if interval is a day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 1, 22, 0);
        expect(dateInterval(begin, end, dateUnits.Day)).toBe(0);
    });

    test('should return 3 for the same dates if interval is a day', () => {
        const begin = new Date(2020, 0, 1, 0, 0);
        const end = new Date(2020, 0, 4, 0, 0);
        expect(dateInterval(begin, end, dateUnits.Day)).toBe(3);
    });

    test('should return 0 for the same dates if interval is a month', () => {
        const date = new Date();
        expect(dateInterval(date, date, dateUnits.Month)).toBe(0);
    });

    test('should return 1 if interval is a full month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-31');
        expect(dateInterval(begin, end, dateUnits.Month)).toBe(1);
    });

    test('should return 2 if interval is more month but less two month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-03-05');
        expect(dateInterval(begin, end, dateUnits.Month)).toBe(2);
    });

    test('should return 0 if interval is less month', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-01-05');
        expect(dateInterval(begin, end, dateUnits.Month)).toBe(0);
    });

    test('should return 1 if interval is a full year', () => {
        const begin = new Date('2020-01-01');
        const end = new Date('2020-12-31');
        expect(dateInterval(begin, end, dateUnits.Year)).toBe(1);
    });
});
