import dateDifference, { Units } from 'Types/_entity/compare/dateDifference';

describe('Types/_entity/compare/dateDifference', () => {
    test('should return 0 for the same dates', () => {
        const date = new Date();
        expect(dateDifference(date, date)).toBe(0);
    });

    test('should return 0 for not a Date', () => {
        //@ts-ignore
        expect(dateDifference(0 as unknown as Date, null)).toBe(0);
    });

    test('should return milliseconds by default', () => {
        const dateA = new Date(2020, 0, 9, 0, 0, 0);
        const dateB = new Date(2020, 0, 9, 12, 0, 0);
        expect(dateDifference(dateA, dateB)).toBe(43200000);
    });

    test('should return difference in years', () => {
        const dateA = new Date(2019, 11, 31);
        const dateB = new Date(2020, 0, 1);
        expect(dateDifference(dateA, dateB, Units.Year)).toBe(1);
    });

    test('should return zero for same years', () => {
        const dateA = new Date(2020, 0, 1);
        const dateB = new Date(2020, 11, 1);
        expect(dateDifference(dateA, dateB, Units.Year)).toBe(0);
    });

    test('should return difference in months', () => {
        const dateA = new Date(2019, 10, 30);
        const dateB = new Date(2020, 0, 1);
        expect(dateDifference(dateA, dateB, Units.Month)).toBe(2);
    });

    test('should return zero for same months', () => {
        const dateA = new Date(2020, 0, 1);
        const dateB = new Date(2020, 0, 31);
        expect(dateDifference(dateA, dateB, Units.Month)).toBe(0);
    });

    test('should return difference in days', () => {
        const dateA = new Date(2019, 11, 31);
        const dateB = new Date(2020, 0, 1);
        expect(dateDifference(dateA, dateB, Units.Day)).toBe(1);
    });

    test('should return difference in negative days', () => {
        const dateA = new Date(2019, 11, 31);
        const dateB = new Date(2020, 0, 1);
        expect(dateDifference(dateB, dateA, Units.Day)).toBe(-1);
    });

    test('should return zero for same days', () => {
        const dateA = new Date(2020, 11, 20, 0);
        const dateB = new Date(2020, 11, 20, 1);
        expect(dateDifference(dateA, dateB, Units.Day)).toBe(0);
    });

    test('should return one day when hours difference less than 24', () => {
        const dateA = new Date(2020, 6, 22, 23);
        const dateB = new Date(2020, 6, 23, 1);
        expect(dateDifference(dateA, dateB, Units.Day)).toBe(1);
    });

    test('should return actual days when hours difference less than 24', () => {
        const dateA = new Date(2020, 4, 31, 23);
        const dateB = new Date(2020, 5, 2, 1);
        expect(dateDifference(dateA, dateB, Units.Day)).toBe(2);
    });
});
