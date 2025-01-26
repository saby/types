import { toEndOf } from 'Types/_transformation/date';
import dateUnit from 'Types/_entity/applied/dateUnit';

describe('Types/_transformation/date', () => {
    describe('toEndOf()', () => {
        test('should return another instance of Date', () => {
            const date = new Date();
            const result = toEndOf(date, dateUnit.Month);
            expect(result).not.toBe(date);
        });

        test("shouldn't modify original instance of Date", () => {
            const date = new Date();
            const dateStamp = date.getTime();
            toEndOf(date, dateUnit.Month);
            expect(date.getTime()).toEqual(dateStamp);
        });

        test('should return valid end of December', () => {
            const date = new Date(2020, 11, 1);
            const result = toEndOf(date, dateUnit.Month);
            expect(result.getFullYear()).toBe(2020);
            expect(result.getMonth()).toBe(11);
            expect(result.getDate()).toBe(31);
        });

        test('should return valid end of February in a regular year', () => {
            const date = new Date(2019, 1, 1);
            const result = toEndOf(date, dateUnit.Month);
            expect(result.getFullYear()).toBe(2019);
            expect(result.getMonth()).toBe(1);
            expect(result.getDate()).toBe(28);
        });

        test('should return valid end of February in a leap year', () => {
            const date = new Date(2020, 1, 1);
            const result = toEndOf(date, dateUnit.Month);
            expect(result.getFullYear()).toBe(2020);
            expect(result.getMonth()).toBe(1);
            expect(result.getDate()).toBe(29);
        });

        test('should throw an error if unit is not supported', () => {
            const date = new Date();
            expect(() => {
                toEndOf(date, dateUnit.Year);
            }).toThrow();
        });
    });
});
