import Concatenated from 'Types/_chain/Concatenated';
import Abstract from 'Types/_chain/Abstract';
import List from 'Types/_collection/List';
import Mock from './ArrayMock';

describe('Types/_chain/Concatenated', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        prev = new Mock(items);
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            //@ts-ignore
            const chain = new Concatenated(prev, undefined);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        it('should return an enumerator with concatenated items', () => {
            const toConcat = [
                ['4', '5'],
                ['6', '7'],
            ];
            const expectData = ['one', 'two', 'three', '4', '5', '6', '7'];
            const chain = new Concatenated(prev, toConcat);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(expectData[index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(expectData.length);
        });

        it('should return an enumerator with concatenated items include IEnumerable', () => {
            const toConcat = [['4', '5'], new List({ items: ['6', '7'] })];
            const expectData = ['one', 'two', 'three', '4', '5', '6', '7'];
            const chain = new Concatenated(prev, toConcat);
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
