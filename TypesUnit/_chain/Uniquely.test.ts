import Uniquely from 'Types/_chain/Uniquely';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Uniquely', () => {
    let items: (string | number)[];
    let prev: Abstract<string | number>;

    beforeEach(() => {
        items = ['one', 'two', 'three', 'two', 1, 2, 'One'];
        prev = new ArrayMock(items);
    });

    describe('.getEnumerator()', () => {
        test('should return a valid enumerator', () => {
            //@ts-ignore
            const chain = new Uniquely(prev);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        test('should return an enumerator with unique scalars', () => {
            const expectData = ['one', 'two', 'three', 1, 2, 'One'];
            //@ts-ignore
            const chain = new Uniquely(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
                index++;
            }
            expect(index).toBe(expectData.length);
        });

        test('should return an enumerator with unique objects', () => {
            const sameItem = { id: 2 };
            const items = [{ id: 1 }, sameItem, { id: 3 }, sameItem, { id: 5 }];
            const prev = new ArrayMock(items);
            const expectData = [1, 2, 3, 5];
            //@ts-ignore
            const chain = new Uniquely(prev);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent().id).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
                index++;
            }
            expect(index).toBe(expectData.length);
        });

        test('should return an enumerator with items with unique property value', () => {
            const items = [
                { id: 1, foo: 'bar' },
                { id: 2, foo: 'bar' },
                { id: 3, foo: 'baz' },
                { id: 4, foo: 'bar' },
            ];
            const prev = new ArrayMock(items);
            const expectData = [1, 3];
            const chain = new Uniquely(prev, (item) => {
                return item.foo;
            });
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent().id).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(items.indexOf(enumerator.getCurrent()));
                index++;
            }
            expect(index).toBe(expectData.length);
        });
    });
});
