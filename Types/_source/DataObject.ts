import SbisService from './SbisService';
import DataSet from './DataSet';
import Query from './Query';
import ICrud, { EntityKey as CrudEntityKey } from './ICrud';
import { IEndpoint as IProviderEndpoint } from './IProvider';
import { mixin } from 'Types/util';
import {
    getMergeableProperty,
    OptionsToPropertyMixin,
    SerializableMixin,
    Model,
    Record,
    adapter,
} from 'Types/entity';
import { EntityMarker } from 'Types/declarations';

/**
 * Опции конструктора
 * @public
 */
export interface IDataObjectOptions {
    /**
     * Название типа прикладного объекта
     */
    objectName?: string;
    /**
     *
     */
    binding?: IBinding;
    /**
     *
     */
    endpoint?: IProviderEndpoint | string;
}

/**
 * Интерфейс базового прикладного объекта
 * @public
 */
export interface IDataObject {
    /**
     * Идентификатор прикладного объекта
     */
    Id: string;
}

/**
 * Интерфейс объекта с соответствием методов CRUD контракту
 * @public
 */
export interface IBinding {
    /**
     * Операция создания прикладного объекта через метод {@link create}
     */
    create?: string;
    /**
     * Операция чтения прикладного объекта через метод {@link read}
     */
    read?: string;
    /**
     * Операция обновления прикладного объекта через метод {@link update}
     */
    update?: string;
    /**
     * Операция удаления прикладного объекта через метод {@link destroy}.
     */
    destroy?: string;
    /**
     * Операция получения выборки прикладных объектов через метод {@link query}
     */
    query?: string;
    /**
     * Операция получения функции на прикладном объекте через метод {@link call}
     */
    execute?: string;
}

/**
 * Дополнительные мета-данные для чтения прикладного объекта
 * @public
 */
export interface IReadMeta {
    /**
     * Список полей в прикладном объекте
     */
    fields?: string[];

    /**
     * Параметры для сервиса прикладных объектов
     */
    parameters?: {
        /**
         * Идентификатор сервиса, где находится прикладной объект
         */
        ServiceId?: string;
        /**
         * Идентификатор регламента документа
         */
        RegulationId?: string;
        /**
         * Признак чтения полей, которые начитываются резолвером попутно с требуемыми полями и вывод их в результат.
         */
        partial?: boolean;
    };
}

/**
 * Дополнительные мета-данные для записи прикладного объекта
 * @public
 */
export interface IUpdateMeta {
    /**
     * Сохранять только измененные поля
     */
    updateOnlyChanged?: boolean;
    /**
     * Параметры для сервиса прикладных объектов
     */
    parameters?: {
        /**
         * Идентификатор сервиса, где находится прикладной объект
         */
        ServiceId?: string;
        /**
         * Идентификатор регламента документа
         */
        RegulationId?: string;
    };
}

