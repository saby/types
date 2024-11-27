//@ts-nocheck
import { MapPolyfill } from 'Types/_shim/Map';

describe('Types/_shim/Map:MapPolyfill', () => {
    let map: MapPolyfill<string, string>;

    beforeEach(() => {
        map = new MapPolyfill();
    });

    describe('.size', () => {
        test('should return 0 by default', () => {
            expect(map.size).toBe(0);
        });

        test('should return new size after set new entry', () => {
            map.set('foo', 'bar');
            expect(map.size).toBe(1);
        });

        test('should return new size after set new Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            expect(map.size).toBe(1);
        });

        test('should return new size after remove entry', () => {
            map.set('foo', 'bar');
            map.delete('foo');
            expect(map.size).toBe(0);
        });
    });

    describe('.clear()', () => {
        test('should reset the size', () => {
            map.set('foo', 'bar');
            map.clear();
            expect(map.size).toBe(0);
        });

        test('should reset the size with Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            map.clear();
            expect(map.size).toBe(0);
        });
    });

    describe('.delete()', () => {
        test('should delete the entry', () => {
            map.set('foo', 'bar');
            const result = map.delete('foo');
            expect(map.has('foo')).toBe(false);
            expect(result).toBe(true);
        });

        test('should do nothing for not exists entry', () => {
            const result = map.delete('foo');
            expect(map.has('foo')).toBe(false);
            expect(result).toBe(false);
        });

        test('should delete the Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            map.delete(foo);
            expect(map.has(foo)).toBe(false);
        });

        test('should do nothing for not exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.delete(foo);
            expect(map.has(foo)).toBe(false);
        });

        test('should not found item in foreach', () => {
            const map = new MapPolyfill();
            const foo = {};
            let result = false;
            map.set(foo, 'bar');
            map.set('foo', 'bar');
            map.delete(foo);

            map.forEach((item, key) => {
                result = key === foo || result;
            });
            expect(result).toBe(false);
        });
    });

    describe('.entries()', () => {
        test('should throw an Error', () => {
            expect(() => {
                map.entries();
            }).toThrow();
        });
    });

    describe('.forEach()', () => {
        test('should invoke callback for each entry', () => {
            const map = new MapPolyfill();
            const baz = {};
            const expectData = [
                ['foo', 'a'],
                ['bar', 'b'],
                [baz, 'c'],
                ['@key', 'd'],
                [null, 'e'],
            ];

            map.set('foo', 'a');
            map.set('bar', 'b');
            map.set(baz, 'c');
            map.set('@key', 'd');
            map.set(null, 'e');

            let index = 0;
            map.forEach((item, key) => {
                expect(key).toBe(expectData[index][0]);
                expect(item).toBe(expectData[index][1]);
                index++;
            });
            expect(index).toEqual(expectData.length);
        });

        test('should invoke callback with given context', () => {
            const context = {};

            map.set('foo', 'bar');
            map.forEach(function (): void {
                expect(this).toBe(context);
            }, context);
        });
    });

    describe('.get()', () => {
        test('should return an entry value', () => {
            map.set('foo', 'bar');
            expect(map.get('foo')).toBe('bar');
        });

        test('should return an Object value', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'foo');
            expect(map.get(foo)).toBe('foo');

            const bar = {};
            map.set(bar, 'bar');
            expect(map.get(bar)).toBe('bar');
        });

        test('should return undefined if entry is not exists', () => {
            expect(map.get('foo')).not.toBeDefined();
        });

        test('should return undefined if Object is not exists', () => {
            expect(map.get({} as any)).not.toBeDefined();
        });

        test('should return an entry value', () => {
            map.set(null, 'bar');
            expect(map.get(null)).toBe('bar');
        });
    });

    describe('.has()', () => {
        test('should return true for exists entry', () => {
            map.set('foo', 'bar');
            expect(map.has('foo')).toBe(true);
        });

        test('should return true for exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'foo');
            expect(map.has(foo)).toBe(true);

            const bar = {};
            map.set(bar, 'foo');
            expect(map.has(bar)).toBe(true);
        });

        test('should return false for not exists entry', () => {
            expect(map.has('foo')).toBe(false);
        });

        test('should return false for not exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            expect(map.has(foo)).toBe(false);
        });

        test('should correct work with null-key', () => {
            expect(map.has(null)).toBe(false);
            map.set(null, 'foo');
            expect(map.has(null)).toBe(true);
            expect(map.has('null')).toBe(false);
        });
    });

    describe('.keys()', () => {
        test('should throw an Error', () => {
            expect(() => {
                map.keys();
            }).toThrow();
        });
    });

    describe('.set()', () => {
        test('should set a new entry', () => {
            map.set('foo', 'bar');
            expect(map.get('foo')).toBe('bar');
        });

        test('should set a new Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            expect(map.get(foo)).toBe('bar');
        });

        test('should overwrite an exists entry', () => {
            map.set('foo', 'bar');
            map.set('foo', 'baz');
            expect(map.get('foo')).toBe('baz');
        });

        test('should overwrite an exists Object', () => {
            const map = new MapPolyfill();
            const foo = {};
            map.set(foo, 'bar');
            map.set(foo, 'baz');
            expect(map.get(foo)).toBe('baz');
        });
    });

    describe('.values()', () => {
        test('should throw an Error', () => {
            expect(() => {
                map.keys();
            }).toThrow();
        });
    });
});
