import recordSetFactory from 'Types/_collection/factory/recordSet';
import { List, RecordSet } from 'Types/collection';
import { Record } from 'Types/entity';

describe('Types/_collection/factory/recordSet', () => {
    let items: Record[];
    let itemsList: List<Record>;

    beforeEach(() => {
        items = [
            new Record({ rawData: { id: 1 } }),
            new Record({ rawData: { id: 2 } }),
            new Record({ rawData: { id: 3 } }),
        ];
        itemsList = new List({ items });
    });

    describe('constructor()', () => {
        test('should throw an error on invalid type of argument "items"', () => {
            expect(() => {
                //@ts-ignore
                recordSetFactory();
            }).toThrow();
            expect(() => {
                //@ts-ignore
                recordSetFactory({});
            }).toThrow();
            expect(() => {
                //@ts-ignore
                recordSetFactory(null);
            }).toThrow();
        });

        test('should return RecordSet', () => {
            expect(recordSetFactory(itemsList)).toBeInstanceOf(RecordSet);
        });

        test('should return RecordSet with given collection', () => {
            const rs = recordSetFactory(itemsList);

            rs.each(function (record, index) {
                expect(record.isEqual(items[index])).toBe(true);
            });
            expect(rs.getCount()).toEqual(items.length);
        });

        test('should return RecordSet with given options', () => {
            const options = { keyProperty: 'foo' };
            const rs = recordSetFactory(itemsList, options);

            expect(rs.getKeyProperty()).toEqual(options.keyProperty);
        });
    });
});
