import listFactory from 'Types/_collection/factory/list';
import { List } from 'Types/collection';

describe('Types/_collection/factory/list', () => {
    let items: string[];
    let itemsList: List<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        itemsList = new List({ items });
    });

    describe('constructor()', () => {
        test('should throw an error on invalid type of argument "items"', () => {
            expect(() => {
                //@ts-ignore
                listFactory();
            }).toThrow();
            expect(() => {
                //@ts-ignore
                listFactory({});
            }).toThrow();
            expect(() => {
                //@ts-ignore
                listFactory(null);
            }).toThrow();
        });

        test('should return List', () => {
            expect(listFactory(itemsList)).toBeInstanceOf(List);
        });

        test('should return List with given collection', () => {
            const list = listFactory(itemsList);

            list.each((record, index) => {
                expect(record).toBe(items[index]);
            });
            expect(list.getCount()).toEqual(items.length);
        });
    });
});
