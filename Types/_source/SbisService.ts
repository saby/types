import Rpc from './Rpc';
import {
    IOptions as IRemoteOptions,
    IOptionsOption as IRemoteOptionsOption,
    IPassing as IRemotePassing,
    IProviderOptions,
} from './Remote';
import { EntityKey } from './ICrud';
import { IEndpoint as IProviderEndpoint } from './IProvider';
import { IBinding as IDefaultBinding } from './BindingMixin';
import OptionsMixin from './OptionsMixin';
import DataMixin from './DataMixin';
import Query, { ExpandMode, playExpression, NavigationType, WhereExpression } from './Query';
import DataSet from './DataSet';
import { IAbstract } from './provider';
import { RecordSet, EnumeratorIndex } from '../collection';
import {
    applied,
    AdapterDescriptor,
    getMergeableProperty,
    Record as TypesRecord,
    Model,
} from '../entity';
import { register, resolve } from '../di';
import { logger, object } from '../util';
import { IHashMap } from 'Types/declarations';
import { Object as EventObject } from 'Env/Event';

/**
 * Separator for BL object name and method name
 */
const BL_OBJECT_SEPARATOR = '.';

/**
 * Separator for Identity type
 */
const COMPLEX_ID_SEPARATOR = ',';

/**
 * Regexp for Identity type detection
 */
const COMPLEX_ID_MATCH = /^[0-9]+,[А-яA-z0-9]+$/;

const EXPRESSION_TEMPLATE = /(.+)([<>]=?|~)$/;

enum CursorDirection {
    backward = 'backward',
    forward = 'forward',
    bothways = 'bothways',
}

interface ICursor {
    position: object | object[] | null;
    direction: CursorDirection | null;
}

/**
 * @public
 */
export interface IEndpoint extends IProviderEndpoint {
    /**
     *
     */
    moveContract?: string;
}
/**
 * Расширенный IBinding
 * @public
 */
export interface IBinding extends IDefaultBinding {
    /**
     * Имя метода для обновления рекордсета через метод {@link update} с передачей только измененных записей.
     * @remark
     * Метод должен принимать следующий набор аргументов:
     * RecordSet changed,
     * RecordSet added,
     * Array<Sting|Number> removed
     * Где changed - измененные записи, added - добавленные записи, removed - ключи удаленных записей.
     */
    updateBatch?: string;
    /**
     *
     */
    moveBefore?: string;
    /**
     *
     */
    moveAfter?: string;
    /**
     * Имя метода для получения формата записи через {@link create}, {@link read} и {@link copy}.
     * Метод должен быть декларативным.
     */
    format?: string;
    /**
     * Имя метода для создания записи через {@link create}.
     * @example
     * Зададим свою реализацию для метода create:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             create: 'FastCreate'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода create на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             create: 'Personnel.Create'
     *         }
     *     });
     * </pre>
     */
    create?: string;
    /**
     * Имя метода для чтения записи через {@link read}.
     * @example
     * Зададим свою реализацию для метода read:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             read: 'getById'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода create на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             read: 'Personnel.Read'
     *         }
     *     });
     * </pre>
     */
    read?: string;
    /**
     * Имя метода для обновления записи или рекордсета через {@link update}.
     * @example
     * Зададим свою реализацию для метода update:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             update: 'FastSave'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода update на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             update: 'Personnel.Update'
     *         }
     *     });
     * </pre>
     */
    update?: string;
    /**
     * Имя метода для удаления записи через {@link destroy}.
     * @example
     * Зададим свою реализацию для метода destroy:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             destroy: 'SafeDelete'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода destroy на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             destroy: 'Personnel.Delete'
     *         }
     *     });
     * </pre>
     */
    destroy?: string;
    /**
     * Имя метода для получения списка записей через {@link query}.
     * @example
     * Зададим свою реализацию для метода query:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             query: 'CustomizedList'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода query на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         binding: {
     *             query: 'Personnel.List'
     *         }
     *     });
     * </pre>
     */
    query?: string;
    /**
     * Имя метода для копирования записей через {@link copy}.
     */
    copy?: string;
    /**
     * Имя метода для объединения записей через {@link merge}.
     */
    merge?: string;
    /**
     * Имя метода перемещения записи перед указанной через метод {@link move}.
     * @remark Метод перемещения, используемый по умолчанию - IndexNumber.Move, при изменении родителя вызовет методы Прочитать(read) и Записать(Update), они обязательно должны быть у объекта БЛ.
     */
    move?: string;
}

/**
 * Дополнительные настройки источника данных бизнес-логики СБИС
 * @public
 */
export interface IOptionsOption extends IRemoteOptionsOption {
    /**
     * Название свойства мета-данных {@link Types/source:Query#meta запроса}, в котором хранится значение поля HasMore аргумента Навигация, передаваемое в вызов {@link Types/source:SbisService#query}.
     */
    hasMoreProperty?: string;
    /**
     * Передавать аргумент "ДопПоля" при вызове методов {@link Types/source:SbisService#read} и {@link Types/source:SbisService#update}, значение которых получено из метаданных {@link Types/source:Query#meta запроса}.
     */
    passAddFieldsFromMeta?: boolean;
}

/**
 * Constructor options
 * @public
 */
export interface IOptions extends IRemoteOptions {
    /**
     *
     */
    endpoint?: IEndpoint | string;
    /**
     *
     */
    binding?: IBinding;
    /**
     *
     */
    orderProperty?: string;
    /**
     *
     */
    options?: IOptionsOption;
}

/**
 * Move metadata interface
 * @private
 */
