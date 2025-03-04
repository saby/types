import Sliced from 'Types/_chain/Sliced';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Sliced', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        prev = new ArrayMock(items);
    });

    describe('.getEnumerator()', () => {
        test('should return a valid enumerator', () => {
            const chain = new Sliced(prev, 0, 0);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        test('should return an enumerator with first item', () => {
            const begin = 0;
            const end = 1;
            const expectData = ['one'];
            const chain = new Sliced(prev, begin, end);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(expectData.length);

            expect(enumerator.getCurrent()).toBe(expectData[index - 1]);
            expect(enumerator.getCurrentIndex()).toBe(index - 1);
        });

        test('should return an enumerator with second item', () => {
            const begin = 1;
            const end = 2;
            const expectData = ['two'];
            const chain = new Sliced(prev, begin, end);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
                index++;
            }
            expect(index).toBe(expectData.length);

            expect(enumerator.getCurrent()).toBe(expectData[index - 1]);
            expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
        });

        test('should return an enumerator with first and second items', () => {
            const begin = 0;
            const end = 2;
            const expectData = ['one', 'two'];
            const chain = new Sliced(prev, begin, end);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
                index++;
            }
            expect(index).toBe(expectData.length);

            expect(enumerator.getCurrent()).toBe(expectData[index - 1]);
            expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
        });

        test('should return an enumerator with no items', () => {
            const chainA = new Sliced(prev, 3, 4);
            expect(chainA.getEnumerator().moveNext()).toBe(false);

            const chainB = new Sliced(prev, 0, 0);
            expect(chainB.getEnumerator().moveNext()).toBe(false);

            const chainC = new Sliced(prev, 1, 1);
            expect(chainC.getEnumerator().moveNext()).toBe(false);

            const chainD = new Sliced(prev, 1, 0);
            expect(chainD.getEnumerator().moveNext()).toBe(false);
        });
    });
});
