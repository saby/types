import ICrud, { EntityKey } from './ICrud';
import ICrudPlus from './ICrudPlus';
import Base, { IOptions as IBaseOptions } from './Base';
import DataMixin from './DataMixin';
import DataCrudMixin from './DataCrudMixin';
import Query, { IMeta, Join, Order, PartialExpression, WhereExpression } from './Query';
import DataSet from './DataSet';
import { adapter, Record as TypesRecord, Model } from '../entity';
import { RecordSet } from '../collection';
import { mixin, object } from '../util';
import { IHashMap, EntityMarker } from 'Types/declarations';
import { Deferred } from 'Types/deferred';

/**
 * Варианты позиционирования записи
 */
export enum LOCAL_MOVE_POSITION {
    /**
     * Вставить внутрь целевой записи
     */
    On = 'on',
    /**
     * Вставить перед целевой записью
     */
    Before = 'before',
    /**
     * Вставить после целевой записи
     */
    After = 'after',
}

/**
 * Интерфейс объекта с дополнительными мета данными операции перемещения.
 * @private
 */
interface IMovePosition {
    /**
     * Добавляет перемещаемую модель перед целевой моделью.
     */
    before?: boolean;
    /**
     * Название поля иерархии.
     */
    parentProperty?: string;
    /**
     * Определяет как позиционировать запись относительно target.
     */
    position?: string;
}

export interface IQueryRawData {
    items: any;
    meta?: {
        total?: number;
        path?: unknown;
        ENTRY_PATH?: unknown;
    };
}

/**
 * @public
 */
export interface IOptions extends IBaseOptions {
    filter?: MemoryFilterFunction;
}

function randomId(prefix: string): string {
    return prefix + Math.random().toString(36).substr(2) + +new Date();
}

function compareValues(given: unknown, expect: unknown, operator: string): boolean {
    // If array expected, use "given in expect" logic
    if (expect instanceof Array) {
        for (let i = 0; i < expect.length; i++) {
            if (compareValues(given, expect[i], operator)) {
                return true;
            }
        }
        return false;
    }

    // If array given, use "given has only expect" logic
    if (given instanceof Array) {
        for (let i = 0; i < given.length; i++) {
            if (!compareValues(given[i], expect, operator)) {
                return false;
            }
        }
        return true;
    }

    // Otherwise - just compare
    // eslint-disable-next-line eqeqeq
    return given == expect;
}

/**
 * @public
 */
export type MemoryFilterFunction = (item: adapter.IRecord, query: object) => boolean;

/**
 * Источник данных, работающий локально.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @public
 */