export interface IMoveMeta {
    parentProperty?: string;
    objectName?: string;
    position?: string;
    query?: Query;
}

/**
 * Old move metadata interface
 * @private
 */
interface IOldMoveMeta {
    before: string;
    hierField: string;
}

/**
 * Параметры сортировки в формате БЛ СБИС
 * @private
 */
interface ISBISSortingParams {
    /**
     * Имя поля, к которому применяется сортировка
     */
    n: string;
    /**
     * Направление сортировки.
     */
    o: string | boolean;
    /**
     * Политика позиционирования NULL-подобных значений
     */
    l: boolean;
}

/**
 * Параметры постраничной навигации в формате БЛ СБИС
 * @private
 */
interface IPageNavigationParams {
    Страница: number;
    РазмерСтраницы: number;
    ЕстьЕще: boolean;
}

/**
 * Параметиры курсорной навигации в формате БЛ СБИС
 */
interface ICursorNavigationParams {
    Direction: CursorDirection;
    Position: TypesRecord | RecordSet;
    HasMore: boolean;
    Limit: number;
}

/**
 * Параметиры навигации по сдвигу в формате БЛ СБИС
 */
interface IOffsetNavigationParams {
    Offset: number;
    HasMore: boolean;
    Limit: number;
}

type TNavigationParams = IPageNavigationParams | ICursorNavigationParams | IOffsetNavigationParams;

/**
 * Returns BL object name and its method name joined by separator.
 * If method name already contains the separator then returns it unchanged.
 */
function buildBlMethodName(objectName: string, methodName: string): string {
    return methodName.indexOf(BL_OBJECT_SEPARATOR) > -1
        ? methodName
        : objectName + BL_OBJECT_SEPARATOR + methodName;
}

/**
 * Returns key of the BL Object from its complex id
 */
function getKeyByComplexId(id: EntityKey): string {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR)[0];
    }
    return id;
}

/**
 * Returns name of the BL Object from its complex id
 */
function getNameByComplexId(id: EntityKey, defaults: string): string {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR)[1];
    }
    return defaults;
}

/**
 * Creates complex id
 */
function createComplexId(id: string, defaults?: string): [string, string?] {
    id = String(id || '');
    if (id.match(COMPLEX_ID_MATCH)) {
        return id.split(COMPLEX_ID_SEPARATOR, 2) as [string, string];
    }
    return [id, defaults];
}

/**
 * Joins BL objects into groups be its names
 */
function getGroupsByComplexIds(ids: EntityKey[], defaults: string): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    let name;
    for (let i = 0, len = ids.length; i < len; i++) {
        name = getNameByComplexId(ids[i], defaults);
        groups[name] = groups[name] || [];
        groups[name].push(getKeyByComplexId(ids[i]));
    }

    return groups;
}

/**
 * Builds Record from plain object
 * @param data Record data as JSON
 * @param adapter
 */
function buildRecord<T extends object = object>(
    data: T,
    adapter: AdapterDescriptor
): T extends object ? TypesRecord<T> : null {
    if (data instanceof TypesRecord) {
        //@ts-ignore;
        return data;
    }

    const RecordType = resolve<typeof TypesRecord>('Types/entity:Record');
    // @ts-ignore
    return RecordType.fromObject(data, adapter);
}

/**
 * Builds RecordSet from array of plain objects
 * @param data RecordSet data as JSON
 * @param adapter
 * @param keyProperty
 */
function buildRecordSet(data: null, adapter: AdapterDescriptor, keyProperty?: string): null;
function buildRecordSet<T = unknown>(
    data: T | RecordSet,
    adapter: AdapterDescriptor,
    keyProperty?: string
): RecordSet;
function buildRecordSet<DeclaredDataType extends object = any>(
    data: DeclaredDataType | RecordSet<DeclaredDataType, Model<DeclaredDataType>>,
    adapter: AdapterDescriptor,
    keyProperty?: string
): RecordSet | null {
    if (data === null) {
        return null;
    }
    if (data && DataMixin.isRecordSetInstance(data)) {
        return data;
    }

    const RecordSetType = resolve<typeof RecordSet>('Types/collection:RecordSet');
    const records = new RecordSetType<DeclaredDataType, Model<DeclaredDataType>>({
        adapter,
        keyProperty,
    });

    if (data instanceof Array) {
        const count = data.length;
        for (let i = 0; i < count; i++) {
            records.add(buildRecord(data[i], adapter) as unknown as Model<DeclaredDataType>);
        }
    }

    return records;
}

function eachQuery<T>(
    query: Query<T>,
    callback: (item: Query<T>, parent?: Query<T>) => void,
    prev?: Query<T>
): void {
    callback(query, prev);
    query.getUnion().forEach((unionQuery: Query<T>) => {
        eachQuery(unionQuery, callback, query);
    });
}

/**
 * Returns sorting parameters
 */
function getSortingParams(query?: Query): ISBISSortingParams[] | null {
    if (!query) {
        return null;
    }

    let sort: ISBISSortingParams[] | null = null;
    eachQuery(query, (subQuery) => {
        const orders = subQuery.getOrderBy();
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (!sort) {
                sort = [];
            }
            sort.push({
                n: order.getSelector(),
                o: order.getOrder(),
                l: order.getNullPolicy(),
            });
        }
    });

    return sort;
}

/**
 * Converts expression to the plain object
 * @param expr Expression to convert
 */
