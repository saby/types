import ICrud, { EntityKey } from './ICrud';
import ICrudPlus from './ICrudPlus';
import IDecorator from './IDecorator';
import Memory, { IOptions as IMemoryOptions } from './Memory';
import { IQueryRawData } from './Local';
import Query from './Query';
import DataSet from './DataSet';
import {
    OptionsToPropertyMixin,
    SerializableMixin,
    ISerializableState as IDefaultSerializableState,
    Record,
    relation,
    adapter,
} from '../entity';
import { RecordSet } from '../collection';
import { mixin } from '../util';
import { EntityMarker, IHashMap } from '../_declarations';
import type { Model } from 'Types/entity';

interface IOptions extends IMemoryOptions {
    parentProperty?: string;
}

interface ISerializableState extends IDefaultSerializableState {
    _source: Memory;
}

interface IEntryPath {
    id: number;
    parent: number;
}

/**
 * Источник, который возвращает «хлебные крошки» в корень иерархии и заполняет ENTRY_PATH в результате выполнения метода query().
 * @remark
 * "Хлебные крошки" хранятся в виде массива в свойстве "path" метаданных RecordSet's.
 *
 * Давайте создадим иерархический источник и выберем данные с помощью хлебных крошек:
 * <pre>
 *     import {HierarchicalMemory, Query} from 'Types/source';
 *
 *     const goods = new HierarchicalMemory({
 *         data: [
 *             {id: 1, parent: null, name: 'Laptops'},
 *             {id: 10, parent: 1, name: 'Apple MacBook Pro'},
 *             {id: 11, parent: 1, name: 'Xiaomi Mi Notebook Air'},
 *             {id: 2, parent: null, name: 'Smartphones'},
 *             {id: 20, parent: 2, name: 'Apple iPhone'},
 *             {id: 21, parent: 2, name: 'Samsung Galaxy'}
 *         ],
 *         keyProperty: 'id',
 *         parentProperty: 'parent'
 *     });
 *
 *     const laptopsQuery = new Query();
 *     laptopsQuery.where({parent: 1});
 *
 *     goods.query(laptopsQuery).then((response) => {
 *         const items = response.getAll();
 *         items.forEach((item) => {
 *              console.log(item.get('name')); // 'Apple MacBook Pro', 'Xiaomi Mi Notebook Air'
 *         });
 *         items.getMetaData().path.map((item) => {
 *             console.log(item.get('name')); // 'Laptops'
 *         });
 *     }).catch(console.error);
 * </pre>
 *
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IDecorator
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @mixes Types/_entity/SerializableMixin
 * @public
 */

/*
 * Source which returns "breadcrumbs" to the root of hierarchy and ENTRY_PATH in the result of query() method.
 * @remark
 * "Breadcrumbs" stores as Array in property "path" of RecordSet's meta data.
 *
 * Let's create hierarchical source and select data with breadcrumbs:
 * <pre>
 *     import {HierarchicalMemory, Query} from 'Types/source';
 *
 *     const goods = new HierarchicalMemory({
 *         data: [
 *             {id: 1, parent: null, name: 'Laptops'},
 *             {id: 10, parent: 1, name: 'Apple MacBook Pro'},
 *             {id: 11, parent: 1, name: 'Xiaomi Mi Notebook Air'},
 *             {id: 2, parent: null, name: 'Smartphones'},
 *             {id: 20, parent: 2, name: 'Apple iPhone'},
 *             {id: 21, parent: 2, name: 'Samsung Galaxy'}
 *         ],
 *         keyProperty: 'id',
 *         parentProperty: 'parent'
 *     });
 *
 *     const laptopsQuery = new Query();
 *     laptopsQuery.where({parent: 1});
 *
 *     goods.query(laptopsQuery).then((response) => {
 *         const items = response.getAll();
 *         items.forEach((item) => {
 *              console.log(item.get('name')); // 'Apple MacBook Pro', 'Xiaomi Mi Notebook Air'
 *         });
 *         items.getMetaData().path.map((item) => {
 *             console.log(item.get('name')); // 'Laptops'
 *         });
 *     }).catch(console.error);
 * </pre>
 * @class Types/_source/HierarchicalMemory
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_source/IDecorator
 * @implements Types/_source/ICrud
 * @implements Types/_source/ICrudPlus
 * @mixes Types/_entity/SerializableMixin
 * @author Буранов А.Р.
 * @public
 */
