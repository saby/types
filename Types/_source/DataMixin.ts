import IData from './IData';
import DataSet, { IOptions as IDataSetOptions } from './DataSet';
import { ReadWriteMixin, AdapterDescriptor, adapter, Record, Model } from '../entity';
import { RecordSet } from '../collection';
import { create } from '../di';
import { EntityMarker } from 'Types/declarations';

/**
 * @public
 */
export interface IOptions {
    /**
     *
     */
    adapter?: string | adapter.IAdapter;
    /**
     *
     */
    model?: string | Function;
    /**
     *
     */
    listModule?: string | Function;
    /**
     *
     */
    keyProperty?: string;
    /**
     *
     */
    dataSetMetaProperty?: string;
}

/**
 * Миксин, позволяющий реализовать интерфейс {@link Types/_source/IData}.
 * @public
 */
export default abstract class DataMixin implements IData {
    readonly '[Types/_source/DataMixin]': EntityMarker;

    /**
     * Адаптер для работы с форматом данных, выдаваемых источником.
     * По умолчанию {@link Types/_entity/adapter/Json}.
     * @see {@link getAdapter}
     * @see {@link Types/di}
     * @example
     * Адаптер для данных в формате БЛ СБИС:
     * <pre>
     *     import {SbisService, Memory} from 'Types/source';
     *
     *     const remoteSource = new SbisService({
     *         endpoint: 'Employee'
     *     });
     *
     *     let localSource = null;
     *
     *     remoteSource.call('getList', {department: 'Management'})
     *         .then((data) => {
     *             localSource = new Memory({
     *                 adapter: remoteSource.getAdapter(),
     *                 data
     *             });
     *         })
     *         .catch((err) => {
     *             console.error('Can\'t call "Employee.getList()"', err);
     *         })
     * </pre>
     */
    protected _$adapter: AdapterDescriptor;

    /**
     * Конструктор записей, порождаемых источником данных.
     * По умолчанию {@link Types/entity:Model}.
     * @see {@link getModel}
     * @see {@link Types/entity:Model}
     * @see {@link Types/di}
     * @remark
     * Для корректной {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/serialization/#nota-bene сериализации и клонирования} моделей необходимо выносить их в отдельные модули и указывать имя модуля в свойстве _moduleName каждого наследника.
     * @example
     * Конструктор пользовательской модели, внедренный в виде класса:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {Model} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _moduleName: string = 'Awesome/User';
     *
     *         identify(login: string, password: string): void {
     *             // ...
     *         }
     *     }
     *
     *     const dataSource = new Memory({
     *         model: User
     *     });
     * </pre>
     * Конструктор пользовательской модели, внедренный в виде названия зарегистрированной зависимости:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {Model} from 'Types/entity';
     *     import {register} from 'Types/di';
     *
     *     class User extends Model {
     *         identify(login: string, password: string): void {
     *             // ...
     *         }
     *     }
     *     register('My/application/models/User', User, {instantiate: false});
     *
     *     const dataSource = new Memory({
     *         model: 'My/application/models/User'
     *     });
     * </pre>
     */
    protected _$model: Function | string;

    /**
     * Конструктор рекордсетов, порождаемых источником данных.
     * По умолчанию {@link Types/collection:RecordSet}.
     * @see {@link getListModule}
     * @see {@link Types/collection:RecordSet}
     * @see {@link Types/di}
     * @example
     * Конструктор рекордсета, внедренный в виде класса:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {RecordSet} from 'Types/collection';
     *     import {Model} from 'Types/entity';
     *
     *     class Users extends RecordSet{
     *         getAdministrators(): Model[] {
     *             // ...
     *         }
     *     }
     *
     *     const dataSource = new Memory({
     *         listModule: Users
     *     });
     * </pre>
     * Конструктор рекордсета, внедренный в виде названия зарегистрированной зависимости:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {RecordSet} from 'Types/collection';
     *     import {Model} from 'Types/entity';
     *     import {register} from 'Types/di';
     *
     *     class Users extends RecordSet{
     *         getAdministrators(): Model[] {
     *             // ...
     *         }
     *     }
     *     register('My/application/models/Users', Users, {instantiate: false});
     *
     *     const dataSource = new MemorySource({
     *         listModule: 'My/application/models/Users'
     *     });
     * </pre>
     */
    protected _$listModule: Function | string;

    /**
     * Название свойства записи, содержащего первичный ключ.
     * @see {@link getKeyProperty}
     * @example
     * Установим свойство 'primaryId' в качестве первичного ключа:
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const dataSource = new Memory({
     *         keyProperty: 'primaryId'
     *     });
     * </pre>
     */
    protected _$keyProperty: string;

    /*
     * Использовать режим Copy-On-Write в данных, извлекаемых из источника.
     */
    protected _$cow: boolean;

    /**
     * Конструктор модуля, реализующего DataSet
     */
    protected _dataSetModule: Function | string;

    /**
     * Свойство данных, в котором лежит основная выборка
     */
    protected _dataSetItemsProperty: string;

    /**
     * Свойство данных, в котором лежит общее кол-во строк, выбранных запросом
     */
    protected _dataSetMetaProperty: string;

    protected _writable: boolean;

    // region IData