function expressionToObject<T>(expr: WhereExpression<T>): object {
    const result: Record<string, unknown> = {};
    let currentType: string = '';

    playExpression(
        expr,
        (key, value) => {
            if (currentType === 'or') {
                result[key] = result[key] || [];
                if (value !== undefined) {
                    (result[key] as unknown[]).push(value);
                }
            } else {
                result[key] = value;
            }
        },
        (type) => {
            currentType = type;
        },
        (_, restoreType) => {
            currentType = restoreType;
        }
    );

    return result;
}

/**
 * Applies string expression and its value to given cursor
 * @param expr Expression to apply
 * @param value Value of expression
 * @param cursor Cursor to affect
 * @return True if argument expr contains expression
 */
function applyPairToCursor(expr: string, value: unknown, cursor: ICursor): boolean {
    // Skip undefined values
    if (value === undefined) {
        return false;
    }
    const parts = expr.match(EXPRESSION_TEMPLATE);

    // Check next if there's no operand
    if (!parts) {
        return false;
    }

    const field = parts[1];
    const operand = parts[2];

    // Add field value to position if it's not null because nulls used only for defining an order.
    if (value !== null) {
        if (!cursor.position) {
            cursor.position = {};
        }
        // @ts-ignore
        cursor.position[field] = value;
    }

    // We can use only one kind of order so take it from the first operand
    if (!cursor.direction) {
        switch (operand) {
            case '~':
                cursor.direction = CursorDirection.bothways;
                break;

            case '<':
            case '<=':
                cursor.direction = CursorDirection.backward;
                break;
        }
    }

    return true;
}

/**
 * Returns navigation parameters
 */
function getNavigationParams(
    query: Query | undefined,
    options: IOptionsOption,
    adapter: AdapterDescriptor
): object[] {
    const result: TNavigationParams[] = [];

    if (!query) {
        return result;
    }

    eachQuery(query, (subQuery) => {
        const offset = subQuery.getOffset();
        const limit = subQuery.getLimit();
        const meta = subQuery.getMeta();
        const moreProp = options.hasMoreProperty as string;
        const hasMoreProp = meta.hasOwnProperty(moreProp);
        const more = hasMoreProp ? meta[moreProp] : offset >= 0;
        const withoutOffset = offset === 0;
        const withoutLimit = limit === undefined || limit === null;

        let params: TNavigationParams | null = null;

        switch (meta.navigationType || options.navigationType) {
            case NavigationType.Page:
                if (!withoutOffset || !withoutLimit) {
                    const safeLimit = limit || 0;
                    params = {
                        Страница: safeLimit > 0 ? Math.floor(offset / safeLimit) : 0,
                        РазмерСтраницы: limit,
                        ЕстьЕще: more,
                    } as IPageNavigationParams;
                }
                break;

            case NavigationType.Position:
                if (!withoutLimit) {
                    const cursor: ICursor = {
                        position: null,
                        direction: null,
                    };

                    const where = subQuery.getWhere();
                    playExpression(where, (expr, value) => {
                        if (applyPairToCursor(expr, value, cursor)) {
                            // Also delete property with operand in subQuery (by link)
                            // @ts-ignore
                            delete where[expr];
                        }
                    });

                    params = {
                        HasMore: more,
                        Limit: limit,
                        Direction: cursor.direction || CursorDirection.forward,
                        Position:
                            cursor.position instanceof Array
                                ? buildRecordSet(cursor.position, adapter)
                                : buildRecord(cursor.position as object, adapter),
                    } as ICursorNavigationParams;
                }
                break;

            default:
                if (!withoutOffset || !withoutLimit) {
                    params = {
                        Offset: offset || 0,
                        Limit: limit,
                        HasMore: more,
                    } as IOffsetNavigationParams;
                }
        }

        result.push(params as TNavigationParams);
    });

    return result;
}

interface IMultipleNavigation {
    id: EntityKey;
    nav: TypesRecord | null;
}

function getMultipleNavigation(
    summaryNav: object[],
    summaryFilter: object[],
    adapter: AdapterDescriptor
): IMultipleNavigation[] {
    const navigation: IMultipleNavigation[] = [];

    summaryNav.forEach((sectionNav, index) => {
        // Treat first filter key as section id
        const sectionFilter = summaryFilter[index] || {};
        const primaryKeys = Object.entries(sectionFilter)
            .filter(([_, value]) => {
                return value instanceof applied.PrimaryKey;
            })
            .map(([key, value]) => {
                // Delete section id from filter to prevent sending it in general filter
                // @ts-ignore
                delete sectionFilter[key];

                return value;
            });

        navigation.push({
            id: primaryKeys.length === 0 ? null : primaryKeys.length ? primaryKeys[0] : primaryKeys,
            nav: buildRecord(sectionNav, adapter),
        });
    });

    return navigation;
}

/**
 * Returns filtering parameters
 */
function getFilterParams(query?: Query): object[] {
    const result: IHierarchyOptions[] = [];

    if (!query) {
        return result;
    }

    interface IHierarchyOptions {
        Разворот?: string;
        ВидДерева?: string;
    }

    eachQuery(query, (subQuery) => {
        const whereExpr = subQuery.getWhere();
        // Pass records and models 'as is'
        const whereObject: IHierarchyOptions =
            whereExpr instanceof TypesRecord ? whereExpr : expressionToObject(whereExpr);

        const meta = subQuery.getMeta();
        if (meta) {
            switch (meta.expand) {
                case ExpandMode.None:
                    whereObject.Разворот = 'Без разворота';
                    break;
                case ExpandMode.Nodes:
                    whereObject.Разворот = 'С разворотом';
                    whereObject.ВидДерева = 'Только узлы';
                    break;
                case ExpandMode.Leaves:
                    whereObject.Разворот = 'С разворотом';
                    whereObject.ВидДерева = 'Только листья';
                    break;
                case ExpandMode.All:
                    whereObject.Разворот = 'С разворотом';
                    whereObject.ВидДерева = 'Узлы и листья';
                    break;
            }
        }

        result.push(whereObject);
    });

    return result;
}

