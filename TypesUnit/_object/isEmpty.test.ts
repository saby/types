import isEmpty from 'Types/_object/isEmpty';

describe('Types/_object/isEmpty', () => {
    test('should return true for empty object', () => {
        expect(isEmpty({})).toBe(true);
    });

    test('should return false for not empty object', () => {
        expect(isEmpty({ foo: 'bar' })).toBe(false);
    });

    test('should return false for null', () => {
        expect(isEmpty(false)).toBe(false);
    });

    test('should return false for not an object', () => {
        expect(isEmpty(undefined)).toBe(false);
        expect(isEmpty(false)).toBe(false);
        expect(isEmpty(true)).toBe(false);
        expect(isEmpty(0)).toBe(false);
        expect(isEmpty(1)).toBe(false);
    });

    test('should return true for empty Map', () => {
        expect(isEmpty(new Map())).toBe(true);
    });
});
