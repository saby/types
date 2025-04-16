import ArrayEnumerator from 'Types/_collection/enumerator/Arraywise';

describe('Types/_collection/enumerator/Arraywise', () => {
    let items: Record<string, string | number>[];

    beforeEach(() => {
        items = [
            {
                Ид: 1,
                Фамилия: 'Иванов',
                Пол: 'м',
            },
            {
                Ид: 2,
                Фамилия: 'Петров',
                Пол: 'м',
            },
            {
                Ид: 4,
                Фамилия: 'Иванова',
                Пол: 'ж',
            },
            {
                Ид: 3,
                Фамилия: 'Сидоров',
                Пол: 'м',
            },
        ];
    });

    describe('constructor()', () => {
        test('should throw an error on invalid argument', () => {
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ArrayEnumerator({});
            }).toThrow();
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ArrayEnumerator('');
            }).toThrow();
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ArrayEnumerator(0);
            }).toThrow();
            expect(function () {
                // eslint-disable-next-line no-new
                //@ts-ignore
                new ArrayEnumerator(null);
            }).toThrow();
        });
    });

    describe('.getCurrent()', () => {
        test('should return undefined by default', () => {
            //@ts-ignore
            const enumerator = new ArrayEnumerator();
            expect(enumerator.getCurrent()).not.toBeDefined();
        });
        test('should return item by item', () => {
            const enumerator = new ArrayEnumerator(items);
            let index = -1;
            while (enumerator.moveNext()) {
                index++;
                expect(items[index]).toBe(enumerator.getCurrent());
            }
            expect(items[items.length - 1]).toBe(enumerator.getCurrent());
        });
    });

    describe('.getCurrentIndex()', () => {
        test('should return -1 by default', () => {
            //@ts-ignore
            const enumerator = new ArrayEnumerator();
            expect(enumerator.getCurrentIndex()).toEqual(-1);
        });
        test('should return item by item', () => {
            const enumerator = new ArrayEnumerator(items);
            let index = -1;
            while (enumerator.moveNext()) {
                index++;
                expect(index).toBe(enumerator.getCurrentIndex());
            }
        });
    });

    describe('.moveNext()', () => {
        test('should return false for empty list', () => {
            //@ts-ignore
            const enumerator = new ArrayEnumerator();
            expect(enumerator.moveNext()).toBe(false);
        });
        test('should return item by item', () => {
            const enumerator = new ArrayEnumerator(items);
            let index = 0;
            while (enumerator.moveNext()) {
                expect(items[index]).toBe(enumerator.getCurrent());
                index++;
            }
        });
    });

    describe('.reset()', () => {
        test('should set current to undefined', () => {
            const enumerator = new ArrayEnumerator(items);
            enumerator.moveNext();
            expect(enumerator.getCurrent()).toBeDefined();
            enumerator.reset();
            expect(enumerator.getCurrent()).not.toBeDefined();
        });

        test('should start enumeration from beginning', () => {
            const enumerator = new ArrayEnumerator(items);
            let index;

            enumerator.moveNext();
            const firstOne = enumerator.getCurrent();
            enumerator.reset();
            enumerator.moveNext();
            expect(firstOne).toBe(enumerator.getCurrent());

            enumerator.reset();
            index = 0;
            while (enumerator.moveNext()) {
                expect(items[index]).toBe(enumerator.getCurrent());
                index++;
            }
        });
    });

    describe('.setResolver()', () => {
        test('should return result from given function', () => {
            const enumerator = new ArrayEnumerator(items);
            let count = 0;
            //@ts-ignore
            enumerator.setResolver((index) => {
                return items[index]['Ид'];
            });
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(items[count]['Ид']);
                count++;
            }
            expect(count).toBe(items.length);
        });
    });

    describe('.setFilter()', () => {
        test('should force return only filtered items', () => {
            const enumerator = new ArrayEnumerator(items);
            let count = 0;
            enumerator.setFilter(function (item) {
                //@ts-ignore
                return item['Ид'] < 3;
            });
            while (enumerator.moveNext()) {
                expect(enumerator?.getCurrent()?.['Ид']).toBeLessThan(3);
                count++;
            }
            expect(count).toBe(2);
        });
    });

    describe('.getIndexByValue()', () => {
        test('should return item index with given property', () => {
            const enumerator = new ArrayEnumerator(items);
            for (let i = 0; i < items.length; i++) {
                expect(i).toBe(enumerator.getIndexByValue('Ид', items[i]['Ид']));
                expect(i).toBe(enumerator.getIndexByValue('Фамилия', items[i]['Фамилия']));
            }
        });
        test('should return -1 with not exists property', () => {
            const enumerator = new ArrayEnumerator(items);
            expect(-1).toBe(enumerator.getIndexByValue('Ид', 0));
        });
        test('should return -1 for not a property name', () => {
            const enumerator = new ArrayEnumerator(items);
            //@ts-ignore
            expect(-1).toBe(enumerator.getIndexByValue());
            //@ts-ignore
            expect(-1).toBe(enumerator.getIndexByValue(null));
            //@ts-ignore
            expect(-1).toBe(enumerator.getIndexByValue(false));
            //@ts-ignore
            expect(-1).toBe(enumerator.getIndexByValue(0));
            //@ts-ignore
            expect(-1).toBe(enumerator.getIndexByValue(''));
        });
        test('should work fine with names from Object.prototype', () => {
            const innerItems = [
                //@ts-ignore
                {
                    constructor: 'a',
                },
                //@ts-ignore
                {
                    hasOwnProperty: 1,
                },
                //@ts-ignore
                {
                    toString: false,
                },
                //@ts-ignore
                {
                    isPrototypeOf: null,
                },
            ];
            const enumerator = new ArrayEnumerator(innerItems);
            for (let i = 0; i < innerItems.length; i++) {
                for (const k in innerItems[i]) {
                    if (Object.prototype.hasOwnProperty.call(innerItems[i], k)) {
                        //@ts-ignore
                        expect(i).toBe(enumerator.getIndexByValue(k, innerItems[i][k]));
                    }
                }
            }
        });
        test('should work fine with values from Object.prototype', () => {
            const innerItems = [
                {
                    id: 'constructor',
                },
                {
                    id: 'hasOwnProperty',
                },
                {
                    id: 'toString',
                },
                {
                    id: 'isPrototypeOf',
                },
            ];
            const enumerator = new ArrayEnumerator(innerItems);
            for (let i = 0; i < innerItems.length; i++) {
                expect(i).toBe(enumerator.getIndexByValue('id', innerItems[i].id));
            }
        });
    });

    describe('.getIndicesByValue()', () => {
        test('should return items indexes with given property', () => {
            const enumerator = new ArrayEnumerator(items);
            expect([0]).toEqual(enumerator.getIndicesByValue('Ид', 1));
            expect([0, 1, 3]).toEqual(enumerator.getIndicesByValue('Пол', 'м'));
            expect([2]).toEqual(enumerator.getIndicesByValue('Пол', 'ж'));
        });
        test('should return no indexes with not exists property', () => {
            const enumerator = new ArrayEnumerator(items);
            expect(0).toBe(enumerator.getIndicesByValue('Ид', 0).length);
        });
    });
});
