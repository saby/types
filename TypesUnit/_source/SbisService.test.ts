import { assert } from 'chai';
import SbisService, {
    getQueryArguments,
    IBinding,
} from 'Types/_source/SbisService';
import DataSet from 'Types/_source/DataSet';
import Query, {
    andExpression,
    orExpression,
    ExpandMode,
    NavigationType,
} from 'Types/_source/Query';
import PrimaryKey from 'Types/_entity/applied/PrimaryKey';
import Record from 'Types/_entity/Record';
import Model from 'Types/_entity/Model';
import RecordSet from 'Types/_collection/RecordSet';
import List from 'Types/_collection/List';
import * as di from 'Types/di';
import { ExtendDate, IExtendDateConstructor } from 'Types/_declarations';
import {Deferred} from 'Types/deferred';
import {IOptions as OptSbisBusinessLogic} from 'Types/_source/provider/SbisBusinessLogic';
import 'Types/_entity/adapter/Sbis';

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
            static lastRequest;
            static lastDeferred;

            constructor(cfg: OptSbisBusinessLogic) {
                this._cfg = cfg;
            }

            call(method: string, args: any, cache?: unknown): Promise<any> {
                const def = new Deferred();
                const idPosition = 3;
                let error = '';
                let data;

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
                                        d: [
                                            'Smith',
                                            'John',
                                            'Levitt',
                                            existsId,
                                            'Engineer',
                                            true,
                                        ],
                                        s: meta,
                                    };
                                } else {
                                    error = 'Model is not found';
                                }
                                break;

                            case 'Записать':
                                if (args.Запись) {
                                    if (
                                        args.Запись.d &&
                                        args.Запись.d[idPosition]
                                    ) {
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
                                        [
                                            'Smith',
                                            'John',
                                            'Levitt',
                                            existsId,
                                            'Engineer',
                                            true,
                                        ],
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

    const testArgIsModel = (arg, model) => {
        assert.strictEqual(arg._type, 'record');
        assert.deepEqual(arg.d, model.getRawData().d);
        assert.deepEqual(arg.s, model.getRawData().s);
    };

    const testArgIsDataSet = (arg, dataSet) => {
        assert.strictEqual(arg._type, 'recordset');
        assert.deepEqual(arg.d, dataSet.getRawData().d);
        assert.deepEqual(arg.s, dataSet.getRawData().s);
    };

    let service;

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
        service = undefined;
    });

    describe('.create()', () => {
        context('when the service is exists', () => {
            it('should return an empty model', () => {
                return service.create().then((model) => {
                    assert.isTrue(model instanceof Model);
                    assert.isTrue(model.getKey() > 0);
                    assert.strictEqual(model.get('LastName'), '');
                });
            });

            it('should generate a valid request', () => {
                return service.create().then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.isNull(args.ИмяМетода);
                    assert.strictEqual(
                        args.Фильтр.d[0],
                        true,
                        'Wrong value for argument Фильтр.ВызовИзБраузера'
                    );
                    assert.strictEqual(
                        args.Фильтр.s[0].n,
                        'ВызовИзБраузера',
                        'Wrong name for argument Фильтр.ВызовИзБраузера'
                    );
                    assert.strictEqual(
                        args.Фильтр.s[0].t,
                        'Логическое',
                        'Wrong type for argument Фильтр.ВызовИзБраузера'
                    );
                });
            });

            it('should generate request with additional fields from record', () => {
                const model = getSampleModel();
                return service.create(model).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsModel(args.Фильтр, model);
                });
            });

            it('should generate request with additional fields from object', () => {
                const meta = getSampleMeta();
                return service.create(meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    const fields = Object.keys(meta);
                    meta.ВызовИзБраузера = true;
                    fields.push('ВызовИзБраузера');

                    assert.strictEqual(args.Фильтр.s.length, fields.length);
                    for (let i = 0; i < args.Фильтр.d.length; i++) {
                        assert.strictEqual(args.Фильтр.s[i].n, fields[i]);
                        assert.strictEqual(args.Фильтр.d[i], meta[fields[i]]);
                    }
                });
            });

            it('should generate request with Date field', () => {
                const date = new Date() as ExtendDate;
                if (!date.setSQLSerializationMode) {
                    return;
                }

                date.setSQLSerializationMode(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE
                );
                const meta = { foo: date };
                return service.create(meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Фильтр.s[0].n, 'foo');
                    assert.strictEqual(args.Фильтр.s[0].t, 'Дата');
                });
            });

            it('should generate request with Time field', () => {
                const date = new Date() as ExtendDate;
                if (!date.setSQLSerializationMode) {
                    return;
                }

                date.setSQLSerializationMode(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME
                );
                const meta = { foo: date };
                return service.create(meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Фильтр.s[0].n, 'foo');
                    assert.strictEqual(args.Фильтр.s[0].t, 'Время');
                });
            });

            it('should generate request with custom method name in the filter', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    binding: {
                        format: 'ПрочитатьФормат',
                    },
                });
                return service.create().then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.ИмяМетода, 'ПрочитатьФормат');
                });
            });

            it('should cancel the inner request', () => {
                const def = service.create();
                const lastDef = SbisBusinessLogic.lastDeferred;

                def.cancel();
                assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
            });

            it('should sort fields in filter', () => {
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
                        .map((i) => {
                            return i.n;
                        })
                        .sort();
                    for (let i = 0; i < sortNames.length; i++) {
                        assert.strictEqual(s[i].n, sortNames[i]);
                    }
                });
            });
        });

        context("when the service isn't exists", () => {
            it('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.create().then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        assert.instanceOf(err, Error);
                    }
                );
            });
        });
    });

    describe('.read()', () => {
        context('when the service is exists', () => {
            context('and the model is exists', () => {
                it('should return valid model', () => {
                    return service
                        .read(SbisBusinessLogic.existsId)
                        .then((model) => {
                            assert.isTrue(model instanceof Model);
                            assert.strictEqual(
                                model.getKey(),
                                SbisBusinessLogic.existsId
                            );
                            assert.strictEqual(model.get('LastName'), 'Smith');
                        });
                });

                it('should generate a valid request', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        binding: {
                            format: 'Формат',
                        },
                    });
                    return service.read(SbisBusinessLogic.existsId).then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        assert.strictEqual(args.ИмяМетода, 'Формат');
                        assert.strictEqual(
                            args.ИдО,
                            SbisBusinessLogic.existsId
                        );
                    });
                });

                it('should generate request with additional fields if option passAddFieldsFromMeta is set', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        options: {
                            passAddFieldsFromMeta: true,
                        },
                    });
                    const meta = { foo: 'bar' };

                    return service
                        .read(SbisBusinessLogic.existsId, meta)
                        .then(() => {
                            const args = SbisBusinessLogic.lastRequest.args;
                            assert.deepEqual(args.ДопПоля, meta);
                        });
                });

                it('should return Types/entity:Model instance by default', () => {
                    const service = new SbisService({
                        endpoint: 'USP',
                        model: undefined,
                    });
                    return service
                        .read(SbisBusinessLogic.existsId)
                        .then((model) => {
                            assert.isTrue(model instanceof Model);
                            assert.strictEqual(
                                model.getKey(),
                                SbisBusinessLogic.existsId
                            );
                            assert.strictEqual(model.get('LastName'), 'Smith');
                        });
                });
            });

            context("and the model isn't exists", () => {
                it('should return an error', () => {
                    return service.read(SbisBusinessLogic.notExistsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            assert.instanceOf(err, Error);
                        }
                    );
                });
            });
        });

        context("when the service isn't exists", () => {
            it('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.read(SbisBusinessLogic.existsId).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        assert.instanceOf(err, Error);
                    }
                );
            });
        });
    });

    describe('.update()', () => {
        context('when the service is exists', () => {
            context('and the model was stored', () => {
                it('should update the model', () => {
                    return service
                        .read(SbisBusinessLogic.existsId)
                        .then((model) => {
                            model.set('LastName', 'Cameron');
                            return service.update(model).then((success) => {
                                assert.isTrue(success > 0);
                                assert.isFalse(model.isChanged());
                                assert.strictEqual(
                                    model.get('LastName'),
                                    'Cameron'
                                );
                            });
                        });
                });
            });

            context('and the model was not stored', () => {
                const testModel = (success, model) => {
                    assert.isTrue(success > 0);
                    assert.isFalse(model.isChanged());
                    assert.isTrue(model.getKey() > 0);
                };

                it('should create the model by 1st way', () => {
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

                it('should create the model by 2nd way', () => {
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

            it('should generate a valid request', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    binding: {
                        format: 'Формат',
                    },
                });
                return service
                    .read(SbisBusinessLogic.existsId)
                    .then((model) => {
                        return service.update(model).then(() => {
                            const args = SbisBusinessLogic.lastRequest.args;
                            testArgIsModel(args.Запись, model);
                        });
                    });
            });

            it('should generate request with additional fields if option passAddFieldsFromMeta is set', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    options: {
                        passAddFieldsFromMeta: true,
                    },
                });
                const meta = { foo: 'bar' };

                return service.update(getSampleModel(), meta).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.deepEqual(args.ДопПоля, meta);
                });
            });

            it('should cancel the inner request', () => {
                const model = getSampleModel();
                const def = service.update(model);
                const lastDef = SbisBusinessLogic.lastDeferred;

                def.cancel();
                assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
            });
        });

        context("when the service isn't exists", () => {
            it('should return an error', () => {
                return service.create().then((model) => {
                    const service = new SbisService({
                        endpoint: 'Unknown',
                    });
                    return service.update(model).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            assert.instanceOf(err, Error);
                        }
                    );
                });
            });
        });

        context('when is updating few rows', () => {
            it('should accept RecordSet', () => {
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
                    assert.isObject(args.Записи);
                });
            });

            it('should call updateBatch', () => {
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

                    assert.equal(args.changed.d.length, 1);
                    assert.equal(args.changed.d[0][0], 1);

                    assert.equal(args.added.d.length, 1);
                    assert.equal(args.added.d[0][0], 4);

                    assert.deepEqual(args.removed, [2]);
                });
            });
        });
    });

    describe('.destroy()', () => {
        context('when the service is exists', () => {
            context('and the model is exists', () => {
                it('should return success', () => {
                    return service
                        .destroy(SbisBusinessLogic.existsId)
                        .then((success) => {
                            assert.strictEqual(
                                success,
                                SbisBusinessLogic.existsId
                            );
                        });
                });
            });

            context("and the model isn't exists", () => {
                it('should return an error', () => {
                    return service.destroy(SbisBusinessLogic.notExistsId).then(
                        () => {
                            throw new Error('Method should return an error');
                        },
                        (err) => {
                            assert.instanceOf(err, Error);
                        }
                    );
                });
            });

            it('should delete a few records', () => {
                return service
                    .destroy([0, SbisBusinessLogic.existsId, 1])
                    .then((success) => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        assert.equal(args.ИдО[0], 0);
                        assert.equal(args.ИдО[1], SbisBusinessLogic.existsId);
                        assert.equal(args.ИдО[2], 1);
                        assert.equal(success[0], SbisBusinessLogic.existsId);
                    });
            });

            it('should delete records by a composite key', () => {
                const anId = 987;
                return service
                    .destroy([
                        SbisBusinessLogic.existsId + ',USP',
                        anId + ',Goods',
                    ])
                    .then((success) => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        assert.equal(args.ИдО, anId);
                        assert.equal(success[0], SbisBusinessLogic.existsId);
                        assert.equal(success[1], anId);
                    });
            });

            it('should delete records with composite key and object name in binding', () => {
                service = new SbisService({
                    endpoint: 'Foo1',
                    binding: {
                        destroy: 'Foo2.Delete',
                    },
                });
                return service
                    .destroy([SbisBusinessLogic.existsId + ',Foo3'])
                    .then((success) => {
                        const method = SbisBusinessLogic.lastRequest.method;
                        const args = SbisBusinessLogic.lastRequest.args;

                        assert.equal(method, 'Foo2.Delete');
                        assert.equal(args.ИдО, SbisBusinessLogic.existsId);
                        assert.equal(success[0], SbisBusinessLogic.existsId);
                    });
            });

            it('should handle not a composite key', () => {
                const notABlName = SbisBusinessLogic.existsId + ',(USP)';
                return service.destroy([notABlName]).then(
                    () => {
                        throw new Error("It shouldn't be a successful call");
                    },
                    () => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        assert.equal(args.ИдО, notABlName);
                    }
                );
            });

            it('should delete records by text key', () => {
                const anId = 'uuid';
                return service.destroy([anId]).then((success) => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.ИдО[0], anId);
                    assert.strictEqual(success[0], anId);
                });
            });

            it('should generate a valid request', () => {
                return service.destroy(SbisBusinessLogic.existsId).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.equal(args.ИдО[0], SbisBusinessLogic.existsId);
                });
            });

            it('should generate request with additional fields from record', () => {
                return service
                    .destroy(SbisBusinessLogic.existsId, getSampleModel())
                    .then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        testArgIsModel(args.ДопПоля, getSampleModel());
                    });
            });

            it('should generate request with additional fields from object', () => {
                return service
                    .destroy(SbisBusinessLogic.existsId, getSampleMeta())
                    .then(() => {
                        const args = SbisBusinessLogic.lastRequest.args;
                        assert.deepEqual(args.ДопПоля, getSampleMeta());
                    });
            });
        });

        context("when the service isn't exists", () => {
            it('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.destroy(SbisBusinessLogic.existsId).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        assert.instanceOf(err, Error);
                    }
                );
            });
        });
    });

    describe('.query()', () => {
        context('when the service is exists', () => {
            it('should return a valid dataset', () => {
                return service.query(new Query()).then((ds) => {
                    assert.isTrue(ds instanceof DataSet);
                    assert.strictEqual(ds.getAll().getCount(), 2);
                });
            });

            it('should take key property for dataset from raw data', () => {
                return service.query(new Query()).then((ds) => {
                    assert.strictEqual(ds.getKeyProperty(), '@ID');
                });
            });

            it('should work with no query', () => {
                return service.query().then((ds) => {
                    assert.isTrue(ds instanceof DataSet);
                    assert.strictEqual(ds.getAll().getCount(), 2);
                });
            });

            it('should return a list instance of injected module', () => {
                class MyList<T> extends List<T> {
                    constructor(options) {
                        super(options);
                    }
                }

                service.setListModule(MyList);
                return service.query().then((ds) => {
                    assert.isTrue(ds.getAll() instanceof MyList);
                });
            });

            it('should return a model instance of injected module', () => {
                class MyModel extends Model {
                    constructor(options) {
                        super(options);
                    }
                }
                service.setModel(MyModel);
                return service.query().then((ds) => {
                    assert.isTrue(ds.getAll().at(0) instanceof MyModel);
                });
            });

            it('should generate a valid request', () => {
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

                    assert.strictEqual(args.Фильтр.s[0].n, 'emptyArray');
                    assert.strictEqual(args.Фильтр.s[0].t.n, 'Массив');
                    assert.strictEqual(args.Фильтр.s[0].t.t, 'Строка');
                    assert.deepEqual(args.Фильтр.d[0], []);

                    assert.strictEqual(args.Фильтр.s[1].n, 'emptyObject');
                    assert.strictEqual(args.Фильтр.s[1].t, 'JSON-объект');
                    assert.deepEqual(args.Фильтр.d[1], {});

                    assert.strictEqual(args.Фильтр.s[2].n, 'enabled');
                    assert.strictEqual(args.Фильтр.s[2].t, 'Логическое');
                    assert.isTrue(args.Фильтр.d[2]);

                    assert.strictEqual(args.Фильтр.s[3].n, 'id');
                    assert.strictEqual(args.Фильтр.s[3].t, 'Число целое');
                    assert.strictEqual(args.Фильтр.d[3], 5);

                    assert.strictEqual(args.Фильтр.s[4].n, 'obj');
                    assert.strictEqual(args.Фильтр.s[4].t, 'JSON-объект');
                    assert.deepEqual(args.Фильтр.d[4], { a: 1, b: 2 });

                    assert.strictEqual(args.Фильтр.s[5].n, 'path');
                    assert.strictEqual(args.Фильтр.s[5].t.n, 'Массив');
                    assert.strictEqual(args.Фильтр.s[5].t.t, 'Число целое');
                    assert.deepEqual(args.Фильтр.d[5], [1, 2, 3]);

                    assert.strictEqual(args.Фильтр.s[6].n, 'rec');
                    assert.strictEqual(args.Фильтр.s[6].t, 'Запись');
                    assert.deepEqual(args.Фильтр.d[6].d, recData.d);
                    assert.deepEqual(args.Фильтр.d[6].s, recData.s);

                    assert.strictEqual(args.Фильтр.s[7].n, 'rs');
                    assert.strictEqual(args.Фильтр.s[7].t, 'Выборка');
                    assert.deepEqual(args.Фильтр.d[7].d, rsData.d);
                    assert.deepEqual(args.Фильтр.d[7].s, rsData.s);

                    assert.strictEqual(args.Фильтр.s[8].n, 'title');
                    assert.strictEqual(args.Фильтр.s[8].t, 'Строка');
                    assert.strictEqual(args.Фильтр.d[8], 'abc*');

                    assert.strictEqual(args.Сортировка.d[0][1], 'id');
                    assert.isFalse(args.Сортировка.d[0][2]);
                    assert.isTrue(args.Сортировка.d[0][0]);

                    assert.strictEqual(args.Сортировка.d[1][1], 'enabled');
                    assert.isTrue(args.Сортировка.d[1][2]);
                    assert.isFalse(args.Сортировка.d[1][0]);

                    assert.strictEqual(args.Сортировка.s[0].n, 'l');
                    assert.strictEqual(args.Сортировка.s[1].n, 'n');
                    assert.strictEqual(args.Сортировка.s[2].n, 'o');

                    assert.strictEqual(args.Навигация.s[0].n, 'ЕстьЕще');
                    assert.isTrue(args.Навигация.d[0]);

                    assert.strictEqual(args.Навигация.s[1].n, 'РазмерСтраницы');
                    assert.strictEqual(args.Навигация.d[1], 33);

                    assert.strictEqual(args.Навигация.s[2].n, 'Страница');
                    assert.strictEqual(args.Навигация.d[2], 3);

                    assert.strictEqual(args.ДопПоля.length, 0);
                });
            });

            it('should generate request with andExpression()', () => {
                const query = new Query();
                query.where(andExpression({ a: 1 }));

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 1);
                    assert.strictEqual(args.Фильтр.s[0].n, 'a');
                    assert.strictEqual(args.Фильтр.d[0], 1);
                });
            });

            it('should generate request with andExpression() and orExpression()', () => {
                const query = new Query();
                query.where(
                    andExpression<IAtoC>(
                        { a: 1 },
                        orExpression({ b: 2 }, { c: 3 })
                    )
                );

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 3);

                    assert.strictEqual(args.Фильтр.s[0].n, 'a');
                    assert.strictEqual(args.Фильтр.d[0], 1);

                    assert.strictEqual(args.Фильтр.s[1].n, 'b');
                    assert.deepEqual(args.Фильтр.d[1], [2]);

                    assert.strictEqual(args.Фильтр.s[2].n, 'c');
                    assert.deepEqual(args.Фильтр.d[2], [3]);
                });
            });

            it('should generate request with filter contains only given data', () => {
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
                    assert.strictEqual(args.Фильтр.s.length, 1);
                    assert.strictEqual(args.Фильтр.s[0].n, 'b');
                });
            });

            it('should generate request with an empty filter', () => {
                const query = new Query();
                query.where({});
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 0);
                    assert.strictEqual(args.Фильтр.d.length, 0);
                });
            });

            it('should generate request with filter given as Record instance', () => {
                const query = new Query();
                const where = new Record({
                    rawData: { foo: 'bar' },
                });
                query.where(where);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.deepEqual(args.Фильтр, { foo: 'bar' });
                });
            });

            it('should generate request with given null policy', () => {
                const query = new Query();
                query.orderBy('id', true, true);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Сортировка.s.length, 3);
                    assert.strictEqual(args.Сортировка.s[0].n, 'l');
                    assert.strictEqual(args.Сортировка.s[1].n, 'n');
                    assert.strictEqual(args.Сортировка.s[2].n, 'o');

                    assert.strictEqual(args.Сортировка.d.length, 1);
                    assert.strictEqual(args.Сортировка.d[0].length, 3);
                    assert.strictEqual(args.Сортировка.d[0][0], true);
                    assert.strictEqual(args.Сортировка.d[0][1], 'id');
                    assert.strictEqual(args.Сортировка.d[0][2], true);
                });
            });

            it('should generate request with expand "None" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.None,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 1);
                    assert.strictEqual(args.Фильтр.s[0].n, 'Разворот');
                    assert.strictEqual(args.Фильтр.d[0], 'Без разворота');
                });
            });

            it('should generate request with expand "Nodes" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.Nodes,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 2);
                    assert.strictEqual(args.Фильтр.s[0].n, 'ВидДерева');
                    assert.strictEqual(args.Фильтр.d[0], 'Только узлы');
                    assert.strictEqual(args.Фильтр.s[1].n, 'Разворот');
                    assert.strictEqual(args.Фильтр.d[1], 'С разворотом');
                });
            });

            it('should generate request with expand "Leaves" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.Leaves,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 2);
                    assert.strictEqual(args.Фильтр.s[0].n, 'ВидДерева');
                    assert.strictEqual(args.Фильтр.d[0], 'Только листья');
                    assert.strictEqual(args.Фильтр.s[1].n, 'Разворот');
                    assert.strictEqual(args.Фильтр.d[1], 'С разворотом');
                });
            });

            it('should generate request with expand "All" mode', () => {
                const query = new Query();
                query.meta({
                    expand: ExpandMode.All,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.strictEqual(args.Фильтр.s.length, 2);
                    assert.strictEqual(args.Фильтр.s[0].n, 'ВидДерева');
                    assert.strictEqual(args.Фильтр.d[0], 'Узлы и листья');
                    assert.strictEqual(args.Фильтр.s[1].n, 'Разворот');
                    assert.strictEqual(args.Фильтр.d[1], 'С разворотом');
                });
            });

            it('should generate request with additional fields from query select', () => {
                const query = new Query();
                query.select(['Foo']);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.deepEqual(args.ДопПоля, ['Foo']);
                });
            });

            it('should generate request with null navigation and undefined limit', () => {
                const query = new Query();
                query.limit(undefined);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.isNull(args.Навигация);
                });
            });

            it('should generate request with null navigation and null limit', () => {
                const query = new Query();
                query.limit(null);
                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;
                    assert.isNull(args.Навигация);
                });
            });

            it('should generate request with offset type navigation by option', () => {
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

                    assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                    assert.strictEqual(args.Навигация.d[0], true);

                    assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                    assert.strictEqual(args.Навигация.d[1], limit);

                    assert.strictEqual(args.Навигация.s[2].n, 'Offset');
                    assert.strictEqual(args.Навигация.d[2], offset);
                });
            });

            it('should generate request with offset type navigation by meta data', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const offset = 15;
                const limit = 50;

                query
                    .meta({ navigationType: NavigationType.Offset })
                    .offset(offset)
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Навигация.s[0].n, 'HasMore');
                    assert.strictEqual(args.Навигация.d[0], true);

                    assert.strictEqual(args.Навигация.s[1].n, 'Limit');
                    assert.strictEqual(args.Навигация.d[1], limit);

                    assert.strictEqual(args.Навигация.s[2].n, 'Offset');
                    assert.strictEqual(args.Навигация.d[2], offset);
                });
            });

            it('should generate request with null navigation if there is no limit', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query().meta({
                    navigationType: NavigationType.Position,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.isNull(args.Навигация);
                    assert.strictEqual(args.Фильтр.d.length, 0);
                });
            });

            it('should generate request with position navigation and null position and "forward" direction', () => {
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

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'forward');

                    assert.strictEqual(args.Навигация.s[1].n, 'HasMore');
                    assert.strictEqual(args.Навигация.d[1], true);

                    assert.strictEqual(args.Навигация.s[2].n, 'Limit');
                    assert.strictEqual(args.Навигация.d[2], limit);

                    assert.strictEqual(args.Навигация.s[3].n, 'Position');
                    assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                    assert.strictEqual(args.Навигация.d[3], null);
                });
            });

            it('should generate request with position navigation and null position and "backward" direction', () => {
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

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'backward');

                    assert.strictEqual(args.Навигация.s[1].n, 'HasMore');
                    assert.strictEqual(args.Навигация.d[1], true);

                    assert.strictEqual(args.Навигация.s[2].n, 'Limit');
                    assert.strictEqual(args.Навигация.d[2], limit);

                    assert.strictEqual(args.Навигация.s[3].n, 'Position');
                    assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                    assert.strictEqual(args.Навигация.d[3], null);
                });
            });

            it(
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

                        assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                        assert.strictEqual(args.Навигация.d[0], 'forward');

                        assert.strictEqual(args.Навигация.s[1].n, 'HasMore');
                        assert.strictEqual(args.Навигация.d[1], true);

                        assert.strictEqual(args.Навигация.s[2].n, 'Limit');
                        assert.strictEqual(args.Навигация.d[2], limit);

                        assert.strictEqual(args.Навигация.s[3].n, 'Position');
                        assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                        assert.strictEqual(args.Навигация.d[3], null);
                    });
                }
            );

            it('should generate request with position navigation and "forward" direction as default', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const limit = 50;

                query
                    .meta({ navigationType: NavigationType.Position })
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'forward');

                    assert.strictEqual(args.Навигация.s[1].n, 'HasMore');
                    assert.strictEqual(args.Навигация.d[1], true);

                    assert.strictEqual(args.Навигация.s[2].n, 'Limit');
                    assert.strictEqual(args.Навигация.d[2], limit);

                    assert.strictEqual(args.Навигация.s[3].n, 'Position');
                    assert.strictEqual(args.Навигация.s[3].t, 'Строка');
                    assert.strictEqual(args.Навигация.d[3], null);

                    assert.strictEqual(args.Фильтр.d.length, 0);
                });
            });

            it('should generate request with position navigation and "forward" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const where = { 'id>=': 10 };
                const limit = 50;

                query
                    .meta({ navigationType: NavigationType.Position })
                    .where(where)
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'forward');

                    assert.strictEqual(args.Навигация.s[1].n, 'HasMore');
                    assert.strictEqual(args.Навигация.d[1], true);

                    assert.strictEqual(args.Навигация.s[2].n, 'Limit');
                    assert.strictEqual(args.Навигация.d[2], limit);

                    assert.strictEqual(args.Навигация.s[3].n, 'Position');
                    assert.strictEqual(args.Навигация.s[3].t, 'Запись');
                    assert.strictEqual(args.Навигация.d[3].s.length, 1);
                    assert.strictEqual(args.Навигация.d[3].s[0].n, 'id');
                    assert.strictEqual(args.Навигация.d[3].d.length, 1);
                    assert.strictEqual(args.Навигация.d[3].d[0], 10);

                    assert.strictEqual(args.Фильтр.d.length, 0);
                });
            });

            it('should generate request with position navigation and "backward" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const where = { 'id<=': 10 };
                const limit = 50;

                query
                    .meta({ navigationType: NavigationType.Position })
                    .where(where)
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'backward');

                    assert.strictEqual(args.Навигация.s[3].n, 'Position');
                    assert.strictEqual(args.Навигация.s[3].t, 'Запись');
                    assert.strictEqual(args.Навигация.d[3].s.length, 1);
                    assert.strictEqual(args.Навигация.d[3].s[0].n, 'id');
                    assert.strictEqual(args.Навигация.d[3].d.length, 1);
                    assert.strictEqual(args.Навигация.d[3].d[0], 10);

                    assert.strictEqual(args.Фильтр.d.length, 0);
                });
            });

            it('should generate request with position navigation and "bothways" direction', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                });
                const query = new Query();
                const where = { 'id~': 10 };
                const limit = 50;

                query
                    .meta({ navigationType: NavigationType.Position })
                    .where(where)
                    .limit(limit);

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'bothways');

                    assert.strictEqual(args.Фильтр.d.length, 0);
                });
            });

            it('should generate request with position navigation and mixed conditions', () => {
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

                    assert.strictEqual(args.Навигация.s[0].n, 'Direction');
                    assert.strictEqual(args.Навигация.d[0], 'forward');

                    assert.strictEqual(args.Навигация.s[3].n, 'Position');
                    assert.strictEqual(args.Навигация.s[3].t, 'Запись');
                    assert.strictEqual(args.Навигация.d[3].s.length, 1);
                    assert.strictEqual(args.Навигация.d[3].s[0].n, 'id');
                    assert.strictEqual(args.Навигация.d[3].d.length, 1);
                    assert.strictEqual(args.Навигация.d[3].d[0], 50);

                    assert.strictEqual(args.Фильтр.s.length, 1);
                    assert.strictEqual(args.Фильтр.s[0].n, 'parentId');
                    assert.strictEqual(args.Фильтр.d[0], 10);
                });
            });

            it('should generate request with page navigation from union query', () => {
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

                    assert.strictEqual(args.Фильтр.s.length, 1);
                    assert.strictEqual(args.Фильтр.s[0].n, 'b');

                    assert.strictEqual(args.Фильтр.d.length, 1);
                    assert.strictEqual(args.Фильтр.d[0], 2);

                    assert.strictEqual(args.Навигация.s.length, 2);
                    assert.strictEqual(args.Навигация.s[0].n, 'id');
                    assert.strictEqual(args.Навигация.s[1].n, 'nav');

                    assert.strictEqual(args.Навигация.d.length, 2);
                    assert.deepEqual(args.Навигация.d[0], [
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
                    assert.deepEqual(args.Навигация.d[1], [
                        1,
                        {
                            _type: 'record',
                            s: [
                                { n: 'ЕстьЕще', t: 'Логическое' },
                                { n: 'РазмерСтраницы', t: 'Число целое' },
                                { n: 'Страница', t: 'Число целое' },
                            ],
                            d: [true, 10, 2],
                        },
                    ]);
                });
            });

            it('should generate request with position navigation from union query', () => {
                const service = new SbisService({
                    endpoint: 'USP',
                    options: {
                        navigationType: SbisService.NAVIGATION_TYPE.POSITION,
                    },
                });

                const queryA = new Query()
                    .where({ a: new PrimaryKey(1), 'b>': 2 })
                    .limit(10);

                const queryB = new Query();
                queryB.where({ c: new PrimaryKey(3), d: 4, 'e<': 5 }).limit(20);

                queryA.union(queryB);

                return service.query(queryA).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Фильтр.s.length, 1);
                    assert.strictEqual(args.Фильтр.s[0].n, 'd');
                    assert.strictEqual(args.Фильтр.d[0], 4);

                    assert.strictEqual(args.Навигация.s.length, 2);
                    assert.strictEqual(args.Навигация.s[0].n, 'id');
                    assert.strictEqual(args.Навигация.s[1].n, 'nav');

                    assert.strictEqual(args.Навигация.d.length, 2);
                    assert.deepEqual(args.Навигация.d[0], [
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
                    assert.deepEqual(args.Навигация.d[1], [
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

            it('should generate request with "hasMore" from given meta property', () => {
                const hasMore = 'test';
                const query = new Query();
                query.offset(0).limit(10).meta({
                    hasMore,
                });

                return service.query(query).then(() => {
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.strictEqual(args.Навигация.d[0], hasMore);
                    assert.strictEqual(args.Навигация.s[0].n, 'ЕстьЕще');
                });
            });

            it('should cancel the inner request', () => {
                const def = service.query();
                const lastDef = SbisBusinessLogic.lastDeferred;

                def.cancel();
                assert.instanceOf(lastDef.getResult(), DeferredCanceledError);
            });
        });

        context("when the service isn't exists", () => {
            it('should return an error', () => {
                const service = new SbisService({
                    endpoint: 'Unknown',
                });
                return service.query(new Query()).then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        assert.instanceOf(err, Error);
                    }
                );
            });
        });
    });

    describe('.call()', () => {
        context('when the method is exists', () => {
            it('should accept an object', () => {
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
                    assert.strictEqual(
                        SbisBusinessLogic.lastRequest.method,
                        'Dummy'
                    );
                    const args = SbisBusinessLogic.lastRequest.args;

                    assert.deepEqual(args.rec, getSampleModel().getRawData());
                    delete sent.rec;
                    delete args.rec;

                    assert.deepEqual(args.rs, rs.getRawData());
                    delete sent.rs;
                    delete args.rs;

                    assert.deepEqual(args, sent);
                });
            });

            it('should accept a model', () => {
                const model = getSampleModel();

                return service.call('Dummy', model).then(() => {
                    assert.strictEqual(
                        SbisBusinessLogic.lastRequest.method,
                        'Dummy'
                    );
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsModel(args, model);
                });
            });

            it('should accept a dataset', () => {
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
                    assert.strictEqual(
                        SbisBusinessLogic.lastRequest.method,
                        'Dummy'
                    );
                    const args = SbisBusinessLogic.lastRequest.args;
                    testArgIsDataSet(args, dataSet);
                });
            });

            it('should generate request with cache argument', () => {
                const cacheParams = {
                    maxAge: 123,
                    mustRevalidate: true,
                };
                return service.call('Dummy', {}, cacheParams).then(() => {
                    const cache = SbisBusinessLogic.lastRequest.cache;
                    assert.deepEqual(cache, cacheParams);
                });
            });
        });

        context("when the method isn't exists", () => {
            it('should return an error', () => {
                return service.call('МойМетод').then(
                    () => {
                        throw new Error('Method should return an error');
                    },
                    (err) => {
                        assert.instanceOf(err, Error);
                    }
                );
            });
        });
    });

    describe('.move', () => {
        it('should call move', () => {
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
                    assert.deepEqual(args, expected);
                });
        });

        it('should call move with sorting', () => {
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
                    assert.deepEqual(args, expected);
                });
        });

        it('should call move method when binding.move has contract', () => {
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
                    assert.deepEqual(args, expected);
                });
        });

        it('should call move method when binding.read or binding.update have contract', () => {
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
                    assert.deepEqual(args, expected);
                });
        });

        it('should call move with complex ids', () => {
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
                    assert.deepEqual(args, expected);
                });
        });

        it('should return origin error', () => {
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
                    (error) => {
                        throw new Error('Method should return an error');
                    },
                    (error) => {
                        assert.equal(error, originError);
                    }
                );
        });

        context('test move way with moveBefore or moveAfter', () => {
            let oldWayService;
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

            it('should call move', () => {
                return oldWayService
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
                        assert.deepEqual(etalon, args);
                    });
            });

            it('should call move with complex ids', () => {
                return oldWayService
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
                        assert.deepEqual(etalon, args);
                    });
            });
        });
    });

    describe('.getOrderProperty()', () => {
        it('should return an empty string by default', () => {
            const source = new SbisService();
            assert.strictEqual(source.getOrderProperty(), 'ПорНомер');
        });

        it('should return value passed to the constructor', () => {
            const source = new SbisService({
                orderProperty: 'test',
            });
            assert.equal(source.getOrderProperty(), 'test');
        });
    });

    describe('.setOrderProperty()', () => {
        it('should set the new value', () => {
            const source = new SbisService();
            source.setOrderProperty('test');
            assert.equal(source.getOrderProperty(), 'test');
        });
    });

    describe('.toJSON()', () => {
        it('should serialize provider option', () => {
            class Foo {}
            di.register('Foo', Foo);

            const source = new SbisService({
                provider: 'Foo',
            });
            const provider = source.getProvider();
            const json = source.toJSON();

            di.unregister('Foo');

            assert.instanceOf(provider, Foo);
            assert.equal(json.state.$options.provider, 'Foo');
        });
    });

    describe('getQueryArguments()', () => {
        it('should return valid arguments for .query()', () => {
            const query = new Query();
            query.orderBy({ foo: false }).offset(10);
            const args = getQueryArguments(query);

            assert.instanceOf(args.Фильтр, Record);
            assert.instanceOf(args.Сортировка, RecordSet);
            assert.instanceOf(args.Навигация, Record);
            assert.instanceOf(args.ДопПоля, Array);
        });
    });
});