export default class HierarchicalMemory
    extends mixin<OptionsToPropertyMixin, SerializableMixin>(
        OptionsToPropertyMixin,
        SerializableMixin
    )
    implements IDecorator, ICrud, ICrudPlus
{
    protected get _keyProperty(): string {
        return this._source.getKeyProperty();
    }

    get data(): any {
        return this._source.data;
    }
    /**
     * @cfg {Object} Смотрите {@link Types/_source/Memory#data}.
     * @name Types/_source/HierarchicalMemory#data
     */

    /**
     * @cfg {String|Types/_entity/adapter/IAdapter} Смотрите {@link Types/_source/Memory#adapter}.
     * @name Types/_source/HierarchicalMemory#adapter
     */

    /**
     * @cfg {String|Function} Смотрите {@link Types/_source/Memory#model}.
     * @name Types/_source/HierarchicalMemory#model
     */

    /**
     * @cfg {String|Function} Смотрите {@link Types/_source/Memory#listModule}.
     * @name Types/_source/HierarchicalMemory#listModule
     */

    /**
     * @cfg {Function(Types/_entity/adapter/IRecord, Object):Boolean} Смотрите {@link Types/_source/Memory#filter}.
     * @name Types/_source/HierarchicalMemory#filter
     */

    /**
     * @cfg {String} Смотрите {@link Types/_source/Memory#keyProperty}.
     * @name Types/_source/HierarchicalMemory#keyProperty
     */

    /**
     * @cfg {String} Имя параметра записи, которое содержит идентификатор узла, которому принадлежит другой узел или список.
     * @name Types/_source/HierarchicalMemory#parentProperty
     */

    /*
     * @cfg {String} Record's property name that contains identity of the node another node or leaf belongs to.
     * @name Types/_source/HierarchicalMemory#parentProperty
     */
    protected _$parentProperty: string;

    protected _source: Memory;

    // region IDecorator

    readonly '[Types/_source/IDecorator]': EntityMarker = true;

    // endregion

    // region ICrud

    readonly '[Types/_source/ICrud]': EntityMarker = true;

    // endregion

    // region ICrudPlus

    readonly '[Types/_source/ICrudPlus]': EntityMarker = true;

    constructor(options?: IOptions) {
        super();
        OptionsToPropertyMixin.initMixin(this, options);
        this._source = new Memory(options);
    }

    getOriginal<T = Memory>(): T {
        return this._source as any;
    }

    /**
     * Возвращает адаптер для работы с данными.
     * @see adapter
     * @see Types/_entity/adapter/IAdapter
     * @example
     * Получим адаптер источника, используемый по умолчанию:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {adapter} from 'Types/entity';
     *
     *     const dataSource = new Memory();
     *     console.assert(dataSource.getAdapter() instanceof adapter.Json); // correct
     * </pre>
     */
    getAdapter(): adapter.IAdapter {
        return this._source.getAdapter();
    }

    create(meta?: object): Promise<Record> {
        return this._source.create(meta);
    }

    read(key: any, meta?: object): Promise<Record> {
        return this._source.read(key, meta);
    }

    update(data: Record | RecordSet, meta?: object): Promise<void> {
        return this._source.update(data, meta);
    }

    destroy(keys: any | any[], meta?: object): Promise<void> {
        return this._source.destroy(keys, meta);
    }

    query(query?: Query): Promise<DataSet> {
        return new Promise<DataSet>((resolve, reject) => {
            import('Types/collection')
                .then((collection) => {
                    const [preparedQuery, entries] = this._prepareQuery(query);
                    this._source
                        .query(preparedQuery)
                        .then((response) => {
                            if (this._$parentProperty) {
                                const hierarchy = new relation.Hierarchy({
                                    keyProperty: this._keyProperty,
                                    parentProperty: this._$parentProperty,
                                });

                                const sourceRecords = new collection.RecordSet({
                                    rawData: this._source.data,
                                    adapter: this._source.getAdapter(),
                                    keyProperty: this._keyProperty,
                                });

                                const breadcrumbs = new collection.RecordSet({
                                    adapter: this._source.getAdapter(),
                                    keyProperty: this._keyProperty,
                                });

                                // Extract breadcrumbs as path from filtered node to the root
                                const whereConditions = preparedQuery.getWhere();
                                if (this._$parentProperty in whereConditions) {
                                    const startFromId = whereConditions[this._$parentProperty];
                                    let startFromNode = sourceRecords.getRecordById(startFromId);
                                    if (startFromNode) {
                                        breadcrumbs.add(startFromNode, 0);
                                        let node: Model;
                                        while (
                                            startFromNode &&
                                            (node = hierarchy.getParent(
                                                startFromNode,
                                                sourceRecords
                                            ) as Model)
                                        ) {
                                            breadcrumbs.add(node, 0);
                                            startFromNode = node.get(this._keyProperty);
                                        }
                                    }
                                }

                                // Store breadcrumbs as 'path' in meta data
                                const data = response.getRawData() as IQueryRawData;

                                let entryPath;

                                if (entries) {
                                    entryPath = this._calcEntryPath(
                                        sourceRecords,
                                        entries as Model
                                    );
                                }

                                if (data) {
                                    const metaData = data.meta || {};
                                    metaData.path = breadcrumbs;
                                    if (entryPath) {
                                        metaData.ENTRY_PATH = entryPath;
                                    }
                                    data.meta = metaData;
                                    response.setRawData(data);
                                }
                            }

                            resolve(response);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    merge(target: EntityKey, merged: EntityKey | EntityKey[]): Promise<void> {
        return this._source.merge(target, merged);
    }

    copy(key: EntityKey, meta?: object): Promise<Record> {
        return this._source.copy(key, meta);
    }

    move(items: EntityKey | EntityKey[], target: EntityKey, meta?: object): Promise<void> {
        return this._source.move(items, target, meta);
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        // @ts-ignore
        const resultState: ISerializableState =
            SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState._source = this._source;

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function (this: HierarchicalMemory): void {
            fromSerializableMixin.call(this);
            this._source = state._source;
        };
    }

    // calculates ENTRY_PATH for each marked entry in filter
    _calcEntryPath(sourceRecords: RecordSet, filter: Record): IEntryPath[] | undefined {
        if (!filter['[Types/_entity/Record]']) {
            return;
        }

        const MARKED_FIELD = 'marked';
        const entryPath: IEntryPath[] = [];

        const hierarchy = new relation.Hierarchy({
            keyProperty: this._keyProperty,
            parentProperty: this._$parentProperty,
        });

        if (filter.has(MARKED_FIELD)) {
            filter.get<string[]>(MARKED_FIELD).forEach((entryId: string) => {
                let node = sourceRecords.getRecordById(entryId);
                let parentNode: Model;
                while (node && (parentNode = hierarchy.getParent(node, sourceRecords) as Model)) {
                    entryPath.push({
                        id: node.get(this._keyProperty),
                        parent: parentNode.get(this._keyProperty),
                    });

                    node = parentNode;
                }
            });
        }

        return entryPath;
    }

    _prepareQuery(query?: Query): [Query, IHashMap<string>] {
        if (!query) {
            // @ts-ignore
            return [query, null];
        }

        let preparedEntries: IHashMap<string> | undefined;
        let whereConditions = query.getWhere();

        if (whereConditions && typeof whereConditions === 'object') {
            if ('entries' in whereConditions) {
                preparedEntries = whereConditions.entries as IHashMap<string>;
            }

            whereConditions = { ...whereConditions } as IHashMap<string>;
            delete whereConditions.entries;
            delete whereConditions.selectionWithPath;
            delete whereConditions.selection;
        }

        return [query.where(whereConditions), preparedEntries];
    }

    // endregion
}

Object.assign(HierarchicalMemory.prototype, {
    '[Types/_source/HierarchicalMemory]': true,
    _moduleName: 'Types/source:HierarchicalMemory',
    _$parentProperty: null,
});
