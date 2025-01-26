import ObjectEnumerator from 'Types/_collection/enumerator/Objectwise';

describe('Types/_collection/enumerator/Objectwise', () => {
    let items: Record<string, number>;

    beforeEach(() => {
        items = {
            one: 1,
            two: 2,
            three: 3,
        };
    });

    describe('constructor()', () => {
        test('should throw an error on invalid argument', () => {
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ObjectEnumerator('');
            }).toThrow();
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ObjectEnumerator(0);
            }).toThrow();
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ObjectEnumerator(null);
            }).toThrow();
        });
    });

    describe('.getCurrent()', () => {
        test('should return undefined by default', () => {
            //@ts-ignore
            const enumerator = new ObjectEnumerator();
            expect(enumerator.getCurrent()).not.toBeDefined();
        });

        test('should return item by item', () => {
            const enumerator = new ObjectEnumerator(items);
            const keys = Object.keys(items);
            let index = 0;
            while (enumerator.moveNext()) {
                expect(items[keys[index]]).toBe(enumerator.getCurrent());
                index++;
            }
            expect(items.three).toBe(enumerator.getCurrent());
        });
    });

    describe('.getCurrentIndex()', () => {
        test('should return undefined by default', () => {
            //@ts-ignore
            const enumerator = new ObjectEnumerator();
            expect(enumerator.getCurrentIndex()).not.toBeDefined();
        });

        test('should return item by item', () => {
            const enumerator = new ObjectEnumerator(items);
            const keys = Object.keys(items);
            let index = 0;
            while (enumerator.moveNext()) {
                expect(keys[index]).toBe(enumerator.getCurrentIndex());
                index++;
            }
        });
    });

    describe('.moveNext()', () => {
        test('should return undefined for empty list', () => {
            //@ts-ignore
            const enumerator = new ObjectEnumerator();
            expect(enumerator.moveNext()).toBe(false);
        });

        test('should return item by item', () => {
            const enumerator = new ObjectEnumerator(items);
            const keys = Object.keys(items);
            let index = 0;
            while (enumerator.moveNext()) {
                expect(items[keys[index]]).toBe(enumerator.getCurrent());
                index++;
            }
        });
    });

    describe('.reset()', () => {
        test('should set current to undefined', () => {
            const enumerator = new ObjectEnumerator(items);
            enumerator.moveNext();
            expect(enumerator.getCurrent()).toBeDefined();
            enumerator.reset();
            expect(enumerator.getCurrent()).not.toBeDefined();
        });

        test('should start enumeration from beginning', () => {
            const enumerator = new ObjectEnumerator(items);
            const keys = Object.keys(items);
            let index;

            enumerator.moveNext();
            const firstOne = enumerator.getCurrent();
            enumerator.reset();
            enumerator.moveNext();
            expect(firstOne).toBe(enumerator.getCurrent());

            enumerator.reset();
            index = 0;
            while (enumerator.moveNext()) {
                expect(items[keys[index]]).toBe(enumerator.getCurrent());
                index++;
            }

            enumerator.reset();
            index = 0;
            while (enumerator.moveNext()) {
                expect(items[keys[index]]).toBe(enumerator.getCurrent());
                index++;
            }
        });
    });

    describe('.setFilter()', () => {
        test('should force return only filtered items', () => {
            const enumerator = new ObjectEnumerator(items);
            let count = 0;
            const expectData = [1, 3];
            enumerator.setFilter(function (item) {
                return expectData.indexOf(item) > -1;
            });
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toEqual(expectData[count]);
                count++;
            }
            expect(count).toBe(expectData.length);
        });
    });
});
