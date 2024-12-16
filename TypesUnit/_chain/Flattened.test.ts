import FlattenedChain from 'Types/_chain/Flattened';
import Abstract from 'Types/_chain/Abstract';
import List from 'Types/_collection/List';
import Mock from './ArrayMock';

describe('Types/_chain/Flattened', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        prev = new Mock(items);
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        it('should return an enumerator with flat items', () => {
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();
            let index = 0;

            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(items[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);
        });

        it('should return an enumerator with flat items after reset', () => {
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(items[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);
        });

        it('should return an enumerator with nesting arrays', () => {
            const items = ['one', ['two', [['three']]]];
            const expectData = ['one', 'two', 'three'];
            const prev = new Mock(items);
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(expectData.length);
        });

        it('should return an enumerator which works well with empty arrays by the way', () => {
            const items = [[], 1, [2, 3]];
            const expectData = [1, 2, 3];
            const prev = new Mock(items);
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(expectData.length);
        });

        it('should return an enumerator with nesting IEnumerable', () => {
            const items = ['one', new List({ items: ['two', [['three']]] })];
            const expectData = ['one', 'two', 'three'];
            const prev = new Mock(items);
            const chain = new FlattenedChain(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(expectData.length);
        });
    });
});
