import MappedChain from 'Types/_chain/Mapped';
import Abstract from 'Types/_chain/Abstract';
import ArrayMock from './ArrayMock';
import ObjectMock from './ObjectMock';

describe('Types/_chain/Mapped', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two'];
        prev = new ArrayMock(items);
    });

    describe('.getEnumerator()', () => {
        test('should return a valid enumerator', () => {
            const map = () => {
                return undefined;
            };
            const mapContext = {};
            const chain = new MappedChain(prev, map, mapContext);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        test('should return an enumerator with valid values for Array', () => {
            //@ts-ignore
            const map = (item, index) => {
                return [item, index];
            };
            const mapContext = {};
            const chain = new MappedChain(prev, map, mapContext);
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual([items[index], index] as any);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);

            expect(enumerator.getCurrent()).toEqual([items[index - 1], index - 1] as any);
            expect(enumerator.getCurrentIndex()).toBe(index - 1);
        });

        test('should return an enumerator with valid values for Object', () => {
            const items = { foo: 'one', bar: 'two' };
            const keys = Object.keys(items);
            const prev = new ObjectMock(items);
            const chain = new MappedChain(prev, (val, key) => {
                return [val, key];
            });
            const enumerator = chain.getEnumerator();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrentIndex()).toBe(keys[index]);
                expect(enumerator.getCurrent()).toEqual([
                    //@ts-ignore
                    items[enumerator.getCurrentIndex()],
                    enumerator.getCurrentIndex(),
                ] as any);
                index++;
            }
            expect(index).toBe(keys.length);
        });

        test('should return an enumerator and reset it', () => {
            //@ts-ignore
            const map = (item) => {
                return [item];
            };
            const mapContext = {};
            const chain = new MappedChain(prev, map, mapContext);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual([items[index]] as any);
                expect(enumerator.getCurrentIndex()).toBe(index);
                index++;
            }
            expect(index).toBe(items.length);

            expect(enumerator.getCurrent()).toEqual([items[index - 1]] as any);
            expect(enumerator.getCurrentIndex()).toBe(index - 1);
        });
    });
});
