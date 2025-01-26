import MemorySource from 'Types/_source/Memory';
import DataSet from 'Types/_source/DataSet';
import Query from 'Types/_source/Query';
import Model from 'Types/_entity/Model';
import List from 'Types/_collection/List';
import RecordSet from 'Types/_collection/RecordSet';
import SbisAdapter from 'Types/_entity/adapter/Sbis';

describe('Types/_source/Memory', () => {
    const existsId = 5;
    const existsIdIndex = 6;
    const existsId2 = 6;
    const existsId3 = 4;
    const notExistsId = 33;

    let data: {
        Id?: number;
        Order?: number;
        ParentId?: number[];
        LastName?: string;
        FirstName?: string;
        MiddleName?: string;
        Position?: string;
    }[];

    let source: MemorySource;

    beforeEach(() => {
        data = [
            {
                Id: 6,
                Order: 3,
                //@ts-ignore
                ParentId: [null],
                LastName: 'Иванов',
                FirstName: 'Иван',
                MiddleName: 'Иванович',
                Position: 'Инженер',
            },
            {
                Id: 4,
                Order: 1,
                //@ts-ignore
                ParentId: [null],
                LastName: 'Петров',
                FirstName: 'Федор',
                MiddleName: 'Иванович',
                Position: 'Директор',
            },
            {
                //@ts-ignore
                Order: null,
            },
            {
                Id: 7,
                Order: 6,
                ParentId: [6],
                LastName: 'Аксенова',
                FirstName: 'Федора',
                MiddleName: 'Сергеевна',
                Position: 'Инженер',
            },
            {
                Id: 2,
                Order: 0,
                ParentId: [4],
                LastName: 'Афанасьев',
                FirstName: 'Иван',
                MiddleName: 'Андреевич',
                Position: 'Директор',
            },
            {
                //@ts-ignore
                Id: null,
            },
            {
                Id: 5,
                Order: 4,
                //@ts-ignore
                ParentId: [null],
                LastName: 'Баранов',
                FirstName: 'Иванко',
                MiddleName: 'Петрович',
                Position: 'Карапуз',
            },
            {
                Id: 1,
                Order: 5,
                //@ts-ignore
                ParentId: [null],
                LastName: 'Годолцов',
                FirstName: 'Иван',
                MiddleName: 'Викторович',
                Position: 'Директор',
            },
            {
                Id: 3,
                Order: 3,
                ParentId: [6],
                LastName: 'Иванов',
                FirstName: 'Ян',
                MiddleName: 'Яковлевич',
                Position: 'Маркетолог',
            },
        ];

        source = new MemorySource({
            data,
            keyProperty: 'Id',
        });
    });

    describe('.data', () => {
        test('should return data passed to constructor', () => {
            expect(source.data).toBe(data);
        });
    });

    describe('.create()', () => {
        test('should return an empty model', () => {
            return source.create().then((model) => {
                expect(model).toBeInstanceOf(Model);
                if (model instanceof Model) {
                    expect(model.getKey()).not.toBeDefined();
                }
                expect(model.get('LastName')).not.toBeDefined();
            });
        });

        test('should return an model with initial data', () => {
            return source
                .create({
                    a: 1,
                    b: true,
                })
                .then((model) => {
                    expect(model.get('a')).toBe(1);
                    expect(model.get('b')).toBe(true);
                });
        });

        test('should return an unlinked model', () => {
            const meta = {
                a: 1,
                b: true,
            };
            return source.create(meta).then((model) => {
                model.set('a', 2);
                expect(meta.a).toBe(1);
            });
        });
    });

    describe('.read()', () => {
        describe('when the model is exists', () => {
            test('should return the valid model', () => {
                return source.read(existsId).then((model) => {
                    expect(model).toBeInstanceOf(Model);
                    if (model instanceof Model) {
                        //@ts-ignore
                        expect(model.getKey() > 0).toBe(true);
                        expect(model.getKey()).toBe(existsId);
                    }
                    expect(model.get('LastName')).toBe('Баранов');
                });
            });

            test('should return an unlinked model', () => {
                const oldValue = data[existsIdIndex].LastName;
                return source.read(existsId).then((model) => {
                    model.set('LastName', 'Test');
                    expect(data[existsIdIndex].LastName).toBe(oldValue);
                });
            });
        });

        describe("when the model isn't exists", () => {
            test('should return an error', () => {
                return source.read(notExistsId).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        expect(err).toBeInstanceOf(Error);
                    }
                );
            });
        });
    });

    describe('.update()', () => {
        describe('when the model was stored', () => {
            test('should update the model', () => {
                return source.read(existsId).then((model) => {
                    model.set('LastName', 'Петров');
                    return source.update(model).then((success) => {
                        expect(Boolean(success)).toBe(true);
                        expect(model.isChanged()).toBe(false);
                        return source.read(existsId).then((model) => {
                            expect(model.get('LastName')).toBe('Петров');
                        });
                    });
                });
            });
        });

        describe('when the model was not stored', () => {
            //@ts-ignore
            const testModel = (success, model, length) => {
                expect(!!success).toBe(true);
                expect(model.isChanged()).toBe(false);
                expect(!!model.getKey()).toBe(true);
                expect(length).toBe(data.length);
                return source.read(model.getKey()).then((modelToo) => {
                    expect(model.get('LastName')).toBe(modelToo.get('LastName'));
                });
            };

            test('should create the model by 1st way', () => {
                const oldLength = data.length;
                return source.create().then((model) => {
                    model.set('LastName', 'Козлов');
                    return source.update(model).then((success) => {
                        return testModel(success, model, 1 + oldLength);
                    });
                });
            });

            test('should create the model by 2nd way', () => {
                const oldLength = data.length;
                const model = new Model({
                    keyProperty: 'Id',
                });

                model.set('LastName', 'Овечкин');
                return source.update(model).then((success) => {
                    return testModel(success, model, 1 + oldLength);
                });
            });

            test('should generate id and set it in raw data', () => {
                const model = new Model({
                    keyProperty: 'Id',
                });

                return source.update(model).then((id) => {
                    expect(model.get('Id')).toEqual(id);
                    return source.read(String(id)).then((readModel) => {
                        expect(readModel.get('Id')).toEqual(id);
                    });
                });
            });

            test('should generate ids and set it in raw data when updating recordset', () => {
                const data = new RecordSet({
                    rawData: [
                        {
                            Id: null,
                            Order: 3,
                            ParentId: [null],
                            LastName: 'Иванов',
                            FirstName: 'Иван',
                            MiddleName: 'Иванович',
                            Position: 'Инженер',
                        },
                        {
                            Order: 1,
                            ParentId: [null],
                            LastName: 'Петровский',
                            FirstName: 'Федор',
                            MiddleName: 'Иванович',
                            Position: 'Директор',
                        },
                    ],
                    keyProperty: 'Id',
                });

                return source.update(data).then((ids) => {
                    const updates: Promise<void>[] = [];

                    data.each((model, i) => {
                        const id = (ids as any)[i];
                        expect(model.get('Id')).toEqual(id);
                        updates.push(
                            source.read(id).then((readModel) => {
                                expect(readModel.get('Id')).toEqual(id);
                            })
                        );
                    });

                    return Promise.all(updates);
                });
            });
        });

        describe('update few rows', () => {
            test('should insert new rows', () => {
                const source = new MemorySource({
                    data,
                    keyProperty: 'Id',
                });
                const rs = new RecordSet({
                    rawData: [
                        {
                            Id: 25,
                            Order: 3,
                            ParentId: [null],
                            LastName: 'Иванов',
                            FirstName: 'Иван',
                            MiddleName: 'Иванович',
                            Position: 'Инженер',
                        },
                        {
                            Id: 15,
                            Order: 1,
                            ParentId: [null],
                            LastName: 'Петровский',
                            FirstName: 'Федор',
                            MiddleName: 'Иванович',
                            Position: 'Директор',
                        },
                    ],
                });

                return source.update(rs).then(() => {
                    return source.read(15).then((record) => {
                        expect(record.get('LastName')).toEqual('Петровский');
                    });
                });
            });
        });
    });

    describe('.destroy()', () => {
        describe('when the model is exists', () => {
            test('should return success', () => {
                return source.destroy(existsId).then(() => {
                    expect('fine').toBeTruthy();
                });
            });

            test('should really delete the model', () => {
                return source.destroy(existsId).then(() => {
                    return source.read(existsId).then(
                        () => {
                            throw new Error('The model still exists');
                        },
                        (err) => {
                            // ok if err == Model is not found
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });
            });

            test('should decrease the size of raw data', () => {
                const targetLength = data.length - 1;
                return source.destroy(existsId).then(() => {
                    expect(targetLength).toBe(data.length);
                });
            });

            test('should decrease the size of raw data when delete a few models', () => {
                const targetLength = data.length - 2;
                return source.destroy([existsId, existsId2]).then(() => {
                    expect(targetLength).toBe(data.length);
                });
            });
        });

        describe("when the model isn't exists", () => {
            test('should return an error', () => {
                return source.destroy(notExistsId).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        expect(err).toBeInstanceOf(Error);
                    }
                );
            });
        });
    });

    describe('.merge()', () => {
        describe("when the model isn't exists", () => {
            test('should return an error', () => {
                return source.merge(notExistsId, existsId).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        expect(err).toBeInstanceOf(Error);
                    }
                );
            });

            test('should return an error', () => {
                return source.merge(existsId, notExistsId).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        expect(err).toBeInstanceOf(Error);
                    }
                );
            });
        });

        test('should merge models', () => {
            return source.merge(existsId, existsId2).then(() => {
                return source.read(existsId).then(() => {
                    return source.read(existsId2).then(
                        () => {
                            throw new Error('Exists extention model.');
                        },
                        (err) => {
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });
            });
        });
    });

    describe('.copy()', () => {
        test('should copy model', () => {
            const oldLength = data.length;
            return source.copy(existsId).then((copy) => {
                expect(copy).toBeInstanceOf(Model);
                expect(copy.getRawData()).toEqual(data[existsIdIndex]);
                expect(data.length).toBe(1 + oldLength);
            });
        });
    });

    describe('.query()', () => {
        test('should return a valid dataset', () => {
            return source.query(new Query()).then((ds) => {
                expect(ds).toBeInstanceOf(DataSet);
                expect(ds.getAll().getCount()).toBe(data.length);
            });
        });

        test('should work with no query', () => {
            return source.query().then((ds) => {
                expect(ds).toBeInstanceOf(DataSet);
                expect(ds.getAll().getCount()).toBe(data.length);
            });
        });

        test('should return an unlinked collection', () => {
            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                const oldId = data[0].Id;
                //@ts-ignore
                rec.set('Id', 'test');
                expect(data[0].Id).toBe(oldId);
            });
        });

        test('should keep functions in data', () => {
            const data = [
                {
                    a: () => {
                        return undefined;
                    },
                },
            ];
            const source = new MemorySource({
                data,
            });

            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                //@ts-ignore
                expect(rec.get('a')).toBe(data[0].a);
            });
        });

        test('should keep modules of cloned instances', () => {
            const data = [
                {
                    a: new Model(),
                },
            ];
            const source = new MemorySource({
                data,
            });

            return source.query().then((ds) => {
                const rec = ds.getAll().at(0);
                //@ts-ignore
                expect(rec.get('a')).toBeInstanceOf(Model);
            });
        });

        test('should return a model instance of injected module', () => {
            class MyModel extends Model {}
            source.setModel(MyModel);
            return source.query().then((ds) => {
                expect(ds.getAll().at(0)).toBeInstanceOf(MyModel);
            });
        });

        test('should keep data artifact if data is empty', () => {
            const artifact = [{ foo: 'bar' }];
            const data = {
                d: [],
                s: artifact,
            };
            const source = new MemorySource({
                data,
                adapter: 'Types/entity:adapter.Sbis',
            });

            return source.query().then((ds) => {
                expect((ds.getRawData().items as typeof data).s).toEqual(artifact);
            });
        });

        test('should keep data artifact if query selects empty', () => {
            const artifact = [{ n: 'foo', t: 'Число целое' }];
            const data = {
                d: [[1]],
                s: artifact,
            };
            const source = new MemorySource({
                data,
                adapter: 'Types/entity:adapter.Sbis',
            });
            const query = new Query();

            query.where({ foo: 2 });
            return source.query(query).then((ds) => {
                expect((ds.getRawData().items as typeof data).s).toEqual([...artifact]);
            });
        });

        test('should use filter from option', () => {
            const data = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
            const source = new MemorySource({
                data,
                filter: (item) => {
                    return item.get('id') % 2 === 0;
                },
            });
            const expected = [2, 4];

            return source.query().then((ds) => {
                ds.getAll().each((record, index) => {
                    //@ts-ignore
                    expect(record.get('id')).toEqual(expected[index]);
                });
                expect(ds.getAll().getCount()).toEqual(expected.length);
            });
        });

        test('should pass filters to filter from option', () => {
            const data = [
                { id: 1, title: 'a' },
                { id: 2, title: 'b' },
                { id: 3, title: 'c' },
                { id: 4, title: 'd' },
                { id: 5, title: 'e' },
            ];
            const source = new MemorySource({
                data,
                filter: (item, where) => {
                    return Object.keys(where).reduce((_match, field) => {
                        const value = item.get(field);
                        //@ts-ignore
                        const check = where[field];
                        if (check[0] === '>') {
                            return value > check.substr(1);
                        } else {
                            return value === check;
                        }
                    }, true);
                },
            });
            const query = new Query();
            const expected = [3, 4, 5];

            query.where({ id: '>2' });

            return source.query(query).then((ds) => {
                ds.getAll().each((record, index) => {
                    //@ts-ignore
                    expect(record.get('id')).toEqual(expected[index]);
                });
                expect(ds.getAll().getCount()).toEqual(expected.length);
            });
        });

        describe('when sort use several fields', () => {
            //@ts-ignore
            const getResult = (ds) => {
                //@ts-ignore
                const result = [];
                //@ts-ignore
                ds.getAll().forEach((item) => {
                    result.push(
                        [item.get('first'), item.get('second'), item.get('third')].join('')
                    );
                });
                //@ts-ignore
                return result;
            };

            const source = new MemorySource({
                data: [
                    { first: 'a', second: 'a', third: 'a' },
                    { first: 'a', second: 'a', third: 'b' },
                    { first: 'a', second: 'a', third: 'c' },
                    { first: 'a', second: 'b', third: 'a' },
                    { first: 'a', second: 'b', third: 'b' },
                    { first: 'a', second: 'b', third: 'c' },
                    { first: 'a', second: 'c', third: 'a' },
                    { first: 'a', second: 'c', third: 'b' },
                    { first: 'a', second: 'c', third: 'c' },
                    { first: 'b', second: 'a', third: 'a' },
                    { first: 'b', second: 'a', third: 'b' },
                    { first: 'b', second: 'a', third: 'c' },
                    { first: 'b', second: 'b', third: 'a' },
                    { first: 'b', second: 'b', third: 'b' },
                    { first: 'b', second: 'b', third: 'c' },
                    { first: 'b', second: 'c', third: 'a' },
                    { first: 'b', second: 'c', third: 'b' },
                    { first: 'b', second: 'c', third: 'c' },
                    { first: 'c', second: 'a', third: 'a' },
                    { first: 'c', second: 'a', third: 'b' },
                    { first: 'c', second: 'a', third: 'c' },
                    { first: 'c', second: 'b', third: 'a' },
                    { first: 'c', second: 'b', third: 'b' },
                    { first: 'c', second: 'b', third: 'c' },
                    { first: 'c', second: 'c', third: 'a' },
                    { first: 'c', second: 'c', third: 'b' },
                    { first: 'c', second: 'c', third: 'c' },
                ],
            });

            test('should sort asc from right to left', () => {
                const query = new Query();
                const expectData = [
                    'aaa',
                    'baa',
                    'caa',
                    'aba',
                    'bba',
                    'cba',
                    'aca',
                    'bca',
                    'cca',

                    'aab',
                    'bab',
                    'cab',
                    'abb',
                    'bbb',
                    'cbb',
                    'acb',
                    'bcb',
                    'ccb',

                    'aac',
                    'bac',
                    'cac',
                    'abc',
                    'bbc',
                    'cbc',
                    'acc',
                    'bcc',
                    'ccc',
                ];
                query.orderBy([{ third: false }, { second: false }, { first: false }]);
                return source.query(query).then((ds) => {
                    const given = getResult(ds);
                    expect(given).toEqual(expectData);
                });
            });

            test('should sort desc from left to right', () => {
                const query = new Query();
                const expectData = [
                    'ccc',
                    'ccb',
                    'cca',
                    'cbc',
                    'cbb',
                    'cba',
                    'cac',
                    'cab',
                    'caa',

                    'bcc',
                    'bcb',
                    'bca',
                    'bbc',
                    'bbb',
                    'bba',
                    'bac',
                    'bab',
                    'baa',

                    'acc',
                    'acb',
                    'aca',
                    'abc',
                    'abb',
                    'aba',
                    'aac',
                    'aab',
                    'aaa',
                ];
                query.orderBy([{ first: true }, { second: true }, { third: true }]);
                return source.query(query).then((ds) => {
                    const given = getResult(ds);
                    expect(given).toEqual(expectData);
                });
            });

            test('should sort mixed from right to left', () => {
                const query = new Query();
                const expectData = [
                    'aca',
                    'bca',
                    'cca',
                    'aba',
                    'bba',
                    'cba',
                    'aaa',
                    'baa',
                    'caa',

                    'acb',
                    'bcb',
                    'ccb',
                    'abb',
                    'bbb',
                    'cbb',
                    'aab',
                    'bab',
                    'cab',

                    'acc',
                    'bcc',
                    'ccc',
                    'abc',
                    'bbc',
                    'cbc',
                    'aac',
                    'bac',
                    'cac',
                ];
                query.orderBy([{ third: false }, { second: true }, { first: false }]);

                return source.query(query).then((ds) => {
                    const given = getResult(ds);
                    expect(given).toEqual(expectData);
                });
            });
        });

        describe('when fields selection applied', () => {
            test('should return given fieldset from string', () => {
                const data = [
                    { a: 'a1', b: 'b1', c: 'c1' },
                    { a: 'a2', b: 'b2', c: 'c2' },
                    { a: 'a3', b: 'b3', c: 'c3' },
                ];
                const source = new MemorySource({ data });
                const query = new Query().select('a');

                return source.query(query).then((ds) => {
                    expect(ds.getAll().getRawData()).toEqual([
                        { a: 'a1' },
                        { a: 'a2' },
                        { a: 'a3' },
                    ]);
                });
            });

            test('should return given fieldset from array', () => {
                const data = [
                    { a: 'a1', b: 'b1', c: 'c1' },
                    { a: 'a2', b: 'b2', c: 'c2' },
                    { a: 'a3', b: 'b3', c: 'c3' },
                ];
                const source = new MemorySource({ data });
                const query = new Query().select(['b']);

                return source.query(query).then((ds) => {
                    expect(ds.getAll().getRawData()).toEqual([
                        { b: 'b1' },
                        { b: 'b2' },
                        { b: 'b3' },
                    ]);
                });
            });

            test('should return given fieldset from object', () => {
                const data = [
                    { a: 'a1', b: 'b1', c: 'c1' },
                    { a: 'a2', b: 'b2', c: 'c2' },
                    { a: 'a3', b: 'b3', c: 'c3' },
                ];
                const source = new MemorySource({ data });
                const query = new Query().select({ c: 'AliasOfC' });

                return source.query(query).then((ds) => {
                    expect(ds.getAll().getRawData()).toEqual([
                        { AliasOfC: 'c1' },
                        { AliasOfC: 'c2' },
                        { AliasOfC: 'c3' },
                    ]);
                });
            });

            test('should return given fieldset using strict data adapter', () => {
                const adapter = new SbisAdapter();
                const data = {
                    _type: 'recordset',
                    d: [[1], [2]],
                    s: [{ n: 'a', t: 'Число целое' }],
                };
                const source = new MemorySource({ adapter, data });
                const query = new Query().select({ a: 'aliasOfA' });

                return source.query(query).then((ds) => {
                    expect(ds.getAll().getRawData()).toEqual({
                        _type: 'recordset',
                        d: [[1], [2]],
                        s: [{ n: 'aliasOfA', t: 'Число целое' }],
                    });
                });
            });
        });

        describe('when the filter applied', () => {
            const tests = [
                {
                    filter: { LastName: 'Иванов' },
                    expect: 2,
                },
                {
                    //@ts-ignore
                    filter: (item) => {
                        return item.get('LastName') === 'Иванов';
                    },
                    expect: 2,
                },
                {
                    filter: (_item: unknown, index: number) => {
                        return index < 3;
                    },
                    expect: 3,
                },
                {
                    filter: { LastName: ['Иванов', 'Петров'] },
                    expect: 3,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 0,
                    expect: 2,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 0,
                    limit: 0,
                    expect: 0,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 0,
                    limit: 1,
                    expect: 1,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 0,
                    limit: 2,
                    expect: 2,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 1,
                    expect: 1,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 1,
                    limit: 0,
                    expect: 0,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 1,
                    limit: 1,
                    expect: 1,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 2,
                    expect: 0,
                },
                {
                    filter: { LastName: 'Иванов' },
                    offset: 2,
                    limit: 1,
                    expect: 0,
                },
                {
                    filter: { FirstName: 'Иван' },
                    expect: 3,
                },
                {
                    filter: { FirstName: 'Иван' },
                    offset: 0,
                    expect: 3,
                },
                {
                    filter: { FirstName: 'Иван' },
                    limit: 2,
                    expect: 2,
                },
                {
                    filter: { FirstName: 'Иван' },
                    offset: 0,
                    limit: 1,
                    expect: 1,
                },
                {
                    filter: { FirstName: 'Иван' },
                    offset: 0,
                    limit: 2,
                    expect: 2,
                },
                {
                    filter: { FirstName: 'Иван' },
                    offset: 1,
                    limit: 2,
                    expect: 2,
                },
                {
                    filter: { FirstName: 'Иван' },
                    offset: 2,
                    expect: 1,
                },
                {
                    filter: { FirstName: 'Иван' },
                    offset: 2,
                    limit: 2,
                    expect: 1,
                },
                {
                    filter: { MiddleName: 'Оглы' },
                    expect: 0,
                },
                {
                    filter: { ParentId: null },
                    expect: 6,
                },
                {
                    filter: { ParentId: 6 },
                    expect: 2,
                },
                {
                    filter: { ParentId: 99 },
                    expect: 0,
                },
            ];

            for (let i = 0; i < tests.length; i++) {
                ((testData, num) => {
                    test(`#${num} should return ${testData.expect} model(s)`, () => {
                        const query = new Query()
                            .where(testData.filter)
                            //@ts-ignore
                            .offset(testData.offset)
                            //@ts-ignore
                            .limit(testData.limit);
                        return source.query(query).then((ds) => {
                            expect(ds.getAll().getCount()).toBe(testData.expect);
                        });
                    });
                })(tests[i], 1 + i);
            }
        });

        describe('when sorting applied', () => {
            const tests = [
                {
                    sorting: 'Id',
                    check: 'Id',
                    expect: [7, 6, 5, 4, 3, 2, 1, undefined, null],
                },
                {
                    sorting: [{ Id: true }],
                    check: 'Id',
                    expect: [7, 6, 5, 4, 3, 2, 1, undefined, null],
                },
                {
                    sorting: [{ Id: false }],
                    offset: 2,
                    check: 'Id',
                    expect: [1, 2, 3, 4, 5, 6, 7],
                },
                {
                    sorting: [{ Id: true }],
                    offset: 2,
                    check: 'Id',
                    expect: [5, 4, 3, 2, 1, undefined, null],
                },
                {
                    sorting: [{ Id: false }],
                    limit: 4,
                    check: 'Id',
                    expect: [undefined, null, 1, 2, 3, 4],
                },
                {
                    sorting: [{ Id: true }],
                    limit: 4,
                    check: 'Id',
                    expect: [7, 6, 5, 4],
                },
                {
                    sorting: [{ Id: false }],
                    offset: 3,
                    limit: 2,
                    check: 'Id',
                    expect: [2, 3, 4],
                },
                {
                    sorting: [{ Id: true }],
                    offset: 3,
                    limit: 2,
                    check: 'Id',
                    expect: [4, 3],
                },
                {
                    sorting: [{ LastName: false }],
                    limit: 5,
                    check: 'LastName',
                    expect: [undefined, undefined, 'Аксенова', 'Афанасьев', 'Баранов'],
                },
                {
                    sorting: [{ LastName: true }],
                    limit: 3,
                    check: 'LastName',
                    expect: ['Петров', 'Иванов', 'Иванов'],
                },
                {
                    sorting: [{ FirstName: true }],
                    limit: 4,
                    check: 'FirstName',
                    expect: ['Ян', 'Федора', 'Федор', 'Иванко'],
                },
                {
                    sorting: [{ LastName: false }, { FirstName: true }],
                    check: ['LastName', 'FirstName'],
                    expect: [
                        '+',
                        '+',
                        'Аксенова+Федора',
                        'Афанасьев+Иван',
                        'Баранов+Иванко',
                        'Годолцов+Иван',
                        'Иванов+Ян',
                        'Иванов+Иван',
                        'Петров+Федор',
                    ],
                },
                {
                    sorting: [{ FirstName: false }, { MiddleName: false }],
                    limit: 7,
                    check: ['FirstName', 'MiddleName'],
                    expect: [
                        '+',
                        '+',
                        'Иван+Андреевич',
                        'Иван+Викторович',
                        'Иван+Иванович',
                        'Иванко+Петрович',
                        'Федор+Иванович',
                    ],
                },
                {
                    sorting: [{ FirstName: false }, { MiddleName: true }],
                    limit: 7,
                    check: ['FirstName', 'MiddleName'],
                    expect: [
                        '+',
                        '+',
                        'Иван+Иванович',
                        'Иван+Викторович',
                        'Иван+Андреевич',
                        'Иванко+Петрович',
                        'Федор+Иванович',
                    ],
                },
                {
                    sorting: [{ Position: false }, { LastName: false }, { FirstName: false }],
                    check: ['Position', 'LastName', 'FirstName'],
                    expect: [
                        '++',
                        '++',
                        'Директор+Афанасьев+Иван',
                        'Директор+Годолцов+Иван',
                        'Директор+Петров+Федор',
                        'Инженер+Аксенова+Федора',
                        'Инженер+Иванов+Иван',
                        'Карапуз+Баранов+Иванко',
                        'Маркетолог+Иванов+Ян',
                    ],
                },
            ];

            for (let i = 0; i < tests.length; i++) {
                ((testData, num) => {
                    if (!(testData.check instanceof Array)) {
                        testData.check = [testData.check];
                    }

                    test(`#${num} should return ${testData.expect} models order`, () => {
                        const query = new Query()
                            .where((testData as any).filter)
                            //@ts-ignore
                            .orderBy(testData.sorting)
                            //@ts-ignore
                            .offset(testData.offset)
                            //@ts-ignore
                            .limit(testData.limit);
                        return source.query(query).then((ds) => {
                            let modelNum = 0;
                            ds.getAll().each((model) => {
                                const need = testData.expect[modelNum];
                                let have;
                                if (testData.check.length > 1) {
                                    have = [];
                                    for (let j = 0; j < testData.check.length; j++) {
                                        //@ts-ignore
                                        have.push(model.get(testData.check[j]));
                                    }
                                    have = have.join('+');
                                } else {
                                    //@ts-ignore
                                    have = model.get(testData.check[0]);
                                }

                                expect(have).toBe(need);
                                modelNum++;
                            });
                        });
                    });
                })(tests[i], 1 + i);
            }
        });
    });

    describe('.move()', () => {
        test('should move 5 to begin list', () => {
            return source.move([5], 6, { position: 'before' }).then(() => {
                expect(data[0].Id).toBe(5);
            });
        });

        test('should move 6 before 5', () => {
            return source.move([6], 5, { position: 'before' }).then(() => {
                expect(data[5].Id).toBe(6);
                expect(data[6].Id).toBe(5);
            });
        });

        test('should move 6 after 5', () => {
            return source.move([6], 5, { position: 'after' }).then(() => {
                expect(data[5].Id).toBe(5);
                expect(data[6].Id).toBe(6);
            });
        });

        test('should move 6 to end list', () => {
            return source.move([6], 3, { position: 'after' }).then(() => {
                expect(data[data.length - 1].Id).toBe(6);
            });
        });

        test('should move 6 to end list', () => {
            return source.move([6], 3, { position: 'after' }).then(() => {
                expect(data[data.length - 1].Id).toBe(6);
            });
        });

        test('should move 6 to end list', () => {
            return source.move([6], 3, { position: 'after' }).then(() => {
                expect(data[data.length - 1].Id).toBe(6);
            });
        });

        test('should move 6 to end list with use before', () => {
            return source.move(6, 3, { before: false }).then(() => {
                expect(data[data.length - 1].Id).toBe(6);
            });
        });

        test('should move 6 before 3 with use before', () => {
            return source.move(6, 3, { before: true }).then(() => {
                expect(data[data.length - 2].Id).toBe(6);
            });
        });
        test('should move row with ids 6 on 3', () => {
            return source.move(6, 3, { position: 'on', parentProperty: 'ParentId' }).then(() => {
                expect(data[0].ParentId).toEqual(3 as any);
            });
        });

        test('should move row with ids 3 on root', () => {
            //@ts-ignore
            return source.move(3, null, { position: 'on', parentProperty: 'ParentId' }).then(() => {
                expect(data[8].ParentId).toEqual(null);
            });
        });

        test('should move row up before targets', () => {
            return source.move(5, 7, { position: 'before' }).then(() => {
                expect(data[3].Id).toBe(5);
            });
        });

        test('should move rows up after targets', () => {
            return source.move(5, 7, { position: 'after' }).then(() => {
                expect(data[4].Id).toBe(5);
            });
        });

        test('should move rows up before targets', () => {
            return source.move([5, 1], 7, { position: 'after' }).then(() => {
                expect(data[4].Id).toBe(5);
                expect(data[5].Id).toBe(1);
            });
        });

        test('should move rows down before targets', () => {
            return source.move([5, 1], 7, { position: 'before' }).then(() => {
                expect(data[3].Id).toBe(5);
                expect(data[4].Id).toBe(1);
            });
        });

        test('should move row down after targets', () => {
            return source.move([4, 7], 1, { position: 'after' }).then(() => {
                expect(data[6].Id).toBe(4);
                expect(data[7].Id).toBe(7);
            });
        });

        test('should move row up before targets', () => {
            return source.move([4, 7], 1, { position: 'before' }).then(() => {
                expect(data[5].Id).toBe(4);
                expect(data[6].Id).toBe(7);
            });
        });
    });

    describe('when use recordset as data', () => {
        let recordset: RecordSet;
        let source: MemorySource;

        beforeEach(() => {
            recordset = new RecordSet({
                rawData: data,
            });

            source = new MemorySource({
                data: recordset,
                adapter: 'Types/entity:adapter.RecordSet',
                keyProperty: 'Id',
            });
        });

        describe('.create()', () => {
            test('should return an empty model', () => {
                return source.create().then((model) => {
                    expect(model).toBeInstanceOf(Model);
                });
            });

            test('should return an model with initial data', () => {
                return source
                    .create(
                        new Model({
                            rawData: {
                                a: 1,
                                b: true,
                            },
                        })
                    )
                    .then((model) => {
                        expect(model.get('a')).toBe(1);
                        expect(model.get('b')).toBe(true);
                    });
            });
        });

        describe('.read()', () => {
            describe('when the model is exists', () => {
                test('should return the valid model', () => {
                    return source.read(existsId).then((model) => {
                        expect(model).toBeInstanceOf(Model);
                        expect((model as Model).getKey()).toBe(existsId);
                    });
                });
            });

            describe("when the model isn't exists", () => {
                test('should return an error', () => {
                    return source.read(notExistsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });
            });
        });

        describe('.update()', () => {
            test("should update data if it's null by default", () => {
                const source = new MemorySource({
                    keyProperty: 'foo',
                });
                const model = new Model({
                    rawData: { foo: 'bar' },
                });

                return source.update(model).then(() => {
                    return source.query().then((ds) => {
                        //@ts-ignore
                        expect(ds.getAll().at(0).get('foo')).toEqual('bar');
                    });
                });
            });

            describe('when the model was stored', () => {
                test('should update the model', () => {
                    return source.read(existsId).then((model) => {
                        model.set('LastName', 'Петров');
                        return source.update(model).then((success) => {
                            expect(Boolean(success)).toBe(true);
                            return source.read(existsId).then((model) => {
                                expect(model.get('LastName')).toEqual('Петров');
                            });
                        });
                    });
                });
            });

            describe('when the model was not stored', () => {
                //@ts-ignore
                const testModel = (success, model, length) => {
                    expect(!!success).toBe(true);
                    expect(length).toBe(recordset.getCount());
                    return source.read(model.getKey()).then((modelToo) => {
                        expect(model.get('LastName')).toBe(modelToo.get('LastName'));
                    });
                };

                test('should create the model by 1st way', () => {
                    const oldLength = recordset.getCount();
                    return source
                        .create(
                            new Model({
                                adapter: recordset.getAdapter(),
                            })
                        )
                        .then((model) => {
                            model.set('LastName', 'Козлов');
                            return source.update(model).then((success) => {
                                return testModel(success, model, 1 + oldLength);
                            });
                        });
                });

                test('should create the model by 2nd way', () => {
                    const oldLength = recordset.getCount();
                    const model = new Model({
                        rawData: new Model(),
                        keyProperty: 'Id',
                        adapter: 'Types/entity:adapter.RecordSet',
                    });

                    model.set('LastName', 'Овечкин');
                    return source.update(model).then((success) => {
                        return testModel(success, model, 1 + oldLength);
                    });
                });

                test('should nod clone row when it have key 0', () => {
                    const source = new MemorySource({
                        data: [{ id: 0, name: 'name' }],
                        keyProperty: 'id',
                    });
                    const model = new Model({
                        rawData: { id: 0, name: '11' },
                        keyProperty: 'id',
                    });

                    source.update(model);
                    expect((source as any)._$data.length).toEqual(1);
                });
            });
        });

        describe('.destroy()', () => {
            describe('when the model is exists', () => {
                test('should return success', () => {
                    return source.destroy(existsId).then(() => {
                        expect('fine').toBeTruthy();
                    });
                });

                test('should really delete the model', () => {
                    return source.destroy(existsId).then(() => {
                        source.read(existsId).then(
                            () => {
                                throw new Error('The model still exists');
                            },
                            (err) => {
                                expect(err).toBeInstanceOf(Error);
                            }
                        );
                    });
                });

                test('should decrease the size of raw data', () => {
                    const targetLength = recordset.getCount() - 1;
                    return source.destroy(existsId).then(() => {
                        expect(targetLength).toBe(recordset.getCount());
                    });
                });
            });

            describe("when the model isn't exists", () => {
                test('should return an error', () => {
                    return source.destroy(notExistsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });
            });
        });

        describe('.merge()', () => {
            describe("when the model isn't exists", () => {
                test('should return an error', () => {
                    return source.merge(notExistsId, existsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });

                test('should return an error', () => {
                    return source.merge(existsId, notExistsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });
            });

            test('should merge target with single record', () => {
                return source.merge(existsId, existsId2).then(() => {
                    return source.read(existsId).then((merged) => {
                        expect(merged.get('Id')).toEqual(existsId);
                        expect(merged.get('Order')).toEqual(3);
                        expect(merged.get('LastName')).toEqual('Иванов');

                        return source.read(existsId2).then(
                            () => {
                                throw new Error('Merged record should be deleted.');
                            },
                            (err) => {
                                expect(err).toBeInstanceOf(Error);
                            }
                        );
                    });
                });
            });

            test('should merge target with several records', () => {
                return source.merge(existsId, [existsId2, existsId3]).then(() => {
                    return source.read(existsId).then((merged) => {
                        expect(merged.get('Id')).toEqual(existsId);
                        expect(merged.get('Order')).toEqual(1);
                        expect(merged.get('LastName')).toEqual('Петров');
                    });
                });
            });
        });

        describe('.copy()', () => {
            test('should copy model', () => {
                const oldLength = recordset.getCount();
                return source.copy(existsId).then(() => {
                    expect(recordset.getCount()).toBe(1 + oldLength);
                });
            });
        });

        describe('.query()', () => {
            test('should return a valid dataset', () => {
                return source.query(new Query()).then((ds) => {
                    expect(ds).toBeInstanceOf(DataSet);
                    expect(ds.getAll().getCount()).toBe(recordset.getCount());
                });
            });

            test('should save data adapter', () => {
                const format = [{ name: 'id', type: 'integer' }];
                const recordset = new RecordSet({
                    format,
                    adapter: 'Types/entity:adapter.Sbis',
                });
                const source = new MemorySource({
                    data: recordset,
                    adapter: 'Types/entity:adapter.RecordSet',
                    keyProperty: 'Id',
                });
                const record = new Model({
                    format: recordset.getFormat(),
                    adapter: recordset.getAdapter(),
                });

                record.set('id', 1);
                recordset.add(record);
                return source.query().then((ds) => {
                    expect(ds.getAll().getRawData(true).getAdapter()).toBeInstanceOf(SbisAdapter);
                });
            });

            test('should work with no query', () => {
                return source.query().then((ds) => {
                    expect(ds).toBeInstanceOf(DataSet);
                    expect(ds.getAll().getCount()).toBe(recordset.getCount());
                });
            });

            test('should work if query select no items', () => {
                const query = new Query();
                query.where({ someField: 'WithValueThatWillNotBeFind' });

                return source.query(query).then((ds) => {
                    expect(ds.getProperty(ds.getItemsProperty())).toBeInstanceOf(RecordSet);
                });
            });

            test('should return a list instance of injected module', () => {
                class MyList<T> extends List<T> {}
                source.setListModule(MyList);
                return source.query().then((ds) => {
                    expect(ds.getAll()).toBeInstanceOf(MyList);
                });
            });

            test('should return a model instance of injected module', () => {
                class MyModel extends Model {}
                source.setModel(MyModel);
                return source.query().then((ds) => {
                    expect(ds.getAll().at(0)).toBeInstanceOf(MyModel);
                });
            });

            test('should keep property total', () => {
                return source.query(new Query().limit(2)).then((ds) => {
                    expect(ds).toBeInstanceOf(DataSet);
                    expect(ds.getMetaData().total).toBe(recordset.getCount());
                });
            });
        });
    });
});
