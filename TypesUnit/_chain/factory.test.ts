import chain from 'Types/_chain/factory';
import Abstract from 'Types/_chain/Abstract';
import Arraywise from 'Types/_chain/Arraywise';
import Objectwise from 'Types/_chain/Objectwise';
import Counted from 'Types/_chain/Counted';
import Enumerable from 'Types/_chain/Enumerable';
import List from 'Types/_collection/List';

class Foo<T> extends Abstract<T> {
    constructor(source: Abstract<T> | any) {
        super(source);
    }
}

describe('Types/_chain/factory', () => {
    describe('.constructor()', () => {
        test('should return chain back', () => {
            const abstractChain = new Foo({} as any);
            expect(chain(abstractChain)).toBe(abstractChain);
        });

        test('should return Arraywise', () => {
            expect(chain([])).toBeInstanceOf(Arraywise);
        });

        test('should return Objectwise', () => {
            expect(chain({})).toBeInstanceOf(Objectwise);
        });

        test('should return Enumerable', () => {
            expect(chain(new List())).toBeInstanceOf(Enumerable);
        });
    });

    describe('.group()', () => {
        test('should group elements', () => {
            const result = chain([
                { title: 'Apple', kind: 'fruit' },
                { title: 'Cherry', kind: 'fruit' },
                { title: 'Cucumber', kind: 'vegetable' },
                { title: 'Pear', kind: 'fruit' },
                { title: 'Potato', kind: 'vegetable' },
            ])
                .group('kind', 'title')
                .toObject();

            expect(result).toEqual({
                fruit: ['Apple', 'Cherry', 'Pear'],
                vegetable: ['Cucumber', 'Potato'],
            });
        });
    });

    describe('.count()', () => {
        test('should count all elements', () => {
            const result = chain([1, 2, 3]).count();
            expect(result).toEqual(3);
        });

        test('should count aggregated elements', () => {
            const result = (
                chain([1, 2, 3]).count((item) => {
                    return item % 2 === 0;
                }) as Counted<number>
            ).value();
            expect(result).toEqual([2, 1]);
        });
    });

    describe('.max()', () => {
        test('should return maximum value', () => {
            const result = chain([1, 2, 3]).max();
            expect(result).toEqual(3);
        });

        test('should return first value', () => {
            const result = chain([2]).max();
            expect(result).toEqual(2);
        });

        test('should return undefined for empty collection', () => {
            const result = chain([]).max();
            expect(result).not.toBeDefined();
        });
    });

    describe('.min()', () => {
        test('should return minimum value', () => {
            const result = chain([1, 2, 3]).min();
            expect(result).toEqual(1);
        });

        test('should return first value', () => {
            const result = chain([2]).min();
            expect(result).toEqual(2);
        });

        test('should return undefined for empty collection', () => {
            const result = chain([]).min();
            expect(result).not.toBeDefined();
        });
    });
});
