import Counted from 'Types/_chain/Counted';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Counted', () => {
    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const prev = new ArrayMock([]);
            //@ts-ignore
            const chain = new Counted(prev);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).not.toBeDefined();
        });

        it('should count array of primitives', () => {
            const items = ['one', 'two', 'three', 'two'];
            const prev = new ArrayMock(items);
            //@ts-ignore
            const chain = new Counted(prev);
            const enumerator = chain.getEnumerator();
            const expectedKeys = ['one', 'two', 'three'];
            const expectedValues = [1, 2, 1];

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectedValues[index]);
                expect(enumerator.getCurrentIndex()).toBe(expectedKeys[index]);
                index++;
            }
            expect(index).toBe(expectedKeys.length);
        });

        it('should count by given property', () => {
            const items = [{ id: 1 }, { id: 1 }, { id: 3 }, { id: 2 }];
            const prev = new ArrayMock(items);
            const chain = new Counted(prev, 'id');
            const enumerator = chain.getEnumerator();
            const expectedKeys = [1, 3, 2];
            const expectedValues = [2, 1, 1];

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectedValues[index]);
                expect(enumerator.getCurrentIndex()).toBe(expectedKeys[index]);
                index++;
            }
            expect(index).toBe(expectedKeys.length);
        });

        it('should count by given handler', () => {
            const items = [1, 2, 3, 4, 5];
            const prev = new ArrayMock(items);
            const chain = new Counted(prev, (item) => {
                return item % 2 === 0 ? 'even' : 'odd';
            });
            const enumerator = chain.getEnumerator();
            const expectedKeys = ['odd', 'even'];
            const expectedValues = [3, 2];

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectedValues[index]);
                expect(enumerator.getCurrentIndex()).toBe(expectedKeys[index]);
                index++;
            }
            expect(index).toBe(expectedKeys.length);
        });
    });
});
