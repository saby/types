import MapEnumerator from 'Types/_collection/enumerator/Mapwise';
import Map from 'Types/_shim/Map';

describe('Types/_collection/enumerator/Mapwise', () => {
    let keys: string[];
    let values: number[];
    let items: Map<string, number>;

    beforeEach(() => {
        keys = ['one', 'two'];
        values = [1, 2];
        items = new Map(
            keys.map((key, index) => {
                return [key, values[index]];
            })
        );
    });

    describe('.getCurrent()', () => {
        test('should return undefined by default', () => {
            const enumerator = new MapEnumerator(new Map());
            expect(enumerator.getCurrent()).not.toBeDefined();
        });

        test('should return item by item', () => {
            const enumerator = new MapEnumerator(items);
            let index = 0;

            while (enumerator.moveNext()) {
                expect(values[index]).toBe(enumerator.getCurrent());
                index++;
            }
            expect(values[values.length - 1]).toBe(enumerator.getCurrent());
        });
    });

    describe('.getCurrentIndex()', () => {
        test('should return undefined by default', () => {
            const enumerator = new MapEnumerator(new Map());
            expect(enumerator.getCurrentIndex()).not.toBeDefined();
        });

        test('should return item by item', () => {
            const enumerator = new MapEnumerator(items);
            let index = 0;

            while (enumerator.moveNext()) {
                expect(keys[index]).toBe(enumerator.getCurrentIndex());
                index++;
            }
            expect(keys[keys.length - 1]).toBe(enumerator.getCurrentIndex());
        });
    });

    describe('.moveNext()', () => {
        test('should return false for empty', () => {
            const enumerator = new MapEnumerator(new Map());

            expect(enumerator.moveNext()).toBe(false);
        });

        test('should return item by item', () => {
            const enumerator = new MapEnumerator(items);
            let index = 0;

            while (enumerator.moveNext()) {
                index++;
            }
            expect(index).toBe(items.size);
        });
    });

    describe('.reset()', () => {
        test('should set current to undefined', () => {
            const enumerator = new MapEnumerator(items);
            enumerator.moveNext();
            expect(enumerator.getCurrent()).toBeDefined();
            enumerator.reset();
            expect(enumerator.getCurrent()).not.toBeDefined();
        });

        test('should start enumeration from beginning', () => {
            const enumerator = new MapEnumerator(items);

            enumerator.moveNext();
            expect(enumerator.getCurrent()).toBe(values[0]);

            enumerator.reset();
            enumerator.moveNext();
            expect(enumerator.getCurrent()).toBe(values[0]);
        });
    });
});
