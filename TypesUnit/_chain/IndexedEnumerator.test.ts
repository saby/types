import IndexedEnumerator from 'Types/_chain/IndexedEnumerator';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';

describe('Types/_chain/IndexedEnumerator', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['a', 'b', 'c'];
        prev = new ArrayMock(items);
    });

    describe('.getCurrent()', () => {
        it('should return undefined by default', () => {
            const enumerator = new IndexedEnumerator(prev);
            expect(enumerator.getCurrent()).not.toBeDefined();
        });
    });

    describe('.getCurrentIndex()', () => {
        it('should return -1 by default', () => {
            const enumerator = new IndexedEnumerator(prev);
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });
    });

    describe('.moveNext()', () => {
        it('should enum items with original indices', () => {
            const enumerator = new IndexedEnumerator(prev);

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(items[index]);
                //@ts-ignore
                expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
                index++;
            }
            expect(index).toBe(items.length);
        });
    });
});
