import Reversed from 'Types/_chain/Reversed';
import Abstract from 'Types/_chain/Abstract';
import ObjectMock, { IItems } from './ObjectMock';
import ArrayMock from './ArrayMock';

describe('Types/_chain/Reversed', () => {
    let itemsObject: IItems<number>;
    let itemsArray: number[];
    let prevObject: Abstract<number>;
    let prevArray: Abstract<number>;

    beforeEach(() => {
        itemsObject = { a: 1, b: 2 };
        itemsArray = [1, 2];
        prevObject = new ObjectMock(itemsObject);
        prevArray = new ArrayMock(itemsArray);
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator for Object', () => {
            const chain = new Reversed(prevObject);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        it('should return a valid enumerator for Array', () => {
            const chain = new Reversed(prevArray);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        it('should return an enumerator with next value for Object', () => {
            const chain = new Reversed(prevObject);
            const enumerator = chain.getEnumerator();
            const keys = Object.keys(itemsObject).reverse();

            let key;
            let index = 0;
            while (enumerator.moveNext()) {
                key = keys[index];
                expect(enumerator.getCurrent()).toBe(itemsObject[key]);
                expect(enumerator.getCurrentIndex()).toBe(key);
                index++;
            }
        });

        it('should return an enumerator with next value for Array', () => {
            const chain = new Reversed(prevArray);
            const enumerator = chain.getEnumerator();
            const max = itemsArray.length - 1;

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(itemsArray[max - index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(itemsArray.length);

            expect(enumerator.getCurrent()).toBe(itemsArray[0]);
            expect(enumerator.getCurrentIndex()).toBe(max);
        });

        it('should return an enumerator and reset it', () => {
            const chain = new Reversed(prevArray);
            const enumerator = chain.getEnumerator();
            const max = itemsArray.length - 1;

            let index = 0;
            enumerator.moveNext();
            enumerator.reset();
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(itemsArray[max - index]);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(itemsArray.length);

            expect(enumerator.getCurrent()).toBe(itemsArray[0]);
            expect(enumerator.getCurrentIndex()).toBe(max);
        });
    });
});
