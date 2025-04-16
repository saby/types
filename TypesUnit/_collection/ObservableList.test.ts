import { List, ObservableList, IObservable as IBindCollection } from 'Types/collection';
import { Record } from 'Types/entity';
import 'Types/_entity/adapter/Json';

describe('Types/_collection/ObservableList', () => {
    function checkEvent(
        action: any,
        newItems: any,
        newItemsIndex: any,
        oldItems: any,
        oldItemsIndex: any,
        reason: string,
        actionOriginal: any,
        newItemsOriginal: any,
        newItemsIndexOriginal: any,
        oldItemsOriginal: any,
        oldItemsIndexOriginal: any,
        reasonOriginal: string
    ): void {
        if (action !== actionOriginal) {
            throw new Error('Invalid action');
        }

        for (let i = 0; i < newItems.length; i++) {
            if (newItems[i] !== newItemsOriginal[i]) {
                throw new Error('Invalid newItems');
            }
        }
        if (newItemsIndex !== newItemsIndexOriginal) {
            throw new Error('Invalid newItemsIndex');
        }

        for (let i = 0; i < oldItems.length; i++) {
            if (oldItems[i] !== oldItemsOriginal[i]) {
                throw new Error('Invalid oldItems');
            }
        }
        if (oldItemsIndex !== oldItemsIndexOriginal) {
            throw new Error('Invalid oldItemsIndex');
        }

        if (reason !== reasonOriginal) {
            throw new Error('Invalid reason');
        }
    }

    interface IData {
        id: number | string;
        lastName?: string;
    }

    let items: IData[];

    beforeEach(() => {
        items = [
            {
                id: 1,
                lastName: 'One',
            },
            {
                id: 2,
                lastName: 'Two',
            },
            {
                id: 3,
                lastName: 'Three',
            },
            {
                id: 4,
                lastName: 'Four',
            },
            {
                id: 5,
                lastName: 'Five',
            },
            {
                id: 6,
                lastName: 'Six',
            },
            {
                id: 7,
                lastName: 'Seven',
            },
        ];
    });

    describe('.append()', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice(),
            });
            const concatItems = [1, 2, 3];
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_ADD,
                        concatItems,
                        items.length,
                        [],
                        0,
                        'append'
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };
            list.subscribe('onCollectionChange', handler);

            list.append(
                new List<any>({
                    items: concatItems,
                })
            );

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });
    });

    describe('.prepend', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice(),
            });
            const concatItems = [4, 5, 6];
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_ADD,
                        concatItems,
                        0,
                        [],
                        0,
                        'prepend'
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.prepend(
                new List<any>({
                    items: concatItems,
                })
            );

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });
    });

    describe('.assign()', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice(),
            });
            const fillItems = ['a', 'b'];
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_RESET,
                        fillItems,
                        0,
                        items,
                        0,
                        'assign'
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.assign(
                new List<any>({
                    items: fillItems,
                })
            );

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        test('should trigger onCollectionItemChange with changed item after several assigns', (done) => {
            const list = new ObservableList<Record>();
            const items = [new Record(), new Record(), new Record()];
            let firesToBeDone = 3;
            const handler = () => {
                firesToBeDone--;
                if (firesToBeDone === 0) {
                    done();
                }
            };
            list.subscribe('onCollectionItemChange', handler);
            list.assign(items);
            list.at(1).set('a', 1);
            list.assign(items);
            list.at(1).set('a', 2);
            list.assign(items);
            list.at(1).set('a', 3);
            list.unsubscribe('onCollectionItemChange', handler);
            list.destroy();
        });

        test("shouldn't trigger onCollectionChange if empty replaced with empty", () => {
            const list = new ObservableList();
            let triggered = false;
            const handler = () => {
                triggered = true;
            };

            list.subscribe('onCollectionChange', handler);
            list.assign(new List());
            list.unsubscribe('onCollectionChange', handler);

            expect(triggered).toBe(false);
        });

        test('should throw an error on attempt to change instance within onCollectionChange handler', () => {
            const list = new ObservableList();
            let triggered = false;
            const handler = () => {
                expect(() => {
                    list.add(2);
                }).toThrow();
                triggered = true;
            };
            list.subscribe('onCollectionChange', handler);
            list.assign([1]);
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            expect(triggered).toBe(true);
        });
    });

    describe('.clear()', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice(),
            });
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_RESET,
                        [],
                        0,
                        items,
                        0,
                        'clear'
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.clear();

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });
    });

    describe('.add()', () => {
        describe('when append', () => {
            test('should trigger onCollectionChange with valid arguments', (done) => {
                const list = new ObservableList({
                    items: items.slice(),
                });
                let andDone = false;
                let addIndex = items.length;
                //@ts-ignore
                let addItem;
                const handler = (
                    //@ts-ignore
                    event,
                    //@ts-ignore
                    action,
                    //@ts-ignore
                    newItems,
                    //@ts-ignore
                    newItemsIndex,
                    //@ts-ignore
                    oldItems,
                    //@ts-ignore
                    oldItemsIndex,
                    //@ts-ignore
                    reason
                ) => {
                    try {
                        checkEvent(
                            action,
                            newItems,
                            newItemsIndex,
                            oldItems,
                            oldItemsIndex,
                            reason,
                            IBindCollection.ACTION_ADD,
                            //@ts-ignore
                            [addItem],
                            addIndex,
                            [],
                            0,
                            'add'
                        );
                        if (andDone) {
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                };

                list.subscribe('onCollectionChange', handler);

                //@ts-ignore
                addItem = { a: 1 };
                list.add(addItem);

                //@ts-ignore
                addItem = { a: 2 };
                addIndex++;
                list.add(addItem);

                andDone = true;
                //@ts-ignore
                addItem = { a: 3 };
                addIndex++;
                list.add(addItem);

                list.unsubscribe('onCollectionChange', handler);
                list.destroy();
            });
        });

        describe('when prepend', () => {
            test('should trigger onCollectionChange with valid arguments', (done) => {
                const list = new ObservableList({
                    items: items.slice(),
                });
                let andDone = false;
                let addItem: { [key: string]: number };
                const handler = (
                    //@ts-ignore
                    event,
                    //@ts-ignore
                    action,
                    //@ts-ignore
                    newItems,
                    //@ts-ignore
                    newItemsIndex,
                    //@ts-ignore
                    oldItems,
                    //@ts-ignore
                    oldItemsIndex,
                    //@ts-ignore
                    reason
                ) => {
                    try {
                        checkEvent(
                            action,
                            newItems,
                            newItemsIndex,
                            oldItems,
                            oldItemsIndex,
                            reason,
                            IBindCollection.ACTION_ADD,
                            [addItem],
                            0,
                            [],
                            0,
                            'add'
                        );
                        if (andDone) {
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                };

                list.subscribe('onCollectionChange', handler);

                addItem = { b: 1 };
                //@ts-ignore
                list.add(addItem, 0);

                addItem = { b: 2 };
                //@ts-ignore
                list.add(addItem, 0);

                andDone = true;
                addItem = { b: 3 };
                //@ts-ignore
                list.add(addItem, 0);

                list.unsubscribe('onCollectionChange', handler);
                list.destroy();
            });
        });

        describe('when insert', () => {
            test('should trigger onCollectionChange with valid arguments', (done) => {
                const list = new ObservableList({
                    items: items.slice(),
                });
                let andDone = false;
                let addItem: { [key: string]: number };
                let at: number;
                const handler = (
                    //@ts-ignore
                    event,
                    //@ts-ignore
                    action,
                    //@ts-ignore
                    newItems,
                    //@ts-ignore
                    newItemsIndex,
                    //@ts-ignore
                    oldItems,
                    //@ts-ignore
                    oldItemsIndex,
                    //@ts-ignore
                    reason
                ) => {
                    try {
                        checkEvent(
                            action,
                            newItems,
                            newItemsIndex,
                            oldItems,
                            oldItemsIndex,
                            reason,
                            IBindCollection.ACTION_ADD,
                            [addItem],
                            at,
                            [],
                            0,
                            'add'
                        );
                        if (andDone) {
                            done();
                        }
                    } catch (err) {
                        done(err);
                    }
                };

                list.subscribe('onCollectionChange', handler);

                addItem = { c: 1 };
                at = 5;
                //@ts-ignore
                list.add(addItem, at);
                //@ts-ignore
                list.add(addItem, at);

                addItem = { c: 2 };
                at = 4;
                //@ts-ignore
                list.add(addItem, at);

                andDone = true;
                addItem = { c: 3 };
                at = 1;
                //@ts-ignore
                list.add(addItem, at);

                list.unsubscribe('onCollectionChange', handler);
                list.destroy();
            });
        });
    });

    describe('.removeAt()', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({ items });
            let andDone = false;
            let oldItem: { [key: string]: number };
            let at: number;
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_REMOVE,
                        [],
                        0,
                        [oldItem],
                        at,
                        'removeAt'
                    );
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            //@ts-ignore
            oldItem = list.at(at);
            list.removeAt(at);

            at = 1;
            //@ts-ignore
            oldItem = list.at(at);
            list.removeAt(at);

            andDone = true;
            at = 3;
            //@ts-ignore
            oldItem = list.at(at);
            list.removeAt(at);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        test("shouldn't trigger onCollectionChange with change item", (done) => {
            const list = new ObservableList({
                items: [],
            });
            const addItem = new Record({
                rawData: { foo: 'fail' },
            });
            const handler = () => {
                done();
            };

            //@ts-ignore
            list.add(addItem);
            list.removeAt(0);
            list.subscribe('onCollectionChange', handler);
            addItem.set('foo', 'ok');
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
            done();
        });

        test('should trigger onCollectionChange with change item and list had changed yet', (done) => {
            const list = new ObservableList({ items });
            const at = 1;
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems) => {
                if (list.getIndex(oldItems[0]) === -1) {
                    done();
                }
            };

            list.subscribe('onCollectionChange', handler);

            list.removeAt(at);
        });
    });

    describe('.replace()', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice(),
            });
            let andDone = false;
            let oldItem: { [key: string]: number };
            let newItem: { [key: string]: number };
            let at: number;
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_REPLACE,
                        [newItem],
                        at,
                        [oldItem],
                        at,
                        'replace'
                    );
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            at = 1;
            //@ts-ignore
            oldItem = list.at(at);
            newItem = { d: 1 };
            //@ts-ignore
            list.replace(newItem, at);

            at = 5;
            //@ts-ignore
            oldItem = list.at(at);
            newItem = { d: 2 };
            //@ts-ignore
            list.replace(newItem, at);

            andDone = true;
            at = 3;
            //@ts-ignore
            oldItem = list.at(at);
            newItem = { d: 3 };
            //@ts-ignore
            list.replace(newItem, at);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        test("should don't trigger onCollectionChange if replace with itself", () => {
            const list = new ObservableList({
                items: items.slice(),
            });
            let fireCount = 0;
            const handler = () => {
                fireCount++;
            };

            list.subscribe('onCollectionChange', handler);
            list.each((item, at) => {
                list.replace(item, at);
            });
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            expect(fireCount).toBe(0);
        });
    });

    describe('.move()', () => {
        test('should trigger onCollectionChange with valid arguments', (done) => {
            const list = new ObservableList({
                items: items.slice(),
            });
            let andDone = false;
            let oldItem: IData;
            let newItem: IData;
            let from: number;
            let to: number;
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                try {
                    checkEvent(
                        action,
                        newItems,
                        newItemsIndex,
                        oldItems,
                        oldItemsIndex,
                        reason,
                        IBindCollection.ACTION_MOVE,
                        [newItem],
                        to,
                        [oldItem],
                        from,
                        'move'
                    );
                    if (andDone) {
                        done();
                    }
                } catch (err) {
                    done(err);
                }
            };

            list.subscribe('onCollectionChange', handler);

            from = 0;
            to = 1;
            newItem = oldItem = list.at(from);
            list.move(from, to);

            andDone = true;
            from = 2;
            to = 0;
            newItem = oldItem = list.at(from);
            list.move(from, to);

            list.unsubscribe('onCollectionChange', handler);
            list.destroy();
        });

        test("should don't trigger onCollectionChange for equal positions", () => {
            const list = new ObservableList({
                items: items.slice(),
            });
            let fireCount = 0;
            const handler = () => {
                fireCount++;
            };

            list.subscribe('onCollectionChange', handler);
            list.move(0, 0);
            list.unsubscribe('onCollectionChange', handler);
            list.destroy();

            expect(fireCount).toBe(0);
        });
    });

    describe('.getIndexByValue', () => {
        test('should update index after change item property', () => {
            const item = new Record({
                rawData: { checked: false },
            });
            const list = new ObservableList({
                items: [item],
            });

            expect(list.getIndexByValue('checked', false)).toBe(0);
            expect(list.getIndexByValue('checked', true)).toBe(-1);

            item.set('checked', true);
            expect(list.getIndexByValue('checked', false)).toBe(-1);
            expect(list.getIndexByValue('checked', true)).toBe(0);

            item.set('checked', false);
            expect(list.getIndexByValue('checked', false)).toBe(0);
            expect(list.getIndexByValue('checked', true)).toBe(-1);
        });
    });

    describe('.setEventRaising()', () => {
        test('should enable and disable onCollectionItemChange', () => {
            let fired;
            const list = new ObservableList({
                items: items.slice(),
            });
            const handler = () => {
                fired = true;
            };

            list.subscribe('onCollectionItemChange', handler);

            fired = false;
            list.setEventRaising(true);
            list.at(0).id = 999;
            (list as any)._notifyItemChange(list.at(0), { id: 999 });
            expect(fired).toBe(true);

            fired = false;
            list.setEventRaising(false);
            list.at(0).id = 777;
            (list as any)._notifyItemChange(list.at(0), { id: 777 });
            expect(fired).toBe(false);

            list.unsubscribe('onCollectionItemChange', handler);
        });

        test('should enable and disable onCollectionChange', () => {
            let fired;
            const list = new ObservableList({
                items: items.slice(),
            });
            const handler = () => {
                fired = true;
            };

            list.subscribe('onCollectionChange', handler);

            fired = false;
            list.setEventRaising(true);
            list.add({ id: 'testA' });
            expect(fired).toBe(true);

            fired = false;
            list.setEventRaising(false);
            list.add({ id: 'testB' });
            expect(fired).toBe(false);

            list.unsubscribe('onCollectionChange', handler);
        });

        test('should trigger ACTION_ADD after restore if "analize" is true and one item added', () => {
            const list = new ObservableList({
                items: items.slice(),
            });
            const args: any = {};
            let fired = false;
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            list.add({ id: 'testA' });

            expect(fired).toBe(false);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(fired).toBe(true);
            expect(args.action).toBe(IBindCollection.ACTION_ADD);
            expect(args.newItems[0].id).toBe('testA');
            expect(args.newItemsIndex).toBe(list.getCount() - 1);
            expect(args.oldItems.length).toBe(0);
            expect(args.oldItemsIndex).toBe(0);
        });

        test('should trigger onCollectionChange with ACTION_CHANGE if "analize" is true and some item changed', () => {
            const items = [new Record(), new Record(), new Record()];
            const list = new ObservableList({ items });
            const args: any = {};
            let fired = false;
            const item = list.at(1);
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            item.set('testP', 'testV');

            expect(fired).toBe(false);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(fired).toBe(true);
            expect(args.action).toBe(IBindCollection.ACTION_CHANGE);
            expect(args.newItems[0]).toBe(item);
            expect(args.newItemsIndex).toBe(1);
            expect(args.oldItems[0]).toBe(item);
            expect(args.oldItemsIndex).toBe(1);
        });

        test('should trigger onCollectionChange with ACTION_CHANGE if "analize" is true and a few items changed', () => {
            const items = [new Record(), new Record(), new Record(), new Record(), new Record()];
            const list = new ObservableList({ items });
            const packs = [[0], [2, 3]];
            interface IItem {
                action: number;
                newItems: number[];
                newItemsIndex: number;
                oldItems: number[];
                oldItemsIndex: number;
                groupId: number;
            }
            const args: IItem[] = [];
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                //@ts-ignore
                args.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex,
                });
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);
            for (let i = 0; i < packs.length; i++) {
                const pack = packs[i];
                for (let j = 0; j < pack.length; j++) {
                    list.at(pack[j]).set('testP', 'testV');
                }
            }

            expect(args.length === 0).toBe(true);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(args.length === 2).toBe(true);
            for (let i = 0; i < packs.length; i++) {
                const pack = packs[i].map((index) => {
                    return items[index];
                });
                const arg = args[i];

                expect(arg.action).toBe(IBindCollection.ACTION_CHANGE);
                expect(arg.newItems).toEqual(pack);
                expect(arg.newItemsIndex).toBe(packs[i][0]);
                expect(arg.oldItems).toEqual(pack);
                expect(arg.oldItemsIndex).toBe(packs[i][0]);
            }
        });

        test('should trigger CollectionChange with ACTION_RESET if "analize" is true and a lot of items changed', () => {
            const items = [new Record(), new Record(), new Record()];
            const list = new ObservableList({
                items,
            });
            const args: any = {};
            let fired = false;
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                fired = true;
                args.action = action;
                args.newItems = newItems;
                args.newItemsIndex = newItemsIndex;
                args.oldItems = oldItems;
                args.oldItemsIndex = oldItemsIndex;
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);

            list.each((item, i) => {
                item.set('foo', i);
            });

            expect(fired).toBe(false);

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            const listItems: unknown[] = [];
            list.each((item) => {
                listItems.push(item);
            });

            expect(fired).toBe(true);
            expect(args.action).toBe(IBindCollection.ACTION_RESET);
            expect(args.newItems).toEqual(listItems);
            expect(args.newItemsIndex).toBe(0);
            expect(args.oldItems).toEqual([]);
            expect(args.oldItemsIndex).toBe(0);
        });

        test('should trigger CollectionChange with ACTION_CHANGE if single item changed many times', () => {
            const items = [new Record(), new Record(), new Record()];
            const list = new ObservableList({ items });
            const firedActions: string[] = [];
            //@ts-ignore
            const handler = (event, action) => {
                firedActions.push(action);
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);

            [0, 1, 2, 3, 4, 5, 6].forEach((value) => {
                list.at(0).set('foo', value);
            });

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(firedActions).toEqual([IBindCollection.ACTION_CHANGE]);
        });

        test('should fire after wake up', () => {
            const list = new ObservableList({
                items: items.slice(),
            });
            const addItem = { id: 'Test' };
            interface IGiven {
                action: number;
                newItems: number[];
                newItemsIndex: number;
                oldItems: number[];
                oldItemsIndex: number;
                groupId: number;
            }
            const given: IGiven[] = [];
            const expectData = [
                {
                    action: IBindCollection.ACTION_MOVE,
                    newItems: [list.at(1)],
                    newItemsIndex: 0,
                    oldItems: [list.at(1)],
                    oldItemsIndex: 1,
                },
                {
                    action: IBindCollection.ACTION_REMOVE,
                    newItems: [],
                    newItemsIndex: 0,
                    oldItems: [list.at(2)],
                    oldItemsIndex: 2,
                },
                {
                    action: IBindCollection.ACTION_ADD,
                    newItems: [addItem],
                    newItemsIndex: 1,
                    oldItems: [],
                    oldItemsIndex: 0,
                },
            ];
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                //@ts-ignore
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex,
                });
            };

            list.subscribe('onCollectionChange', handler);

            list.setEventRaising(false, true);
            const item = list.removeAt(0);
            list.add(item, 1);
            list.setEventRaising(true, true);

            list.setEventRaising(false, true);
            list.removeAt(2);
            list.setEventRaising(true, true);

            list.setEventRaising(false, true);
            list.add(addItem, 1);
            list.setEventRaising(true, true);

            list.unsubscribe('onCollectionChange', handler);

            expect(expectData.length).toBe(given.length);
            for (let i = 0; i < given.length; i++) {
                expect(given[i].action).toBe(expectData[i].action);

                expect(given[i].newItems.length).toBe(expectData[i].newItems.length);
                expect(given[i].newItemsIndex).toBe(expectData[i].newItemsIndex);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    expect(given[i].newItems[j]).toBe(expectData[i].newItems[j]);
                }

                expect(given[i].oldItems.length).toBe(expectData[i].oldItems.length);
                expect(given[i].oldItemsIndex).toBe(expectData[i].oldItemsIndex);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    expect(given[i].oldItems[j]).toBe(expectData[i].oldItems[j]);
                }
            }
        });

        test('should throw an error if enabled not changed and anailze=true', () => {
            const list = new ObservableList();

            list.setEventRaising(false, true);
            expect(() => {
                list.setEventRaising(false, true);
            }).toThrow();

            list.setEventRaising(true, true);
            expect(() => {
                list.setEventRaising(true, true);
            }).toThrow();
        });

        test('should generate move action if item has been removed and added in one transaction', () => {
            const list = new ObservableList({
                items: [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }],
            });
            const item = list.at(0);
            interface IGiven {
                action: number;
                newItems: number[];
                newItemsIndex: number;
                oldItems: number[];
                oldItemsIndex: number;
                groupId: number;
            }
            const given: IGiven[] = [];
            const expectData = [
                {
                    action: IBindCollection.ACTION_MOVE,
                    newItems: [list.at(1), list.at(2)],
                    newItemsIndex: 0,
                    oldItems: [list.at(1), list.at(2)],
                    oldItemsIndex: 1,
                    groupId: 1,
                },
            ];
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                //@ts-ignore
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex,
                });
            };

            list.setEventRaising(false, true);
            list.remove(item);
            list.add(item, 2);
            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(expectData.length).toBe(given.length);
            for (let i = 0; i < given.length; i++) {
                expect(given[i].action).toBe(expectData[i].action);

                expect(given[i].newItems.length).toBe(expectData[i].newItems.length);
                expect(given[i].newItemsIndex).toBe(expectData[i].newItemsIndex);
                for (let j = 0; j < given[i].newItems.length; j++) {
                    expect(given[i].newItems[j]).toBe(expectData[i].newItems[j]);
                }

                expect(given[i].oldItems.length).toBe(expectData[i].oldItems.length);
                expect(given[i].oldItemsIndex).toBe(expectData[i].oldItemsIndex);
                for (let j = 0; j < given[i].oldItems.length; j++) {
                    expect(given[i].oldItems[j]).toBe(expectData[i].oldItems[j]);
                }
            }
        });

        test('should trigger "onCollectionChange" including changed property name if analyze=true', () => {
            const records = [
                new Record({
                    rawData: { foo: 'fail', bar: 'test' },
                }),
                // нужны дополнительные рекорды в коллекции, иначе стрельнет ACTION_RESET
                new Record(),
                new Record(),
            ];
            const list = new ObservableList({
                items: records,
            });

            const eventObjects: object[] = [];
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason,
                //@ts-ignore
                chProps
            ) => {
                eventObjects.push(chProps);
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);

            list.at(0).set('foo', 'success');

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(eventObjects.length).toBe(1);
            const changedObject = eventObjects[0];
            expect(Object.keys(changedObject)).toEqual(['0']);
            //@ts-ignore
            expect(Object.keys(changedObject[0])).toEqual(['foo']);
        });

        test('should trigger "onCollectionChange" including properties if analyze=true and multiple changes', () => {
            const records = [
                new Record({
                    rawData: { foo: 'fail', bar: 'no-change' },
                }),
                new Record({
                    rawData: { foo: 'success', bar: 'no-change' },
                }),
                // нужны дополнительные рекорды в коллекции, иначе стрельнет ACTION_RESET
                new Record(),
                new Record(),
            ];
            const list = new ObservableList({
                items: records,
            });

            const eventObjects: object[] = [];
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason,
                //@ts-ignore
                chProps
            ) => {
                eventObjects.push(chProps);
            };

            list.subscribe('onCollectionChange', handler);
            list.setEventRaising(false, true);

            const first = list.at(0);
            const second = list.at(1);

            first.set('foo', 'success');
            first.set('foo', 'success revert');
            first.set('bar', 'change');
            second.set('foo', 'fail');
            second.set('bar', 'change');

            list.setEventRaising(true, true);
            list.unsubscribe('onCollectionChange', handler);

            expect(eventObjects.length).toBe(1);
            const changedItems = Object.entries(eventObjects[0]);
            expect(changedItems.length).toBe(2);
            changedItems.forEach(([_index, value]) => {
                expect(value.hasOwnProperty('foo')).toBeTruthy();
                expect(value.hasOwnProperty('bar')).toBeTruthy();
            });
        });
    });

    describe('.isEventRaising()', () => {
        test('should return true by default', () => {
            const list = new ObservableList();
            expect(list.isEventRaising()).toBe(true);
        });

        test('should return true if enabled', () => {
            const list = new ObservableList();
            list.setEventRaising(true);
            expect(list.isEventRaising()).toBe(true);
        });

        test('should return false if disabled', () => {
            const list = new ObservableList();
            list.setEventRaising(false);
            expect(list.isEventRaising()).toBe(false);
        });
    });

    describe('.subscribe()', () => {
        test('should trigger "onCollectionItemChange" if property changed', () => {
            const item = new Record({
                rawData: { foo: 'fail' },
            });
            const list = new ObservableList({
                items: [item],
            });
            const given: any = {};
            //@ts-ignore
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };

            list.subscribe('onCollectionItemChange', handler);
            item.set('foo', 'ok');
            list.unsubscribe('onCollectionItemChange', handler);

            expect(given.item).toBe(item);
            expect(given.index).toBe(0);
            expect(given.props).toEqual({ foo: 'ok' });
        });

        test('should trigger "onCollectionItemChange" if Flags property changed', () => {
            const item = new Record({
                rawData: { foo: [false] },
                format: {
                    foo: { type: 'flags', dictionary: ['one'] },
                },
            });
            const list = new ObservableList({
                items: [item],
            });
            const given: any = {};
            //@ts-ignore
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };
            const foo = item.get('foo');

            list.subscribe('onCollectionItemChange', handler);
            foo.set('one', true);
            list.unsubscribe('onCollectionItemChange', handler);

            expect(given.item).toBe(item);
            expect(given.index).toBe(0);
            expect(given.props).toEqual({ foo });
        });

        test('should trigger "onCollectionItemChange" if Enum property changed', () => {
            const item = new Record({
                rawData: { foo: 0 },
                format: {
                    foo: { type: 'enum', dictionary: ['one', 'two'] },
                },
            });
            const list = new ObservableList({
                items: [item],
            });
            const given: any = {};
            //@ts-ignore
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };
            const foo = item.get('foo');

            list.subscribe('onCollectionItemChange', handler);
            foo.set(1);
            list.unsubscribe('onCollectionItemChange', handler);

            expect(given.item).toBe(item);
            expect(given.index).toBe(0);
            expect(given.props).toEqual({ foo });
        });

        test('should trigger "onCollectionItemChange" if relation changed', () => {
            const item = new Record({
                rawData: { foo: 'fail' },
            });
            const list = new ObservableList({
                items: [item],
            });
            const given: any = {};
            //@ts-ignore
            const handler = (event, item, index, props) => {
                given.item = item;
                given.index = index;
                given.props = props;
            };

            list.subscribe('onCollectionItemChange', handler);
            list.relationChanged({ target: item }, []);
            list.unsubscribe('onCollectionItemChange', handler);

            expect(given.item).toBe(item);
            expect(given.index).toBe(0);
            expect(given.props).toBeInstanceOf(Object);
        });

        test('should trigger "onEventRaisingChange"', () => {
            const list = new ObservableList();
            let data: {
                enabled?: boolean;
                analyze?: boolean;
            } = {};
            //@ts-ignore
            const handler = (event, enabled, analyze) => {
                data = { enabled, analyze };
            };

            list.subscribe('onEventRaisingChange', handler);

            list.setEventRaising(false);
            expect(data.enabled).toBe(false);
            expect(data.analyze).toBe(false);

            list.setEventRaising(true);
            expect(data.enabled).toBe(true);
            expect(data.analyze).toBe(false);

            list.setEventRaising(false, true);
            expect(data.enabled).toBe(false);
            expect(data.analyze).toBe(true);

            list.setEventRaising(true, true);
            expect(data.enabled).toBe(true);
            expect(data.analyze).toBe(true);

            list.unsubscribe('onEventRaisingChange', handler);
        });
    });
});