function mergeFilterParams(summaryFilter: object[]): object | null {
    if (!summaryFilter) {
        return summaryFilter;
    }

    const result = summaryFilter.reduce((memo: object | null, item) => {
        if (item instanceof TypesRecord) {
            if (!memo) {
                return item;
            }
            item.each((value, name) => {
                object.setPropertyValue(memo, name as string, value);
            });
            return memo;
        } else if (memo instanceof TypesRecord) {
            memo.set(item);
            return memo;
        }
        return { ...(memo || {}), ...item };
    }, null);

    return result;
}

/**
 *
 */
export type AdditionalParams = string[] | Record<string, unknown>;

/**
 * Returns additional parameters
 */
function getAdditionalParams(query?: Query): AdditionalParams {
    const result: AdditionalParams = [];

    if (!query) {
        return result;
    }

    eachQuery(query, (subQuery) => {
        let additional: AdditionalParams | unknown[] = subQuery.getSelect();
        if (additional instanceof TypesRecord) {
            const obj: Record<string, EnumeratorIndex> = {};
            additional.each((key, value) => {
                obj[key] = value;
            });
            additional = obj;
        }

        if (additional instanceof Object) {
            const arr: unknown[] = [];
            const additionalObject = additional as Record<string, unknown>;
            for (const key in additional) {
                if (additional.hasOwnProperty(key)) {
                    arr.push(additionalObject[key]);
                }
            }
            additional = arr;
        }

        if (!(additional instanceof Array)) {
            throw new TypeError(
                'Types/_source/SbisService::getAdditionalParams(): unsupported data type. ' +
                    'Only Array, Types/_entity/Record or Object are allowed.'
            );
        }

        (result as unknown[]).push(...additional);
    });

    return result;
}

interface ICreateMeta extends IHashMap<unknown> {
    ВызовИзБраузера?: boolean;
}

interface ICreateResult {
    Фильтр: TypesRecord | null;
    ИмяМетода: string | null;
}

/**
 * Returns data to send in create()
 */
function passCreate(this: SbisService, meta?: TypesRecord | ICreateMeta): ICreateResult {
    if (!(meta instanceof TypesRecord)) {
        meta = { ...(meta || {}) };
        if (!('ВызовИзБраузера' in meta)) {
            meta.ВызовИзБраузера = true;
        }
    }

    // TODO: вместо 'ИмяМетода' может передаваться 'Расширение'
    return {
        Фильтр: buildRecord(meta, this._$adapter),
        ИмяМетода: this._$binding.format || null,
    };
}

interface IReadResult {
    ИдО: EntityKey;
    ИмяМетода: string | null;
    ДопПоля?: object;
}

/**
 * Returns data to send in read()
 */
function passRead(this: SbisService, key: EntityKey, meta?: object): IReadResult {
    const binding = this._$binding;
    const passAddFieldsFromMeta = this._$options.passAddFieldsFromMeta;

    const args: IReadResult = {
        ИдО: key,
        ИмяМетода: binding.format || null,
    };

    if (passAddFieldsFromMeta && meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }

    return args;
}

interface IUpdateResult {
    Запись?: TypesRecord;
    Записи?: TypesRecord;
    ДопПоля?: object;
}

/**
 * Returns data to send in update()
 */
function passUpdate(
    this: SbisService,
    data: TypesRecord | RecordSet,
    meta?: object
): IUpdateResult {
    const superArgs = (Rpc.prototype as any)._$passing.update.call(this, data, meta);
    const args: IUpdateResult = {};
    const recordArg = DataMixin.isRecordSetInstance(superArgs.data) ? 'Записи' : 'Запись';
    const passAddFieldsFromMeta = this._$options.passAddFieldsFromMeta;

    args[recordArg] = superArgs.data;

    if (passAddFieldsFromMeta && meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }

    return args;
}

interface IUpdateBatchResult {
    changed: RecordSet;
    added: RecordSet;
    removed: RecordSet;
}

/**
 * Returns data to send in update() if updateBatch uses
 */
function passUpdateBatch(items: RecordSet, _?: IHashMap<unknown>): IUpdateBatchResult {
    const RecordSetType = resolve<typeof RecordSet>('Types/collection:RecordSet');
    const patch = RecordSetType.patch(items);
    return {
        changed: patch.get('changed'),
        added: patch.get('added'),
        removed: patch.get('removed'),
    };
}

interface IDestroyResult {
    ИдО: EntityKey | EntityKey[];
    ДопПоля?: IHashMap<unknown>;
}

/**
 * Returns data to send in destroy()
 */
function passDestroy(
    this: SbisService,
    keys: EntityKey | EntityKey[],
    meta?: IHashMap<unknown>
): IDestroyResult {
    const args: IDestroyResult = {
        ИдО: keys,
    };
    if (meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }
    return args;
}

/**
 * @public
 */
export interface IQueryResult {
    /**
     *
     */
    Фильтр: TypesRecord;
    /**
     *
     */
    Сортировка: RecordSet;
    /**
     *
     */
    Навигация: TypesRecord | RecordSet | null;
    /**
     *
     */
    ДопПоля: AdditionalParams;
}

/**
 * Returns data to send in query()
 */
