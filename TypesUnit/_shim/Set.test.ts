//@ts-nocheck
import { SetPolyfill } from 'Types/_shim/Set';

describe('Types/_shim/Set:SetPolyfill', () => {
    let set: SetPolyfill<string>;

    beforeEach(() => {
        set = new SetPolyfill();
    });

    describe('.size', () => {
        test('should return 0 by default', () => {
            expect(set.size).toBe(0);
        });

        test('should return new size after set new entry', () => {
            set.add('foo');
            expect(set.size).toBe(1);
        });

        test('should return new size after delete entry', () => {
            set.add('foo');
            set.delete('foo');
            expect(set.size).toBe(0);
        });
    });

    describe('.add()', () => {
        test('should set a new entry', () => {
            set.add('foo');
            expect(set.has('foo')).toBe(true);
        });

        test('should set a new Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            expect(set.has(foo)).toBe(true);

            const bar = {};
            set.add(bar);
            expect(set.has(bar)).toBe(true);
        });
    });

    describe('.clear()', () => {
        test('should reset the size', () => {
            set.add('foo');
            set.clear();
            expect(set.size).toBe(0);
        });
    });

    describe('.delete()', () => {
        test('should delete the entry', () => {
            set.add('foo');
            const result = set.delete('foo');
            expect(set.has('foo')).toBe(false);
            expect(result).toBe(true);
        });

        test('should do nothing for not exists entry', () => {
            const result = set.delete('foo');
            expect(set.has('foo')).toBe(false);
            expect(result).toBe(false);
        });

        test('should delete the Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            set.delete(foo);
            expect(set.has(foo)).toBe(false);
        });

        test('should do nothing for not exists Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.delete(foo);
            expect(set.has(foo)).toBe(false);
        });

        test('should not found item in foreach', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            set.add('bar');
            set.delete(foo);

            let count = 0;
            set.forEach(() => {
                count++;
            });
            expect(count).toEqual(1);
        });
    });

    describe('.entries()', () => {
        test('should throw an Error', () => {
            expect(() => {
                set.entries();
            }).toThrow();
        });
    });

    describe('.forEach()', () => {
        test('should invoke callback for each entry', () => {
            const set = new SetPolyfill();
            const baz = {};
            const expectData = ['foo', 'bar', baz];

            set.add('foo');
            set.add('bar');
            set.add(baz);

            let index = 0;
            set.forEach((item, key) => {
                expect(item).toBe(expectData[index]);
                expect(key).toBe(expectData[index]);
                index++;
            });
            expect(index).toEqual(expectData.length);
        });

        test('should invoke callback with given context', () => {
            const context = {};

            set.add('foo');
            set.forEach(function (): void {
                expect(this).toBe(context);
            }, context);
        });
    });

    describe('.has()', () => {
        test('should return true for exists entry', () => {
            set.add('foo');
            expect(set.has('foo')).toBe(true);
        });

        test('should return true for exists Object', () => {
            const set = new SetPolyfill();
            const foo = {};
            set.add(foo);
            expect(set.has(foo)).toBe(true);
        });

        test('should return false for not exists entry', () => {
            expect(set.has('foo')).toBe(false);
        });

        test('should correct work with null', () => {
            expect(set.has(null)).toBe(false);
            set.add(null);
            expect(set.has(null)).toBe(true);
            expect(set.has('null')).toBe(false);
        });
    });

    describe('.keys()', () => {
        test('should throw an Error', () => {
            expect(() => {
                set.keys();
            }).toThrow();
        });
    });

    describe('.values()', () => {
        test('should throw an Error', () => {
            expect(() => {
                set.keys();
            }).toThrow();
        });
    });
});