/**
 * Класс источника данных на сервисе прикладных объектов.
 * @remark
 * <b>Пример 1</b>. Создадим источник данных для прикладного объекта "Сотрудник":
 * <pre>
 *     import { DataObject } from 'Types/source';
 *     const dataObjectSource = new DataObject({
 *         objectName: 'Employee'
 *     });
 * </pre>
 * <b>Пример 2</b>. Создадим источник данных для прикладного объекта "Сотрудник", используя отдельную точку входа:
 * <pre>
 *     import { DataObject } from 'Types/source';
 *     const dataObjectSource = new DataObject({
 *         objectName: 'Employee',
 *         endpoint: {
 *             address: '/my-service/entry/point/',
 *             contract: 'DataObject'
 *         }
 *     });
 * </pre>
 * <b>Пример 3</b>. Выполним основные операции CRUD-контракта для прикладного объекта "Сотрудник":
 * <pre>
 *     import { DataObject, Query } from 'Types/source';
 *     import { Model } from 'Types/entity';
 *
 *     function onError(err: Error): void {
 *         console.error(err);
 *     }
 *
 *     // Прочитаем ФИО демо-сотрудника
 *     dataObjectSource.read(null, {
 *         fields: [
 *             'Employee.FullName',
 *         ]
 *     }).then((employee) => {
 *         const fio = employee.get('FullName');
 *     }).catch(onError);
 *
 *     // Прочитаем ФИО Сотрудника с идентификатором 123
 *     dataObjectSource.read('123', {
 *         fields: [
 *             'Employee.FullName',
 *         ]
 *     }).then((employee) => {
 *         const fio = employee.get('FullName');
 *     }).catch(onError);
 *
 *     // Обновим телефон сотрудника
 *     const employee = new Model({
 *         adapter: new adapter.Sbis(),
 *         format: [
 *             {name: 'Id', type: 'integer'},
 *             {name: 'Phone', type: 'string'}
 *         ],
 *         typeName: 'Employee'
 *     });
 *     employee.set({
 *         Id: '123',
 *         Phone: '+79999999999'
 *     });
 *
 *     dataObjectSource.update(employee).then((employee) => {
 *         const fio = employee.get('FullName');
 *     }).then(() => {
 *         console.log('Employee updated!');
 *     }).catch(onError);
 *
 *
 *     // Прочитаем телефоны первых ста сотрудников
 *     const query = new Query();
 *     query.select(['Phone'])
 *     query.limit(100);
 *
 *     dataObjectSource.query(query).then((response) => {
 *         const employees = response.getAll();
 *         console.log(`Employees count: ${employees.getCount()}`);
 *     }).catch(onError);
 * </pre>
 * @public
 */
export default class DataObject
    extends mixin<OptionsToPropertyMixin, SerializableMixin>(
        OptionsToPropertyMixin,
        SerializableMixin
    )
    implements ICrud
{
    private _source: SbisService;
    protected _$binding: IBinding;
    protected _$endpoint: IProviderEndpoint | string;
    protected _$objectName: string;
    protected _$keyProperty: string;

    constructor(options: IDataObjectOptions) {
        super(options);
    }

    readonly '[Types/_source/ICrud]': EntityMarker;

    /**
     * Создает пустой прикладной объект
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/entity:Model}, в случае ошибки - Error.
     * @see {@link Types/source:ICrud#create}
     * @remark метод не реализован на сервисе прикладных объектов
     */
    create(_?: object): Promise<Record> {
        throw new Error('DataObject does not provide a method for creating a record yet.');
    }

    /**
     * Удаляет прикладной объект
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернёт, в случае ошибки - Error.
     * @see {@link Types/source:ICrud#destroy}
     * @remark метод не реализован на сервисе прикладных объектов
     */
    destroy(_: CrudEntityKey, __: object): Promise<void> {
        throw new Error('DataObject does not provide a method for deleting a record yet.');
    }

    /**
     * Читает прикладной объект
     * @param key Идентификатор прикладного объекта: если указан вернет экземпляр прикладного объекта, если null - демо-данные.
     * @param meta
     */
    read<TData = DataSet<Model>>(key: CrudEntityKey | null, meta: IReadMeta = {}): Promise<TData> {
        if (!this._$binding.read) {
            throw new Error('Read binding not defined');
        }

        return this._callProvider<Promise<TData>>(
            this._$binding.read,
            passRead.call(this, key, meta)
        );
    }

    /**
     * Записывает прикладной объект
     * @param data Модель прикладного объекта.
     * @param meta
     */
    update<TData = DataSet<Model>>(data: Model, meta: IUpdateMeta = {}): Promise<TData> {
        if (!this._$binding.update) {
            throw new Error('Update binding not defined');
        }

        return this._callProvider<Promise<TData>>(
            this._$binding.update,
            passUpdate.call(this, data, meta)
        );
    }

    /**
     * Выполняет запрос на выборку
     * @param query Запрос
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/source:DataSet} - прочитанные данные, в случае ошибки - Error.
     * @see {@link Types/source:Query}
     * @see {@link Types/source:DataSet}
     * @example
     * Найдем молодые таланты среди сотрудников:
     * <pre>
     *     import { DataSource } from 'Types/source';
     *
     *     const source = new DataObject({
     *         objectName: 'Employee'
     *     });
     *
     *     const query = new Query();
     *     query
     *         .select(['Id', 'Name', 'Position' ])
     *         .where((employee) => employee.get('Position') === 'TeamLead' && employee.get('Age') <= 18)
     *         .orderBy('Age');
     *
     *     source.query(query).then((dataSet) => {
     *         if (dataSet.getAll().getCount() > 0) {
     *             //A new Mark Zuckerberg detected
     *         }
     *     }).catch((error) => {
     *         console.error('Can\'t read the employees', error);
     *     });
     * </pre>
     */
    query<TData = DataSet>(query?: Query): Promise<TData> {
        if (!this._$binding.query) {
            throw new Error('Query binding not defined');
        }

        return this.getSource().query<TData>(passQuery.call(this, query));
    }

    /**
     * Выполняет метод прикладного объекта
     * @param data аргументы метода
     */
    call(data: object = {}): Promise<DataSet> {
        if (!this._$binding.execute) {
            throw new Error('Execute binding not defined');
        }
        return this.getSource().call(this._$binding.execute, data);
    }

    /**
     * Возвращает источник данных для запроса к сервису прикладных объектов
     * @returns Источник данных
     */
    protected getSource(): SbisService {
        if (this._source) {
            return this._source;
        }
        return (this._source = new SbisService({
            endpoint: this._$endpoint,
            binding: this._$binding,
        }));
    }

    protected _callProvider<TResult>(name: string | undefined, args: object): TResult {
        if (!name) {
            throw new Error('Binding for called method not defined');
        }
        if (!this._$objectName) {
            throw new Error('objectName not defined');
        }
        return this.getSource().call(name, args) as unknown as TResult;
    }

    static _moduleName: string = 'Frame-DataEnv/dataLoader:DataObject';
}