function passQuery(this: SbisService, query?: Query): IQueryResult {
    const adapter = this._$adapter;
    let nav = getNavigationParams(query, this._$options, adapter);
    const filter = getFilterParams(query);
    const sort = getSortingParams(query);
    const add = getAdditionalParams(query);

    const isMultipleNavigation = nav.length > 1;
    if (isMultipleNavigation) {
        nav = getMultipleNavigation(nav, filter, adapter);
    }

    return {
        Фильтр: buildRecord(mergeFilterParams(filter) as object, adapter),
        Сортировка: buildRecordSet(sort, adapter, this.getKeyProperty()),
        Навигация: isMultipleNavigation
            ? buildRecordSet(nav, adapter, this.getKeyProperty())
            : nav.length
            ? buildRecord(nav[0], adapter)
            : null,
        ДопПоля: add,
    };
}

/**
 * Public implementation which returns standard query() method arguments
 * @package [query] query params
 * @package [options] SbisService constructor options
 */
export function getQueryArguments(query?: Query, options?: IOptions): IQueryResult {
    const source = new SbisService(options);
    return passQuery.call(source, query);
}

interface ICopyResult {
    ИдО: EntityKey;
    ИмяМетода: string;
    ДопПоля?: AdditionalParams;
}

/**
 * Returns data to send in copy()
 */
function passCopy(this: SbisService, key: EntityKey, meta?: IHashMap<unknown>): ICopyResult {
    const args: ICopyResult = {
        ИдО: key,
        ИмяМетода: this._$binding.format as string,
    };
    if (meta && Object.keys(meta).length) {
        args.ДопПоля = meta;
    }
    return args;
}

interface IMergeResult {
    ИдО: EntityKey;
    ИдОУд: EntityKey | EntityKey[];
}

/**
 * Returns data to send in merge()
 */
function passMerge(
    this: SbisService,
    target: EntityKey,
    merged: EntityKey | EntityKey[]
): IMergeResult {
    return {
        ИдО: target,
        ИдОУд: merged,
    };
}

interface IMoveResult {
    IndexNumber: string;
    HierarchyName: string | null;
    ObjectName?: string;
    ObjectId: EntityKey | EntityKey[];
    DestinationId: EntityKey;
    Order?: string;
    Sorting: RecordSet;
    ReadMethod: string;
    UpdateMethod: string;
}

/**
 * Returns data to send in move()
 */
function passMove(
    this: SbisService,
    from: EntityKey | EntityKey[],
    to: EntityKey,
    meta?: IMoveMeta
): IMoveResult {
    return {
        IndexNumber: this._$orderProperty,
        HierarchyName: meta?.parentProperty || null,
        ObjectName: meta?.objectName,
        ObjectId: from,
        DestinationId: to,
        Order: meta?.position,
        Sorting: buildRecordSet(
            getSortingParams(meta?.query),
            this._$adapter,
            this.getKeyProperty()
        ),
        ReadMethod: buildBlMethodName(meta?.objectName as string, this._$binding.read as string),
        UpdateMethod: buildBlMethodName(
            meta?.objectName as string,
            this._$binding.update as string
        ),
    };
}

/**
 * Calls move method in old style
 * @param from Record to move
 * @param to Record to move to
 * @param meta Meta data
 */
function oldMove(
    this: SbisService,
    from: EntityKey | EntityKey[],
    to: string,
    meta: IOldMoveMeta
): Promise<unknown> {
    logger.info(
        this._moduleName,
        'Move elements through moveAfter and moveBefore methods have been deprecated, please use just move instead.'
    );

    const moveMethod = meta.before ? this._$binding.moveBefore : this._$binding.moveAfter;
    const params = {
        ПорядковыйНомер: this._$orderProperty,
        Иерархия: meta.hierField || null,
        Объект: this._$endpoint.moveContract,
        ИдО: createComplexId(from as string, this._$endpoint.contract),
    };

    const handlers = this._getHandlerChain();

    // @ts-ignore
    params[meta.before ? 'ИдОДо' : 'ИдОПосле'] = createComplexId(to, this._$endpoint.contract);

    return this._callProvider(
        this._$endpoint.moveContract + BL_OBJECT_SEPARATOR + moveMethod,
        params,
        handlers
    );
}

