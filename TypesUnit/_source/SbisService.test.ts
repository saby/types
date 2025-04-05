import {
    SbisService,
    sbisServiceGetQueryArguments as getQueryArguments,
    ISbisServiceBinding as IBinding,
    DataSet,
    Query,
    queryAndExpression as andExpression,
    queryOrExpression as orExpression,
    QueryExpandMode as ExpandMode,
    QueryNavigationType as NavigationType,
} from 'Types/source';
import PrimaryKey from 'Types/_entity/applied/PrimaryKey';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';
import { List, RecordSet } from 'Types/collection';
import * as di from 'Types/di';
import { ExtendDate, IExtendDateConstructor } from 'Types/_declarations';
import { Deferred } from 'Types/deferred';
import 'Types/_entity/adapter/Sbis';
import { ISbisBusinessLogicOptions as OptSbisBusinessLogic } from 'Types/_source/provider';

//@ts-ignore
const DeferredCanceledError = globalThis.DeferredCanceledError;

interface IAtoC {
    a?: number;
    b?: number;
    c?: number;
}

describe('Types/_source/SbisService', () => {
    const provider = 'Types/source:provider.SbisBusinessLogic';
    const meta = [
        { n: 'LastName', t: 'Строка' },
        { n: 'FirstName', t: 'Строка' },
        { n: 'MiddleName', t: 'Строка' },
        { n: '@ID', t: 'Число целое' },
        { n: 'Position', t: 'Строка' },
        { n: 'Hired', t: 'Логическое' },
    ];

    // ArrayMock of Types/_source/provider/SbisBusinessLogic
    const SbisBusinessLogic = (() => {
        let lastId = 0;
        const existsId = 7;
        const existsTooId = 987;
        const notExistsId = 99;
        const textId = 'uuid';

        class Mock {
            _cfg: OptSbisBusinessLogic = {};
            _$binding = {};

            static existsId = existsId;
            static notExistsId = notExistsId;
            //@ts-ignore
            static lastRequest;
            //@ts-ignore
            static lastDeferred;

            constructor(cfg: OptSbisBusinessLogic) {
                this._cfg = cfg;
            }

            call(method: string, args: any, cache?: unknown): Promise<any> {
                const def = new Deferred();
                const idPosition = 3;
                let error = '';
                //@ts-ignore
                let data;

                //@ts-ignore
                switch (this._cfg.endpoint.contract) {
                    case 'USP':
                    case 'Foo1':
                    case 'Foo2':
                    case 'Foo3':
                    case 'Goods':
                        switch (method) {
                            case 'Создать':
                                data = {
                                    _type: 'record',
                                    d: ['', '', '', ++lastId, '', false],
                                    s: meta,
                                };
                                break;

                            case 'Прочитать':
                                if (args.ИдО === existsId) {
                                    data = {
                                        _type: 'record',
                                        d: ['Smith', 'John', 'Levitt', existsId, 'Engineer', true],
                                        s: meta,
                                    };
                                } else {
                                    error = 'Model is not found';
                                }
                                break;

                            case 'Записать':
                                if (args.Запись) {
                                    if (args.Запись.d && args.Запись.d[idPosition]) {
                                        data = args.Запись.d[idPosition];
                                    } else {
                                        data = 99;
                                    }
                                } else {
                                    data = true;
                                }
                                break;

                            case 'Foo1.Delete':
                            case 'Foo2.Delete':
                            case 'Foo3.Delete':
                            case 'Goods.Удалить':
                            case 'Удалить':
                                if (
                                    args.ИдО === existsId ||
                                    args.ИдО.indexOf(String(existsId)) !== -1
                                ) {
                                    data = existsId;
                                } else if (
                                    args.ИдО === textId ||
                                    args.ИдО.indexOf(String(textId)) !== -1
                                ) {
                                    data = textId;
                                } else if (
                                    args.ИдО === existsTooId ||
                                    args.ИдО.indexOf(String(existsTooId)) !== -1
                                ) {
                                    data = existsTooId;
                                } else {
                                    error = 'Model is not found';
                                }
                                break;

                            case 'Список':
                                data = {
                                    _type: 'recordset',
                                    d: [
                                        ['Smith', 'John', 'Levitt', existsId, 'Engineer', true],
                                        [
                                            'Cameron',
                                            'David',
                                            'William Donald',
                                            1 + existsId,
                                            'Prime minister',
                                            true,
                                        ],
                                    ],
                                    s: meta,
                                };
                                break;

                            case 'Sync':
                            case 'ВставитьДо':
                            case 'ВставитьПосле':
                            case 'Dummy':
                            case 'IndexNumber.Move':
                            case 'Product.Mymove':
                            case 'ПорядковыйНомер.ВставитьДо':
                            case 'ПорядковыйНомер.ВставитьПосле':
                                break;

                            default:
                                error = `Method "${method}" is undefined`;
                        }
                        break;

                    case 'ПорядковыйНомер':
                        switch (method) {
                            case 'ВставитьДо':
                            case 'ВставитьПосле':
                                break;
                        }
                        break;
                    case 'IndexNumber.Move':
                        break;

                    default:
                        //@ts-ignore
                        error = `Contract "${this._cfg.endpoint.contract}" is not found`;
                }

                setTimeout(() => {
                    Mock.lastRequest = {
                        cfg: this._cfg,
                        method,
                        args,
                        cache,
                    };

                    if (error) {
                        return def.errback(error);
                    }

                    //@ts-ignore
                    def.callback(data);
                }, 0);

                Mock.lastDeferred = def;

                return def as any;
            }
        }

        return Mock;
    })();

    const getSampleModel = () => {
        const model = new Model({
            adapter: 'Types/entity:adapter.Sbis',
            keyProperty: '@ID',
        });
        model.addField({ name: '@ID', type: 'integer' }, undefined, 1);
        model.addField({ name: 'LastName', type: 'string' }, undefined, 'tst');

        return model;
    };

    const getSampleMeta = (): any => {
        return {
            a: 1,
            b: 2,
            c: 3,
        };
    };

    //@ts-ignore
    const testArgIsModel = (arg, model) => {
        expect(arg._type).toBe('record');
        expect(arg.d).toEqual(model.getRawData().d);
        expect([...arg.s]).toEqual(model.getRawData().s);
    };

    //@ts-ignore
    const testArgIsDataSet = (arg, dataSet) => {
        expect(arg._type).toBe('recordset');
        expect(arg.d).toEqual(dataSet.getRawData().d);
        expect(arg.s).toEqual(dataSet.getRawData().s);
    };

    let service: SbisService;

    beforeEach(() => {
        SbisBusinessLogic.lastRequest = {};
        SbisBusinessLogic.lastDeferred = null;

        // Replace of standard with mock
        di.register(provider, SbisBusinessLogic);

        service = new SbisService({
            endpoint: 'USP',
        });
    });

    afterEach(() => {
        //@ts-ignore
        service = undefined;
    });

    describe('.create()', () => {
        describe('when the service is exists', () => {
            test('should return an empty model', () => {
                return service.create().then((model) => {
                    expect(model instanceof Model).toBe(true);
                    //@ts-ignore
                    expect(model.getKey() > 0).toBe(true);
                    expect(model.get('LastName')).toBe('');
                });
            });

            test('should generate a valid request', () => {
                return service.create().then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.ИмяМетода).toBeNull();
                    expect(args.Фильтр.d[0]).toBe(true);
                    expect(args.Фильтр.s[0].n).toBe('ВызовИзБраузера');
                    expect(args.Фильтр.s[0].t).toBe('Логическое');
                });
            });

            test('should generate request with additional fields from record', () => {
                const model = getSampleModel();
                return service.create(model).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsModel(args.Фильтр, model);
                });
            });

            test('should generate request with additional fields from object', () => {
                const meta = getSampleMeta();
                return service.create(meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const fields = Object.keys(meta);
                    meta.ВызовИзБраузера = true;
                    fields.push('ВызовИзБраузера');

                    expect(args.Фильтр.s.length).toBe(fields.length);
                    for (let i = 0; i < args.Фильтр.d.length; i++) {
                        expect(args.Фильтр.s[i].n).toBe(fields[i]);
                        expect(args.Фильтр.d[i]).toBe(meta[fields[i]]);
                    }
                });
            });

            test('should generate request with Date field', () => {
                const date = new Date() as ExtendDate;
                if (!date.setSQLSerializationMode) {
                    return Promise.resolve();
                }

                date.setSQLSerializationMode(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE
                );
                const meta = { foo: date };
                return service.create(meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Фильтр.s[0].n).toBe('foo');
                    expect(args.Фильтр.s[0].t).toBe('Дата');
                });
            });

            test('should generate request with Time field', () => {
                const date = new Date() as ExtendDate;
                if (!date.setSQLSerializationMode) {
                    return Promise.resolve();
                }

                date.setSQLSerializationMode(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME
                );
                const meta = { foo: date };
                return service.create(meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Фильтр.s[0].n).toBe('foo');
                    expect(args.Фильтр.s[0].t).toBe('Время');
                });
            });

            test('should generate request with custom method name in the filter', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    binding: {
                        format: 'ПрочитатьФормат',
                    },
                });
                return service.create().then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ИмяМетода).toBe('ПрочитатьФормат');
                });
            });

            test('should cancel the inner request', () => {
                const def = service.create();
                const lastDef = SbisBusinessLogic.lastDeferred;

                //@ts-ignore
                def.cancel();
                expect(lastDef.getResult()).toBeInstanceOf(DeferredCanceledError);
            });

            test('should sort fields in filter', () => {
                const filter = {
                    Раздел: 1,
                    Тип: 3,
                    'Раздел@': true,
                    Демо: true,
                    Раздел$: true,
                };
                return service.create(filter).then(() => {
                    const s = SbisBusinessLogic.lastRequest.args.Фильтр.s;
                    const sortNames = s
                        //@ts-ignore
                        .map((i) => {
                            return i.n;
                        })
                        .sort();
                    for (let i = 0; i < sortNames.length; i++) {
                        expect(s[i].n).toBe(sortNames[i]);
                    }
                });
            });
        });

        describe("when the service isn't exists", () => {
            test('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.create().then(
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

    describe('.read()', () => {
        describe('when the service is exists', () => {
            describe('and the model is exists', () => {
                test('should return valid model', () => {
                    return service.read(SbisBusinessLogic.existsId).then((model) => {
                        expect(model instanceof Model).toBe(true);
                        expect(model.getKey()).toBe(SbisBusinessLogic.existsId);
                        expect(model.get('LastName')).toBe('Smith');
                    });
                });

                test('should generate a valid request', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        binding: {
                            format: 'Формат',
                        },
                    });
                    return service.read(SbisBusinessLogic.existsId).then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        expect(args.ИмяМетода).toBe('Формат');
                        expect(args.ИдО).toBe(SbisBusinessLogic.existsId);
                    });
                });

                test('should generate request with additional fields if option passAddFieldsFromMeta is set', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        options: {
                            passAddFieldsFromMeta: true,
                        },
                    });
                    const meta = { foo: 'bar' };

                    return service.read(SbisBusinessLogic.existsId, meta).then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        expect(args.ДопПоля).toEqual(meta);
                    });
                });

                test('should return Types/entity:Model instance by default', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        model: undefined,
                    });
                    return service.read(SbisBusinessLogic.existsId).then((model) => {
                        expect(model instanceof Model).toBe(true);
                        expect(model.getKey()).toBe(SbisBusinessLogic.existsId);
                        expect(model.get('LastName')).toBe('Smith');
                    });
                });
            });

            describe("and the model isn't exists", () => {
                test('should return an error', () => {
                    return service.read(SbisBusinessLogic.notExistsId).then(
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

        describe("when the service isn't exists", () => {
            test('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.read(SbisBusinessLogic.existsId).then(
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
        describe('when the service is exists', () => {
            describe('and the model was stored', () => {
                test('should update the model', () => {
                    return service.read(SbisBusinessLogic.existsId).then((model) => {
                        model.set('LastName', 'Cameron');
                        return service.update(model).then((success) => {
                            //@ts-ignore
                            expect(success > 0).toBe(true);
                            expect(model.isChanged()).toBe(false);
                            expect(model.get('LastName')).toBe('Cameron');
                        });
                    });
                });
            });

            describe('and the model was not stored', () => {
                //@ts-ignore
                const testModel = (success, model) => {
                    expect(success > 0).toBe(true);
                    expect(model.isChanged()).toBe(false);
                    expect(model.getKey() > 0).toBe(true);
                };

                test('should create the model by 1st way', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        keyProperty: '@ID',
                    });
                    return service.create().then((model) => {
                        return service.update(model).then((success) => {
                            testModel(success, model);
                        });
                    });
                });

                test('should create the model by 2nd way', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        keyProperty: '@ID',
                    });
                    const model = getSampleModel();

                    return service.update(model).then((success) => {
                        testModel(success, model);
                    });
                });
            });

            test('should generate a valid request', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    binding: {
                        format: 'Формат',
                    },
                });
                return service.read(SbisBusinessLogic.existsId).then((model) => {
                    return service.update(model).then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args.Запись, model);
                    });
                });
            });

            test('should generate request with additional fields if option passAddFieldsFromMeta is set', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    options: {
                        passAddFieldsFromMeta: true,
                    },
                });
                const meta = { foo: 'bar' };

                return service.update(getSampleModel(), meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ДопПоля).toEqual(meta);
                });
            });

            test('should cancel the inner request', () => {
                const model = getSampleModel();
                const def = service.update(model);
                const lastDef = SbisBusinessLogic.lastDeferred;

                //@ts-ignore
                def.cancel();
                expect(lastDef.getResult()).toBeInstanceOf(DeferredCanceledError);
            });
        });

        describe("when the service isn't exists", () => {
            test('should return an error', () => {
                return service.create().then((model) => {
                    const service = new SbisService({
                        endpoint: 'Unknown',
                    });
                    return service.update(model).then(
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

        describe('when is updating few rows', () => {
            test('should accept RecordSet', () => {
                const rs = new RecordSet({
                    rawData: {
                        _type: 'recordset',
                        d: [['Smith', 'John', 'Levitt', 1, 'Engineer', true]],
                        s: meta,
                    },
                    adapter: 'Types/entity:adapter.Sbis',
                });
                const service = new SbisService({
                    endpoint: 'Goods',
                });

                return service.update(rs).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(typeof args.Записи).toBe('object');
                });
            });

            test('should call updateBatch', () => {
                const RecordState = (Model as any).RecordState;
                const format = [
                    { name: 'id', type: 'integer' },
                    { name: 'name', type: 'string' },
                ];
                const rs = new RecordSet({
                    format,
                    adapter: 'Types/entity:adapter.Sbis',
                });
                const service = new SbisService({
                    endpoint: 'Goods',
                });

                const binding = service.getBinding() as IBinding;
                binding.updateBatch = 'Sync';
                service.setBinding(binding);

                //@ts-ignore
                const addRecord = (data) => {
                    const record = new Model({
                        format: rs.getFormat(),
                        adapter: rs.getAdapter(),
                    });
                    record.set(data);
                    rs.add(record);
                };

                addRecord({ id: 1, name: 'sample1' });
                addRecord({ id: 2, name: 'sample2' });
                addRecord({ id: 3, name: 'sample3' });
                rs.acceptChanges();

                addRecord({ id: 4, name: 'sample4' });
                rs.at(0).set('name', 'foo');
                rs.at(1).setState(RecordState.DELETED);

                return service.update(rs).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.changed.d.length).toEqual(1);
                    expect(args.changed.d[0][0]).toEqual(1);

                    expect(args.added.d.length).toEqual(1);
                    expect(args.added.d[0][0]).toEqual(4);

                    expect(args.removed).toEqual([2]);
                });
            });
        });
    });

    describe('.destroy()', () => {
        describe('when the service is exists', () => {
            describe('and the model is exists', () => {
                test('should return success', () => {
                    return service.destroy(SbisBusinessLogic.existsId).then((success) => {
                        expect(success).toBe(SbisBusinessLogic.existsId);
                    });
                });
            });

            describe("and the model isn't exists", () => {
                test('should return an error', () => {
                    return service.destroy(SbisBusinessLogic.notExistsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            expect(err).toBeInstanceOf(Error);
                        }
                    );
                });
            });

            test('should delete a few records', () => {
                return service.destroy([0, SbisBusinessLogic.existsId, 1]).then((success) => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ИдО[0]).toEqual('');
                    expect(args.ИдО[1]).toEqual('7');
                    expect(args.ИдО[2]).toEqual('1');
                    //@ts-ignore
                    expect(success[0]).toEqual(SbisBusinessLogic.existsId);
                });
            });

            test('should delete records by a composite key', () => {
                const anId = 987;
                return service
                    .destroy([SbisBusinessLogic.existsId + ',USP', anId + ',Goods'])
                    .then((success) => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        expect(args.ИдО).toEqual([anId + '']);
                        //@ts-ignore
                        expect(success[0]).toEqual(SbisBusinessLogic.existsId);
                        //@ts-ignore
                        expect(success[1]).toEqual(anId);
                    });
            });

            test('should delete records with composite key and object name in binding', () => {
                service = new SbisService({
                    endpoint: 'Foo1',
                    binding: {
                        destroy: 'Foo2.Delete',
                    },
                });
                return service.destroy([SbisBusinessLogic.existsId + ',Foo3']).then((success) => {
                    const method = SbisBusinessLogic.lastRequest.method;
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(method).toEqual('Foo2.Delete');
                    expect(args.ИдО).toEqual([SbisBusinessLogic.existsId + '']);
                    //@ts-ignore
                    expect(success[0]).toEqual(SbisBusinessLogic.existsId);
                });
            });

            test('should handle not a composite key', () => {
                const notABlName = SbisBusinessLogic.existsId + ',(USP)';
                return service.destroy([notABlName]).then(
                    () => {
                        throw new Error("It shouldn't be a successful call");
                    },
                    () => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        expect(args.ИдО).toEqual([notABlName]);
                    }
                );
            });

            test('should delete records by text key', () => {
                const anId = 'uuid';
                return service.destroy([anId]).then((success) => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ИдО[0]).toBe(anId);
                    //@ts-ignore
                    expect(success[0]).toBe(anId);
                });
            });

            test('should generate a valid request', () => {
                return service.destroy(SbisBusinessLogic.existsId).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ИдО[0]).toEqual('7');
                });
            });

            test('should generate request with additional fields from record', () => {
                return service.destroy(SbisBusinessLogic.existsId, getSampleModel()).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsModel(args.ДопПоля, getSampleModel());
                });
            });

            test('should generate request with additional fields from object', () => {
                return service.destroy(SbisBusinessLogic.existsId, getSampleMeta()).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ДопПоля).toEqual(getSampleMeta());
                });
            });
        });

        describe("when the service isn't exists", () => {
            test('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.destroy(SbisBusinessLogic.existsId).then(
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

    describe('.query()', () => {
        describe('when the service is exists', () => {
            test('should return a valid dataset', () => {
                return service.query(new Query()).then((ds) => {
                    expect(ds instanceof DataSet).toBe(true);
                    expect(ds.getAll().getCount()).toBe(2);
                });
            });

            test('should take key property for dataset from raw data', () => {
                return service.query(new Query()).then((ds) => {
                    expect(ds.getKeyProperty()).toBe('@ID');
                });
            });

            test('should work with no query', () => {
                return service.query().then((ds) => {
                    expect(ds instanceof DataSet).toBe(true);
                    expect(ds.getAll().getCount()).toBe(2);
                });
            });

            test('should return a list instance of injected module', () => {
                class MyList<T> extends List<T> {
                    //@ts-ignore
                    constructor(options) {
                        super(options);
                    }
                }

                service.setListModule(MyList);
                return service.query().then((ds) => {
                    expect(ds.getAll() instanceof MyList).toBe(true);
                });
            });

            test('should return a model instance of injected module', () => {
                class MyModel extends Model {
                    //@ts-ignore
                    constructor(options) {
                        super(options);
                    }
                }
                service.setModel(MyModel);
                return service.query().then((ds) => {
                    expect(ds.getAll().at(0) instanceof MyModel).toBe(true);
                });
            });

            test('should generate a valid request', () => {
                const recData = {
                    d: [1],
                    s: [{ n: 'Число целое' }],
                };
                const rsData = {
                    d: [[1], [2]],
                    s: [{ n: 'Число целое' }],
                };
                const query = new Query()
                    .from('Goods')
                    .where({
                        id: 5,
                        enabled: true,
                        title: 'abc*',
                        path: [1, 2, 3],
                        obj: { a: 1, b: 2 },
                        emptyArray: [],
                        emptyObject: {},
                        rec: new Model({
                            adapter: 'Types/entity:adapter.Sbis',
                            rawData: recData,
                        }),
                        rs: new RecordSet({
                            adapter: 'Types/entity:adapter.Sbis',
                            rawData: rsData,
                        }),
                    })
                    .orderBy({
                        id: false,
                        enabled: true,
                    })
                    .offset(100)
                    .limit(33);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Фильтр.s[0].n).toBe('emptyArray');
                    expect(args.Фильтр.s[0].t.n).toBe('Массив');
                    expect(args.Фильтр.s[0].t.t).toBe('Строка');
                    expect(args.Фильтр.d[0]).toEqual([]);

                    expect(args.Фильтр.s[1].n).toBe('emptyObject');
                    expect(args.Фильтр.s[1].t).toBe('JSON-объект');
                    expect(args.Фильтр.d[1]).toEqual({});

                    expect(args.Фильтр.s[2].n).toBe('enabled');
                    expect(args.Фильтр.s[2].t).toBe('Логическое');
                    expect(args.Фильтр.d[2]).toBe(true);

                    expect(args.Фильтр.s[3].n).toBe('id');
                    expect(args.Фильтр.s[3].t).toBe('Число целое');
                    expect(args.Фильтр.d[3]).toBe(5);

                    expect(args.Фильтр.s[4].n).toBe('obj');
                    expect(args.Фильтр.s[4].t).toBe('JSON-объект');
                    expect(args.Фильтр.d[4]).toEqual({ a: 1, b: 2 });

                    expect(args.Фильтр.s[5].n).toBe('path');
                    expect(args.Фильтр.s[5].t.n).toBe('Массив');
                    expect(args.Фильтр.s[5].t.t).toBe('Число целое');
                    expect(args.Фильтр.d[5]).toEqual([1, 2, 3]);

                    expect(args.Фильтр.s[6].n).toBe('rec');
                    expect(args.Фильтр.s[6].t).toBe('Запись');
                    expect(args.Фильтр.d[6].d).toEqual(recData.d);
                    expect(args.Фильтр.d[6].s).toEqual(recData.s);

                    expect(args.Фильтр.s[7].n).toBe('rs');
                    expect(args.Фильтр.s[7].t).toBe('Выборка');
                    expect(args.Фильтр.d[7].d).toEqual(rsData.d);
                    expect(args.Фильтр.d[7].s).toEqual(rsData.s);

                    expect(args.Фильтр.s[8].n).toBe('title');
                    expect(args.Фильтр.s[8].t).toBe('Строка');
                    expect(args.Фильтр.d[8]).toBe('abc*');

                    expect(args.Сортировка.d[0][1]).toBe('id');
                    expect(args.Сортировка.d[0][2]).toBe(false);
                    expect(args.Сортировка.d[0][0]).toBe(true);

                    expect(args.Сортировка.d[1][1]).toBe('enabled');
                    expect(args.Сортировка.d[1][2]).toBe(true);
                    expect(args.Сортировка.d[1][0]).toBe(false);

                    expect(args.Сортировка.s[0].n).toBe('l');
                    expect(args.Сортировка.s[1].n).toBe('n');
                    expect(args.Сортировка.s[2].n).toBe('o');

                    expect(args.Навигация.s[0].n).toBe('ЕстьЕще');
                    expect(args.Навигация.d[0]).toBe(true);

                    expect(args.Навигация.s[1].n).toBe('РазмерСтраницы');
                    expect(args.Навигация.d[1]).toBe(33);

                    expect(args.Навигация.s[2].n).toBe('Страница');
                    expect(args.Навигация.d[2]).toBe(3);

                    expect(args.ДопПоля.length).toBe(0);
                });
            });

            test('should generate request with andExpression()', () => {
                const query = new Query();
                query.where(andExpression({ a: 1 }));

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(1);
                    expect(args.Фильтр.s[0].n).toBe('a');
                    expect(args.Фильтр.d[0]).toBe(1);
                });
            });

            test('should generate request with andExpression() and orExpression()', () => {
                const query = new Query();
                query.where(andExpression<IAtoC>({ a: 1 }, orExpression({ b: 2 }, { c: 3 })));

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(3);

                    expect(args.Фильтр.s[0].n).toBe('a');
                    expect(args.Фильтр.d[0]).toBe(1);

                    expect(args.Фильтр.s[1].n).toBe('b');
                    expect(args.Фильтр.d[1]).toEqual([2]);

                    expect(args.Фильтр.s[2].n).toBe('c');
                    expect(args.Фильтр.d[2]).toEqual([3]);
                });
            });

            test('should generate request with filter contains only given data', () => {
                class MyModel extends Model {
                    rawData = {
                        a: 1,
                    };
                }
                const query = new Query();

                service.setModel(MyModel);
                query.where({
                    b: 2,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(1);
                    expect(args.Фильтр.s[0].n).toBe('b');
                });
            });

            test('should generate request with an empty filter', () => {
                const query = new Query();
                query.where({});
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(0);
                    expect(args.Фильтр.d.length).toBe(0);
                });
            });

            test('should generate request with filter given as Record instance', () => {
                const query = new Query();
                const where = new Record({
                    rawData: { foo: 'bar' },
                });
                query.where(where);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр).toEqual({ foo: 'bar' });
                });
            });

            test('should generate request with given null policy', () => {
                const query = new Query();
                query.orderBy('id', true, true);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Сортировка.s.length).toBe(3);
                    expect(args.Сортировка.s[0].n).toBe('l');
                    expect(args.Сортировка.s[1].n).toBe('n');
                    expect(args.Сортировка.s[2].n).toBe('o');

                    expect(args.Сортировка.d.length).toBe(1);
                    expect(args.Сортировка.d[0].length).toBe(3);
                    expect(args.Сортировка.d[0][0]).toBe(true);
                    expect(args.Сортировка.d[0][1]).toBe('id');
                    expect(args.Сортировка.d[0][2]).toBe(true);
                });
            });

            test('should generate request with expand "None" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.None,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(1);
                    expect(args.Фильтр.s[0].n).toBe('Разворот');
                    expect(args.Фильтр.d[0]).toBe('Без разворота');
                });
            });

            test('should generate request with expand "Nodes" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.Nodes,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(2);
                    expect(args.Фильтр.s[0].n).toBe('ВидДерева');
                    expect(args.Фильтр.d[0]).toBe('Только узлы');
                    expect(args.Фильтр.s[1].n).toBe('Разворот');
                    expect(args.Фильтр.d[1]).toBe('С разворотом');
                });
            });

            test('should generate request with expand "Leaves" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.Leaves,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(2);
                    expect(args.Фильтр.s[0].n).toBe('ВидДерева');
                    expect(args.Фильтр.d[0]).toBe('Только листья');
                    expect(args.Фильтр.s[1].n).toBe('Разворот');
                    expect(args.Фильтр.d[1]).toBe('С разворотом');
                });
            });

            test('should generate request with expand "All" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.All,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Фильтр.s.length).toBe(2);
                    expect(args.Фильтр.s[0].n).toBe('ВидДерева');
                    expect(args.Фильтр.d[0]).toBe('Узлы и листья');
                    expect(args.Фильтр.s[1].n).toBe('Разворот');
                    expect(args.Фильтр.d[1]).toBe('С разворотом');
                });
            });

            test('should generate request with additional fields from query select', () => {
                const query = new Query();
                query.select(['Foo']);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.ДопПоля).toEqual(['Foo']);
                });
            });

            test('should generate request with null navigation and undefined limit', () => {
                const query = new Query();
                //@ts-ignore
                query.limit(undefined);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Навигация).toBeNull();
                });
            });

            test('should generate request with null navigation and null limit', () => {
                const query = new Query();
                //@ts-ignore
                query.limit(null);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    expect(args.Навигация).toBeNull();
                });
            });

            test('should generate request with offset type navigation by option', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    options: {
                        navigationType: SbisService.NAVIGATION_TYPE.OFFSET,
                    },
                });
                const query = new Query();
                const offset = 15;
                const limit = 50;

                query.offset(offset).limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('HasMore');
                    expect(args.Навигация.d[0]).toBe(true);

                    expect(args.Навигация.s[1].n).toBe('Limit');
                    expect(args.Навигация.d[1]).toBe(limit);

                    expect(args.Навигация.s[2].n).toBe('Offset');
                    expect(args.Навигация.d[2]).toBe(offset);
                });
            });

            test('should generate request with offset type navigation by meta data', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const offset = 15;
                const limit = 50;

                query.meta({ navigationType: NavigationType.Offset }).offset(offset).limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('HasMore');
                    expect(args.Навигация.d[0]).toBe(true);

                    expect(args.Навигация.s[1].n).toBe('Limit');
                    expect(args.Навигация.d[1]).toBe(limit);

                    expect(args.Навигация.s[2].n).toBe('Offset');
                    expect(args.Навигация.d[2]).toBe(offset);
                });
            });

            test('should generate request with null navigation if there is no limit', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query().meta({
                    navigationType: NavigationType.Position,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация).toBeNull();
                    expect(args.Фильтр.d.length).toBe(0);
                });
            });

            test('should generate request with position navigation and null position and "forward" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const limit = 9;
                const query = new Query()
                    .meta({ navigationType: NavigationType.Position })
                    .where({ 'id>=': null })
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('forward');

                    expect(args.Навигация.s[1].n).toBe('HasMore');
                    expect(args.Навигация.d[1]).toBe(true);

                    expect(args.Навигация.s[2].n).toBe('Limit');
                    expect(args.Навигация.d[2]).toBe(limit);

                    expect(args.Навигация.s[3].n).toBe('Position');
                    expect(args.Навигация.s[3].t).toBe('Строка');
                    expect(args.Навигация.d[3]).toBe(null);
                });
            });

            test('should generate request with position navigation and null position and "backward" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const limit = 9;
                const query = new Query()
                    .meta({ navigationType: NavigationType.Position })
                    .where({ 'id<=': null })
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('backward');

                    expect(args.Навигация.s[1].n).toBe('HasMore');
                    expect(args.Навигация.d[1]).toBe(true);

                    expect(args.Навигация.s[2].n).toBe('Limit');
                    expect(args.Навигация.d[2]).toBe(limit);

                    expect(args.Навигация.s[3].n).toBe('Position');
                    expect(args.Навигация.s[3].t).toBe('Строка');
                    expect(args.Навигация.d[3]).toBe(null);
                });
            });

            test(
                'should generate request with position navigation and null position if there is undefined value in ' +
                    'conditions',
                () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                    });
                    const limit = 9;
                    const query = new Query()
                        .meta({ navigationType: NavigationType.Position })
                        .where({ 'id>=': undefined })
                        .limit(limit);

                    return service.query(query).then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;

                        expect(args.Навигация.s[0].n).toBe('Direction');
                        expect(args.Навигация.d[0]).toBe('forward');

                        expect(args.Навигация.s[1].n).toBe('HasMore');
                        expect(args.Навигация.d[1]).toBe(true);

                        expect(args.Навигация.s[2].n).toBe('Limit');
                        expect(args.Навигация.d[2]).toBe(limit);

                        expect(args.Навигация.s[3].n).toBe('Position');
                        expect(args.Навигация.s[3].t).toBe('Строка');
                        expect(args.Навигация.d[3]).toBe(null);
                    });
                }
            );

            test('should generate request with position navigation and "forward" direction as default', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const limit = 50;

                query.meta({ navigationType: NavigationType.Position }).limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('forward');

                    expect(args.Навигация.s[1].n).toBe('HasMore');
                    expect(args.Навигация.d[1]).toBe(true);

                    expect(args.Навигация.s[2].n).toBe('Limit');
                    expect(args.Навигация.d[2]).toBe(limit);

                    expect(args.Навигация.s[3].n).toBe('Position');
                    expect(args.Навигация.s[3].t).toBe('Строка');
                    expect(args.Навигация.d[3]).toBe(null);

                    expect(args.Фильтр.d.length).toBe(0);
                });
            });

            test('should generate request with position navigation and "forward" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const where = { 'id>=': 10 };
                const limit = 50;

                query.meta({ navigationType: NavigationType.Position }).where(where).limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('forward');

                    expect(args.Навигация.s[1].n).toBe('HasMore');
                    expect(args.Навигация.d[1]).toBe(true);

                    expect(args.Навигация.s[2].n).toBe('Limit');
                    expect(args.Навигация.d[2]).toBe(limit);

                    expect(args.Навигация.s[3].n).toBe('Position');
                    expect(args.Навигация.s[3].t).toBe('Запись');
                    expect(args.Навигация.d[3].s.length).toBe(1);
                    expect(args.Навигация.d[3].s[0].n).toBe('id');
                    expect(args.Навигация.d[3].d.length).toBe(1);
                    expect(args.Навигация.d[3].d[0]).toBe(10);

                    expect(args.Фильтр.d.length).toBe(0);
                });
            });

            test('should generate request with position navigation and "backward" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const where = { 'id<=': 10 };
                const limit = 50;

                query.meta({ navigationType: NavigationType.Position }).where(where).limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('backward');

                    expect(args.Навигация.s[3].n).toBe('Position');
                    expect(args.Навигация.s[3].t).toBe('Запись');
                    expect(args.Навигация.d[3].s.length).toBe(1);
                    expect(args.Навигация.d[3].s[0].n).toBe('id');
                    expect(args.Навигация.d[3].d.length).toBe(1);
                    expect(args.Навигация.d[3].d[0]).toBe(10);

                    expect(args.Фильтр.d.length).toBe(0);
                });
            });

            test('should generate request with position navigation and "bothways" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const where = { 'id~': 10 };
                const limit = 50;

                query.meta({ navigationType: NavigationType.Position }).where(where).limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('bothways');

                    expect(args.Фильтр.d.length).toBe(0);
                });
            });

            test('should generate request with position navigation and mixed conditions', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query()
                    .meta({ navigationType: NavigationType.Position })
                    .where({
                        parentId: 10,
                        'id>=': 50,
                    })
                    .limit(5);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.s[0].n).toBe('Direction');
                    expect(args.Навигация.d[0]).toBe('forward');

                    expect(args.Навигация.s[3].n).toBe('Position');
                    expect(args.Навигация.s[3].t).toBe('Запись');
                    expect(args.Навигация.d[3].s.length).toBe(1);
                    expect(args.Навигация.d[3].s[0].n).toBe('id');
                    expect(args.Навигация.d[3].d.length).toBe(1);
                    expect(args.Навигация.d[3].d[0]).toBe(50);

                    expect(args.Фильтр.s.length).toBe(1);
                    expect(args.Фильтр.s[0].n).toBe('parentId');
                    expect(args.Фильтр.d[0]).toBe(10);
                });
            });

            test('should generate request with page navigation from union query', () => {
                const service = new SbisService({ endpoint: 'USP' });

                const queryA = new Query().offset(10).limit(5);

                const queryB = new Query();
                queryB
                    .where({ a: new PrimaryKey(1), b: 2 })
                    .offset(20)
                    .limit(10);

                queryA.union(queryB);

                return service.query(queryA).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Фильтр.s.length).toBe(1);
                    expect(args.Фильтр.s[0].n).toBe('b');

                    expect(args.Фильтр.d.length).toBe(1);
                    expect(args.Фильтр.d[0]).toBe(2);

                    expect(args.Навигация.s.length).toBe(2);
                    expect(args.Навигация.s[0].n).toBe('id');
                    expect(args.Навигация.s[1].n).toBe('nav');

                    expect(args.Навигация.d.length).toBe(2);
                    expect(args.Навигация.d[0]).toEqual([
                        null,
                        {
                            _type: 'record',
                            s: [
                                { n: 'ЕстьЕще', t: 'Логическое' },
                                { n: 'РазмерСтраницы', t: 'Число целое' },
                                { n: 'Страница', t: 'Число целое' },
                            ],
                            d: [true, 5, 2],
                        },
                    ]);
                    expect(JSON.parse(JSON.stringify(args.Навигация.d[1]))).toEqual([
                        1,
                        {
                            _type: 'record',
                            s: [
                                { n: 'ЕстьЕще', t: 'Логическое' },
                                { n: 'РазмерСтраницы', t: 'Число целое' },
                                { n: 'Страница', t: 'Число целое' },
                            ],
                            f: 0,
                            d: [true, 10, 2],
                        },
                    ]);
                });
            });

            test('should generate request with position navigation from union query', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    options: {
                        navigationType: SbisService.NAVIGATION_TYPE.POSITION,
                    },
                });

                const queryA = new Query().where({ a: new PrimaryKey(1), 'b>': 2 }).limit(10);

                const queryB = new Query();
                queryB.where({ c: new PrimaryKey(3), d: 4, 'e<': 5 }).limit(20);

                queryA.union(queryB);

                return service.query(queryA).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Фильтр.s.length).toBe(1);
                    expect(args.Фильтр.s[0].n).toBe('d');
                    expect(args.Фильтр.d[0]).toBe(4);

                    expect(args.Навигация.s.length).toBe(2);
                    expect(args.Навигация.s[0].n).toBe('id');
                    expect(args.Навигация.s[1].n).toBe('nav');

                    expect(args.Навигация.d.length).toBe(2);
                    expect(args.Навигация.d[0]).toEqual([
                        1,
                        {
                            _type: 'record',
                            s: [
                                { n: 'Direction', t: 'Строка' },
                                { n: 'HasMore', t: 'Логическое' },
                                { n: 'Limit', t: 'Число целое' },
                                { n: 'Position', t: 'Запись' },
                            ],
                            d: [
                                'forward',
                                true,
                                10,
                                {
                                    _type: 'record',
                                    s: [{ n: 'b', t: 'Число целое' }],
                                    d: [2],
                                },
                            ],
                        },
                    ]);
                    expect(args.Навигация.d[1]).toEqual([
                        3,
                        {
                            _type: 'record',
                            s: [
                                { n: 'Direction', t: 'Строка' },
                                { n: 'HasMore', t: 'Логическое' },
                                { n: 'Limit', t: 'Число целое' },
                                { n: 'Position', t: 'Запись' },
                            ],
                            d: [
                                'backward',
                                true,
                                20,
                                {
                                    _type: 'record',
                                    s: [{ n: 'e', t: 'Число целое' }],
                                    d: [5],
                                },
                            ],
                        },
                    ]);
                });
            });

            test('should generate request with "hasMore" from given meta property', () => {
                const hasMore = 'test';
                const query = new Query();
                query.offset(0).limit(10).meta({
                    hasMore,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    expect(args.Навигация.d[0]).toBe(hasMore);
                    expect(args.Навигация.s[0].n).toBe('ЕстьЕще');
                });
            });

            test('should cancel the inner request', () => {
                const def = service.query();
                const lastDef = SbisBusinessLogic.lastDeferred;

                //@ts-ignore
                def.cancel();
                expect(lastDef.getResult()).toBeInstanceOf(DeferredCanceledError);
            });
        });

        describe("when the service isn't exists", () => {
            test('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.query(new Query()).then(
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

    describe('.call()', () => {
        describe('when the method is exists', () => {
            test('should accept an object', () => {
                const rs = new RecordSet({
                    rawData: [
                        { f1: 1, f2: 2 },
                        { f1: 3, f2: 4 },
                    ],
                });
                const sent = {
                    bool: false,
                    intgr: 1,
                    real: 1.01,
                    string: 'test',
                    obj: { a: 1, b: 2, c: 3 },
                    rec: getSampleModel(),
                    rs,
                };

                return service.call('Dummy', sent).then(() => {
                    expect(SbisBusinessLogic.lastRequest.method).toBe('Dummy');
                    const args = SbisBusinessLogic.lastRequest.args;
                    const expectData = getSampleModel().getRawData();

                    expect(args.rec.d).toEqual(expectData.d);
                    expect([...args.rec.s]).toEqual(expectData.s);

                    //@ts-ignore
                    delete sent.rec;
                    delete args.rec;

                    expect(args.rs).toEqual(rs.getRawData());
                    //@ts-ignore
                    delete sent.rs;
                    delete args.rs;

                    expect(args).toEqual(sent);
                });
            });

            test('should accept a model', () => {
                const model = getSampleModel();

                return service.call('Dummy', model).then(() => {
                    expect(SbisBusinessLogic.lastRequest.method).toBe('Dummy');
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsModel(args, model);
                });
            });

            test('should accept a dataset', () => {
                const dataSet = new DataSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData: {
                        _type: 'recordset',
                        d: [
                            [1, true],
                            [2, false],
                            [5, true],
                        ],
                        s: [
                            { n: '@ID', t: 'Идентификатор' },
                            { n: 'Флаг', t: 'Логическое' },
                        ],
                    },
                });

                return service.call('Dummy', dataSet).then(() => {
                    expect(SbisBusinessLogic.lastRequest.method).toBe('Dummy');
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsDataSet(args, dataSet);
                });
            });

            test('should generate request with cache argument', () => {
                const cacheParams = {
                    maxAge: 123,
                    mustRevalidate: true,
                };
                //@ts-ignore
                return service.call('Dummy', {}, cacheParams).then(() => {
                    const cache = SbisBusinessLogic.lastRequest.cache;
                    expect(cache).toEqual(cacheParams);
                });
            });
        });

        describe("when the method isn't exists", () => {
            test('should return an error', () => {
                return service.call('МойМетод').then(
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

    describe('.move', () => {
        test('should call move', () => {
            return service
                .move([1], 2, {
                    parentProperty: 'parent',
                    position: 'before',
                })
                .then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const expected = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'USP',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        Sorting: null,
                        ReadMethod: 'USP.Прочитать',
                        UpdateMethod: 'USP.Записать',
                    };
                    expect(args).toEqual(expected);
                });
        });

        test('should call move with sorting', () => {
            const query = new Query().orderBy('id');

            return service
                .move([1], 2, {
                    parentProperty: 'parent',
                    position: 'before',
                    query,
                })
                .then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const expected = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'USP',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        Sorting: {
                            _type: 'recordset',
                            d: [[false, 'id', true]],
                            s: [
                                {
                                    t: 'Логическое',
                                    n: 'l',
                                },
                                {
                                    t: 'Строка',
                                    n: 'n',
                                },
                                {
                                    t: 'Логическое',
                                    n: 'o',
                                },
                            ],
                        },
                        ReadMethod: 'USP.Прочитать',
                        UpdateMethod: 'USP.Записать',
                    };
                    expect(args).toEqual(expected);
                });
        });

        test('should call move method when binding.move has contract', () => {
            const service = new SbisService({
                endpoint: 'Goods',
                binding: {
                    move: 'Product.Mymove',
                },
            });

            return service
                .move([1], 2, {
                    parentProperty: 'parent',
                    position: 'before',
                })
                .then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const expected = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'Goods',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        ReadMethod: 'Goods.Прочитать',
                        UpdateMethod: 'Goods.Записать',
                    };
                    expect(args).toEqual(expected);
                });
        });

        test('should call move method when binding.read or binding.update have contract', () => {
            const service = new SbisService({
                endpoint: 'Goods',
                binding: {
                    read: 'Product.get',
                    update: 'Product.put',
                },
            });

            return service
                .move([1], 2, {
                    parentProperty: 'parent',
                    position: 'before',
                })
                .then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const expected = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'Goods',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        Sorting: null,
                        ReadMethod: 'Product.get',
                        UpdateMethod: 'Product.put',
                    };
                    expect(args).toEqual(expected);
                });
        });

        test('should call move with complex ids', () => {
            return service
                .move(['1,Item'], '2,Item', {
                    parentProperty: 'parent',
                    position: 'before',
                })
                .then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const expected = {
                        IndexNumber: 'ПорНомер',
                        HierarchyName: 'parent',
                        ObjectName: 'Item',
                        ObjectId: ['1'],
                        DestinationId: '2',
                        Order: 'before',
                        Sorting: null,
                        ReadMethod: 'Item.Прочитать',
                        UpdateMethod: 'Item.Записать',
                    };
                    expect(args).toEqual(expected);
                });
        });

        test('should return origin error', () => {
            const originError = new Error();
            class SbisBusinessLogic2 extends SbisBusinessLogic {
                call() {
                    return new Deferred().errback(originError);
                }
            }
            di.register(provider, SbisBusinessLogic2);
            service = new SbisService({
                endpoint: 'USP',
            });

            return service
                .move(['1,Item'], '2,Item', {
                    parentProperty: 'parent',
                    position: 'before',
                })
                .then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (error) => {
                        expect(error).toEqual(originError);
                    }
                );
        });

        describe('test move way with moveBefore or moveAfter', () => {
            let oldWayService: SbisService;
            beforeEach(() => {
                oldWayService = new SbisService({
                    endpoint: {
                        contract: 'USP',
                        moveContract: 'ПорядковыйНомер',
                    },
                    binding: {
                        moveBefore: 'ВставитьДо',
                        moveAfter: 'ВставитьПосле',
                    },
                });
            });

            test('should call move', () => {
                return (
                    oldWayService
                        //@ts-ignore
                        .move(1, 2, {
                            before: true,
                            hierField: 'parent',
                        })
                        .then(() => {
                            const args = SbisBusinessLogic.lastRequest.args;
                            const etalon = {
                                ПорядковыйНомер: 'ПорНомер',
                                Иерархия: 'parent',
                                Объект: 'ПорядковыйНомер',
                                ИдО: ['1', 'USP'],
                                ИдОДо: ['2', 'USP'],
                            };
                            expect(etalon).toEqual(args);
                        })
                );
            });

            test('should call move with complex ids', () => {
                return (
                    oldWayService
                        //@ts-ignore
                        .move('1,Item', '2,Item', {
                            before: true,
                            hierField: 'parent',
                        })
                        .then(() => {
                            const args = SbisBusinessLogic.lastRequest.args;
                            const etalon = {
                                ПорядковыйНомер: 'ПорНомер',
                                Иерархия: 'parent',
                                Объект: 'ПорядковыйНомер',
                                ИдО: ['1', 'Item'],
                                ИдОДо: ['2', 'Item'],
                            };
                            expect(etalon).toEqual(args);
                        })
                );
            });
        });
    });

    describe('.getOrderProperty()', () => {
        test('should return an empty string by default', () => {
            const source = new SbisService();
            expect(source.getOrderProperty()).toBe('ПорНомер');
        });

        test('should return value passed to the constructor', () => {
            const source = new SbisService({
                orderProperty: 'test',
            });
            expect(source.getOrderProperty()).toEqual('test');
        });
    });

    describe('.setOrderProperty()', () => {
        test('should set the new value', () => {
            const source = new SbisService();
            source.setOrderProperty('test');
            expect(source.getOrderProperty()).toEqual('test');
        });
    });

    describe('.toJSON()', () => {
        test('should serialize provider option', () => {
            class Foo {}
            di.register('Foo', Foo);

            const source = new SbisService({
                provider: 'Foo',
            });
            const provider = source.getProvider();
            const json = source.toJSON();

            di.unregister('Foo');

            expect(provider).toBeInstanceOf(Foo);
            //@ts-ignore
            expect(json.state.$options.provider).toEqual('Foo');
        });
    });

    describe('getQueryArguments()', () => {
        test('should return valid arguments for .query()', () => {
            const query = new Query();
            query.orderBy({ foo: false }).offset(10);
            const args = getQueryArguments(query);

            expect(args.Фильтр).toBeInstanceOf(Record);
            expect(args.Сортировка).toBeInstanceOf(RecordSet);
            expect(args.Навигация).toBeInstanceOf(Record);
            expect(args.ДопПоля).toBeInstanceOf(Array);
        });
    });
});