/**
 * Подготавливает аргументы для передачи в метод сохранения провайдера
 * @param data
 * @param meta
 * @private
 */
function passRead(this: DataObject, key: CrudEntityKey | null, meta: IReadMeta): object {
    const Properties =
        Array.isArray(meta.fields) && meta.fields.length ? meta.fields : [this._$keyProperty];

    const Parameters = meta.parameters
        ? Model.fromObject(meta.parameters, new adapter.Sbis())
        : null;

    return {
        Name: this._$objectName,
        ID: key || null,
        Properties,
        Parameters,
    };
}

/**
 * Подготавливает аргументы для передачи в метод сохранения провайдера
 * @param data
 * @param meta
 * @private
 */
function passUpdate(
    this: DataObject,
    data: Model<IDataObject> = new Model({
        adapter: new adapter.Sbis(),
    }),
    meta: IUpdateMeta = {}
): object {
    const Properties = meta.updateOnlyChanged
        ? Record.filter(data as Record<any>, (name) => {
              return data.isChanged(name) || name === this._$keyProperty;
          })
        : data;

    const Parameters = meta.parameters
        ? Model.fromObject(meta.parameters, new adapter.Sbis())
        : null;

    return {
        Name: this._$objectName,
        Properties,
        Parameters,
    };
}

/**
 * Подготавливает аргументы для передачи в метод query провайдера
 * @param query
 * @private
 */
function passQuery(query?: Query): Query | undefined {
    return query;
}

Object.assign(DataObject.prototype, {
    _$objectName: null,
    _$binding: getMergeableProperty<IBinding>({
        create: 'Create',
        read: 'Read',
        update: 'Write',
        destroy: 'Destroy',
        query: 'List',
        execute: 'Execute',
    }),

    _$endpoint: 'DataObject',

    _$keyProperty: 'Id',
});