/**
 * Класс источника данных на сервисах бизнес-логики СБИС.
 * @remark
 * <b>Пример 1</b>. Создадим источник данных для объекта БЛ:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *     const dataSource = new SbisService({
 *         endpoint: 'Employee'
 *     });
 * </pre>
 * <b>Пример 2</b>. Создадим источник данных для объекта БЛ, используя отдельную точку входа:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *     const dataSource = new SbisService({
 *         endpoint: {
 *             address: '/my-service/entry/point/',
 *             contract: 'Employee'
 *         }
 *     });
 * </pre>
 * <b>Пример 3</b>. Создадим источник данных для объекта БЛ с указанием своих методов для чтения записи и списка записей, а также свой формат записи:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *     const dataSource = new SbisService({
 *         endpoint: 'Employee',
 *         binding: {
 *             read: 'GetById',
 *             query: 'GetList',
 *             format: 'getListFormat'
 *         },
 *         keyProperty: '@Employee'
 *     });
 * </pre>
 * <b>Пример 4</b>. Выполним основные операции CRUD-контракта объекта 'Article':
 * <pre>
 *     import {SbisService, Query} from 'Types/source';
 *     import {Model} from 'Types/entity';
 *
 *     function onError(err: Error): void {
 *         console.error(err);
 *     }
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'id'
 *     });
 *
 *     // Создадим новую статью
 *     dataSource.create().then((article) => {
 *         const id = article.getKey();
 *     }).catch(onError);
 *
 *     // Прочитаем статью
 *     dataSource.read('article-1').then((article) => {
 *         const title = article.get('title');
 *     }).catch(onError);
 *
 *     // Обновим статью
 *     const article = new Model({
 *         adapter: dataSource.getAdapter(),
 *         format: [
 *             {name: 'id', type: 'integer'},
 *             {name: 'title', type: 'string'}
 *         ],
 *         keyProperty: 'id'
 *     });
 *     article.set({
 *         id: 'article-1',
 *         title: 'Article 1'
 *     });
 *
 *     dataSource.update(article).then(() => {
 *         console.log('Article updated!');
 *     }).catch(onError);
 *
 *     // Удалим статью
 *     dataSource.destroy('article-1').then(() => {
 *         console.log('Article deleted!');
 *     }).catch(onError);
 *
 *     // Прочитаем первые сто статей
 *     const query = new Query();
 *     query.limit(100);
 *
 *     dataSource.query(query).then((response) => {
 *         const articles = response.getAll();
 *         console.log(`Articles count: ${articles.getCount()}`);
 *     }).catch(onError);
 * </pre>
 * <b>Пример 5</b>. Выберем статьи, используя {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#cursor навигацию по курсору}:
 * Для этого в метод {@link Types/source:Query#where where} передается объект, в котором имя свойства — это имя поля, а значение свойства — {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-position начальная позиция курсора}.
 * {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#parametr-source-direction Направление выборки} задается в конце имени поля с помощью символов "<" (backward), ">" (forward) или "~" (bothways).
 * <pre>
 *     import {SbisService, Query} from 'Types/source';
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'id',
 *         options: {
 *             navigationType: SbisService.NAVIGATION_TYPE.POSITION
 *         }
 *     });
 *
 *     const query = new Query();
 *     // Set cursor position by value of field 'PublicationDate'
 *     query.where({
 *         'PublicationDate>=': new Date(2020, 0, 1)
 *     });
 *     query.limit(100);
 *
 *     dataSource.query(query).then((response) => {
 *         const articles = response.getAll();
 *         console.log('Articles released on the 1st of January 2020 or later');
 *         // Do something with articles
 *     }).catch(onError);
 * </pre>
 * <b>Пример 6</b>. Выберем статьи, используя множественную навигацию по нескольким разделам каталога:
 * <pre>
 *     import {SbisService, Query} from 'Types/source';
 *     import {applied} from 'Types/entity';
 *
 *     const dataSource = new SbisService({
 *         endpoint: 'Article',
 *         keyProperty: 'articleId'
 *     });
 *
 *     const sections = {
 *         movies: 456,
 *         cartoons: 457,
 *         comics: 458,
 *         literature: 459,
 *         art: 460
 *     };
 *
 *     // Use union of queries with various parameters
 *     const moviesQuery = new Query()
 *         .where({sectionId: new applied.PrimaryKey(sections.movies)})
 *         .offset(20)
 *         .limit(10)
 *         .orderBy('imdbRating', true);
 *
 *     const comicsQuery = new Query()
 *         .where({sectionId: new applied.PrimaryKey(sections.comics)})
 *         .offset(30)
 *         .limit(15)
 *         .orderBy('starComRating', true);
 *
 *     comicsQuery.union(moviesQuery);
 *
 *     dataSource.query(comicsQuery).then((response) => {
 *         const articles = response.getAll();
 *         console.log(`
 *             Articles from sections "Comics" and "Movies" with different query params
 *         `);
 *         // Do something with articles
 *     }).catch(onError);
 * </pre>
 * @public
 */
export default class SbisService extends Rpc {
    /**
     * Перед вызовом метода удаленного сервиса через провайдер
     * @category Event
     * @param eventObject Дескриптор события.
     * @param name Имя метода
     * @param args Аргументы метода (передаются по ссылке, можно модифицировать, но при этом следует учитывать, что изменяется оригинальный объект)
     * @remark
     * Если задана функция обратного вызова {@link Types/_source/Remote#beforeProviderCallCallback beforeProviderCallCallback}, событие отключается.
     * @example
     * Добавляем в фильтр выборки поле 'active' со значением true:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *
     *     const dataSource = new SbisService({endpoint: 'Pickles'});
     *     dataSource.subscribe('onBeforeProviderCall', (eventObject, name, args) => {
     *         args = {...args};
     *         switch (name) {
     *             case 'getList':
     *                 //Select only active users
     *                 args.filter = args.filter || {};
     *                 args.filter.active = true;
     *                 break;
     *         }
     *         eventObject.setResult(args);
     *     });
     *
     *     dataSource.call('getList', {filter: {registered: true}});
     * </pre>
     */
    onBeforeProviderCall?: (eventObject: EventObject, name: string, args: object) => void;

    /**
     * Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника данных.
     * @remark
     * Можно использовать сокращенную запись, передав значение в виде строки - в этом случае оно будет интерпретироваться как контракт (endpoint.contract).
     * @see {@link getEndpoint}
     * @example
     * <b>Пример 1</b>. Подключаем объект БЛ 'Сотрудник', используя сокращенную запись:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *     });
     * </pre>
     * <b>Пример 2</b>. Подключаем объект БЛ 'Сотрудник', используя отдельную точку входа:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: {
     *             address: '/my-service/entry/point/',
     *             contract: 'Employee'
     *         }
     *     });
     * </pre>
     * <b>Пример 3</b>. Отправим запрос на служебный пул:
     * Отправка запроса на {@link https://wi.sbis.ru/doc/platform/developmentapl/architecture/structure/web-service-node/ служебный пул} через изменение endpoint:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         // добавляем параметр srv=1 в конце адреса для отправки запроса на служебный пул
     *         endpoint: {
     *             address: '/my-service/?srv=1',
     *             contract: 'Employee'
     *         }
     *     });
     * </pre>
     *
     * Отправка запроса на служебный пул с помощью {@link Types/source:SbisService#callHandlers обработчика сообщений}:
     * <pre>
     *     import {SbisService, ServicePoolCallHandler} from 'Types/source';
     *     import {List} from 'Types/collection';
     *
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         callHandlers:
     *             new List<ICallHandler>({
     *                 items: [
     *                     new ServicePoolCallHandler()
     *                 ]
     *             })
     *     });
     * </pre>
     */
    protected _$endpoint: IEndpoint;

