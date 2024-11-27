import Zipped from 'Types/_chain/Zipped';
import Abstract from 'Types/_chain/Abstract';
import List from 'Types/_collection/List';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Zipped', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two'];
        prev = new ArrayMock(items);
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const chain = new Zipped(prev, []);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        it('should return an enumerator with zipped items', () => {
            const itemsMap = ['1', '2'];
            const expectData = [
                ['one', '1'],
                ['two', '2'],
            ];
            const chain = new Zipped(prev, [itemsMap]);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);
        });

        it('should return an enumerator with IEnumerable-zipped items', () => {
            const itemsMap = new List({ items: ['1', '2'] });
            const expectData = [
                ['one', '1'],
                ['two', '2'],
            ];
            const chain = new Zipped(prev, [itemsMap]);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);
        });

        it('should return an enumerator with zipped items and reset it', () => {
            const itemsMap = ['1', '2'];
            const expectData = [
                ['one', '1'],
                ['two', '2'],
            ];
            const chain = new Zipped(prev, [itemsMap]);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);
        });
    });
});
