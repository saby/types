import {
    DestroyableMixin,
    OptionsToPropertyMixin,
    SerializableMixin,
    AdapterDescriptor,
    Record,
    Model,
    adapter,
    ModelConstructor,
} from '../entity';
import { create } from '../di';
import { mixin } from '../util';
import { IList, RecordSet, ListConstructor } from '../collection';
import { EntityMarker, IHashMap } from 'Types/declarations';

/**
 *
 */
export interface IOptions<
    TData = unknown,
    TRawData = any,
    TItemsProperty = keyof TRawData,
    TMetaProperty = keyof TRawData,
    TKeyProperty = keyof TData
> {
    /**
     *
     */
    adapter?: AdapterDescriptor;
    /**
     *
     */
    itemsProperty?: TItemsProperty;
    /**
     *
     */
    keyProperty?: TKeyProperty;
    /**
     *
     */
    listModule?: ListConstructor<Record> | string;
    /**
     *
     */
    metaProperty?: TMetaProperty;
    /**
     *
     */
    model?: ModelConstructor | string;
    /**
     *
     */
    rawData?: TRawData;
    /**
     *
     */
    writable?: boolean;
}

interface IRawDataWithTotal {
    total: number | boolean;
}

function isObject(value: any): value is IHashMap<string> {
    return value && typeof value === 'object';
}

function isTotalRawData(value: any): value is IRawDataWithTotal {
    return isObject(value) && value.hasOwnProperty('total');
}

export function isInstanceWithMeta(value: any) {
    return value['[Types/_entity/adapter/IMetaData]'];
}

