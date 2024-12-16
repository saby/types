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
        it('should return chain back', () => {
            const abstractChain = new Foo({} as any);
            expect(chain(abstractChain)).toBe(abstractChain);
        });

        it('should return Arraywise', () => {
            expect(chain([])).toBeInstanceOf(Arraywise);
        });

        it('should return Objectwise', () => {
            expect(chain({})).toBeInstanceOf(Objectwise);
        });

        it('should return Enumerable', () => {
            expect(chain(new List())).toBeInstanceOf(Enumerable);
        });
    });

    describe('.group()', () => {
        it('should group elements', () => {
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
        it('should count all elements', () => {
            const result = chain([1, 2, 3]).count();
            expect(result).toEqual(3);
        });

        it('should count aggregated elements', () => {
            const result = (
                chain([1, 2, 3]).count((item) => {
                    return item % 2 === 0;
                }) as Counted<number>
            ).value();
            expect(result).toEqual([2, 1]);
        });
    });

    describe('.max()', () => {
        it('should return maximum value', () => {
            const result = chain([1, 2, 3]).max();
            expect(result).toEqual(3);
        });

        it('should return first value', () => {
            const result = chain([2]).max();
            expect(result).toEqual(2);
        });

        it('should return undefined for empty collection', () => {
            const result = chain([]).max();
            expect(result).not.toBeDefined();
        });
    });

    describe('.min()', () => {
        it('should return minimum value', () => {
            const result = chain([1, 2, 3]).min();
            expect(result).toEqual(1);
        });

        it('should return first value', () => {
            const result = chain([2]).min();
            expect(result).toEqual(2);
        });

        it('should return undefined for empty collection', () => {
            const result = chain([]).min();
            expect(result).not.toBeDefined();
        });
    });
});
