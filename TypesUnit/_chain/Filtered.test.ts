import FilteredChain from 'Types/_chain/Filtered';
import Abstract from 'Types/_chain/Abstract';
import Mock from './ArrayMock';

describe('Types/_chain/Filtered', () => {
    let items: string[];
    let prev: Abstract<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        prev = new Mock(items);
    });

    describe('.getEnumerator()', () => {
        it('should return a valid enumerator', () => {
            const filter = () => {
                return undefined;
            };
            const filterContext = {};
            //@ts-ignore
            const chain = new FilteredChain(prev, filter, filterContext);
            const enumerator = chain.getEnumerator();

            expect(enumerator.getCurrent()).not.toBeDefined();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });

        it('should return an enumerator with next value', () => {
            const filter = (item: string) => {
                return item === 'one' || item === 'three';
            };
            const expectData = ['one', 'three'];
            const filterContext = {};
            const chain = new FilteredChain(prev, filter, filterContext);
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

        it('should return an enumerator and reset it', () => {
            const filter = (item: string) => {
                return item === 'one' || item === 'three';
            };
            const expectData = ['one', 'three'];
            const filterContext = {};
            const chain = new FilteredChain(prev, filter, filterContext);
            const enumerator = chain.getEnumerator();

            enumerator.moveNext();
            enumerator.reset();

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
    });
});
