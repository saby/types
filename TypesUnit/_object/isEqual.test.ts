import isEqual from 'Types/_object/isEqual';
import Record from 'Types/_entity/Record';

describe('Types/_object/isEqual', () => {
    test('should return true for nulls', () => {
        expect(isEqual(null, null)).toBe(true);
    });

    test('should return true for booleans', () => {
        expect(isEqual(false, false)).toBe(true);
    });

    test('should return false for booleans', () => {
        expect(isEqual(false, null)).toBe(false);
        expect(isEqual(true, false)).toBe(false);
        expect(isEqual(true, 1)).toBe(false);
    });

    test('should return true for numbers', () => {
        expect(isEqual(0, 0)).toBe(true);
        expect(isEqual(1, 1)).toBe(true);
    });

    test('should return false for numbers', () => {
        expect(isEqual(0, 1)).toBe(false);
        expect(isEqual(0, true)).toBe(false);
    });

    test('should return true for NaNs', () => {
        expect(isEqual(NaN, NaN)).toBe(true);
        expect(isEqual({ a: NaN }, { a: NaN })).toBe(true);
    });

    test('should return true for strings', () => {
        expect(isEqual('', '')).toBe(true);
        expect(isEqual('a', 'a')).toBe(true);
    });

    test('should return false for strings', () => {
        expect(isEqual('a', 'b')).toBe(false);
        expect(isEqual('0', 0)).toBe(false);
    });

    test('should return true for string objects', () => {
        expect(isEqual(String(''), String(''))).toBe(true);
        expect(isEqual(String('a'), String('a'))).toBe(true);
    });

    test('should return false for string objects', () => {
        expect(isEqual(String('a'), String('b'))).toBe(false);
    });

    test('should return true for dates', () => {
        expect(isEqual(new Date(1, 2, 3), new Date(1, 2, 3))).toBe(true);
    });

    test('should return false for dates', () => {
        expect(isEqual(new Date(1, 2, 3), new Date(1, 2, 4))).toBe(false);
        expect(isEqual(new Date(1, 2, 3), 1)).toBe(false);
    });

    test('should return true for arrays', () => {
        expect(isEqual([], [])).toBe(true);
        expect(isEqual([1, 2, '3'], [1, 2, '3'])).toBe(true);
    });

    test('should return false for arrays', () => {
        expect(isEqual([1, 2, '3'], [1, 2])).toBe(false);
        expect(isEqual([1, 2, '3'], [1, 2, 3])).toBe(false);
        expect(isEqual(new Array(2), [1, 2])).toBe(false);
    });

    test('should return true for objects', () => {
        expect(isEqual({}, {})).toBe(true);
        expect(isEqual({ a: 1, b: '2' }, { a: 1, b: '2' })).toBe(true);
        expect(isEqual({ a: 1, b: '2' }, { b: '2', a: 1 })).toBe(true);
    });

    test('should return false for objects', () => {
        expect(isEqual({ a: 1, b: '2' }, { a: 1, b: 2 })).toBe(false);
    });

    test('should return true for objects with dates', () => {
        expect(isEqual({ a: new Date(1, 2, 3) }, { a: new Date(1, 2, 3) })).toBe(true);
    });

    test('should return false for objects with dates', () => {
        expect(isEqual({ a: new Date(1, 2, 3) }, { a: new Date(1, 2, 4) })).toBe(false);
    });

    test('should return true for the same objects implements IEquatable', () => {
        const recA = new Record({ rawData: {} });
        const recB = new Record({ rawData: {} });
        expect(isEqual(recA, recB)).toBe(true);
        expect(isEqual(recB, recA)).toBe(true);
    });

    test('should return false for not the same objects implements IEquatable', () => {
        const recA = new Record({ rawData: {} });
        const recB = new Record({ rawData: { foo: 'bar' } });
        expect(isEqual(recA, recB)).toBe(false);
        expect(isEqual(recB, recA)).toBe(false);
    });

    test('should return false for mix of objects when some of them implements IEquatable', () => {
        const recA = new Record({ rawData: {} });
        const recB = {};
        expect(isEqual(recA, recB)).toBe(false);
        expect(isEqual(recB, recA)).toBe(false);
    });

    test('should return true for not plain objects', () => {
        class Foo {}

        const fooA = new Foo();
        const fooB = fooA;

        expect(isEqual(fooA, fooB)).toBe(true);
    });

    test('should return false for not plain objects', () => {
        class Foo {}

        const fooA = new Foo();
        const fooB = new Foo();

        expect(isEqual(fooA, fooB)).toBe(false);
    });

    test('should return false when compare an empty object and a date', () => {
        expect(isEqual({ dt: {} }, { dt: new Date() })).toBe(false);
    });
});