/**
 * Набор данных, полученный из источника.
 * @remark
 * Представляет собой набор {@link Types/collection:RecordSet выборок}, {@link Types/entity:Model записей}, а также скалярных значений, которые можно получить по имени свойства (или пути из имен).
 * Использование таких комплексных наборов позволяет за один вызов {@link Types/source:ICrud#query списочного} либо {@link Types/source:IRpc#call произвольного} метода источника данных получать сразу все требующиеся для отображения какого-либо сложного интерфейса данные.
 * Исходные данные могут быть предоставлены источником в разных форматах (JSON, XML). По умолчанию используется формат JSON. Для чтения каждого формата должен быть указан соответствующий адаптер. По умолчанию используется адаптер {@link Types/_entity/adapter/Json}.
 * В общем случае не требуется создавать экземпляры DataSet самостоятельно - это за вас будет делать источник. Но для наглядности ниже приведены несколько примеров чтения частей из набора данных.
 *
 * Создадим комплексный набор в формате JSON из двух выборок "Заказы" и "Покупатели", одной записи "Итого" и даты выполнения запроса:
 * <pre>
 *     import {DataSet} from 'Types/source';
 *
 *     const data = new DataSet({
 *         rawData: {
 *             orders: [
 *                 {id: 1, buyerId: 1, date: '2016-06-02 14:12:45', amount: 96},
 *                 {id: 2, buyerId: 2, date: '2016-06-02 17:01:12', amount: 174},
 *                 {id: 3, buyerId: 1, date: '2016-06-03 10:24:28', amount: 475}
 *             ],
 *             buyers: [
 *                 {id: 1, email: 'tony@stark-industries.com', phone: '555-111-222'},
 *                 {id: 2, email: 'steve-rogers@avengers.us', phone: '555-222-333'}
 *             ],
 *             total: {
 *                 dateFrom: '2016-06-01 00:00:00',
 *                 dateTo: '2016-07-01 00:00:00',
 *                 amount: 745,
 *                 deals: 3,
 *                 completed: 2,
 *                 paid: 2,
 *                 awaited: 1,
 *                 rejected: 0
 *             },
 *             executeDate: '2016-06-27 11:34:57'
 *         },
 *         itemsProperty: 'orders',
 *         keyProperty: 'id'
 *     });
 *
 *     const orders = data.getAll(); // Here use itemsProperty option value
 *     console.log(orders.getCount()); // 3
 *     console.log(orders.at(0).get('amount')); // 96
 *
 *     const buyers = data.getAll('buyers'); // Here use argument 'property'
 *     console.log(buyers.getCount()); // 2
 *     console.log(buyers.at(0).get('email')); // 'tony@stark-industries.com'
 *
 *     const total = data.getRow('total');
 *     console.log(total.get('amount')); // 745
 *
 *     console.log(data.getScalar('executeDate')); // '2016-06-27 11:34:57'
 * </pre>
 * Создадим комплексный набор в формате XML из двух выборок "Заказы" и "Покупатели", записи "Итого" и даты выполнения
 * запроса:
 * <pre>
 *     import {DataSet} from 'Types/source';
 *     import {adapter} from 'Types/entity';
 *
 *     const data = new DataSet({
 *         adapter: new adapter.Xml(),
 *         rawData: '<?xml version="1.0"?>' +
 *             '<response>' +
 *             '    <orders>' +
 *             '        <order>' +
 *             '            <id>1</id><buyerId>1</buyerId><date>2016-06-02 14:12:45</date><amount>96</amount>' +
 *             '        </order>' +
 *             '        <order>' +
 *             '            <id>2</id><buyerId>2</buyerId><date>2016-06-02 17:01:12</date><amount>174</amount>' +
 *             '        </order>' +
 *             '        <order>' +
 *             '            <id>3</id><buyerId>1</buyerId><date>2016-06-03 10:24:28</date><amount>475</amount>' +
 *             '        </order>' +
 *             '    </orders>' +
 *             '    <buyers>' +
 *             '        <buyer>' +
 *             '            <id>1</id><email>tony@stark-industries.com</email><phone>555-111-222</phone>' +
 *             '        </buyer>' +
 *             '        <buyer>' +
 *             '            <id>2</id><email>steve-rogers@avengers.us</email><phone>555-222-333</phone>' +
 *             '        </buyer>' +
 *             '    </buyers>' +
 *             '    <total>' +
 *             '        <dateFrom>2016-06-01 00:00:00</dateFrom>' +
 *             '        <dateTo>2016-07-01 00:00:00</dateTo>' +
 *             '        <amount>475</amount>' +
 *             '        <deals>3</deals>' +
 *             '        <completed>2</completed>' +
 *             '        <paid>2</paid>' +
 *             '        <awaited>1</awaited>' +
 *             '        <rejected>0</rejected>' +
 *             '    </total>' +
 *             '    <executeDate>2016-06-27 11:34:57</executeDate>' +
 *             '</response>',
 *         itemsProperty: 'orders/order', // XPath syntax
 *         keyProperty: 'id'
 *     });
 *
 *     const orders = data.getAll();
 *     console.log(orders.getCount()); // 3
 *     console.log(orders.at(0).get('amount')); // 96
 *
 *     const buyers = data.getAll('buyers/buyer'); // XPath syntax
 *     console.log(buyers.getCount()); // 2
 *     console.log(buyers.at(0).get('email')); // 'tony@stark-industries.com'
 *
 *     const total = data.getRow('total');
 *     console.log(total.get('amount')); // 745
 *
 *     console.log(data.getScalar('executeDate')); // '2016-06-27 11:34:57'
 * </pre>
 * @public
 */
export default class DataSet<
    TData = any,
    TRow extends Record = Model,
    TList extends RecordSet<Record> = RecordSet<Record>,
    TKeyProperty extends keyof TData = keyof TData,
    TRawData = any,
    TItemsProperty extends keyof TRawData = keyof TRawData,
    TMetaProperty extends keyof TRawData = keyof TRawData
