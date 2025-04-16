import { List } from 'Types/collection';
import { Record } from 'Types/entity';

interface IItem {
    id: number;
    name: string;
}

describe('Types/_collection/List', () => {
    const getItems = () => {
        return [
            {
                id: 1,
                name: 'Иванов',
            },
            {
                id: 2,
                name: 'Петров',
            },
            {
                id: 3,
                name: 'Сидоров',
            },
            {
                id: 4,
                name: 'Пухов',
            },
            {
                id: 5,
                name: 'Молодцов',
            },
            {
                id: 6,
                name: 'Годолцов',
            },
            {
                id: 7,
                name: 'Арбузнов',
            },
        ];
    };
    let items: IItem[];

    beforeEach(() => {
        items = getItems();
    });

    describe('constructor()', () => {
        test('should create list with items', () => {
            const list = new List({
                items,
            });
            expect(items[0]).toBe(list.at(0));
            expect(items[6]).toBe(list.at(6));
        });

        test('should throw an error on invalid argument', () => {
            expect(() => {
                // eslint-disable-next-line no-new
                new List({
                    //@ts-ignore
                    items: {},
                });
            }).toThrow();
            expect(() => {
                // eslint-disable-next-line no-new
                new List({
                    //@ts-ignore
                    items: '',
                });
            }).toThrow();
            expect(() => {
                // eslint-disable-next-line no-new
                new List({
                    //@ts-ignore
                    items: 0,
                });
            }).toThrow();
            expect(() => {
                // eslint-disable-next-line no-new
                new List({
                    items: undefined,
                });
            }).toThrow();
        });
    });

    describe('.destroy()', () => {
        test('should destroy owned items', () => {
            const innerItems = [new Record(), new Record(), new Record()];
            const list = new List({
                items: innerItems,
            });

            list.destroy();
            for (let i = 0; i < innerItems.length; i++) {
                expect(innerItems[i].destroyed).toBe(true);
            }
        });
    });

    describe('.getEnumerator()', () => {
        test('should return an list enumerator', () => {
            const list = new List();
            //@ts-ignore
            expect(list.getEnumerator()['[Types/_collection/enumerator/Arraywise]']).toBe(true);
        });
    });

    describe('.each()', () => {
        test('should return every item in original order', () => {
            const list = new List({
                items,
            });
            let index = 0;

            //@ts-ignore
            list.each((item, innerIndex, innerList) => {
                expect(item).toBe(items[index]);
                expect(innerIndex).toBe(index);
                expect(innerList).toBe(list);
                index++;
            });
            expect(index).toBe(items.length);
        });

        test('should use the given context', () => {
            const list = new List({
                items,
            });
            const context = {
                blah: 'blah',
            };

            list.each(function () {
                //@ts-ignore
                expect(this).toBe(context);
            }, context);
        });
    });

    describe('.forEach()', () => {
        test('should work like each', () => {
            const list = new List({
                items,
            });
            let index = 0;

            //@ts-ignore
            list.forEach((item, innerIndex, innerList) => {
                expect(item).toBe(items[index]);
                expect(innerIndex).toBe(index);
                expect(innerList).toBe(list);
                index++;
            });
            expect(index).toBe(items.length);
        });
    });

    describe('.append()', () => {
        test('should append items', () => {
            const list = new List({
                items: items.slice(),
            });
            const moreItems = [
                {
                    id: 8,
                },
                {
                    id: 9,
                },
            ];
            let ok = true;

            list.append(
                //@ts-ignore
                new List({
                    items: moreItems,
                })
            );

            for (let i = 0, count = items.length + moreItems.length; i < count; i++) {
                const item = i < items.length ? items[i] : moreItems[i - items.length];
                if (list.at(i) !== item) {
                    ok = false;
                    break;
                }
            }
            expect(ok).toBe(true);
        });

        test('should append items when items is array', () => {
            const list = new List({
                items: items.slice(),
            });
            const moreItems = [
                {
                    id: 8,
                },
                {
                    id: 9,
                },
            ];
            let ok = true;

            //@ts-ignore
            list.append(moreItems);

            for (let i = 0, count = items.length + moreItems.length; i < count; i++) {
                const item = i < items.length ? items[i] : moreItems[i - items.length];
                if (list.at(i) !== item) {
                    ok = false;
                    break;
                }
            }
            expect(ok).toBe(true);
        });

        test('should throw an error on invalid argument', () => {
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.append({});
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.append('');
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.append(0);
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.append();
            }).toThrow();
        });

        test('should rebuild index for instantiable item', () => {
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                ],
            });
            const moreItems = [
                new Record({
                    rawData: {
                        id: 2,
                    },
                }),
                new Record({
                    rawData: {
                        id: 3,
                    },
                }),
            ];
            list.getIndex(list.at(0));
            list.append(moreItems);

            expect(list.getIndex(list.at(2))).toEqual(2);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List();

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.append(['bar']);
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.prepend()', () => {
        test('should prepend items', () => {
            const list = new List({
                items: items.slice(),
            });
            const moreItems = [
                {
                    id: 8,
                },
                {
                    id: 9,
                },
            ];
            let ok = true;

            list.prepend(
                //@ts-ignore
                new List({
                    items: moreItems,
                })
            );

            for (let i = 0, count = items.length + moreItems.length; i < count; i++) {
                const item = i < moreItems.length ? moreItems[i] : items[i - moreItems.length];
                if (list.at(i) !== item) {
                    ok = false;
                    break;
                }
            }
            expect(ok).toBe(true);
        });

        test('should prepend items when items is array', () => {
            const list = new List({
                items: items.slice(),
            });
            const moreItems = [
                {
                    id: 8,
                },
                {
                    id: 9,
                },
            ];
            let ok = true;

            //@ts-ignore
            list.prepend(moreItems);

            for (let i = 0, count = items.length + moreItems.length; i < count; i++) {
                const item = i < moreItems.length ? moreItems[i] : items[i - moreItems.length];
                if (list.at(i) !== item) {
                    ok = false;
                    break;
                }
            }
            expect(ok).toBe(true);
        });

        test('should throw an error on invalid argument', () => {
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.prepend({});
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.prepend('');
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.prepend(0);
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.prepend();
            }).toThrow();
        });

        test('should rebuild index for instantiable item', () => {
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                ],
            });
            const moreItems = [
                new Record({
                    rawData: {
                        id: 2,
                    },
                }),
                new Record({
                    rawData: {
                        id: 3,
                    },
                }),
            ];
            list.getIndex(list.at(0));
            list.prepend(moreItems);

            expect(list.getIndex(list.at(2))).toEqual(2);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List();

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.prepend(['bar']);
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.assign()', () => {
        test('should replace items', () => {
            const list = new List({
                items,
            });
            const moreItems = [
                {
                    id: 8,
                },
                {
                    id: 9,
                },
            ];
            let ok = true;

            list.assign(
                //@ts-ignore
                new List({
                    items: moreItems,
                })
            );

            for (let i = 0; i < moreItems.length; i++) {
                if (list.at(i) !== moreItems[i]) {
                    ok = false;
                    break;
                }
            }
            expect(ok).toBe(true);
        });

        test('should replace items when items is array', () => {
            const list = new List({
                items,
            });
            const moreItems = [
                {
                    id: 8,
                },
                {
                    id: 9,
                },
            ];
            let ok = true;

            //@ts-ignore
            list.assign(moreItems);

            for (let i = 0; i < moreItems.length; i++) {
                if (list.at(i) !== moreItems[i]) {
                    ok = false;
                    break;
                }
            }
            expect(ok).toBe(true);
        });

        test('should clear items', () => {
            const list = new List({
                items,
            });
            let ok = true;

            //@ts-ignore
            list.assign();

            list.each(() => {
                ok = false;
            });

            expect(ok).toBe(true);
        });

        test('should throw an error on invalid argument', () => {
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.assign({});
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.assign('a');
            }).toThrow();
            expect(() => {
                const list = new List();
                //@ts-ignore
                list.assign(1);
            }).toThrow();
        });

        test('should rebuild index for instantiable item', () => {
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                ],
            });
            const moreItems = [
                new Record({
                    rawData: {
                        id: 2,
                    },
                }),
                new Record({
                    rawData: {
                        id: 3,
                    },
                }),
            ];
            list.getIndex(list.at(0));
            list.assign(moreItems);

            expect(list.getIndex(list.at(1))).toEqual(1);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List();

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.assign(['bar']);
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.clear()', () => {
        test('should reset items count', () => {
            const list = new List({
                items,
            });
            list.clear();
            expect(list.getCount()).toBe(0);
        });

        test('should return an empty enumerator', () => {
            const list = new List({
                items,
            });
            list.clear();
            expect(list.getEnumerator().moveNext()).toBe(false);
        });

        test('should not call callback in each', () => {
            const list = new List({
                items,
            });
            list.clear();
            list.each(() => {
                throw new Error('Callback was called');
            });
        });

        test('should rebuild index for instantiable item', () => {
            const item = new Record({
                rawData: {
                    id: 1,
                },
            });
            const list = new List({
                items: [item],
            });
            expect(list.getIndex(item)).toBe(0);
            list.clear();
            expect(list.getIndex(item)).toBe(-1);
        });

        test('should save relationships with parent', () => {
            const listA = new List();
            const listB = new List();
            listA.add(listB);

            let version = listA.getVersion();
            listB.add('foo');
            expect(listA.getVersion()).not.toEqual(version);

            version = listA.getVersion();
            //@ts-ignore
            listB.clear('foo');
            expect(listA.getVersion()).not.toEqual(version);
        });
    });

    describe('.clone()', () => {
        test('should not be same as original', () => {
            const list = new List({
                items,
            });
            expect(list.clone()).toBeInstanceOf(List);
            expect(list.clone(true)).toBeInstanceOf(List);
            expect(list.clone()).not.toEqual(list);
            expect(list.clone(true)).not.toEqual(list);
        });

        test('should clone list from library', () => {
            const list = new List({
                items,
            });
            expect(list.clone()).toBeInstanceOf(List);
            expect(list.clone(true)).toBeInstanceOf(List);
        });

        test('should not be same as previous clone', () => {
            const list = new List({
                items,
            });
            expect(list.clone() !== list.clone()).toBeTruthy();
            expect(list.clone(true) !== list.clone(true)).toBeTruthy();
        });

        test('should make items unlinked from original', () => {
            const list = new List({
                items,
            });
            const clone = list.clone();
            //@ts-ignore
            clone.each(function (item, index) {
                expect(item !== list.at(index)).toBeTruthy();
            });
        });

        test('should make items linked to original if shallow', () => {
            const list = new List({
                items,
            });
            const clone = list.clone(true);
            //@ts-ignore
            clone.each(function (item, index) {
                expect(item).toBe(list.at(index));
            });
        });
    });

    describe('.add()', () => {
        test('should append an item', () => {
            const list = new List({
                items: items.slice(),
            });
            const item = {
                id: 8,
            };

            //@ts-ignore
            list.add(item);
            expect(list.at(items.length)).toBe(item);
        });

        test('should prepend an item', () => {
            const list = new List({
                items,
            });
            const item = {
                id: 9,
            };

            //@ts-ignore
            list.add(item, 0);
            expect(list.at(0)).toBe(item);
        });

        test('should insert an item at given position', () => {
            const list = new List({
                items,
            });
            const item = {
                id: 10,
            };

            //@ts-ignore
            list.add(item, 3);
            expect(list.at(3)).toBe(item);
        });

        test('should throw an error on invalid index', () => {
            expect(() => {
                const list = new List();
                list.add({}, -1);
            }).toThrow();
            expect(() => {
                const list = new List();
                list.add({}, items.length);
            }).toThrow();
        });

        test('should rebuild index for instantiable item', () => {
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                ],
            });
            const moreItem = new Record({
                rawData: {
                    id: 2,
                },
            });
            list.getIndex(list.at(0));
            list.add(moreItem);
            expect(list.getIndex(list.at(1))).toEqual(1);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List();

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.add('bar');
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.at()', () => {
        test('should return an item at given position', () => {
            const list = new List({
                items,
            });

            for (let i = 0; i < items.length; i++) {
                expect(list.at(i)).toBe(items[i]);
            }
        });

        test('should return undefined on invalid index', () => {
            const list = new List();
            expect(list.at(-1)).not.toBeDefined();
            expect(list.at(items.length)).not.toBeDefined();
        });
    });

    describe('.remove()', () => {
        test('should remove given item', () => {
            const list = new List({
                items,
            });

            for (let i = items.length; i > 0; i--) {
                list.remove(items[i - 1]);
                expect(list.at(i - 1)).not.toBeDefined();
            }
        });

        test('should return false if item is undefined', () => {
            const list = new List();
            expect(list.remove({})).toBe(false);
            expect(list.remove(10)).toBe(false);
        });

        test('should rebuild index for instantiable item', () => {
            const item = new Record({
                rawData: {
                    id: 2,
                },
            });
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                    item,
                ],
            });
            expect(list.getIndex(item)).not.toEqual(-1);
            list.remove(item);
            expect(list.getIndex(item)).toBe(-1);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List({ items: ['bar'] });

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.remove('bar');
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.removeAt()', () => {
        test('should remove item at given position', () => {
            const list = new List({
                items,
            });
            let toRemove;
            let removed;
            let i;

            for (i = items.length; i > 0; i--) {
                toRemove = list.at(i - 1);
                removed = list.removeAt(i - 1);
                expect(toRemove).toBe(removed);
                expect(list.at(i - 1)).not.toBeDefined();
            }
        });

        test('should throw an error on on invalid index', () => {
            expect(() => {
                const list = new List();
                list.removeAt(-1);
            }).toThrow();
            expect(() => {
                const list = new List();
                list.removeAt(0);
            }).toThrow();
            expect(() => {
                const list = new List({
                    items,
                });
                list.removeAt(items.length);
            }).toThrow();
        });

        test('should rebuild index for instantiable item', () => {
            const item = new Record({
                rawData: {
                    id: 2,
                },
            });
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                    item,
                ],
            });
            expect(list.getIndex(item)).not.toEqual(-1);
            list.removeAt(1);
            expect(list.getIndex(item)).toBe(-1);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List({ items: ['bar'] });

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.removeAt(0);
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.replace()', () => {
        test('should replace item at given position', () => {
            const list = new List({
                items,
            });

            for (let i = 0; i < items.length; i++) {
                const item = { i };
                //@ts-ignore
                list.replace(item, i);
                expect(item).toBe(list.at(i));
            }
        });

        test('should replace item with itself', () => {
            const list = new List({
                items,
            });

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                list.replace(item, i);
                expect(item).toBe(list.at(i));
            }
        });

        test('should throw an error on invalid index', () => {
            expect(() => {
                const list = new List();
                list.replace({}, -1);
            }).toThrow();
            expect(() => {
                const list = new List();
                list.replace({}, 0);
            }).toThrow();
            expect(() => {
                const list = new List({
                    items,
                });
                //@ts-ignore
                list.replace({}, items.length);
            }).toThrow();
        });

        test('should rebuild index for instantiable item', () => {
            const item1 = new Record({
                rawData: {
                    id: 2,
                },
            });
            const item2 = new Record({
                rawData: {
                    id: 3,
                },
            });
            const list = new List({
                items: [
                    new Record({
                        rawData: {
                            id: 1,
                        },
                    }),
                    item1,
                ],
            });

            expect(list.getIndex(item1)).not.toEqual(-1);
            expect(list.getIndex(item2)).toBe(-1);

            list.replace(item2, 1);
            expect(list.getIndex(item1)).toBe(-1);
            expect(list.getIndex(item2)).not.toEqual(-1);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List({ items: ['bar'] });

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.replace('baz', 0);
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.move()', () => {
        test('should move item to the given position', () => {
            const list = new List({
                items,
            });
            const from = 0;
            const to = 2;
            const item = list.at(from);
            const next = list.at(from + 1);

            list.move(from, to);
            expect(list.at(from)).toBe(next);
            expect(list.at(to)).toBe(item);
        });

        test('should give no effect for equal positions', () => {
            const list = new List({
                items,
            });
            const from = 1;
            const item = list.at(from);

            list.move(from, from);
            expect(list.at(from)).toBe(item);
        });

        test('should throw an error om invalid argument "from"', () => {
            const list = new List({
                items,
            });

            expect(() => {
                list.move(-1, 0);
            }).toThrow();

            expect(() => {
                list.move(100, 0);
            }).toThrow();
        });

        test('should throw an error om invalid argument "to"', () => {
            const list = new List({
                items,
            });

            expect(() => {
                list.move(0, -1);
            }).toThrow();

            expect(() => {
                list.move(0, 100);
            }).toThrow();
        });

        test('should rebuild index for affected items', () => {
            const list = new List({
                items,
            });
            const from = 0;
            const to = 2;

            expect(list.getIndexByValue('id', 1)).toBe(from);
            expect(list.getIndexByValue('id', 3)).toBe(to);

            list.move(from, to);

            expect(list.getIndexByValue('id', 1)).toBe(to);
            expect(list.getIndexByValue('id', 3)).toBe(to - 1);
        });

        test('should change associated field in the owner', () => {
            const item = new Record();
            const list = new List({ items: ['bar', 'baz'] });

            item.set('foo', list);
            item.acceptChanges();
            expect(item.isChanged('foo')).toBe(false);

            list.move(0, 1);
            expect(item.isChanged('foo')).toBe(true);
        });
    });

    describe('.getIndex()', () => {
        test('should return an index of given item', () => {
            const list = new List({
                items: items.slice(),
            });
            for (let i = 0; i < items.length; i++) {
                expect(i).toBe(list.getIndex(items[i]));
            }

            const item = { a: 'b' };

            //@ts-ignore
            list.add(item, 5);
            //@ts-ignore
            expect(5).toBe(list.getIndex(item));
        });

        test('should return -1 for undefined item', () => {
            const list = new List();
            expect(-1).toBe(list.getIndex({ c: 'd' }));
            expect(-1).toBe(list.getIndex(''));
            expect(-1).toBe(list.getIndex(0));
            expect(-1).toBe(list.getIndex(false));
            expect(-1).toBe(list.getIndex(null));
            //@ts-ignore
            expect(-1).toBe(list.getIndex());
        });

        test('should return  an index of given instantiable item', () => {
            const newItems: Record[] = [];
            items.forEach(function (item) {
                newItems.push(
                    new Record({
                        rawData: item,
                    })
                );
            });

            const list = new List({
                items: newItems,
            });

            let i;
            for (i = 0; i < newItems.length; i++) {
                expect(i).toBe(list.getIndex(newItems[i]));
            }

            list.removeAt(0);
            for (i = 0; i < newItems.length; i++) {
                expect(i).toBe(list.getIndex(newItems[i]));
            }
        });

        test('should return  an -1 for undefined instantiable item', () => {
            const newItems: Record[] = [];
            items.forEach(function (item) {
                newItems.push(
                    new Record({
                        rawData: item,
                    })
                );
            });
            const list = new List({
                items: newItems,
            });
            expect(-1).toBe(
                list.getIndex(
                    new Record({
                        rawData: { id: 100500 },
                    })
                )
            );
            expect(-1).toBe(
                list.getIndex(
                    new Record({
                        rawData: items[1],
                    })
                )
            );
        });
    });

    describe('.getIndexByValue', () => {
        const innerGetItems = () => {
            return [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
        };

        test('should return initial indexes', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            expect(list.getIndexByValue('id', 2)).toEqual(1);
            expect(list.getIndexByValue('id', 3)).toEqual(2);
            expect(list.getIndexByValue('id', 4)).toEqual(3);
        });

        test('should shift indexes after add', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.add({ id: 5 }, 1);
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            expect(list.getIndexByValue('id', 5)).toEqual(1);
            expect(list.getIndexByValue('id', 2)).toEqual(2);
            expect(list.getIndexByValue('id', 3)).toEqual(3);
        });

        test('should return first index if dublicate added before', () => {
            const list = new List({
                items: [{ id: 1 }, { id: 2 }, { id: 3 }],
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.add({ id: 1 }, 0);
            expect(list.getIndexByValue('id', 1)).toEqual(0);
        });

        test('should shift indexes after append', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.append([{ id: 5 }, { id: 6 }]);
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            expect(list.getIndexByValue('id', 3)).toEqual(2);
            expect(list.getIndexByValue('id', 4)).toEqual(3);
            expect(list.getIndexByValue('id', 5)).toEqual(4);
            expect(list.getIndexByValue('id', 6)).toEqual(5);
        });

        test('should shift indexes after prepend', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.prepend([{ id: 5 }, { id: 6 }]);
            expect(list.getIndexByValue('id', 5)).toEqual(0);
            expect(list.getIndexByValue('id', 6)).toEqual(1);
            expect(list.getIndexByValue('id', 1)).toEqual(2);
            expect(list.getIndexByValue('id', 2)).toEqual(3);
        });

        test('should shift indexes after removeAt', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.removeAt(1);
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            expect(list.getIndexByValue('id', 2)).toEqual(-1);
            expect(list.getIndexByValue('id', 3)).toEqual(1);
            expect(list.getIndexByValue('id', 4)).toEqual(2);
        });

        test('should shift indexes after replace', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.replace({ id: 5 }, 1);
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            expect(list.getIndexByValue('id', 2)).toEqual(-1);
            expect(list.getIndexByValue('id', 3)).toEqual(2);
            expect(list.getIndexByValue('id', 4)).toEqual(3);
            expect(list.getIndexByValue('id', 5)).toEqual(1);
        });

        test('should return -1 indexes after clear', () => {
            const list = new List({
                items: innerGetItems(),
            });
            expect(list.getIndexByValue('id', 1)).toEqual(0);
            list.clear();
            expect(list.getIndexByValue('id', 1)).toEqual(-1);
            expect(list.getIndexByValue('id', 2)).toEqual(-1);
            expect(list.getIndexByValue('id', 3)).toEqual(-1);
            expect(list.getIndexByValue('id', 4)).toEqual(-1);
        });
    });

    describe('.getIndicesByValue', () => {
        test('should return indices by value', () => {
            const newItems = [
                {
                    id: 70,
                    name: '12a',
                },
                {
                    id: 71,
                    name: '12a',
                },
            ];
            const len = items.length;
            const list = new List({
                items: items.concat(newItems),
            });
            const indices = [len, len + 1];
            expect(list.getIndicesByValue('name', '12a')).toEqual(indices);
        });
    });

    describe('.getCount()', () => {
        test('should return same count like initial collection', () => {
            const list = new List({
                items: items.slice(),
            });
            expect(items.length).toBe(list.getCount());
        });

        test('should change after modifications', () => {
            const list = new List();
            expect(0).toBe(list.getCount());
            list.add({});
            expect(1).toBe(list.getCount());
            list.add({}, 0);
            expect(2).toBe(list.getCount());
            list.add({}, 1);
            expect(3).toBe(list.getCount());

            //@ts-ignore
            list.assign();
            expect(0).toBe(list.getCount());

            list.assign(
                new List({
                    items: [1, 2],
                })
            );
            expect(2).toBe(list.getCount());

            list.append(
                new List({
                    items: [3, 4, 5],
                })
            );
            expect(5).toBe(list.getCount());

            list.remove(2);
            expect(4).toBe(list.getCount());

            list.removeAt(1);
            expect(3).toBe(list.getCount());

            list.replace(10, 2);
            expect(3).toBe(list.getCount());
        });
    });

    describe('.isEqual()', () => {
        test('should return true for list with same instances', () => {
            const listA = new List({
                items: items.slice(),
            });
            const listB = new List({
                items: items.slice(),
            });
            expect(listA.isEqual(listB)).toBe(true);
        });

        test('should return false for list with different instances', () => {
            const listA = new List({
                items: getItems(),
            });
            const listB = new List({
                items: getItems(),
            });
            expect(listA.isEqual(listB)).toBe(false);
        });

        test('should return false for list with different count', () => {
            const listA = new List({
                items: items.slice(),
            });
            const listB = new List({
                items: items.slice(),
            });
            listB.removeAt(5);
            expect(listA.isEqual(listB)).toBe(false);
        });

        test('should return false for not a list', () => {
            const list = new List();
            //@ts-ignore
            expect(list.isEqual()).toBe(false);
            expect(list.isEqual(null)).toBe(false);
            expect(list.isEqual(false)).toBe(false);
            expect(list.isEqual(true)).toBe(false);
            expect(list.isEqual(0)).toBe(false);
            expect(list.isEqual(1)).toBe(false);
            expect(list.isEqual('')).toBe(false);
            expect(list.isEqual('a')).toBe(false);
            expect(list.isEqual({})).toBe(false);
            expect(list.isEqual([])).toBe(false);
        });
    });

    describe('.toJSON()', () => {
        test('should serialize a list', () => {
            const list = new List({
                items,
            });
            const json = list.toJSON();
            expect(json?.module).toBe('Types/collection:List');
            expect(typeof json?.id).toBe('number');
            //@ts-ignore
            expect(json?.id > 0).toBe(true);
            //@ts-ignore
            expect(json?.state.$options).toEqual(list._getOptions());
            //@ts-ignore
            expect(json?.state._items).toEqual(list._items);
        });
    });

    describe('.getVersion()', () => {
        test('should change version when item has been added to the list', () => {
            const list = new List({
                items,
            });
            const version = list.getVersion();
            list.add({
                id: 110,
                name: 'Иванов',
            });
            expect(version).not.toEqual(list.getVersion());
        });

        test('should change version when item has been removed from the list', () => {
            const list = new List({
                items,
            });
            const version = list.getVersion();
            list.removeAt(0);
            expect(version).not.toEqual(list.getVersion());
        });

        test('should change version when another list has been appended from the list', () => {
            const list = new List({
                items,
            });
            const version = list.getVersion();
            list.append(items);
            expect(version).not.toEqual(list.getVersion());
        });

        test('should change version when inner item has been changed', () => {
            const list = new List({
                items: [new Record({ rawData: { id: 32 } })],
            });
            const version = list.getVersion();
            list.at(0).set('id', 1);
            expect(version).not.toEqual(list.getVersion());
        });

        test('should change version of each list which changed item belongs to', () => {
            const item = new Record();
            const listA = new List();
            const listB = new List();

            listA.add(item);
            const versionA = listA.getVersion();
            listB.add(item);
            const versionB = listB.getVersion();

            item.set('foo', 'bar');
            expect(versionA).not.toEqual(listA.getVersion());
            expect(versionB).not.toEqual(listB.getVersion());
        });
    });
});
