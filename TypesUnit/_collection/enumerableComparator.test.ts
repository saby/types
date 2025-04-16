import {
    List,
    enumerableComparator as comparator,
    IObservable as IBindCollection,
    IEnumerableComparatorSession as ISession,
} from 'Types/collection';

describe('Types/_collection/enumerableComparator', () => {
    let items;
    let list: List<string>;

    beforeEach(() => {
        items = ['a', 'b', 'c', 'd', 'e', 'f'];
        list = new List({ items });
    });

    describe('.startSession()', () => {
        test('should return before items', () => {
            const session = comparator.startSession(list);
            list.each(function (item, index) {
                expect(item).toBe(session.before[index]);
            });
        });
    });

    describe('.finishSession()', () => {
        test('should return after items', () => {
            const session = comparator.startSession(list);

            comparator.finishSession(session, list);
            list.each(function (item, index) {
                expect(item).toBe(session.after[index]);
            });
        });
    });

    describe('.analizeSession()', () => {
        let session: ISession;
        //@ts-ignore
        const checkPack = function (action, changes, expectData, _fireIndex) {
            let i;

            expect(action).toBe(expectData.action);

            if (expectData.newItems) {
                expect(changes.newItems.length).toBe(expectData.newItems.length);
                for (i = 0; i < expectData.newItems.length; i++) {
                    expect(changes.newItems[i]).toBe(expectData.newItems[i]);
                }
            }
            if (expectData.hasOwnProperty('newItemsIndex')) {
                expect(changes.newItemsIndex).toBe(expectData.newItemsIndex);
            }

            if (expectData.oldItems) {
                expect(changes.oldItems.length).toBe(expectData.oldItems.length);
                for (i = 0; i < expectData.oldItems.length; i++) {
                    expect(changes.oldItems[i]).toBe(expectData.oldItems[i]);
                }
            }
            if (expectData.hasOwnProperty('oldItemsIndex')) {
                expect(changes.oldItemsIndex).toBe(expectData.oldItemsIndex);
            }
        };
        //@ts-ignore
        const check = (expectData) => {
            let fireIndex = 0;

            comparator.finishSession(session, list);
            //@ts-ignore
            comparator.analizeSession(session, list, function (action, changes) {
                expect(expectData[fireIndex]).toBeDefined();
                checkPack(action, changes, expectData[fireIndex], fireIndex);
                fireIndex++;
            });

            expect(fireIndex).toBe(expectData.length);
        };

        beforeEach(() => {
            session = comparator.startSession(list);
        });

        test('should notify about added item', () => {
            list.add('new', 1);

            check([
                {
                    action: IBindCollection.ACTION_ADD,
                    newItems: ['new'],
                    newItemsIndex: 1,
                },
            ]);
        });

        test('should notify about added items', () => {
            list.add('new1', 0);
            list.add('new2', 5);

            check([
                {
                    action: IBindCollection.ACTION_ADD,
                    newItems: ['new1'],
                    newItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_ADD,
                    newItems: ['new2'],
                    newItemsIndex: 5,
                },
            ]);
        });

        test('should notify about added sequence', () => {
            list.add('new1', 0);
            list.add('new2', 1);
            list.add('new3', 4);
            list.add('new4', 5);

            check([
                {
                    action: IBindCollection.ACTION_ADD,
                    newItems: ['new1', 'new2'],
                    newItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_ADD,
                    newItems: ['new3', 'new4'],
                    newItemsIndex: 4,
                },
            ]);
        });

        test('should notify about added in reordered sequence', () => {
            // a, b, c, d, e, f
            list.add(list.removeAt(0), 2);
            list.add(list.removeAt(0), 3);

            // c, a, d, b, e, f

            list.add('new1', 1);
            list.add('new2', 2);
            list.add('new3', 4);
            list.add('new4', 5);

            // c, new1, new2, a, new3, new4, d, b, e, f

            check([
                {
                    action: IBindCollection.ACTION_ADD, // a, new1, new2, b, c, d, e, f
                    newItems: ['new1', 'new2'],
                    newItemsIndex: 1,
                },
                {
                    action: IBindCollection.ACTION_ADD, // a, new1, new2, b, new3, new4, c, d, e, f
                    newItems: ['new3', 'new4'],
                    newItemsIndex: 4,
                },
                {
                    action: IBindCollection.ACTION_MOVE, // c, a, new1, new2, b, new3, new4, d, e, f
                    newItems: ['c'],
                    newItemsIndex: 0,
                    oldItemsIndex: 6,
                },
                {
                    action: IBindCollection.ACTION_MOVE, // c, new1, new2, a, b, new3, new4, d, e, f
                    newItems: ['new1', 'new2'],
                    newItemsIndex: 1,
                    oldItemsIndex: 2,
                },
                {
                    action: IBindCollection.ACTION_MOVE, // c, new1, new2, a, new3, new4, d, b, e, f
                    newItems: ['new3', 'new4', 'd'],
                    newItemsIndex: 4,
                    oldItemsIndex: 5,
                },
            ]);
        });

        test('should notify about removed item', () => {
            list.removeAt(1); // b

            check([
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['b'],
                    oldItemsIndex: 1,
                },
            ]);
        });

        test('should notify about removed items', () => {
            list.removeAt(0); // a
            list.removeAt(1); // c

            check([
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['a'],
                    oldItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['c'],
                    oldItemsIndex: 1,
                },
            ]);
        });

        test('should notify about removed sequence', () => {
            list.removeAt(0); // a
            list.removeAt(0); // b
            list.removeAt(1); // d
            list.removeAt(1); // e

            check([
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['a', 'b'],
                    oldItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['d', 'e'],
                    oldItemsIndex: 1,
                },
            ]);
        });

        test('should notify about moved forward item', () => {
            list.add(list.removeAt(0), 2); // [a]: 0->2 is equal to [b, c]: 1->0

            check([
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['b', 'c'],
                    oldItemsIndex: 1,
                    newItems: ['b', 'c'],
                    newItemsIndex: 0,
                },
            ]);
        });
        test('should notify about removed and moved forward item', () => {
            list.removeAt(0);
            list.removeAt(4);
            list.add(list.removeAt(2), 0); // [c]: 2->0

            check([
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['a'],
                    oldItemsIndex: 0,
                    newItems: [],
                    newItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_REMOVE,
                    oldItems: ['f'],
                    oldItemsIndex: 4,
                    newItems: [],
                    newItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['d'],
                    oldItemsIndex: 2,
                    newItems: ['d'],
                    newItemsIndex: 0,
                },
            ]);
        });

        test('should notify about added and moved forward item', () => {
            list.add('z', 6);
            list.add('y', 7);
            list.add(list.removeAt(2), 0); // [c]: 2->0

            check([
                {
                    action: IBindCollection.ACTION_ADD,
                    oldItems: [],
                    oldItemsIndex: 0,
                    newItems: ['z', 'y'],
                    newItemsIndex: 6,
                },
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['c'],
                    oldItemsIndex: 2,
                    newItems: ['c'],
                    newItemsIndex: 0,
                },
            ]);
        });

        test('should notify about moved backward item', () => {
            list.add(list.removeAt(2), 0); // [c]: 2->0

            check([
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['c'],
                    oldItemsIndex: 2,
                    newItems: ['c'],
                    newItemsIndex: 0,
                },
            ]);
        });

        test('should notify about moved items', () => {
            list.add(list.removeAt(0), 2); // a: 0->2 is equal to [b, c]: 1->0
            list.add(list.removeAt(5), 4); // f: 5->4

            check([
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['b', 'c'],
                    oldItemsIndex: 1,
                    newItems: ['b', 'c'],
                    newItemsIndex: 0,
                },
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['f'],
                    oldItemsIndex: 5,
                    newItems: ['f'],
                    newItemsIndex: 4,
                },
            ]);
        });

        test('should notify about moved sequence', () => {
            list.add(list.removeAt(0), 2);
            list.add(list.removeAt(0), 2);

            // [a]: 0->2, [b]: 0->2 is equal to [c]: 2->0

            check([
                {
                    action: IBindCollection.ACTION_MOVE,
                    oldItems: ['c'],
                    oldItemsIndex: 2,
                    newItems: ['c'],
                    newItemsIndex: 0,
                },
            ]);
        });

        test('should work with a lot of elements', () => {
            const arr = [];
            let i = 0;

            while (i < 1100) {
                arr.push(i++);
            }
            const innerList = new List({ items: arr });
            const innerSession = comparator.startSession(innerList);
            arr.sort();
            comparator.finishSession(innerSession, innerList);
            //@ts-ignore
            comparator.analizeSession(innerSession, innerList);
        });

        describe('if has duplicates before', () => {
            beforeEach(() => {
                list.add('b');
                list.add('a');
                list.add('a');

                // a, b, c, d, e, f, b, a, a
                session = comparator.startSession(list);
            });

            test('should notify about added duplicates', () => {
                list.add('a', 0);
                list.add('b', 8);
                list.add('b', 8);
                check([
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['b', 'b'],
                        newItemsIndex: 8,
                    },
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['a'],
                        newItemsIndex: 11,
                    },
                    {
                        action: IBindCollection.ACTION_MOVE,
                        oldItems: ['a'],
                        oldItemsIndex: 7,
                        newItems: ['a'],
                        newItemsIndex: 1,
                    },
                ]);
            });

            test('should notify about removed first duplicate', () => {
                // a, b, c, d, e, f, b, a, a
                list.removeAt(0); // a
                // b, c, d, e, f, b, a, a

                check([
                    {
                        action: IBindCollection.ACTION_REMOVE,
                        oldItems: ['a'],
                        oldItemsIndex: 8,
                    },
                    {
                        action: IBindCollection.ACTION_MOVE,
                        oldItems: ['b', 'c', 'd', 'e', 'f', 'b', 'a'],
                        oldItemsIndex: 1,
                        newItemsIndex: 0,
                    },
                ]);
            });

            test('should notify about removed last duplicate', () => {
                list.removeAt(8); // a

                check([
                    {
                        action: IBindCollection.ACTION_REMOVE,
                        oldItems: ['a'],
                        oldItemsIndex: 8,
                    },
                ]);
            });

            test('should notify about removed several duplicates', () => {
                // a, b, c, d, e, f, b, a, a
                list.removeAt(0); // a
                list.removeAt(7); // a
                // b, c, d, e, f, b, a

                check([
                    {
                        action: IBindCollection.ACTION_REMOVE,
                        oldItems: ['a', 'a'],
                        oldItemsIndex: 7,
                    },
                    {
                        action: IBindCollection.ACTION_MOVE,
                        oldItems: ['b', 'c', 'd', 'e', 'f', 'b'],
                        oldItemsIndex: 1,
                        newItemsIndex: 0,
                    },
                ]);
            });
        });

        describe('if has duplicates after', () => {
            test('should notify about added duplicates', () => {
                // a, b, c, d, e, f
                list.add('a', 0);
                list.add('b', 5);
                list.add('b', 6);

                // a, a, b, c, d, b, b, e, f

                check([
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['a'],
                        newItemsIndex: 1,
                    },
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['b', 'b'],
                        newItemsIndex: 5,
                    },
                ]);
            });

            test('should notify about removed first duplicate', () => {
                // a, b, c, d, e, f
                list.add('a');
                list.add('b');
                list.removeAt(0); // a
                // b, c, d, e, f, a, b

                check([
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['b'],
                        newItemsIndex: 6,
                    },
                    {
                        action: IBindCollection.ACTION_MOVE,
                        oldItems: ['b', 'c', 'd', 'e', 'f'],
                        oldItemsIndex: 1,
                        newItemsIndex: 0,
                    },
                ]);
            });

            test('should notify about removed last duplicate', () => {
                // a, b, c, d, e, f
                list.add('a', 0);
                list.add('b', 0);
                list.removeAt(2); // a
                // b, a, b, c, d, e, f

                check([
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['b'],
                        newItemsIndex: 2,
                    },
                    {
                        action: IBindCollection.ACTION_MOVE,
                        oldItems: ['b'],
                        oldItemsIndex: 1,
                        newItemsIndex: 0,
                    },
                ]);
            });

            test('should notify about removed several duplicates', () => {
                // a, b, c, d, e, f
                list.add('a', 0);
                list.add('b', 0);
                list.removeAt(0); // b
                list.removeAt(2); // b
                // a, a, c, d, e, f

                check([
                    {
                        action: IBindCollection.ACTION_REMOVE,
                        oldItems: ['b'],
                        oldItemsIndex: 1,
                    },
                    {
                        action: IBindCollection.ACTION_ADD,
                        newItems: ['a'],
                        newItemsIndex: 1,
                    },
                ]);
            });

            test('should notify about moved duplicates', () => {
                // a, b, c, d, e, f
                list.removeAt(1); // b
                list.add('b', 2);
                list.add('b', 2);
                list.add('b', 5);

                // a, c, b, b, d, b, e, f

                check([
                    {
                        action: IBindCollection.ACTION_ADD, // a, b, c, b, d, e, f
                        newItems: ['b'],
                        newItemsIndex: 3,
                    },
                    {
                        action: IBindCollection.ACTION_ADD, // a, b, c, b, d, b, e, f
                        newItems: ['b'],
                        newItemsIndex: 5,
                    },
                    {
                        action: IBindCollection.ACTION_MOVE, // a, c, b, b, d, b, e, f
                        oldItems: ['c', 'b'],
                        oldItemsIndex: 2,
                        newItemsIndex: 1,
                    },
                ]);
            });
        });
    });
});