    /**
     * Соответствие методов CRUD методам БЛ. Определяет, какой метод объекта БЛ соответствует каждому методу CRUD.
     * @remark
     * По умолчанию используются стандартные методы.
     * Можно переопределить имя объекта БЛ, указанное в endpoint.contract, прописав его имя через точку.
     * @see {@link getBinding}
     * @see {@link create}
     * @see {@link read}
     * @see {@link destroy}
     * @see {@link query}
     * @see {@link copy}
     * @see {@link merge}
     * @example
     * Зададим свои реализации для методов create, read и update:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         binding: {
     *             create: 'new',
     *             read: 'get',
     *             update: 'save'
     *         }
     *     });
     * </pre>
     * Зададим реализацию для метода create на другом объекте БЛ:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         binding: {
     *             create: 'Personnel.Create'
     *         }
     *     });
     * </pre>
     */
    protected _$binding: IBinding;

    protected _$passing: Required<IRemotePassing>;

    /**
     * Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link Types/entity:adapter.Sbis}.
     * @see {@link getAdapter}
     * @see {@link Types/di}
     */
    protected _$adapter: string;

    /**
     * Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link Types/source:provider.SbisBusinessLogic}.
     * @see {@link getProvider}
     * @see {@link Types/di}
     * @example
     * Используем провайдер нотификатора:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     import SbisPluginProvider from 'Plugin/DataSource/Provider/SbisPlugin';
     *     const dataSource = new SbisService({
     *         endpoint: 'Employee'
     *         provider: new SbisPluginProvider()
     *     });
     * </pre>
     */
    protected _$provider: string;

    /**
     * Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
     */
    protected _$orderProperty: string;

    protected _$options: IOptionsOption;

    /**
     *
     * @param options
     */
    constructor(options?: IOptions) {
        super(options);

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es 2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this.initSbisService();
    }

    protected initSbisService() {
        if (!this._$endpoint.moveContract) {
            this._$endpoint.moveContract = 'IndexNumber';
        }
    }

    // region Public methods

    getOrderProperty(): string {
        return this._$orderProperty;
    }

    setOrderProperty(name: string): void {
        this._$orderProperty = name;
    }

    // endregion

    // region ICrud

    /**
     * Создает пустую модель через источник данных
     * @param meta Дополнительные мета данные, которые могут понадобиться для создания модели.
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/entity:Model}, в случае ошибки - Error.
     * @see {@link Types/source:ICrud#create}
     * @example
     * Создадим нового сотрудника:
     * <pre>
     *    import {SbisService} from 'Types/source';
     *    const dataSource = new SbisService({
     *       endpoint: 'Employee',
     *       keyProperty: '@Employee'
     *    });
     *    dataSource.create().then((employee) => {
     *       console.log(employee.get('FirstName'));
     *    }.then((error) => {
     *       console.error(error);
     *    });
     * </pre>
     * Создадим нового сотрудника по формату:
     * <pre>
     *    import {SbisService} from 'Types/source';
     *    const dataSource = new SbisService({
     *       endpoint: 'Employee',
     *       keyProperty: '@Employee',
     *       binding: {
     *          format: 'getListFormat'
     *       }
     *    });
     *    dataSource.create().then((employee) => {
     *       console.log(employee.get('FirstName'));
     *    }.then((error) => {
     *       console.error(error);
     *    });
     * </pre>
     */
    create<TData = Model>(meta?: IHashMap<unknown>): Promise<TData> {
        return this._loadAdditionalDependencies((ready) => {
            this._connectAdditionalDependencies(super.create(meta) as any, ready);
        });
    }

    /**
     *
     * @param data
     * @param meta
     */
    update<TData = unknown>(
        data: TypesRecord | RecordSet,
        meta?: IHashMap<unknown>
    ): Promise<TData> {
        if (this._$binding.updateBatch && DataMixin.isRecordSetInstance(data)) {
            return this._loadAdditionalDependencies((ready) => {
                this._connectAdditionalDependencies(
                    this._callProvider(
                        this._$binding.updateBatch as string,
                        passUpdateBatch(data as RecordSet, meta),
                        this._getHandlerChain()
                    ).addCallback((key: string[]) => {
                        return this._prepareUpdateResult(data, key);
                    }) as any,
                    ready
                );
            });
        }

        return super.update<TData>(data, meta);
    }

