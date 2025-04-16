import HierarchicalMemory from 'Types/_source/HierarchicalMemory';
import Memory from 'Types/_source/Memory';
import Query from 'Types/_source/Query';
import Model from 'Types/_entity/Model';
import Record from 'Types/_entity/Record';

describe('Types/_source/HierarchicalMemory', () => {
    let data;
    let source: HierarchicalMemory;

    beforeEach(() => {
        data = [
            { id: 1, title: 'foo' },
            { id: 2, title: 'bar' },
        ];

        source = new HierarchicalMemory({
            data,
            keyProperty: 'id',
        });
    });

    describe('.getOriginal()', () => {
        test('should return Memory instance', () => {
            expect(source.getOriginal()).toBeInstanceOf(Memory);
        });
    });

    describe('.create()', () => {
        test('should return record', () => {
            return source.create().then((model) => {
                expect(model).toBeInstanceOf(Model);
            });
        });
    });

    describe('.read()', () => {
        test('should return record', () => {
            return source.read(1).then((model) => {
                expect(model).toBeInstanceOf(Model);
                //@ts-ignore
                expect(model.getKey()).toEqual(1);
            });
        });
    });

    describe('.update()', () => {
        test('should update record', () => {
            const rec = new Record({
                rawData: { id: 1, title: 'one' },
            });
            return source.update(rec).then((result) => {
                expect(result).toEqual(1);
            });
        });
    });

    describe('.destroy()', () => {
        test('should delete record', () => {
            return source.destroy(1).then(() => {
                expect('fine').toBeTruthy();
            });
        });
    });

    describe('.query()', () => {
        test('should return all source records', () => {
            return source.query().then((result) => {
                expect(result.getAll().getCount()).toEqual(2);
            });
        });

        test('should return items and path in metadata', () => {
            const source = new HierarchicalMemory({
                data: [
                    { id: 1, parent: null, name: 'Catalogue' },
                    { id: 10, parent: 1, name: 'Computers' },
                    { id: 100, parent: 10, name: 'Laptops' },
                    { id: 1000, parent: 100, name: 'Apple MacBook Pro' },
                    { id: 1001, parent: 100, name: 'Xiaomi Mi Notebook Air' },
                    { id: 11, parent: 1, name: 'Smartphones' },
                    { id: 110, parent: 11, name: 'Apple iPhone' },
                ],
                keyProperty: 'id',
                parentProperty: 'parent',
            });

            const query = new Query();
            query.where({ parent: 100 });

            const expectItems = ['Apple MacBook Pro', 'Xiaomi Mi Notebook Air'];
            const expectPath = ['Catalogue', 'Computers', 'Laptops'];

            return source.query(query).then((result) => {
                const items: string[] = [];
                result.getAll().forEach((item) => {
                    //@ts-ignore
                    items.push(item.get('name'));
                });
                expect(items).toEqual(expectItems);

                const path: string[] = [];
                result
                    .getAll()
                    .getMetaData()
                    //@ts-ignore
                    .path?.each((item) => {
                        path.push(item.get('name'));
                    });
                expect(path).toEqual(expectPath);
            });
        });

        test("should return an empty path if query's filter doesn't have property related to parentProperty", () => {
            const source = new HierarchicalMemory({
                data: [
                    { id: 1, parent: null, name: 'Catalogue' },
                    { id: 10, parent: 1, name: 'Computers' },
                    { id: 100, parent: 10, name: 'Laptops' },
                ],
                keyProperty: 'id',
                parentProperty: 'parent',
            });

            const query = new Query();
            return source.query(query).then((result) => {
                expect(result.getAll().getMetaData().path?.getCount()).toBe(0);
            });
        });

        test('should return result with ENTRY_PATH in meta', () => {
            const source = new HierarchicalMemory({
                data: [
                    { id: 1, parent: null, name: 'Catalogue' },
                    { id: 10, parent: 1, name: 'Computers' },
                    { id: 100, parent: 10, name: 'Laptops' },
                    { id: 1000, parent: 100, name: 'Apple MacBook Pro' },
                    { id: 1001, parent: 100, name: 'Xiaomi Mi Notebook Air' },
                    { id: 11, parent: 1, name: 'Smartphones' },
                    { id: 110, parent: 11, name: 'Apple iPhone' },
                ],
                keyProperty: 'id',
                parentProperty: 'parent',
            });

            const query = new Query();
            query.where({
                parent: 100,
                entries: new Record({
                    rawData: {
                        marked: ['1000'],
                    },
                }),
            });

            const expectEntryPath = [
                {
                    id: 10,
                    parent: 1,
                },
                {
                    id: 100,
                    parent: 10,
                },
                {
                    id: 1000,
                    parent: 100,
                },
            ];

            return source.query(query).then((result) => {
                const path: string[] = [];
                result
                    .getAll()
                    .getMetaData()
                    //@ts-ignore
                    .ENTRY_PATH.forEach((item) => {
                        path.unshift(item.id);
                    });
                expect(path).toEqual(
                    expectEntryPath.map((x) => {
                        return x.id;
                    })
                );
            });
        });
    });

    describe('.merge()', () => {
        test('should merge records', () => {
            return source.merge(1, 2).then((result) => {
                expect(result).toEqual(1);
            });
        });
    });

    describe('.copy()', () => {
        test('should copy record', () => {
            return source.copy(1).then((result) => {
                //@ts-ignore
                expect(result.getKey()).toEqual(1);
            });
        });
    });

    describe('.move()', () => {
        test('should move record', () => {
            return source.move([1], 2).then((result) => {
                expect(result).not.toBeDefined();
            });
        });
    });

    describe('.toJSON()', () => {
        test('should serialize its own options', () => {
            const data = { foo: 'bar' };
            const options = {
                parentProperty: 'id',
            };
            const source = new HierarchicalMemory({ data, ...options });
            const serialized = source.toJSON();

            expect(serialized?.state.$options).toEqual(options);
            expect((serialized?.state as any)._source._$data).toEqual(data);
        });
    });
});
