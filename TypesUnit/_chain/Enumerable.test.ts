import Enumerable from 'Types/_chain/Enumerable';
import Record from 'Types/_entity/Record';
import List from 'Types/_collection/List';

describe('Types/_chain/Enumerable', () => {
    let data: { [name: string]: number };
    let items: Record;
    let chain: Enumerable<string, string>;

    beforeEach(() => {
        data = { one: 1, two: 2, three: 3 };
        items = new Record({ rawData: data });
        chain = new Enumerable(items);
    });

    afterEach(() => {
        chain.destroy();
        items.destroy();
    });

    describe('.constructor()', () => {
        it('should throw an error on invalid argument', () => {
            let chain;

            expect(() => {
                chain = new Enumerable(undefined);
            }).toThrow();
            expect(() => {
                chain = new Enumerable([]);
            }).toThrow();
            expect(() => {
                chain = new Enumerable({});
            }).toThrow();
            expect(() => {
                chain = new Enumerable('');
            }).toThrow();
            expect(() => {
                chain = new Enumerable(0);
            }).toThrow();
            expect(() => {
                chain = new Enumerable(null);
            }).toThrow();

            expect(chain).not.toBeDefined();
        });
    });

    describe('.getEnumerator()', () => {
        it('should return enumerator with all properties', () => {
            const enumerator = chain.getEnumerator();
            const keys = Object.keys(data);
            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(keys[index]);
                index++;
            }
            expect(index).toEqual(keys.length);
        });
    });

    describe('.each()', () => {
        it('should return all properties and values', () => {
            const keys = Object.keys(data);
            let index = 0;
            chain.each((key, value) => {
                expect(key).toEqual(keys[index]);
                expect(value).toEqual(data[key]);
                index++;
            });
            expect(index).toBe(keys.length);
        });
    });

    describe('.toArray()', () => {
        it('should return all properties for Record', () => {
            expect(chain.toArray()).toEqual(Object.keys(data));
        });

        it('should return all items for List', () => {
            const data = ['one', 'two', 'three'];
            const items = new List({ items: data });
            const chain = new Enumerable(items);

            expect(chain.toArray()).toEqual(data);
        });
    });

    describe('.toObject()', () => {
        it('should return equal object for Record', () => {
            expect(chain.toObject()).toEqual(data);
        });

        it('should return all items for List', () => {
            const data = ['one', 'two', 'three'];
            const items = new List({ items: data });
            const chain = new Enumerable(items);
            const obj = chain.toObject();

            for (let i = 0; i < data.length; i++) {
                expect(obj[i]).toBe(data[i]);
            }
        });
    });
});