    /**
     * Удаляет запись через источник данных
     * @param keys Первичный ключ, или массив первичных ключей записи
     * @param meta Дополнительные мета данные, которые могут понадобиться для удаления записи
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернёт (если используется автогенерируемый метод БЛ) или вернёт {@link Types/source:DataSet DataSet}, {@link Types/entity:Model Model} (в соответствии с реализацией метода БЛ), в случае ошибки - Error.
     * @example
     * Удалим статью с ключом 'article-id-to-destroy':
     * <pre>
     *     import {SbisService} from 'Types/source';
     *     const dataSource = new SbisService({
     *        endpoint: 'Article',
     *        keyProperty: 'id'
     *     });
     *     dataSource.destroy('article-id-to-destroy').then(() => {
     *         console.log('The article has been deleted successfully');
     *     }).catch((error) => {
     *         console.error('Can\'t delete the article', error);
     *     });
     * </pre>
     * Удалим сотрудника с идентификатором 123321:
     * <pre>
     *      import {SbisService} from 'Types/source';
     *      const dataSource = new SbisService({
     *         endpoint: 'Employee',
     *         keyProperty: 'id'
     *      });
     *      dataSource.destroy(123321).then(() => {
     *         console.log('The employee has been deleted successfully');
     *      }).catch((error) => {
     *         console.error('Can\'t delete the article', error);
     *      });
     * </pre>
     */
    destroy<TData = void>(keys: EntityKey | EntityKey[], meta?: IHashMap<unknown>): Promise<TData> {
        /**
         * Calls destroy method for some BL-Object
         * @param ids BL objects ids
         * @param name BL object name
         * @param meta Meta data
         */
        const callDestroyWithComplexId = (
            ids: string[],
            name: string,
            meta: object
        ): Promise<TData> => {
            return this._callProvider<TData>(
                this._$endpoint.contract === name
                    ? (this._$binding.destroy as string)
                    : buildBlMethodName(name, this._$binding.destroy as string),
                // @ts-ignore
                this._$passing.destroy.call(this, ids, meta),
                this._getHandlerChain()
            );
        };

        if (!(keys instanceof Array)) {
            return callDestroyWithComplexId(
                [getKeyByComplexId(keys)],
                getNameByComplexId(keys, this._$endpoint.contract as string),
                meta as object
            );
        }

        // В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
        const groups = getGroupsByComplexIds(keys, this._$endpoint.contract as string);
        return Promise.all(
            Object.keys(groups).map((name) => {
                return callDestroyWithComplexId(groups[name], name, meta as object);
            })
        ) as unknown as Promise<TData>;
    }

    /**
     *
     * @param query
     */
    query<TData = DataSet>(query?: Query): Promise<TData> {
        query = object.clonePlain(query);
        return this._loadAdditionalDependencies((ready) => {
            this._connectAdditionalDependencies(super.query(query) as any, ready);
        });
    }

    // endregion

    // region ICrudPlus

    /**
     *
     * @param items
     * @param target
     * @param meta
     */
    move<TData = unknown>(items: EntityKey[], target: EntityKey, meta?: IMoveMeta): Promise<TData> {
        const safeMeta = meta || {};
        if (this._$binding.moveBefore) {
            // TODO: поддерживаем старый способ с двумя методами
            return oldMove.call(
                this,
                items,
                target as string,
                safeMeta as IOldMoveMeta
            ) as Promise<TData>;
        }

        if (target !== null) {
            target = getKeyByComplexId(target);
        }

        // На БЛ не могут принять массив сложных идентификаторов,
        // поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
        const groups = getGroupsByComplexIds(items, this._$endpoint.contract as string);
        return Promise.all(
            Object.keys(groups).map((name) => {
                safeMeta.objectName = name;
                const methodName = buildBlMethodName(
                    this._$endpoint.moveContract as string,
                    this._$binding.move as string
                );
                const params = this._$passing.move?.call(this, groups[name], target, safeMeta);
                const handlers = this._getHandlerChain();

                // TODO Удалить в 21.2000, после того как поддержать параметр Sorting во всех реализациях метода  move.
                if (methodName !== 'IndexNumber.Move') {
                    delete params?.Sorting;
                }

                return this._callProvider<TData>(methodName, params, handlers);
            })
        ) as unknown as Promise<TData>;
    }

    // endregion

    // region Remote

    /**
     *
     */
    getProvider(): IAbstract {
        if (!this._provider) {
            this._provider = this._createProvider(this._$provider, {
                endpoint: this._$endpoint,
                options: this._$options,

                // TODO: remove pass 'service' and 'resource'
                service: this._$endpoint.address,
                resource: this._$endpoint.contract,
            } as IProviderOptions);
        }

        return this._provider;
    }

    // endregion

    static es5Constructor(options?: IOptions): void {
        Rpc.es5Constructor.call(this, options);
        // @ts-ignore
        SbisService.prototype.initSbisService.call(this, options);
    }
}

// There are properties owned by the prototype
Object.assign(
    SbisService.prototype,
   {
        '[Types/_source/SbisService]': true,
        _moduleName: 'Types/source:SbisService',

        _$binding: getMergeableProperty<IBinding>({
            create: 'Создать',
            read: 'Прочитать',
            update: 'Записать',
            updateBatch: '',
            destroy: 'Удалить',
            query: 'Список',
            copy: 'Копировать',
            merge: 'Объединить',
            move: 'Move',
            format: '',
        }),

        _$passing: getMergeableProperty<IRemotePassing>({
            create: passCreate,
            read: passRead,
            update: passUpdate,
            destroy: passDestroy,
            query: passQuery,
            copy: passCopy,
            merge: passMerge,
            move: passMove,
        }),

        _$adapter: 'Types/entity:adapter.Sbis',

        _$provider: 'Types/source:provider.SbisBusinessLogic',

        _$orderProperty: 'ПорНомер',

        _$options: getMergeableProperty<IOptionsOption>(
            OptionsMixin.addOptions<IOptionsOption>(Rpc, {
                hasMoreProperty: 'hasMore',

                passAddFieldsFromMeta: false,
            })
        ),
    }
);

register('Types/source:SbisService', SbisService, { instantiate: false });
