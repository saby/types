import Indexer from 'Types/_collection/Indexer';

interface IItem {
    id: number;
    name: string;
    gender: string;
}

describe('Types/_collection/Indexer', () => {
    let items: IItem[];
    let indexer: Indexer<IItem[]>;

    beforeEach(() => {
        items = [
            {
                id: 1,
                name: 'John',
                gender: 'm',
            },
            {
                id: 2,
                name: 'Bill',
                gender: 'm',
            },
            {
                id: 3,
                name: 'Eva',
                gender: 'f',
            },
            {
                id: 4,
                name: 'Ken',
                gender: 'm',
            },
        ];

        indexer = new Indexer(
            items,
            (arr) => {
                return arr.length;
            },
            (arr, at) => {
                return arr[at];
            },
            (item, property) => {
                return item[property];
            }
        );
    });

    describe('.getIndexByValue()', () => {
        test('should return item index for scalar', () => {
            for (let i = 0; i < items.length; i++) {
                expect(i).toBe(indexer.getIndexByValue('id', items[i].id));
                expect(i).toBe(indexer.getIndexByValue('name', items[i].name));
            }
        });

        test('should return item index for Array', () => {
            const items = [{ id: [1] }, { id: [2, 1] }, { id: [3, 'a'] }, { id: [4] }];

            const indexer = new Indexer(
                items,
                (arr) => {
                    return arr.length;
                },
                (arr, at) => {
                    return arr[at];
                },
                (item, property) => {
                    return item[property];
                }
            );

            for (let i = 0; i < items.length; i++) {
                expect(i).toBe(indexer.getIndexByValue('id', items[i].id));
            }
        });

        test('should return -1 with not exists property', () => {
            expect(-1).toBe(indexer.getIndexByValue('some', 0));
        });

        test('should return -1 for not a property name', () => {
            //@ts-ignore
            expect(indexer.getIndexByValue(undefined, undefined)).toBe(-1);
            //@ts-ignore
            expect(indexer.getIndexByValue(null, undefined)).toBe(-1);
            expect(indexer.getIndexByValue(false as unknown as string, undefined)).toBe(-1);
            expect(indexer.getIndexByValue(0 as unknown as string, undefined)).toBe(-1);
            expect(indexer.getIndexByValue('', undefined)).toBe(-1);
        });

        test('should work fine with names from Object.prototype', () => {
            const items: any[] = [
                { constructor: 'a' },
                { hasOwnProperty: 1 },
                { toString: false },
                { isPrototypeOf: null },
            ];

            const indexer = new Indexer(
                items,
                (arr) => {
                    return arr.length;
                },
                (arr, at) => {
                    return arr[at];
                },
                (item, property) => {
                    return item[property];
                }
            );

            for (let i = 0; i < items.length; i++) {
                for (const k in items[i]) {
                    if (Object.prototype.hasOwnProperty.call(items[i], k)) {
                        expect(i).toBe(indexer.getIndexByValue(k, items[i][k]));
                    }
                }
            }
        });

        test('should work fine with values from Object.prototype', () => {
            const items = [
                { id: 'constructor' },
                { id: 'hasOwnProperty' },
                { id: 'toString' },
                { id: 'isPrototypeOf' },
            ];

            const indexer = new Indexer(
                items,
                (arr) => {
                    return arr.length;
                },
                (arr, at) => {
                    return arr[at];
                },
                (item, property) => {
                    return item[property];
                }
            );

            for (let i = 0; i < items.length; i++) {
                expect(i).toBe(indexer.getIndexByValue('id', items[i].id));
            }
        });
    });

    describe('.getIndicesByValue()', () => {
        test('should return items indices with given property', () => {
            expect([0]).toEqual(indexer.getIndicesByValue('id', 1));
            expect([0, 1, 3]).toEqual(indexer.getIndicesByValue('gender', 'm'));
            expect([2]).toEqual(indexer.getIndicesByValue('gender', 'f'));
        });

        test('should return no indices with not exists property', () => {
            expect(0).toBe(indexer.getIndicesByValue('some', 0).length);
        });
    });

    describe('.resetIndex()', () => {
        test('should build equal indices', () => {
            const v1 = indexer.getIndicesByValue('id', 1);

            indexer.resetIndex();
            const v2 = indexer.getIndicesByValue('id', 1);

            expect(v1).toEqual(v2);
        });
    });

    describe('.updateIndex()', () => {
        test('should update index', () => {
            const pos = 1;
            const oldV = items[pos].id;
            const newV = 100;

            expect(indexer.getIndexByValue('id', oldV)).toBe(pos);

            items[pos].id = newV;
            indexer.updateIndex(pos, 1);

            expect(indexer.getIndexByValue('id', newV)).toBe(pos);
        });

        test('should update index after partial remove', () => {
            const items = [
                { id: 1 },
                { id: 1 },
                { id: 1 },
                { id: 1 },
                { id: 1 },
                { id: 1 },
                { id: 1 },
                { id: 1 },
            ];

            const indexer = new Indexer(
                items,
                (arr) => {
                    return arr.length;
                },
                (arr, at) => {
                    return arr[at];
                },
                (item, property) => {
                    return item[property];
                }
            );

            expect(indexer.getIndicesByValue('id', 1)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);

            const start = 4;
            const count = 2;
            indexer.removeFromIndex(start, count);
            indexer.updateIndex(start, count);

            expect(indexer.getIndicesByValue('id', 1)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('.shiftIndex()', () => {
        test('should shift indices', () => {
            const offset = 11;
            const start = 1;
            const count = 2;
            const oldIndices = indexer.getIndicesByValue('gender', 'm');
            const expectData = oldIndices.map((index) => {
                return index >= start && index < start + count ? index + offset : index;
            });

            indexer.shiftIndex(start, count, offset);
            const newIndices = indexer.getIndicesByValue('gender', 'm');
            expect(newIndices).toEqual(expectData);
        });
    });

    describe('.removeFromIndex()', () => {
        test('should remove indices', () => {
            const indicesA = indexer.getIndicesByValue('id', 2);
            expect(indicesA[0]).toEqual(1);
            indexer.removeFromIndex(1, 1);
            expect(indexer.getIndicesByValue('id', 1).length).toEqual(1);
            expect(indexer.getIndicesByValue('id', 2).length).toEqual(0);
            expect(indexer.getIndicesByValue('id', 3).length).toEqual(1);
            expect(indexer.getIndicesByValue('id', 4).length).toEqual(1);

            const indicesB = indexer.getIndicesByValue('id', 1);
            expect(indicesB[0]).toEqual(0);
            indexer.removeFromIndex(0, 2);
            expect(indexer.getIndicesByValue('id', 1).length).toEqual(0);
            expect(indexer.getIndicesByValue('id', 2).length).toEqual(0);
            expect(indexer.getIndicesByValue('id', 3).length).toEqual(1);
            expect(indexer.getIndicesByValue('id', 4).length).toEqual(1);
        });
    });
});