export default abstract class Local<TData = unknown>
    extends mixin<Base, DataCrudMixin>(Base, DataCrudMixin)
    implements ICrud, ICrudPlus
{
    /**
     * С чем работает источник данных.
     */

    /*
     * Data the source work with
     */
    get data(): any {
        return this._getTableAdapter().getData();
    }

    /**
     * Фильтр записей, используемый при вызове метода {@link query}.
     * @remark
     * Первым аргументом передается адаптер сырых данных для каждой записи, вторым - фильтр, переданный в вызов метода query().
     * Функция должна вернуть Boolean: true - запись прошла фильтр и попадет в итоговую выборку, false - не  прошла.
     * @example
     * Спрячем Землю из результатов выборки:
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const solarSystem = new Memory({
     *         data: [
     *             {id: 1, name: 'Sun', kind: 'Star'},
     *             {id: 2, name: 'Mercury', kind: 'Planet'},
     *             {id: 3, name: 'Venus', kind: 'Planet'},
     *             {id: 4, name: 'Earth', kind: 'Planet'},
     *             {id: 5, name: 'Mars', kind: 'Planet'},
     *             {id: 6, name: 'Jupiter', kind: 'Planet'},
     *             {id: 7, name: 'Saturn', kind: 'Planet'},
     *             {id: 8, name: 'Uranus', kind: 'Planet'},
     *             {id: 9, name: 'Neptune', kind: 'Planet'},
     *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
     *         ],
     *         filter: (item) => item.get('name') !== 'Earth',
     *         keyProperty: 'id'
     *     });
     *
     *     solarSystem.query().then((result) => {
     *         result.getAll().each((record) => {
     *             console.log(record.get('name'));
     *             //'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
     *         });
     *     });
     * </pre>
     * Выберем все объекты, имена которых начинаются на 'S':
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const solarSystem = new source.Memory({
     *         data: [
     *             {id: 1, name: 'Sun', kind: 'Star'},
     *             {id: 2, name: 'Mercury', kind: 'Planet'},
     *             {id: 3, name: 'Venus', kind: 'Planet'},
     *             {id: 4, name: 'Earth', kind: 'Planet'},
     *             {id: 5, name: 'Mars', kind: 'Planet'},
     *             {id: 6, name: 'Jupiter', kind: 'Planet'},
     *             {id: 7, name: 'Saturn', kind: 'Planet'},
     *             {id: 8, name: 'Uranus', kind: 'Planet'},
     *             {id: 9, name: 'Neptune', kind: 'Planet'},
     *             {id: 10, name: 'Pluto', kind: 'Dwarf planet'}
     *         ],
     *         filter: (item, where) => Object.keys(where).some((field) => {
     *             const value = item.get(field);
     *             const needed = where[field];
     *             return String(value).indexOf(needed) === 0;
     *         }),
     *         keyProperty: 'id'
     *     });
     *
     *     const query = new source.Query();
     *     query.where({name: 'S'});
     *     solarSystem.query(query).then((result) => {
     *         result.getAll().each((record) => {
     *             console.log(record.get('name'));//'Sun', 'Saturn'
     *         });
     *     });
     * </pre>
     */
    protected _$filter: MemoryFilterFunction | undefined;

    /**
     * Индекс для быстрого поиска записи по его ключу.
     */

    /*
     * Index to fast search record by its key
     */
    protected _index: IHashMap<number>;

    /**
     * Идет настройка держателя данных.
     */

    /*
     * Data holder setup is in progress
     */
    protected _settingUpDataHolder: boolean;

    // region ICrud

    readonly '[Types/_source/ICrud]': EntityMarker = true;

    // endregion

    // region ICrudPlus

    readonly '[Types/_source/ICrudPlus]': EntityMarker = true;

    protected constructor(options?: IOptions) {
        super(options);

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es 2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this._reIndex();
    }

    create(meta?: object): Promise<Model | TypesRecord> {
        return this._loadAdditionalDependencies().addCallback(() => {
            return this._prepareCreateResult(meta);
        }) as Promise<Model | TypesRecord>;
    }

    read(key: EntityKey, _?: object): Promise<Model> {
        const data = this._getRecordByKey(key);
        if (data) {
            return this._loadAdditionalDependencies().addCallback(() => {
                return this._prepareReadResult(data);
            }) as Promise<Model>;
        } else {
            return Promise.reject(
                new ReferenceError(
                    `Can't perform read() because record with key "${key}" does not exist`
                )
            );
        }
    }

    update(data: TypesRecord | RecordSet, _meta?: object): Promise<void> {
        const updateRecord = (record: TypesRecord) => {
            const keyProperty = this.getKeyProperty();
            let key = keyProperty ? record.get(keyProperty) : undefined;
            if (key === undefined) {
                key = randomId('k');
                record.set(keyProperty, key);
            }

            const adapter = this._getTableAdapter();
            const index = this._getIndexByKey(key as number);

            if (index === -1) {
                adapter.add(record.getRawData());
                if (this._index) {
                    this._index[key as number] = adapter.getCount() - 1;
                }
            } else {
                adapter.replace(record.getRawData(), index);
            }

            return key;
        };

        let keys: string[] = [];
        if (DataMixin.isRecordSetInstance(data)) {
            data.each((record) => {
                keys.push(updateRecord(record));
            });
        } else {
            keys = updateRecord(data);
        }

        return this._loadAdditionalDependencies().addCallback(() => {
            return this._prepareUpdateResult(data, keys);
        }) as Promise<void>;
    }

    destroy(keys: EntityKey | EntityKey[], _?: object): Promise<void> {
        const destroyByKey = (key: EntityKey) => {
            const index = this._getIndexByKey(key);
            if (index !== -1) {
                this._getTableAdapter().remove(index);
                this._reIndex();
                return true;
            } else {
                return false;
            }
        };

        const keysArray = keys instanceof Array ? keys : [keys];
        for (let i = 0, len = keysArray.length; i < len; i++) {
            if (!destroyByKey(keysArray[i])) {
                return Deferred.fail(
                    new ReferenceError(
                        `Can't perform destroy() because record with key "${keysArray[i]}" does not exist`
                    )
                ) as unknown as Promise<void>;
            }
        }

        return Deferred.success(undefined);
    }

    query(query?: Query): Promise<DataSet> {
        let items = this._applyFrom(query ? query.getFrom() : undefined);
        const adapter = this.getAdapter();
        let total: number;

        if (query) {
            items = this._applyJoin(items, query.getJoin());
            items = this._applyWhere(items, query.getWhere(), query.getMeta());
            items = this._applyOrderBy(items, query.getOrderBy());
            items = this._applySelect(items, query.getSelect());
            total = adapter.forTable(items).getCount();
            items = this._applyPaging(items, query.getOffset(), query.getLimit());
        } else if (this._$filter) {
            items = this._applyWhere(items);
        } else {
            total = adapter.forTable(items).getCount();
        }

        return this._loadAdditionalDependencies().addCallback(() => {
            return this._prepareQueryResult(
                {
                    items,
                    meta: {
                        total,
                    },
                },
                query
            );
        }) as Promise<DataSet>;
    }

    merge(target: EntityKey, merged: EntityKey | EntityKey[]): Promise<void> {
        const mergedKeys = merged instanceof Array ? merged : [merged];
        const tableAdapter = this._getTableAdapter();
        const keyProperty = this.getKeyProperty();
        try {
            mergedKeys.forEach((mergedKey) => {
                // targetIndex can change within several merges that's why it must be refreshed it on each iteration
                const targetIndex = this._getIndexByKey(target);
                if (targetIndex === -1) {
                    throw new ReferenceError(
                        `Can't perform merge() because target record with key "${target}" does not exist`
                    );
                }

                const mergedIndex = this._getIndexByKey(mergedKey);
                if (mergedIndex === -1) {
                    throw new ReferenceError(
                        `Can't perform merge() because source record with key "${mergedKey}" does not exist`
                    );
                }

                tableAdapter.merge(targetIndex, mergedIndex, keyProperty);
                this._reIndex();
            });
        } catch (error) {
            return Promise.reject(error);
        }

        // FIXME: Actually should return void here
        return Promise.resolve(target as unknown as void);
    }

    copy(key: EntityKey, _meta?: object): Promise<Model> {
        const index = this._getIndexByKey(key);
        if (index === -1) {
            return Promise.reject(
                new ReferenceError(
                    `Can't perform copy() because record with key "${key}" does not exist`
                )
            );
        } else {
            const copy = this._getTableAdapter().copy(index);
            this._reIndex();
            return this._loadAdditionalDependencies().addCallback(() => {
                return this._prepareReadResult(copy);
            }) as Promise<Model>;
        }
    }

    move(items: EntityKey | EntityKey[], target: EntityKey, meta?: IMovePosition): Promise<void> {
        meta = meta || {};
        const sourceItems: adapter.IRecord[] = [];
        if (!(items instanceof Array)) {
            items = [items];
        }
        const tableAdapter = this._getTableAdapter();
        const adapter = this.getAdapter();

        items
            .sort((a, b) => {
                const indexA = this._getIndexByKey(a);
                const indexB = this._getIndexByKey(b);
                return meta?.position === LOCAL_MOVE_POSITION.After
                    ? indexB - indexA
                    : indexA - indexB;
            })
            .forEach((id) => {
                const index = this._getIndexByKey(id);
                sourceItems.push(adapter.forRecord(tableAdapter.at(index)));
            });

        let targetPosition = -1;
        let targetItem = null;
        if (target !== null) {
            targetPosition = this._getIndexByKey(target);
            targetItem = adapter.forRecord(tableAdapter.at(targetPosition));
            if (targetPosition === -1) {
                return Promise.reject(
                    new ReferenceError(
                        'Can\'t perform move() because target position "${target}" is not found'
                    )
                );
            }
        }

        if (meta.position === LOCAL_MOVE_POSITION.On) {
            return this._hierarchyMove(sourceItems, targetItem, meta);
        }

        return this._reorderMove(sourceItems, targetItem, meta);
    }

    // endregion

    // region Types/_source/DataMixin

    getAdapter(): adapter.IAdapter {
        super.getAdapter();

        if (
            // @ts-ignore
            this._$adapter['[Types/_entity/adapter/IDataHolder]'] &&
            !this._settingUpDataHolder
        ) {
            this._settingUpDataHolder = true;
            (this._$adapter as unknown as adapter.IDataHolder<TData>).dataReference = this.data;
            this._settingUpDataHolder = false;
        }

        return this._$adapter as adapter.IAdapter;
    }

    // endregion

    // region DataMixin

    protected _wrapToDataSet<TData = DataSet>(data: any): TData {
        return super._wrapToDataSet<TData>(this._detachData(data));
    }

    // endregion

    // region DataCrudMixin

    protected _prepareCreateResult(data: any): Model {
        return super._prepareCreateResult.call(this, this._detachData(data));
    }

    protected _prepareReadResult(data: any): Model {
        return super._prepareReadResult.call(this, this._detachData(data));
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает адаптер для работы с таблицей
     */
    protected abstract _getTableAdapter(): adapter.ITable;

    /**
     * Возвращает данные, отвязанные от данных источника
     */
    protected _detachData(data: unknown): unknown {
        // There is no need to clone data in COW mode
        if (this._$cow) {
            return data;
        }

        return object.clonePlain(data);
    }

    /**
     * Возвращает данные модели с указанным ключом
     * @param key Значение ключа
     */
    protected _getRecordByKey(key: EntityKey): adapter.IRecord {
        return this._getTableAdapter().at(this._getIndexByKey(key));
    }

    /**
     * Возвращает индекс модели с указанным ключом
     * @param key Значение ключа
     * @return -1 - не найден, >=0 - индекс
     */
    protected _getIndexByKey(key: EntityKey): number {
        const index = this._index[key];
        return index === undefined ? -1 : index;
    }

    /**
     * Перестраивает индекс
     */
    protected _reIndex(): void {
        this._index = {};
        const adapter = this.getAdapter();
        this._each(this.data, (item: any, index: number) => {
            const key = adapter.forRecord(item).get(this._$keyProperty);
            this._index[key] = index;
        });
    }

    /**
     * Применяет источник выборки
     * @param from Источник выборки
     */
    protected abstract _applyFrom(from?: string): any;

    /**
     * Применяет объединение
     * @param data Данные
     * @param join Выборки для объединения
     */
    protected abstract _applyJoin(data: any, join: Join[]): any;

    /**
     * Applies fieldset selection
     * @param data Data to handle
     * @param select Fieldset to select
     */
    protected _applySelect(data: any, select: IHashMap<string>): any {
        const selectNames = Object.keys(select);

        if (!selectNames.length) {
            return data;
        }

        const adapter = this.getAdapter();
        const tableAdapter = adapter.forTable();

        this._each(data, (item: any) => {
            const original = adapter.forRecord(item);
            const applied = adapter.forRecord();

            selectNames.forEach((originalName) => {
                const appliedName = select[originalName];
                if (!applied.has(appliedName)) {
                    const format = original.getFormat(originalName);
                    format.setName(appliedName);
                    applied.addField(format);
                }
                applied.set(appliedName, original.get(originalName));
            });

            tableAdapter.add(applied.getData());
        });

        return tableAdapter.getData();
    }

    /**
     * Applies filter
     * @param data Data to handle
     * @param where Query filter
     * @param _meta Query metadata
     */
    protected _applyWhere(data: any, where?: WhereExpression<unknown>, _meta?: IMeta): any {
        // TODO: support for IMeta.expand values

        const safeWhere = where || {};

        if (safeWhere instanceof PartialExpression) {
            throw new TypeError('Filtering by PartialExpression instance is not supported.');
        }

        if (!this._$filter && typeof safeWhere === 'object' && !Object.keys(safeWhere).length) {
            return data;
        }

        const checkFields = (fields: any, item: any) => {
            let result = true;
            for (const name in fields) {
                if (!fields.hasOwnProperty(name)) {
                    continue;
                }
                result = compareValues(item.get(name), fields[name], '=');
                if (!result) {
                    break;
                }
            }
            return result;
        };

        const adapter = this.getAdapter();
        const tableAdapter = adapter.forTable();
        const isPredicate = typeof safeWhere === 'function';

        this._each(data, (item: any, index: number) => {
            item = adapter.forRecord(item);

            let isMatch = true;
            if (this._$filter) {
                isMatch = this._$filter(item, safeWhere);
            } else {
                isMatch = isPredicate
                    ? (safeWhere as Function)(item, index)
                    : checkFields(safeWhere, item);
            }

            if (isMatch) {
                tableAdapter.add(item.getData());
            }
        });

        return tableAdapter.getData();
    }

    /**
     * Применяет сортировку
     * @param data Данные
     * @param order Параметры сортировки
     */
    protected _applyOrderBy(data: any, order: Order[]): any {
        order = order || [];
        if (!order.length) {
            return data;
        }

        // Создаем карту сортировки
        const orderMap: { field: string; order: string | boolean }[] = [];
        for (let i = 0; i < order.length; i++) {
            orderMap.push({
                field: order[i].getSelector(),
                order: order[i].getOrder(),
            });
        }

        // Создаем служебный массив, который будем сортировать
        const adapter = this.getAdapter();
        const dataMap: { index: number; values: any[] }[] = [];
        this._each(data, (item: adapter.IRecord, index: number) => {
            let value;
            const values = [];
            for (let i = 0; i < orderMap.length; i++) {
                value = adapter.forRecord(item).get(orderMap[i].field);

                // undefined значения не передаются в compareFunction Array.prototype.sort, и в результате сортируются
                // непредсказуемо. Поэтому заменим их на null.
                values.push(value === undefined ? null : value);
            }
            dataMap.push({
                index,
                values,
            });
        });

        const compare = (a: number, b: number) => {
            if (a === null && b !== null) {
                // Считаем null меньше любого не-null
                return -1;
            }
            if (a !== null && b === null) {
                // Считаем любое не-null больше null
                return 1;
            }
            // eslint-disable-next-line eqeqeq
            if (a == b) {
                return 0;
            }
            return a > b ? 1 : -1;
        };

        // Сортируем служебный массив
        dataMap.sort((a, b) => {
            let result = 0;
            for (let index = 0; index < orderMap.length; index++) {
                result =
                    (orderMap[index].order ? -1 : 1) * compare(a.values[index], b.values[index]);
                if (result !== 0) {
                    break;
                }
            }
            return result;
        });

        // Создаем новую таблицу по служебному массиву
        const sourceAdapter = adapter.forTable(data);
        const resultAdapter = adapter.forTable();
        for (let i = 0, count = dataMap.length; i < count; i++) {
            resultAdapter.add(sourceAdapter.at(dataMap[i].index));
        }

        return resultAdapter.getData();
    }

    /**
     * Применяет срез
     * @param data Данные
     * @param offsetСмещение начала выборки
     * @param limit Количество записей выборки
     */
    protected _applyPaging(data: any, offset?: number, limit?: number): any {
        offset = offset || 0;
        if (offset === 0 && limit === undefined) {
            return data;
        }

        const dataAdapter = this.getAdapter().forTable(data);
        if (limit === undefined) {
            limit = dataAdapter.getCount();
        } else {
            limit = limit || 0;
        }

        const newDataAdapter = this.getAdapter().forTable();
        let newIndex = 0;
        const beginIndex = offset;
        const endIndex = Math.min(dataAdapter.getCount(), beginIndex + limit);
        for (let index = beginIndex; index < endIndex; index++, newIndex++) {
            newDataAdapter.add(dataAdapter.at(index));
        }

        return newDataAdapter.getData();
    }

    protected _reorderMove(
        items: adapter.IRecord[],
        target: adapter.IRecord | null,
        meta: any
    ): Promise<void> {
        let parentValue: any;

        if (target) {
            if (meta.parentProperty) {
                parentValue = target.get(meta.parentProperty);
            }
            if (!meta.position && meta.hasOwnProperty('before')) {
                meta.position = meta.before
                    ? LOCAL_MOVE_POSITION.Before
                    : LOCAL_MOVE_POSITION.After;
            }

            const tableAdapter = this._getTableAdapter();
            const targetsId = target.get(this._$keyProperty);
            items.forEach((item) => {
                if (meta.parentProperty) {
                    item.set(meta.parentProperty, parentValue);
                }
                const index = this._getIndexByKey(item.get(this._$keyProperty));
                let targetIndex = this._getIndexByKey(targetsId);
                if (meta.position === LOCAL_MOVE_POSITION.Before && targetIndex > index) {
                    targetIndex--;
                } else if (meta.position === LOCAL_MOVE_POSITION.After && targetIndex < index) {
                    targetIndex++;
                }
                tableAdapter.move(index, targetIndex);
                this._reIndex();
            });
        }
        return Promise.resolve();
    }

    protected _hierarchyMove(
        items: adapter.IRecord[],
        target: adapter.IRecord | null,
        meta: any
    ): Promise<void> {
        if (!meta.parentProperty) {
            return Promise.reject(new Error('Parent property is not defined'));
        }
        const parentValue = target ? target.get(this._$keyProperty) : null;
        items.forEach((item) => {
            item.set(meta.parentProperty, parentValue);
        });

        return Promise.resolve();
    }

    // endregion

    static es5Constructor(options: IOptions): void {
        Base.es5Constructor.call(this, options);

        // TypesScript в компиляции вставляет в конструктор присвоение значений по умолчанию для полей.
        // Придётся прописать инцилизацию в ручную в нашем самопальном конструкторе.
        // @ts-ignore
        this['[Types/_source/ICrud]'] = true;
        // @ts-ignore
        this['[Types/_source/ICrudPlus]'] = true;

        Local.prototype._reIndex.call(this);
    }
}

Object.assign(Local.prototype, {
    '[Types/_source/Local]': true,
    _moduleName: 'Types/source:Local',
    _$filter: null,
    _index: null,
});