> extends mixin<DestroyableMixin, OptionsToPropertyMixin, SerializableMixin>(
    DestroyableMixin,
    OptionsToPropertyMixin,
    SerializableMixin
) {
    readonly '[Types/_source/DataSet]': EntityMarker = true;
    /**
     * Адаптер для работы данными, по умолчанию {@link Types/_entity/adapter/Json}
     * @see {@link getAdapter}
     * @see {@link Types/di}
     */
    protected _$adapter: AdapterDescriptor;

    /**
     * Данные в "сыром" виде
     * @remark
     * Данные должны быть в формате, поддерживаемом адаптером {@link Types/entity:adapter.IAdapter}.
     * @see {@link getRawData}
     * @see {@link setRawData}
     * @example
     * Создадим набор данных с персонажами фильма:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new source.DataSet({
     *         rawData: [{
     *             id: 1,
     *             firstName: 'John',
     *             lastName: 'Connor',
     *             role: 'Savior'
     *         }, {
     *             id: 2,
     *             firstName: 'Sarah',
     *             lastName: 'Connor',
     *             role: 'Savior\'s Mother'
     *         }, {
     *             id: 3,
     *             firstName: '-',
     *             lastName: 'T-800',
     *             role: 'Terminator'
     *         }]
     *     });
     *     const characters = data.getAll();
     *
     *     console.log(characters.at(0).get('firstName')); // John
     *     console.log(characters.at(0).get('lastName')); // Connor
     * </pre>
     */
    protected _$rawData: TRawData;

    /**
     * Конструктор записей, порождаемых набором данных. По умолчанию {@link Types/entity:Model}.
     * @see {@link getModel}
     * @see {@link Types/di}
     * @example
     * Установим модель "Пользователь":
     * <pre>
     *     import {DataSet} from 'Types/source';
     *     import {User} from 'My/application/models';
     *
     *     const data = new DataSet({
     *         model: User
     *     });
     * </pre>
     */
    protected _$model: ModelConstructor | string;

    /**
     * Конструктор рекордсетов, порождаемых набором данных. По умолчанию {@link Types/collection:RecordSet}.
     * @see {@link getListModule}
     * @see {@link Types/di}
     * @example
     * Установим рекордсет "Пользователи":
     * <pre>
     *     import {DataSet} from 'Types/source';
     *     import {Users} from 'My/application/models';
     *
     *     const data = new DataSet({
     *         listModule: Users
     *     });
     * </pre>
     */
    protected _$listModule: ListConstructor<Record> | string;

    /**
     * Название свойства записи, содержащего первичный ключ.
     * @see {@link getKeyProperty}
     * @example
     * Установим свойство 'primaryId' в качестве первичного ключа:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         keyProperty: 'primaryId'
     *     });
     * </pre>
     */
    protected _$keyProperty: TKeyProperty;

    /**
     * Название свойства сырых данных, в котором находится основная выборка
     * @see {@link getItemsProperty}
     * @see {@link setItemsProperty}
     * @example
     * Установим свойство 'orders' как содержащее основную выборку:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: {
     *             orders: [
     *                 {id: 1, date: '2016-06-02 14:12:45', amount: 96},
     *                 {id: 2, date: '2016-06-02 17:01:12', amount: 174},
     *                 {id: 3, date: '2016-06-03 10:24:28', amount: 475}
     *             ],
     *             total: {
     *                 dateFrom: '2016-06-01 00:00:00',
     *                 dateTo: '2016-07-01 00:00:00',
     *                 amount: 745
     *             }
     *         },
     *         itemsProperty: 'orders'
     *     });
     *
     *     const orders = data.getAll();
     *     console.log(orders.getCount()); // 3
     *     console.log(orders.at(0).get('id')); // 1
     * </pre>
     */
    protected _$itemsProperty: TItemsProperty;

    /**
     * Свойство данных, в которых находятся мета-данные выборки
     * @see {@link getMetaProperty}
     */
    protected _$metaProperty: TMetaProperty;

    /**
     * Можно модифицировать. Признак передается объектам, которые инстанциирует DataSet.
     */
    protected _$writable: boolean;

    /*
     * Использовать режим Copy-On-Write в конструируемых типах данных
     */
    protected _$cow: boolean;

    /**
     * Получить признак возможности модификации.
     */
    get writable(): boolean {
        return this._$writable;
    }

    /**
     * Установить признак возможности модификации.
     */
    set writable(value: boolean) {
        this._$writable = !!value;
    }

    /**
     *
     */
    constructor(options?: IOptions<TData, TRawData, TItemsProperty, TMetaProperty, TKeyProperty>) {
        super();
        OptionsToPropertyMixin.initMixin(this, options);

        // Support deprecated option 'idProperty'
        if (!this._$keyProperty && options && (options as any).idProperty) {
            this._$keyProperty = (options as any).idProperty;
        }
    }

    // region Public methods

    /**
     * Возвращает адаптер для работы с данными
     * @example
     * Получим адаптер набора данных, используемый по умолчанию:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *     import {adapter} from 'Types/entity';
     *
     *     const data = new DataSet();
     *     console.log(data.getAdapter() instanceof adapter.Json); // true
     * </pre>
     */
    getAdapter(): adapter.IAdapter {
        if (typeof this._$adapter === 'string') {
            this._$adapter = create<adapter.IAdapter>(this._$adapter);
        }
        return this._$adapter;
    }

    /**
     * Возвращает конструктор записей, порождаемых набором данных.
     * @return
     * @see {@link Types/di}
     * @example
     * Получим конструктор записей, используемый по умолчанию:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet();
     *     console.log(data.getModel()); // 'Types/entity:Model'
     * </pre>
     */
    getModel(): ModelConstructor | string {
        return this._$model;
    }

    /**
     * Устанавливает конструктор записей, порождаемых набором данных.
     * @param model
     * @see {@link getModel}
     * @see {@link Types/di}
     * @example
     * Установим конструктор пользовательской модели:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *     import {User} from 'My/application/models';
     *
     *     const data = new DataSet();
     *     data.setModel(User);
     * </pre>
     */
    setModel(model: ModelConstructor | string): void {
        this._$model = model;
    }

    /**
     * Возвращает конструктор списка моделей
     * @see {@link Types/di}
     * @example
     * Получим конструктор рекордсетов, используемый по умолчанию:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet();
     *     console.log(data.getListModule()); // 'Types/collection:RecordSet'
     * </pre>
     */
    getListModule(): ListConstructor<Record> | string {
        return this._$listModule;
    }

    /**
     * Устанавливает конструктор списка моделей
     * @param listModule
     * @see {@link getListModule}
     * @see {@link Types/di}
     * @example
     * Установим конструктор рекордсетов:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *     import {Users} from 'My/application/models';
     *
     *     const data = new DataSet();
     *     data.setListModule(Users);
     * </pre>
     */
    setListModule(listModule: ListConstructor<Record> | string): void {
        this._$listModule = listModule;
    }

    /**
     * Возвращает название свойства модели, содержащего первичный ключ
     * @example
     * Получим название свойства модели, содержащего первичный ключ:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *        keyProperty: 'id'
     *     });
     *     console.log(data.getKeyProperty()); // 'id'
     * </pre>
     */
    getKeyProperty(): string {
        return this._$keyProperty as string;
    }

    /**
     * Устанавливает название свойства модели, содержащего первичный ключ
     * @param name
     * @see {@link getKeyProperty}
     * @example
     * Установим название свойства модели, содержащего первичный ключ:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet();
     *     data.setKeyProperty('id');
     * </pre>
     */
    setKeyProperty(name: TKeyProperty): void {
        this._$keyProperty = name;
    }

    /**
     * Возвращает название свойства сырых данных, в котором находится основная выборка
     * @see {@link setItemsProperty}
     * @example
     * Получим название свойства, в котором находится основная выборка:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         itemsProperty: 'items'
     *     });
     *     console.log(data.getItemsProperty()); // 'items'
     * </pre>
     */
    getItemsProperty(): string {
        return this._$itemsProperty as string;
    }

    /**
     * Устанавливает название свойства сырых данных, в котором находится основная выборка
     * @param name
     * @see {@link getItemsProperty}
     * @example
     * Установим название свойства, в котором находится основная выборка:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet();
     *     data.setItemsProperty('items');
     * </pre>
     */
    setItemsProperty(name: TItemsProperty): void {
        this._$itemsProperty = name;
    }

    /**
     * Возвращает выборку
     * @param property Свойство данных, в которых находятся элементы выборки. Если не указывать, вернется основная выборка.
     * @example
     * Получим основную выборку из набора данных, представляющего выборку:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: [
     *             {id: 1, title: 'How to build a Home'},
     *             {id: 2, title: 'How to plant a Tree'},
     *             {id: 3, title: 'How to grow up a Son'}
     *         ]
     *     });
     *     const mansGuide = data.getAll();
     *
     *     console.log(mansGuide.at(0).get('title')); // 'How to build a Home'
     * </pre>
     * @example
     * Получим основную и дополнительную выборки из набора данных, представляющего несколько выборок:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: {
     *             articles: [{
     *                 id: 1,
     *                 topicId: 1,
     *                 title: 'Captain America'
     *             }, {
     *                 id: 2,
     *                 topicId: 1,
     *                 title: 'Iron Man'
     *             }, {
     *                 id: 3,
     *                 topicId: 2,
     *                 title: 'Batman'
     *             }],
     *             topics: [{
     *                 id: 1,
     *                 title: 'Marvel Comics'
     *             }, {
     *                 id: 2,
     *                 title: 'DC Comics'
     *             }]
     *         },
     *         itemsProperty: 'articles'
     *     });
     *     const articles = data.getAll();
     *     const topics = data.getAll('topics');
     *
     *     console.log(articles.at(0).get('title')); // 'Captain America'
     *     console.log(topics.at(0).get('title')); // 'Marvel Comics'
     * </pre>
     */
    getAll(property?: TItemsProperty): TList {
        this._checkAdapter();
        if (property === undefined) {
            property = this._$itemsProperty;
        }

        const items = this._getListInstance<TList | RecordSet>(this._getDataProperty(property));

        if (this._$metaProperty && (items as RecordSet).getMetaData instanceof Function) {
            let itemsMetaData = items.getMetaData();
            let metaData: ReturnType<typeof this.getMetaData> | IRawDataWithTotal =
                this.getMetaData();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            let someInMetaData = Object.keys(metaData).length > 0;

            // FIXME: don't use deprecated 'total' property from raw data
            if (
                !someInMetaData &&
                this._$rawData &&
                isTotalRawData(this._$rawData) &&
                this._$rawData.total
            ) {
                metaData = {
                    total: this._$rawData.total,
                };
                someInMetaData = true;
            }

            if (someInMetaData) {
                itemsMetaData = {
                    ...(itemsMetaData || {}),
                    ...metaData,
                };

                // FIXME: don't use 'more' anymore
                if (!itemsMetaData.hasOwnProperty('more') && isTotalRawData(metaData)) {
                    itemsMetaData.more = metaData.total;
                }

                items.setMetaData(itemsMetaData);
            }
        }

        return items as TList;
    }

    /**
     * Возвращает запись
     * @param property Свойство данных, в которых находится модель
     * @example
     * Получим запись из набора данных, который содержит только ее:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: {
     *             id: 1,
     *             title: 'C++ Beginners Tutorial'
     *         }
     *     });
     *     const article = data.getRow();
     *
     *     console.log(article.get('title')); // 'C++ Beginners Tutorial'
     * </pre>
     * @example
     * Получим записи статьи и темы из набора данных, который содержит несколько записей:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: {
     *             article: {
     *                 id: 2,
     *                 topicId: 1,
     *                 title: 'Iron Man'
     *             },
     *             topic: {
     *                 id: 1,
     *                 title: 'Marvel Comics'
     *             }
     *         }
     *     }),
     *     const article = data.getRow('article'),
     *     const topic = data.getRow('topic');
     *
     *     console.log(article.get('title')); // 'Iron Man'
     *     console.log(topic.get('title')); // 'Marvel Comics'
     * </pre>
     */
    getRow<K extends keyof TRawData>(property?: K): TRow | undefined {
        this._checkAdapter();
        if (property === undefined) {
            property = this._$itemsProperty as unknown as K;
        }

        // FIXME: don't use hardcoded signature for type detection
        const data = this._getDataProperty(property);
        const type = this.getAdapter().getProperty(data, '_type');
        if (type === 'recordset') {
            const tableAdapter = this.getAdapter().forTable(data);
            if (tableAdapter.getCount() > 0) {
                return this._getModelInstance(tableAdapter.at(0)) as TRow;
            }
        } else {
            return this._getModelInstance(data) as TRow;
        }

        return undefined;
    }

    /**
     * Возвращает значение
     * @param property Свойство данных, в которых находится значение
     * @example
     * Получим количество открытых задач:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const statOpen = new DataSet({
     *         rawData: 234
     *     });
     *
     *     console.log(statOpen.getScalar()); // 234
     * </pre>
     * @example
     * Получим количество открытых и закрытых задач:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const stat = new DataSet({
     *         rawData: {
     *             total: 500,
     *             open: 234,
     *             closed: 123,
     *             deleted: 2345
     *         }
     *     });
     *
     *     console.log(stat.getScalar('open')); // 234
     *     console.log(stat.getScalar('closed')); // 123
     * </pre>
     */
    getScalar<K extends keyof TRawData>(property?: K): TRawData[K] {
        if (property === undefined) {
            property = this._$itemsProperty as unknown as K;
        }
        return this._getDataProperty<K>(property);
    }

    /**
     * Возвращает свойство данных, в котором находится общее число элементов выборки
     */
    getMetaProperty(): TMetaProperty {
        return this._$metaProperty;
    }

    /**
     * Возвращает мета-данные выборки
     */
    getMetaData(): TRawData[TMetaProperty] {
        return (
            (this._$metaProperty && this._getDataProperty(this._$metaProperty)) ||
            ({} as TRawData[TMetaProperty])
        );
    }

    /**
     * Проверяет наличие свойства в данных
     * @param property Свойство
     * @see {@link getProperty}
     * @example
     * Проверим наличие свойств 'articles' и 'topics':
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: {
     *             articles: [{
     *                 id: 1,
     *                 title: 'C++ Beginners Tutorial'
     *             }]
     *         }
     *     });
     *
     *     console.log(data.hasProperty('articles')); // true
     *     console.log(data.hasProperty('topics')); // false
     * </pre>
     */
    hasProperty(property?: string): boolean {
        return property ? this._getDataProperty(property as never) !== undefined : false;
    }

    /**
     * Возвращает значение свойства в данных
     * @param property Свойство
     * @see {@link hasProperty}
     * @example
     * Получим значение свойства 'article':
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new DataSet({
     *         rawData: {
     *             article: {
     *                 id: 1,
     *                 title: 'C++ Beginners Tutorial'
     *             }
     *         }
     *     });
     *
     *     console.log(data.getProperty('article')); // {id: 1, title: 'C++ Beginners Tutorial'}
     * </pre>
     */
    getProperty(): TRawData;
    getProperty<K extends keyof TRawData>(property?: K): TRawData[K];
    getProperty<K extends keyof TRawData>(property?: K): TRawData[K] | TRawData {
        return this._getDataProperty<K>(property);
    }

    /**
     * Возвращает сырые данные
     * @see {@link setRawData}
     * @example
     * Получим данные в сыром виде:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new source.DataSet({
     *         rawData: {
     *             id: 1,
     *             title: 'C++ Beginners Tutorial'
     *         }
     *     });
     *
     *     console.log(data.getRawData()); // {id: 1, title: 'C++ Beginners Tutorial'}
     * </pre>
     */
    getRawData(): TRawData {
        return this._$rawData;
    }

    /**
     * Устанавливает сырые данные
     * @param rawData Сырые данные
     * @see {@link getRawData}
     * @example
     * Установим данные в сыром виде:
     * <pre>
     *     import {DataSet} from 'Types/source';
     *
     *     const data = new source.DataSet();
     *     data.setRawData({
     *         id: 1,
     *         title: 'C++ Beginners Tutorial'
     *     });
     *     console.log(data.getRow().get('title')); // 'C++ Beginners Tutorial'
     * </pre>
     */
    setRawData(rawData: TRawData): void {
        this._$rawData = rawData;
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает свойство данных
     * @param property Свойство
     * @protected
     */
    protected _getDataProperty<K extends keyof TRawData>(property?: K): TRawData[K] {
        this._checkAdapter();
        return property
            ? this.getAdapter().getProperty(this._$rawData, property as string)
            : this._$rawData;
    }

    /**
     * Возвращает инстанс модели
     * @param rawData Данные модели
     * @protected
     */
    protected _getModelInstance<T extends Record>(rawData: unknown): T {
        if (!this._$model) {
            throw new Error('Model is not defined');
        }
        return create<T>(this._$model, {
            writable: this._$writable,
            cow: this._$cow,
            rawData,
            adapter: this._$adapter,
            keyProperty: this._$keyProperty,
        });
    }

    /**
     * Возвращает инстанс рекордсета
     * @param rawData Данные рекордсета
     * @protected
     */
    protected _getListInstance<T extends IList<unknown>>(rawData: unknown): T {
        return create<T>(this._$listModule, {
            writable: this._$writable,
            cow: this._$cow,
            rawData,
            adapter: this._$adapter,
            model: this._$model,
            keyProperty: this._$keyProperty,
        });
    }

    /**
     * Проверят наличие адаптера
     * @protected
     */
    protected _checkAdapter(): void {
        if (!this.getAdapter()) {
            throw new Error('Adapter is not defined');
        }
    }

    // endregion
}

Object.assign(DataSet.prototype, {
    '[Types/_source/DataSet]': true,
    _moduleName: 'Types/source:DataSet',
    _$adapter: 'Types/entity:adapter.Json',
    _$rawData: null,
    _$model: 'Types/entity:Model',
    _$listModule: 'Types/collection:RecordSet',
    _$keyProperty: '',
    _$itemsProperty: '',
    _$metaProperty: '',
    _$cow: false,
    _$writable: true,
    getIdProperty: DataSet.prototype.getKeyProperty,
    setIdProperty: DataSet.prototype.setKeyProperty,
});