    readonly '[Types/_source/IData]': EntityMarker;

    constructor(options?: IOptions) {
        DataMixin.initMixin(this, options);
    }

    static initMixin(instance: any, options?: IOptions) {
        options = options || {};

        // Поддержка устаревшего свойства 'idProperty'
        if (!instance._$keyProperty && (options as any).idProperty) {
            instance._$keyProperty = (options as any).idProperty;
        }
        if (options.dataSetMetaProperty) {
            instance._dataSetMetaProperty = options.dataSetMetaProperty;
        }
        if (!instance._$model) {
            instance._$model = 'Types/entity:Model';
        }
    }

    /**
     *
     */
    getAdapter(): adapter.IAdapter {
        if (typeof this._$adapter === 'string') {
            this._$adapter = create<adapter.IAdapter>(this._$adapter);
        }

        return this._$adapter;
    }

    /**
     *
     */
    getModel(): Function | string {
        return this._$model;
    }

    setModel(model: Function | string): void {
        this._$model = model;
    }

    /**
     *
     */
    getListModule(): Function | string {
        return this._$listModule;
    }

    setListModule(listModule: Function | string): void {
        this._$listModule = listModule;
    }

    /**
     *
     */
    getKeyProperty(): string {
        return this._$keyProperty;
    }

    /**
     *
     * @param name
     */
    setKeyProperty(name: string): void {
        this._$keyProperty = name;
    }

    // endregion

    // region Protected methods

    /**
     * Определяет название свойства с первичным ключом по данным
     * @param data Сырые данные
     * @protected
     */
    protected _getKeyPropertyByData(data: any): string {
        return this.getAdapter().getKeyField(data) || '';
    }

    /**
     * Создает новый экземпляр модели
     * @param data Данные модели
     * @protected
     */
    protected _getModelInstance(data: any): Model {
        return create(this._$model, {
            cow: this._$cow,
            writable: this._writable,
            rawData: data,
            adapter: this.getAdapter(),
            keyProperty: this.getKeyProperty(),
        });
    }

    /**
     * Создает новый экземпляр DataSet
     * @param cfg Опции конструктора
     * @protected
     */
    protected _getDataSetInstance<TData = DataSet>(cfg: IDataSetOptions): TData {
        return create<TData>(this._dataSetModule, {
            cow: this._$cow,
            writable: this._writable,
            adapter: this.getAdapter(),
            model: this.getModel(),
            listModule: this.getListModule(),
            keyProperty: this.getKeyProperty() || this._getKeyPropertyByData(cfg.rawData || null),
            ...cfg,
        });
    }

    /**
     * Оборачивает данные в DataSet
     * @protected
     */
    protected _wrapToDataSet<TData = DataSet>(data: any): TData {
        return this._getDataSetInstance<TData>({
            rawData: data,
            itemsProperty: this._dataSetItemsProperty as never,
            metaProperty: this._dataSetMetaProperty as never,
        });
    }

    /**
     * Перебирает все записи выборки
     * @param data Выборка
     * @param callback Ф-я обратного вызова для каждой записи
     * @param context Контекст
     * @protected
     */
    protected _each(data: any, callback: Function, context?: object): void {
        const tableAdapter = this.getAdapter().forTable(data);
        for (let index = 0, count = tableAdapter.getCount(); index < count; index++) {
            callback.call(context || this, tableAdapter.at(index), index);
        }
    }

    // endregion Protected methods

    // region Statics

    /**
     * Проверяет, что это экземпляр модели
     * @param instance Экземпляр модели
     * @example
     * <pre>
     * import {Base} from 'Types/source';
     * import {Model} from 'Types/entity';
     *
     * const instance = new Model();
     * console.log(Base.isModelInstance(instance)); // true
     * </pre>
     */
    static isModelInstance(instance: any): instance is Record {
        return (
            instance &&
            instance['[Types/_entity/IObject]'] &&
            instance['[Types/_entity/FormattableMixin]']
        );
    }

    /**
     * Проверяет, что это экземпляр рекордсета
     * @param instance Экземпляр рекордсета
     * @example
     * <pre>
     * import {Base} from 'Types/source';
     * import {RecordSet} from 'Types/collection';
     *
     * const instance = new RecordSet();
     * console.log(Base.isRecordSetInstance(instance)); // true
     * </pre>
     */
    static isRecordSetInstance(instance: any): instance is RecordSet {
        return (
            instance &&
            instance['[Types/_collection/IList]'] &&
            instance['[Types/_entity/FormattableMixin]']
        );
    }

    // endregion Statics
}

Object.assign(DataMixin.prototype, {
    '[Types/_source/DataMixin]': true,
    '[Types/_source/IData]': true,
    _$adapter: 'Types/entity:adapter.Json',
    _$model: 'Types/entity:Model',
    _$listModule: 'Types/collection:RecordSet',
    _$keyProperty: '',
    _$cow: false,
    _dataSetModule: 'Types/source:DataSet',
    _dataSetItemsProperty: '',
    _dataSetMetaProperty: '',
    _writable: ReadWriteMixin.prototype.writable,
    getIdProperty: DataMixin.prototype.getKeyProperty,
    setIdProperty: DataMixin.prototype.setKeyProperty,
});
