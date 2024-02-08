/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/* eslint-disable @typescript-eslint/member-ordering */

import IObject from './IObject';
import IObservableObject from './IObservableObject';
import IProducible from './IProducible';
import IEquatable from './IEquatable';
import DestroyableMixin from './DestroyableMixin';
import { cast, serialize } from './factory';
import OptionsToPropertyMixin from './OptionsToPropertyMixin';
import ObservableMixin, { IOptions as IObservableMixinOptions } from './ObservableMixin';
import EventRaisingMixin from './EventRaisingMixin';
import SerializableMixin, {
    IState as IDefaultSerializableState,
    ISignature as ISerializableSignature,
} from './SerializableMixin';
import CloneableMixin from './CloneableMixin';
import ManyToManyMixin from './ManyToManyMixin';
import ReadWriteMixin, { IOptions as IReadWriteMixinOptions } from './ReadWriteMixin';
import FormattableMixin, {
    ISerializableState as IFormattableSerializableState,
    IOptions as IFormattableOptions,
    AdapterDescriptor,
} from './FormattableMixin';
import VersionableMixin, { IOptions as IVersionableMixinOptions } from './VersionableMixin';
import { IReceiver } from './relation';
import { IAdapter, IRecord, ITable } from './adapter';
import { DateTime } from './applied';
import { Field, IFieldDeclaration, IShortDeclaration, UniversalField } from './format';
import { IEnumerable, EnumeratorCallback, enumerator, RecordSet, format } from '../collection';
import { register, create } from '../di';
import { protect, mixin, deprecateExtend, logger } from '../util';
import { Map } from '../shim';
import { ExtendDate, IExtendDateConstructor, EntityMarker } from '../_declarations';
import { isEqual } from '../object';
import IStateful from './IStateful';

/**
 * Свойство, хранящее кэш полей
 */
const $fieldsCache = protect('fieldsCache');

/**
 * Свойство, хранящее клоны полей
 */
const $fieldsClone = protect('fieldsClone');

/**
 * Свойство, хранящее измененные полей
 */
const $changedFields = protect('changedFields');

/**
 * Возможные состояния записи
 */
export type State = 'Added' | 'Deleted' | 'Changed' | 'Unchanged' | 'Detached';

interface IStatesHash {
    [key: string]: State;
}

const STATES: IStatesHash = {
    ADDED: 'Added',
    DELETED: 'Deleted',
    CHANGED: 'Changed',
    UNCHANGED: 'Unchanged',
    DETACHED: 'Detached',
};

/**
 * Префикс названий отношений для полей
 */
const FIELD_RELATION_PREFIX = 'field.';

/**
 * Режим кеширования значений свойств
 * @remark
 * Для оптимизации производительности и минимизации задержек при повторных запросах к свойствам, реализована система кэширования значений в локальном хранилище типа Map.
 * Каждый раз при вызове метода {@link Types/entity:Record#get get}, Record сначала пытается найти значение в кэше.
 *
 * Это особенно важно для сложных типов данных по следующим причинам:
 * - Если кэш не содержит необходимое значение, происходит его вычисление на основе {@link Types/entity:Record#rawData сырых данных} и создается соответствующий экземпляр объекта.
 * - Сложные типы данных не хранятся напрямую в экземпляре Record, их получение требует дополнительного поиска через {@link Types/entity:ManyToManyMixin систему связей}.
 * @typedef {String} CacheMode
 * @variant Objects Режим кэширования: только объекты
 * @variant All Режим кэширования: все значения
 */
enum CacheMode {
    Objects = 'objects',
    All = 'all',
}

type pairsTuple = [string, any, any, boolean];

/**
 * Интерфейс опций конструктора Record
 * @interface Types/entity:IRecordOptions
 * @public
 */
export interface IOptions
    extends IObservableMixinOptions,
        IFormattableOptions,
        IVersionableMixinOptions,
        IReadWriteMixinOptions {
    /**
     * Режим кеширования (по умолчанию - только объекты)
     */
    cacheMode?: CacheMode;
    /**
     * Клонировать значения полей, поддерживающих интерфейс {@link Types/_entity/ICloneable}, и при вызове rejectChanges восстанавливать клонированные значения.
     */
    cloneChanged?: boolean;
    /**
     * Рекордсет, которому принадлежит запись
     */
    owner?: RecordSet;
    /**
     * Текущее состояние записи по отношению к рекордсету
     */
    state?: State;
}

export interface ISerializableState
    extends IDefaultSerializableState,
        IFormattableSerializableState {
    $options: IOptions;
    _format: format.Format;
    _changedFields: string[];
}

/**
 * Возвращает признак примитивного значения (не объекта)
 */
function isPrimitive(value: any): boolean {
    return value && typeof value === 'object' ? false : true;
}

/**
 * Возвращает valueOf от объекта, либо value если это не объект
 */
function getValueOf(value: any): any {
    if (value && typeof value === 'object' && value !== value.valueOf()) {
        return value.valueOf();
    }
    return value;
}

/**
 * Возвращает признак эквивалентности значений с учетом того, что каждое из них может являться объектом, оборачивающим примитивное значение
 */
function isEqualValues(first: any, second: any): boolean {
    if (getValueOf(first) === getValueOf(second)) {
        if (
            !isPrimitive(first) &&
            !isPrimitive(second) &&
            first['[Types/_collection/Enum]'] &&
            second['[Types/_collection/Enum]']
        ) {
            return isEqual(first.getDictionary(), second.getDictionary());
        }
        return true;
    }
    return false;
}

/**
 * Возвращает признак эквивалентности значений с глубоким сравнением
 * @remark
 * Использовать только для отслеживания статуса "измененности" поля
 */
function isDeeplyEqualValues(first: any, second: any): boolean {
    if (isEqual(getValueOf(first), getValueOf(second))) {
        if (isPrimitive(first) && isPrimitive(second)) {
            return true;
        }
        if (first['[Types/_collection/Enum]'] && second['[Types/_collection/Enum]']) {
            return isEqual(first.getDictionary(), second.getDictionary());
        }

        return true;
    }
    return false;
}

/**
 * Функция, определяющая тип значения.
 * @param value Значение, тип которого нужно определить.
 * @remark
 * Обратите внимание, что для сложных типов значений ({@link Types/entity:DateTime DateTime} и массивы) функция возвращает объект типа {@link Types/entity:format#IShortDeclaration IShortDeclaration}.
 * @public
 */
export function getValueType(value: any): string | IShortDeclaration {
    switch (typeof value) {
        case 'boolean':
            return 'boolean';

        case 'number':
            if (value % 1 === 0) {
                return 'integer';
            }
            return 'real';

        case 'object':
            if (value === null) {
                return 'string';
            } else if (value instanceof Record) {
                return 'record';
            } else if (value && value['[Types/_collection/RecordSet]']) {
                return 'recordset';
            } else if (value instanceof Date) {
                if (value['[Types/_entity/applied/Date]']) {
                    return 'date';
                }
                if (value['[Types/_entity/applied/Time]']) {
                    return 'time';
                }
                if (value['[Types/_entity/applied/DateTime]']) {
                    return {
                        type: 'datetime',
                        withoutTimeZone: (value as DateTime).withoutTimeZone,
                    };
                }
                if (value.hasOwnProperty('_serializeMode')) {
                    switch ((value as ExtendDate).getSQLSerializationMode()) {
                        case (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE:
                            return 'date';
                        case (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME:
                            return 'time';
                    }
                }
                return 'datetime';
            } else if (value instanceof Array) {
                const filteredValue = value.filter((item) => {
                    return item === null ? false : true;
                });
                const maxIndex = filteredValue.length - 1;
                return {
                    type: 'array',
                    kind: getValueType(
                        filteredValue.find((item, index) => {
                            if (item === undefined) {
                                return false;
                            } else if (typeof item === 'number') {
                                // For numbers should seek for any element with type 'real' until the end because it's
                                // impossible to find out exact type by first element only
                                const itemType = getValueType(item);
                                if (itemType === 'integer' && index < maxIndex) {
                                    return false;
                                }
                            }
                            return true;
                        })
                    ),
                } as IShortDeclaration;
            } else if (value['[Types/_entity/applied/TimeInterval]']) {
                return 'timeinterval';
            }
            return 'object';

        default:
            return 'string';
    }
}

/**
 * Запись - обертка над данными, которые представлены в виде строки таблицы (объект с набором полей и их значений).
 * @remark
 * Основные аспекты записи:
 * <ul>
 *     <li>одинаковый интерфейс доступа к данным в различных форматах (так называемые {@link rawData "сырые данные"}), например таких как JSON, СБИС-JSON или XML. За определение аспекта отвечает интерфейс {@link Types/_entity/IObject};</li>
 *     <li>одинаковый интерфейс доступа к набору полей. За определение аспекта отвечает интерфейс {@link Types/_collection/IEnumerable};</li>
 *     <li>манипуляции с форматом полей. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin};</li>
 *     <li>манипуляции с сырыми данными посредством адаптера. За реализацию аспекта отвечает примесь {@link Types/_entity/FormattableMixin}.</li>
 * </ul>
 *
 * Создадим запись, в которой в качестве сырых данных используется plain JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *     import {Record} from 'Types/entity';
 *     const employee = new Record({
 *         rawData: {
 *             id: 1,
 *             firstName: 'John',
 *             lastName: 'Smith'
 *         }
 *     });
 *
 *     employee.get('id'); //1
 *     employee.get('firstName'); //John
 * </pre>
 * Создадим запись, в которой в качестве сырых данных используется ответ БЛ СБИС (адаптер для данных в таком формате укажем явно):
 * <pre>
 *     import {Record} from 'Types/entity';
 *     import {SbisService} from 'Types/source';
 *
 *     const source = new SbisService({endpoint: 'Employee'});
 *     source.call('read', {login: 'root'}).then((response) => {
 *         const employee = new Record({
 *             rawData: response.getRawData(),
 *             adapter: response.getAdapter()
 *         });
 *         console.log(employee.get('id'));
 *         console.log(employee.get('firstName'));
 *     });
 * </pre>
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/IObject
 * @implements Types/_entity/IObservableObject
 * @implements Types/_entity/IProducible
 * @implements Types/_entity/IEquatable
 * @implements Types/_collection/IEnumerable
 * @implements Types/_entity/relation/IReceiver
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/ObservableMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/ReadWriteMixin
 * @mixes Types/_entity/FormattableMixin
 * @mixes Types/_entity/VersionableMixin
 * @ignoreOptions owner cloneChanged
 * @ignoreMethods detach
 * @public
 */
export default class Record<T = any>
    extends mixin<
        DestroyableMixin,
        OptionsToPropertyMixin,
        ObservableMixin,
        EventRaisingMixin,
        SerializableMixin,
        CloneableMixin,
        ManyToManyMixin,
        ReadWriteMixin,
        FormattableMixin,
        VersionableMixin
    >(
        DestroyableMixin,
        OptionsToPropertyMixin,
        ObservableMixin,
        EventRaisingMixin,
        SerializableMixin,
        CloneableMixin,
        ManyToManyMixin,
        ReadWriteMixin,
        FormattableMixin,
        VersionableMixin
    )
    implements
        IObject<T>,
        IObservableObject,
        IProducible,
        IEquatable,
        IEnumerable<any>,
        IReceiver,
        IStateful
{
    /**
     * Объект содержащий закэшированные значения полей
     */
    protected get _fieldsCache(): Map<string, any> {
        return this[$fieldsCache as string] || (this[$fieldsCache as string] = new Map());
    }

    /**
     * Объект содержащий клонированные значения полей
     */
    protected get _fieldsClone(): Map<string, any> {
        return this[$fieldsClone as string] || (this[$fieldsClone as string] = new Map());
    }

    /**
     * Данные об измененных полях
     */
    protected get _changedFields(): object {
        const result = {};
        const changedFields = this[$changedFields as string];

        if (!changedFields) {
            return result;
        }

        let data;
        let byLink;
        let value;
        Object.keys(changedFields).forEach((field) => {
            data = changedFields[field];
            value = data[0];
            byLink = data[1];

            // Check record state if it's changed by link
            if (value && byLink && value['[Types/_entity/Record]'] && !value.isChanged()) {
                return;
            }
            result[field] =
                this._haveToClone(value) && this._fieldsClone.has(field)
                    ? this._fieldsClone.get(field)
                    : value;
        });

        return result;
    }

    /**
     * Состояние записи после последнего вызова {@link acceptChanges}
     */
    protected _acceptedState: State;

    /**
     * @typedef {String} RecordState
     * @variant Added Запись была добавлена в рекордсет, но метод {@link acceptChanges} не был вызван.
     * @variant Deleted Запись была отмечена удаленной с использованием метода {@link setState}, но метод {@link acceptChanges} не был вызван.
     * @variant Changed Запись была изменена, но метод {@link acceptChanges} не был вызван. Автоматически переходит в это состояние при изменении любого поля, если до этого состояние было Unchanged.
     * @variant Unchanged С момента последнего вызова {@link acceptChanges} запись не была изменена.
     * @variant Detached Запись не была вставлена ни в один рекордсет, либо запись была удалена из рекордсета.
     */

    /**
     * @cfg {RecordState} Текущее состояние записи по отношению к рекордсету: отражает факт принадлежности записи к рекордсету и сценарий, в результате которого эта принадлежность была сформирована.
     * @name Types/_entity/Record#state
     * @see getState
     * @see setState
     * @see getOwner
     */
    protected _$state: State;

    /**
     * @cfg Режим кеширования (по умолчанию - только объекты)
     */
    protected _$cacheMode: CacheMode;

    /**
     * @cfg {Boolean} Клонировать значения полей, поддерживающих интерфейс {@link Types/_entity/ICloneable}, и при вызове rejectChanges восстанавливать клонированные значения.
     * @name Types/_entity/Record#cloneChanged
     * @see rejectChanges
     */
    protected _$cloneChanged: boolean;

    /**
     * @cfg {Types/_collection/RecordSet} Рекордсет, которому принадлежит запись
     * @name Types/_entity/Record#owner
     */
    protected _$owner: RecordSet;

    /**
     * Конструктор Record, принимающий набор опций в качестве первого аргумента
     * @param [options] Значения опций
     */
    constructor(options?: IOptions) {
        Record.checkOptions(options);

        super(options);

        this.initRecord(options);
    }

    protected initRecord(options?: IOptions) {
        OptionsToPropertyMixin.initMixin(this, options);
        FormattableMixin.initMixin(this);
        ReadWriteMixin.initMixin(this, options);

        this._publish('onPropertyChange');
        this._publish('onStateChange');
        this._clearChangedFields();
        this._acceptedState = this._$state;
    }

    destroy(): void {
        this[$changedFields as string] = null;
        this._clearFieldsCache();

        ReadWriteMixin.prototype.destroy.call(this);
        DestroyableMixin.prototype.destroy.call(this);
    }

    // region IObject

    readonly '[Types/_entity/IObject]': EntityMarker;

    get<K extends keyof T>(name: K): T[K] {
        const cache = this._fieldsCache;
        if (cache.has(name as string)) {
            return cache.get(name as string);
        }

        const value = this._getRawDataValue(name as string);
        if (this._isFieldValueCacheable(value)) {
            this._addChild(value, this._getRelationNameForField(name as string));
            cache.set(name as string, value);
            if (this._haveToClone(value)) {
                this._fieldsClone.set(name as string, value.clone());
            }
        }

        return value;
    }

    set<K extends keyof T>(name: K, value: T[K]): void;
    set(name: Partial<T>): void;
    set<K extends keyof T>(name: K | Partial<T>, value?: T[K]): void {
        const beforeState = this.isChanged();
        const map = this._getHashMap(name, value);
        const errors = [];

        const changed = this._setPairs(
            Object.keys(map).map((key) => {
                return [key, map[key], this.get(key as K), true] as pairsTuple;
            }),
            errors
        );

        if (changed) {
            this._notifyChange(changed);
        }

        if (beforeState && !this.isChanged() && this.getOwner()) {
            this._childChanged(Record.prototype.set);
        }

        this._checkErrors(errors);
    }

    has(name: string): boolean {
        return this._getRawDataFields().indexOf(name) > -1;
    }

    /**
     * Устанавливает значения полей из пар "новое значение => старое значение"
     * @param pairs Массив элементов вида [имя поля, новое значение, старое значение]
     * @param errors Ошибки установки значений по полям
     * @return Изменившиеся значения
     * @protected
     */
    protected _setPairs(pairs: pairsTuple[], errors: string[]): object {
        let changed = null;

        pairs.forEach((item) => {
            const [key, newValue, oldValue, saveInRawData]: pairsTuple = item;
            let value = newValue;

            // Check if value changed
            if (isEqualValues(value, oldValue)) {
                // Update raw data by link if same Object has been set
                if (typeof value === 'object' && saveInRawData) {
                    this._setRawDataValue(key, value);
                }
            } else {
                // Try to set every field
                try {
                    // Work with relations
                    this._removeChild(oldValue);

                    // Save value to rawData
                    if (saveInRawData) {
                        if (isPrimitive(value)) {
                            value = this._setRawDataValue(key, value);
                        } else {
                            this._setRawDataValue(key, value);
                        }
                    }

                    // Work with relations
                    this._addChild(value, this._getRelationNameForField(key));

                    // Compare once again because value can change the type during Factory converting
                    if (value !== oldValue) {
                        if (!this.has(key)) {
                            this._addRawDataField(key);
                        }

                        if (!changed) {
                            changed = {};
                        }
                        changed[key] = value;

                        // Compare new value with initial value
                        if (
                            this._hasChangedField(key) &&
                            isDeeplyEqualValues(this._getChangedFieldValue(key), value) &&
                            !this._isChangedState(value)
                        ) {
                            // Revert changed if new value is equal initial value
                            this._unsetChangedField(key);
                        } else {
                            // Set changed if new value is not equal initial value
                            this._setChangedField(key, oldValue);
                        }

                        // Cache value if necessary
                        if (this._isFieldValueCacheable(value)) {
                            this._fieldsCache.set(key, value);
                            if (this._haveToClone(value)) {
                                this._fieldsClone.set(key, value.clone());
                            }
                        } else {
                            this._fieldsCache.delete(key);
                            this._fieldsClone.delete(key);
                        }
                    }
                } catch (err) {
                    // Collecting errors for every field
                    errors.push(err);
                }
            }
        });

        return changed;
    }

    // endregion

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': EntityMarker;

    /**
     * Возвращает энумератор для перебора названий полей записи
     * @return {Types/_collection/ArrayEnumerator}
     * @example
     * Переберем все поля записи:
     * <pre>
     *     var user = new Record({
     *             rawData: {
     *                 id: 1,
     *                 login: 'dummy',
     *                 group_id: 7
     *             }
     *         }),
     *         enumerator = user.getEnumerator(),
     *         fields = [];
     *
     *     while (enumerator.moveNext()) {
     *         fields.push(enumerator.getCurrent());
     *     }
     *     fields.join(', ');//'id, login, group_id'
     * </pre>
     */
    getEnumerator(): enumerator.Arraywise<any> {
        return create<enumerator.Arraywise<any>>(
            'Types/collection:enumerator.Arraywise',
            this._getRawDataFields()
        );
    }

    /**
     * Возвращает оригинальное значение измененного поля.
     * Если поле не изменено, возвращает текущее значение.
     * @remark
     * Для полей сложных типов ({@link Types/entity:Record Record}, {@link Types/collection:Enum Enum}, {@link Types/collection:Flags Flags}) всегда возвращается текущий объект, т.к. хранение оригинального значения затратно.
     * У полученного объекта можно так же запросить оригинальные значения полей.
     * @param name название поля
     * @example
     * Поменяем значение поля простого типа и получим оригинальное значение:
     * <pre>
     *     import {Record} from 'Types/entity';
     *
     *     const user = new Record({
     *         rawData: {
     *             id: 1,
     *             login: 'dummy',
     *             group_id: 7
     *         }
     *     });
     *
     *     user.set('login', 'admin');
     *     user.getChanged(); // ['login']
     *     user.get('login'); // 'admin'
     *     user.getOriginal('login'); // 'dummy'
     * </pre>
     */
    getOriginal<K extends keyof T>(name: K): T[K] {
        if (this._hasChangedField(name as string) && !this._statefulPrimitive(name, true)) {
            return this._getChangedFieldValue(name as string);
        }

        return this.get(name);
    }

    /**
     * Перебирает все поля записи
     * @param callback Ф-я обратного вызова для каждого поля. Первым аргументом придет название поля, вторым - его значение.
     * @param [context] Контекст вызова callback.
     * @example
     * Переберем все поля записи:
     * <pre>
     *     var user = new Record({
     *             rawData: {
     *                 id: 1,
     *                 login: 'dummy',
     *                 group_id: 7
     *             }
     *         }),
     *         fields = [];
     *
     *     user.each(function(field) {
     *         fields.push(field);
     *     });
     *     fields.join(', ');//'id, login, group_id'
     * </pre>
     */
    each(callback: EnumeratorCallback<any>, context?: object): void {
        const enumerator = this.getEnumerator();
        let name;
        while (enumerator.moveNext()) {
            name = enumerator.getCurrent();
            callback.call(context || this, name, this.get(name));
        }
    }

    // endregion

    // region IObservableObject

    readonly '[Types/_entity/IObservableObject]': EntityMarker;

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker;

    isEqual(to: Record): boolean {
        if (to === this) {
            return true;
        }

        if (!to || !(to instanceof Record)) {
            return false;
        }

        // Если isEqual вызывают до того как инициализированы адаптеры, то на данных не будут инициализированы toJSON,
        // это приводит к тому, что при сериализации не восстанавливаются форматы
        // и рекорды будут ошибочно признаны разными.
        this._getRawDataAdapter();
        to._getRawDataAdapter();

        const rawData = this._getRawData();
        const toRawData = to.getRawData(true);

        // Check that if we have nested records here
        if (rawData instanceof Record) {
            return rawData.isEqual(toRawData);
        }

        return isEqual(rawData, toRawData);
    }

    // endregion

    // region Types/_entity/ICloneable

    clone: <T = this>(shallow?: boolean) => T;

    // endregion

    // region IReceiver

    readonly '[Types/_entity/relation/IReceiver]': EntityMarker;

    relationChanged(which: any, route: string[]): any {
        const checkRawData = (fieldName, target) => {
            const map = {};
            const adapter = this._getRawDataAdapter();
            const hasInRawData = adapter.has(fieldName);

            // Apply child's raw data to the self raw data if necessary
            if (hasInRawData) {
                this._setRawDataValue(fieldName, target, true);
            }

            this._setChangedField(fieldName, target, true);
            map[fieldName] = target;
            this._notifyChange(map, false);

            return map;
        };
        const name = route[0];
        const fieldName = this._getFieldFromRelationName(name);
        const target = which.target;

        switch (which.original) {
            case Record.prototype.acceptChanges:
                if (fieldName && target['[Types/_entity/IStateful]'] && !target.isChanged()) {
                    this.acceptChanges([fieldName]);
                }
                break;

            case Record.prototype.rejectChanges:
                if (fieldName && target['[Types/_entity/IStateful]'] && !target.isChanged()) {
                    if (
                        target['[Types/_collection/Enum]'] &&
                        this._getChangedFieldValue(fieldName) == null
                    ) {
                        this._unsetChangedField(fieldName);

                        if (this.getChanged().length === 0) {
                            this._setState(this._acceptedState);
                        }

                        return;
                    }
                    this.rejectChanges([fieldName]);
                }
                break;

            case Record.prototype.addField:
            case Record.prototype.removeField:
            case Record.prototype.removeFieldAt:
                this._resetRawDataAdapter();
                this._resetRawDataFields();
                if (fieldName) {
                    checkRawData(fieldName, target);
                }
                break;
            case Record.prototype.set:
                if (fieldName && target['[Types/_entity/IStateful]'] && !target.isChanged()) {
                    this._unsetChangedField(fieldName);

                    if (this.getChanged().length === 0) {
                        this._setState(this._acceptedState);
                    }

                    this._notifyChange();
                }
                break;
            default:
                if (fieldName) {
                    const map = checkRawData(fieldName, target);

                    // Set which data to field name => value
                    return {
                        target,
                        data: map,
                    };
                }
        }
    }

    protected _getRelationNameForField(name: string): string {
        return FIELD_RELATION_PREFIX + name;
    }

    protected _getFieldFromRelationName(name: string): string {
        name += '';
        if (name.substr(0, FIELD_RELATION_PREFIX.length) === FIELD_RELATION_PREFIX) {
            return name.substr(FIELD_RELATION_PREFIX.length);
        }
    }

    /**
     * Объединяет запись с данными другой записи
     * @param source Запись, с которой будет произведено объединение
     * @remark
     * В случае совпадения ключей в данных, значение будет взято из объединяемой записи (source)
     * @example
     * Объединим запись пользователя и группы пользователей:
     * <pre>
     *     var user = new Record({
     *             rawData: {
     *                 id: 1,
     *                 login: 'user1',
     *                 group_id: 3
     *             }
     *         }),
     *         userGroup = new Record({
     *             rawData: {
     *                 group_id: 3,
     *                 group_name: 'Domain Users',
     *                 group_members: 126
     *             }
     *         });
     *
     *     user.merge(userGroup);
     *     user.get('id');  //1
     *     user.get('group_id');  //3
     *     user.get('group_name');  //'Domain Users'
     * </pre>
     */
    merge(source: Record): void {
        if (source === this) {
            return;
        }
        try {
            const sourceData = {};
            const recordFormat: format.Format = source.getFormat();
            source.each((key, val) => {
                sourceData[key] = val;

                // TODO: с версии 22.2000 начать выкидывать ошибку
                if (!this._isFormatWritable()) {
                    return;
                }

                if (!this.has(key)) {
                    const fieldFormat = recordFormat.at(recordFormat.getFieldIndex(key));

                    if (fieldFormat) {
                        this.addField(fieldFormat);
                    }
                }
            });
            this.set(sourceData);
        } catch (e) {
            if (e instanceof ReferenceError) {
                logger.info(this._moduleName + '::merge(): ' + e.toString());
            } else {
                throw e;
            }
        }
    }

    // region SerializableMixin

    toJSON(): ISerializableSignature<IOptions>;
    toJSON(key?: unknown): string;
    toJSON(key?: unknown): ISerializableSignature<IOptions> | string {
        return super.toJSON();
    }

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        let resultState: ISerializableState =
            SerializableMixin.prototype._getSerializableState.call(this, state);
        resultState = FormattableMixin.prototype._getSerializableState.call(this, resultState);
        resultState._changedFields = this[$changedFields as string];

        // Keep format if record has owner with format
        if (resultState.$options.owner && resultState.$options.owner.hasDeclaredFormat()) {
            resultState._format = resultState.$options.owner.getFormat();
        }

        delete resultState.$options.owner;

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        const fromFormattableMixin = FormattableMixin.prototype._setSerializableState(state);

        return function (): void {
            fromSerializableMixin.call(this);
            fromFormattableMixin.call(this);

            this[$changedFields] = state._changedFields;
            if (state._format) {
                this._$format = state._format;
            }
        };
    }

    // endregion

    // region FormattableMixin

    setRawData(rawData: any): void {
        super.setRawData(rawData);
        this._nextVersion();
        this._clearFieldsCache();
        this._notifyChange();
    }

    hasDeclaredFormat(): boolean {
        const owner = this.getOwner();
        if (owner) {
            return owner.hasDeclaredFormat();
        } else {
            return super.hasDeclaredFormat();
        }
    }

    addField(format: Field | IFieldDeclaration, at?: number, value?: any): void {
        this._checkFormatIsWritable();
        format = this._buildField(format);

        super.addField(format, at);

        const name = format.getName();
        if (value !== undefined) {
            this.set(name as keyof T, value);
        } else {
            this._notifyChange(
                {
                    [name]: format.getDefaultValue(),
                },
                false
            );
        }
        this._childChanged(Record.prototype.addField);
        this._nextVersion();
    }

    removeField(name: string): void {
        this._checkFormatIsWritable();

        this._fieldsCache.delete(name);
        this._fieldsClone.delete(name);
        this._unsetChangedField(name);

        super.removeField(name);

        this._notifyChange(
            {
                [name]: undefined,
            },
            false
        );
        this._childChanged(Record.prototype.removeField);
        this._nextVersion();
    }

    removeFieldAt(at: number): void {
        this._checkFormatIsWritable();

        const field = this._getFormat(true).at(at);
        let name;
        if (field) {
            name = field.getName();
            this._fieldsCache.delete(name);
            this._fieldsClone.delete(name);
            this._unsetChangedField(name);
        }

        super.removeFieldAt(at);

        if (field) {
            this._notifyChange(
                {
                    [name]: undefined,
                },
                false
            );
        }
        this._childChanged(Record.prototype.removeFieldAt);
        this._nextVersion();
    }

    protected _getFormat(build: boolean): format.Format {
        const owner = this.getOwner();
        if (owner) {
            return (owner as any)._getFormat(build);
        } else {
            return super._getFormat.call(this, build);
        }
    }

    protected _getFieldFormat(name: string, adapter: ITable | IRecord): Field | UniversalField {
        const owner = this.getOwner();
        if (owner) {
            return (owner as any)._getFieldFormat(name, adapter);
        } else {
            return super._getFieldFormat.call(this, name, adapter);
        }
    }

    protected _getRawDataAdapter: () => IRecord;

    /**
     * Создает адаптер для сырых данных
     * @protected
     */
    protected _createRawDataAdapter(): IRecord {
        return (this._getAdapter() as IAdapter).forRecord(this._getRawDataFromOption());
    }

    /**
     * Проверяет, что формат записи доступен для записи. Выкидывает ошибку, если формат только для чтения.
     * @protected
     */
    protected _checkFormatIsWritable(): void {
        if (!this._isFormatWritable()) {
            throw new Error(
                'Record format has read only access if record belongs to recordset. ' +
                    'You should change recordset format instead.'
            );
        }
    }

    /**
     * Признак того, что формат записи доступен для записи
     * @protected
     */
    protected _isFormatWritable(): boolean {
        const owner = this.getOwner();
        return !owner;
    }

    // endregion

    // region Public methods

    /**
     * Возвращает признак, что поле с указанным именем было изменено.
     * Если name не передано, то проверяет, что изменено хотя бы одно поле.
     * @param [name] Имя поля
     * @example
     * Проверим изменилось ли поле title:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *     article.isChanged('title');//false
     *     article.set('title', 'New Title');
     *     article.isChanged('title');//true
     * </pre>
     * Проверим изменилось ли какое-нибудь поле:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *     article.isChanged();//false
     *     article.set('title', 'New Title');
     *     article.isChanged();//true
     * </pre>
     */
    isChanged(name?: string): boolean {
        return name ? this._hasChangedField(name) : this.getChanged().length > 0;
    }

    /**
     * Возвращает рекордсет, которому принадлежит запись. Может не принадлежать рекордсету.
     * @return {Types/_collection/RecordSet|null}
     * @example
     * Проверим владельца записи до и после вставки в рекордсет:
     * <pre>
     *     var record = new Record(),
     *         rs1 = new RecordSet(),
     *         rs2 = new RecordSet();
     *
     *     record.getOwner();//null
     *
     *     rs1.add(record);
     *     record.getOwner() === null;//true
     *     rs1.at(0) === record;//false
     *     rs1.at(0).getOwner() === rs1;//true
     *
     *     rs2.add(record);
     *     record.getOwner() === null;//true
     *     rs2.at(0).getOwner() === rs2;//true
     * </pre>
     */
    getOwner(): RecordSet {
        return this._$owner;
    }

    /**
     * Отвязывает запись от рекордсета: сбрасывает ссылку на владельца и устанавливает состояние detached.
     */
    detach(): void {
        // Enforce to create and init raw data adapter because the instance is now detached from the recordset
        this._getRawDataAdapter();

        this._$owner = null;
        this.setState(STATES.DETACHED);
    }

    /**
     * Возвращает текущее состояние записи.
     * @return {RecordState}
     * @see state
     * @see setState
     * @example
     * Проверим состояние записи до и после вставки в рекордсет, а также после удаления из рекордсета:
     * <pre>
     *     var record = new Record(),
     *         RecordState = Record.RecordState,
     *         rs = new RecordSet();
     *
     *     record.getState() === RecordState.DETACHED;//true
     *
     *     rs.add(record);
     *     record.getState() === RecordState.ADDED;//true
     *
     *     rs.remove(record);
     *     record.getState() === RecordState.DETACHED;//true
     * </pre>
     */
    getState(): State {
        return this._$state;
    }

    /**
     * Устанавливает текущее состояние записи.
     * @param {RecordState} state Новое состояние записи.
     * @see state
     * @see getState
     * @example
     * Пометим запись, как удаленную:
     * <pre>
     *     var record = new Record();
     *     record.setState(Record.RecordState.DELETED);
     * </pre>
     */
    setState(state: State): void {
        this._setState(state);
    }

    /**
     * Возвращает массив названий измененных полей.
     * @return {Array}
     * @example
     * Получим список измененных полей статьи:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             date: new Date(2012, 12, 12),
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.getChanged();//[]
     *
     *     article.set({
     *         date: new Date(),
     *         title: 'New Title'
     *     });
     *     article.getChanged();//['date', 'title']
     * </pre>
     */
    getChanged(): string[] {
        return Object.keys(this._changedFields);
    }

    // region IStateful

    readonly '[Types/_entity/IStateful]': EntityMarker;

    /**
     * Подтверждает изменения состояния записи с момента предыдущего вызова acceptChanges():
     * <ul>
     *     <li>Сбрасывает признак изменения для всех измененных полей;
     *     <li>Меняет {@link state} следующим образом:
     *         <ul>
     *             <li>Added или Changed становится Unchanged;</li>
     *             <li>Deleted становится Detached;</li>
     *             <li>остальные не меняются.</li>
     *         </ul>
     *     </li>
     * </ul>
     * Если передан аргумент fields, то подтверждаются изменения только указанного набора полей. {@link state State} в этом случае меняется только если fields включает в себя весь набор измененных полей.
     * @param [fields] Поля текущего Record, в которых требуется подтвердить изменения. Не распространяется на остальные Record в иерархии, если заданы параметры spread или cascade.
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван acceptChanges для родительского элемента (только для поля, на котором находился дочерний элемент: acceptChanges(['название_поля_с_дочерним_элементом'])).
     * @param [cascade=false] Распространять изменения рекурсивно по вложенным элементам. Если параметр задан, будут вызваны acceptChanges рекурсивно у всех дочерних элементов.
     * @example
     * Подтвердим изменения в записи:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.set('title', 'New Title');
     *     article.getChanged();//['title']
     *     article.setState(Record.RecordState.DELETED);
     *
     *     article.acceptChanges();
     *     article.getChanged();//[]
     *     article.getState() === RecordState.DETACHED;//true
     * </pre>
     * Подтвердим изменение поля brand:
     * <pre>
     *     var car = new Record({
     *         rawData: {
     *             id: 1,
     *             brand: 'Renault'
     *             model: 'Duster'
     *         }
     *     });
     *
     *     car.set({
     *         brand: 'Nissan',
     *         model: 'Terrano'
     *     });
     *
     *     car.acceptChanges(['brand']);
     *     article.getChanged(); //['model']
     *     article.getState() === RecordState.CHANGED; //true
     * </pre>
     */
    acceptChanges(fields?: string[] | boolean, spread?: boolean, cascade?: boolean): void {
        // overload f(p: boolean)
        if (spread === undefined && cascade === undefined && typeof fields === 'boolean') {
            spread = fields;
            fields = undefined;
        }

        // overload f(p: boolean, p: boolean)
        if (cascade === undefined && typeof fields === 'boolean' && typeof spread === 'boolean') {
            cascade = spread;
            spread = fields;
            fields = undefined;
        }

        if (fields === undefined) {
            this.getChanged().forEach((field) => {
                this._acceptField(field, cascade);
            });
            this._clearChangedFields();
        } else {
            if (!(fields instanceof Array)) {
                throw new TypeError('Argument "fields" should be an instance of Array');
            }
            fields.forEach((field) => {
                this._acceptField(field, cascade);
                this._unsetChangedField(field);
            });
        }

        if (this.getChanged().length === 0) {
            switch (this._$state) {
                case STATES.ADDED:
                case STATES.CHANGED:
                    this._setState(STATES.UNCHANGED);
                    break;
                case STATES.DELETED:
                    this._setState(STATES.DETACHED);
                    break;
                case STATES.DETACHED:
                    this._setState(STATES.DETACHED);
            }
        }

        this._acceptedState = this._$state;

        if (spread) {
            this._childChanged(Record.prototype.acceptChanges);
        }
    }

    /**
     * Возвращает запись к состоянию, в котором она была с момента последнего вызова acceptChanges:
     * <ul>
     *     <li>Отменяются изменения всех полей;
     *     <li>{@link state State} возвращается к состоянию, в котором он был сразу после вызова acceptChanges.</li>
     * </ul>
     * Если передан аргумент fields, то откатываются изменения только указанного набора полей. {@link state State} в этом случае меняется только если fields включает в себя весь набор измененных полей.
     * @param [fields] Поля, в которых надо отменить изменения.
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван rejectChanges для родительского элемента (только для поля, на котором находился дочерний элемент: rejectChanges(['название_поля_с_дочерним_элементом']).
     * @param [cascade=false] Отменить изменения всех дочерних элементов рекурсивно. Если параметр задан, будут вызваны rejectChanges рекурсивно у всех дочерних элементов.
     * @example
     * Отменим изменения в записи:
     * <pre>
     *     var article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.set('title', 'New Title');
     *     article.getChanged();//['title']
     *     article.setState(Record.RecordState.DELETED);
     *
     *     article.rejectChanges();
     *     article.getChanged();//[]
     *     article.getState() === RecordState.DETACHED;//true
     *     article.get('title');//'Initial Title'
     * </pre>
     * Отменим изменение поля brand:
     * <pre>
     *     var car = new Record({
     *         rawData: {
     *             id: 1,
     *             brand: 'Renault'
     *             model: 'Duster'
     *         }
     *     });
     *
     *     car.set({
     *         brand: 'Nissan',
     *         model: 'Terrano'
     *     });
     *
     *     car.rejectChanges(['model']);
     *     car.getChanged(); //['brand']
     *     car.get('brand'); //'Nissan'
     *     car.get('model'); //'Duster'
     * </pre>
     */
    rejectChanges(fields?: string[] | boolean, spread?: boolean, cascade?: boolean): void {
        // overload f(p: boolean)
        if (spread === undefined && cascade === undefined && typeof fields === 'boolean') {
            spread = fields;
            fields = undefined;
        }

        // overload f(p: boolean, p: boolean)
        if (typeof fields === 'boolean' && typeof spread === 'boolean') {
            cascade = spread;
            spread = fields;
            fields = undefined;
        }

        const toSet = {};
        if (fields === undefined) {
            fields = this.getChanged();
        } else if (!(fields instanceof Array)) {
            throw new TypeError('Argument "fields" should be an instance of Array');
        }
        fields.forEach((name) => {
            if (this._hasChangedField(name)) {
                toSet[name] = this._getChangedFieldValue(name);
            }
        });

        this.set(toSet);
        for (const name in toSet) {
            if (toSet.hasOwnProperty(name)) {
                this._rejectField(name, cascade);
                this._unsetChangedField(name);
            }
        }

        if (this.getChanged().length === 0) {
            this._setState(this._acceptedState);
        }

        if (spread) {
            this._childChanged(Record.prototype.rejectChanges);
        }
    }

    // end

    /**
     * Возвращает признак возможности вызова методов acceptChanges и rejectChanges для объекта
     * Значения типа Flags и Enum являются простыми, для них всегда нужно вызывать метод acceptChanges и rejectChanges.
     * Для значений типа Record и RecordSet вызывать только, если передан флаг рекурсивности cascade
     * @param [name] название поля со значением в Record
     * @param [cascade=false] признак рекурсивности вызываемого acceptChanges и rejectChanges
     */
    private _statefulPrimitive(value: any, cascade: boolean): boolean {
        return (
            value &&
            !isPrimitive(value) &&
            value['[Types/_entity/IStateful]'] &&
            ((getValueType(value) !== 'record' && getValueType(value) !== 'recordset') || cascade)
        );
    }

    // end

    /**
     * Возвращает значения всех свойств в виде строки формата json
     * @return {String}
     * @example
     * Получим значения всех свойств в виде строки:
     * <pre>
     *     var article = new Model({
     *         rawData: {id: 1, title: 'Article 1'}
     *     });
     *     article.toString();//'{"id": 1, "title": "Article 1"}'
     * </pre>
     */
    toString(): string {
        const result = {};
        this.each((key, value) => {
            result[key] = value;
        });
        return JSON.stringify(result);
    }

    // IStateful

    // region EventRaisingMixin

    setEventRaising(enabled: boolean, analyze?: boolean): void {
        if (analyze) {
            throw new Error('The changes analysis is disabled for Records');
        }

        EventRaisingMixin.prototype.setEventRaising.call(this, enabled, analyze);
    }

    // endregion

    // region Protected methods

    /**
     * Проверяет наличие ошибок
     * @param errors Массив ошибок
     * @protected
     */
    protected _checkErrors(errors: Error[]): void {
        if (errors.length) {
            // Looking for simple Error (use compare by >) that has priority to show.
            let error = errors[0];
            for (let i = errors.length; i > 0; i--) {
                if (error > errors[i]) {
                    error = errors[i];
                }
            }
            throw error;
        }
    }

    /**
     * Возвращает hash map
     * @param name Название поля или набор полей
     * @param [value] Значение поля
     * @protected
     */
    protected _getHashMap<K extends keyof T>(name: K | Partial<T>, value?: T[K]): Partial<T> {
        let map = name;
        if (!(map instanceof Object)) {
            map = {};
            map[name as string] = value;
        }
        return map;
    }

    /**
     * Обнуляет кэш значений полей
     * @protected
     */
    protected _clearFieldsCache(): void {
        this[$fieldsCache as string] = null;
        this[$fieldsClone as string] = null;
    }

    /**
     * Возвращает признак, что значение поля кэшируемое
     * @protected
     */
    protected _isFieldValueCacheable(value: any): boolean {
        switch (this._$cacheMode) {
            case CacheMode.Objects:
                return value instanceof Object;
            case CacheMode.All:
                return true;
        }
        return false;
    }

    /**
     * Возвращает режим работы с клонами значений, поддреживающих клонирование
     * @param value Значение поля
     * @protected
     */
    protected _haveToClone(value: any): boolean {
        return this._$cloneChanged && value && value['[Types/_entity/ICloneable]'];
    }

    /**
     * Возвращает значение поля из "сырых" данных, прогнанное через фабрику
     * @param name Название поля
     * @protected
     */
    protected _getRawDataValue(name: string): any {
        const adapter = this._getRawDataAdapter();
        if (!adapter.has(name)) {
            return;
        }

        const value = adapter.get(name);
        const format = this._getFieldFormat(name, adapter);

        return cast(value, this._getFieldType(format), {
            format,
            adapter: this._getAdapter(),
        });
    }

    /**
     * Конвертирует значение поля через фабрику и сохраняет его в "сырых" данных
     * @param name Название поля
     * @param value Значение поля
     * @param [compatible=false] Значение поля совместимо по типу
     * @protected
     */
    protected _setRawDataValue(name: string, value: any, compatible?: boolean): void {
        if (!compatible && value && value['[Types/_entity/FormattableMixin]']) {
            this._checkAdapterCompatibility(value.getAdapter());
        }

        const adapter = this._getRawDataAdapter();

        value = serialize(value, {
            format: this._getFieldFormat(name, adapter),
            adapter: this.getAdapter(),
        });

        adapter.set(name, value);

        return value;
    }

    /**
     * Уведомляет об изменении полей записи
     * @param [map] Измененные поля
     * @param [spread=true] Распространить по иерархии родителей
     * @protected
     */
    protected _notifyChange(map?: object, spread?: boolean): void {
        map = map || {};
        if (spread === undefined || spread === true) {
            this._childChanged(map);
        }
        this._nextVersion();

        if (this._isNeedNotifyPropertyChange()) {
            this._notify('onPropertyChange', map);
        }
    }

    /**
     * Возвращает признак, что нужно генерировать события об изменении записи
     * @protected
     */
    protected _isNeedNotifyPropertyChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onPropertyChange');
    }

    /**
     * Возвращает признак, что нужно генерировать события об изменении состояния записи
     * @protected
     */
    protected _isNeedNotifyStateChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onStateChange');
    }

    /**
     * Очищает информацию об измененных полях
     * @protected
     */
    protected _clearChangedFields(): void {
        this[$changedFields as string] = {};
    }

    /**
     * Возвращает признак наличия изменений в поле
     * @param name Название поля
     * @protected
     */
    protected _hasChangedField(name: string): boolean {
        return this._changedFields.hasOwnProperty(name);
    }

    /**
     * Возвращает оригинальное значение измененного поля
     * @param name Название поля
     * @protected
     */
    protected _getChangedFieldValue(name: string): any {
        return this._changedFields[name];
    }

    /**
     * Устанавливает признак изменения поля
     * @param name Название поля
     * @param value Старое значение поля
     * @param byLink Значение изменилось по ссылке
     * @protected
     */
    protected _setChangedField(name: string, value: any, byLink?: boolean): void {
        const changedFields = this[$changedFields as string];
        const hasChangedField = changedFields.hasOwnProperty(name);
        switch (this._$state) {
            case STATES.UNCHANGED:
                this._setState(STATES.CHANGED);
                break;
        }

        if (!hasChangedField) {
            changedFields[name] = [value, Boolean(byLink)];
            return;
        }

        const isRecord = value?.['[Types/_entity/Record]'];
        const isChanged = changedFields[name] !== value;
        if (byLink && isRecord && isChanged) {
            changedFields[name] = [value, Boolean(byLink)];
        }
    }

    /**
     * Устанавливает состояние записи.
     * @param state состояние записи.
     */
    protected _setState(state: State): void {
        this._$state = state;

        if (this._isNeedNotifyStateChange()) {
            this._notify('onStateChange', state);
        }
    }

    /**
     * Снимает признак изменения поля
     * @param name Название поля
     * @protected
     */
    protected _unsetChangedField(name: string): void {
        delete this[$changedFields as string][name];
    }

    /**
     * Возвращает признак нахожденения объекта в измененном состоянии (вне контекста данного рекорда)
     * @param value проверяемый объект
     */
    protected _isChangedState(value: IStateful): boolean {
        if (getValueType(value) === 'recordset') {
            return (value as IStateful).isChanged();
        }
        return false;
    }

    /**
     * Принимает изменение значения поля, если тип Flags или Enum
     * Если задан флаг cascade, то изменения применяются и у вложенных Record
     * @param name название поля
     * @param cascade признак рекурсивного прохода по вложенным Record
     */
    protected _acceptField(name: string, cascade: boolean): void {
        const value = this.get<any>(name) as any;
        if (this._statefulPrimitive(value, cascade)) {
            value.acceptChanges(false, cascade);
        }
    }

    /**
     * Откатывает значения поля, если тип Flags или Enum
     * Если задан флаг cascade, то изменения откатываются и у вложенных Record
     * @param name название поля
     * @param cascade признак рекурсивного прохода по вложенным Record
     */
    protected _rejectField(name: string, cascade: boolean): void {
        const value = this.get<any>(name) as any;
        if (this._statefulPrimitive(value, cascade)) {
            value.rejectChanges(false, cascade);
        }
    }

    // endregion

    // region Deprecated

    /**
     * @deprecated
     */
    static extend(mixinsList: any, classExtender: any): Function {
        return deprecateExtend(this, classExtender, mixinsList, 'Types/_entity/Record');
    }

    static checkOptions(options?: IOptions) {
        if (options && options.owner && !options.owner['[Types/_collection/RecordSet]']) {
            throw new TypeError(
                'Records owner should be an instance of Types/collection:RecordSet'
            );
        }
    }

    static es5Constructor(options?: IOptions): void {
        Record.checkOptions(options);

        Record.prototype.initRecord.call(this, options);
    }

    // endregion

    // region Statics

    static get RecordState(): IStatesHash {
        return STATES;
    }

    static get CACHE_MODE_OBJECTS(): CacheMode {
        return CacheMode.Objects;
    }

    static get CACHE_MODE_ALL(): CacheMode {
        return CacheMode.All;
    }

    /**
     * Создает запись по объекту c учетом типов значений полей. Поля добавляются в запись в алфавитном порядке.
     * @example
     * <pre>
     * var record = Record.fromObject({
     *         id: 1,
     *         title: 'title'
     *     }, 'Types/entity:adapter.Json'),
     *     format = record.getFormat();
     * format.each(function(field) {
     *     console.log(field.getName() + ': ' + field.getType());
     * });
     * //output: 'id: Integer', 'title: String'
     * </pre>
     * @param data Объект вида "имя поля" -> "значение поля"
     * @param [adapter='Types/entity:adapter.Json'] Адаптер для сырых данных
     * @static
     */
    static fromObject<T extends object = object>(data: T, adapter?: AdapterDescriptor): Record<T>;
    static fromObject(data: null, adapter?: AdapterDescriptor): null;
    static fromObject<T extends object = object>(data: T, adapter?: AdapterDescriptor): Record<T> {
        if (data === null) {
            return data as null;
        }
        if (data && data instanceof Record) {
            return data;
        }

        const record = new this({
            adapter: adapter || 'Types/entity:adapter.Json',
            format: [],
        });

        let sortNames = [];
        for (const name in data) {
            if (data.hasOwnProperty(name)) {
                sortNames.push(name);
            }
        }
        sortNames = sortNames.sort();

        for (let i = 0, len = sortNames.length; i < len; i++) {
            const name = sortNames[i];
            const value = data[name];

            if (value === undefined) {
                continue;
            }

            Record.addFieldTo(record, name, value);
        }

        record.acceptChanges();

        return record;
    }

    /**
     * Создает запись c набором полей, ограниченных фильтром.
     * @param record Исходная запись
     * @param callback Функция фильтрации полей, аргументами приходят имя поля и его значение. Должна вернуть boolean - прошло ли поле фильтр.
     * @static
     */
    static filter(record: Record, callback: (name: string, value: any) => boolean): Record {
        const result = new Record({
            adapter: record.getAdapter(),
        });

        record.getFormat().each((field) => {
            const name = field.getName();
            const value = record.get(name);
            if (!callback || callback(name, value)) {
                result.addField(field);
                result.set(name, value);
            }
        });

        result.acceptChanges();

        return result;
    }

    /**
     * Добавляет поле в запись. Если формат не указан, то он строится по типу значения поля.
     * @param record Запись
     * @param name Имя поля
     * @param value Значение поля
     * @param [format] Формат поля
     * @static
     */
    protected static addFieldTo(
        record: Record,
        name: string,
        value: unknown,
        format?: IFieldDeclaration
    ): void {
        if (!format) {
            let detectedFormat: IFieldDeclaration = getValueType(value) as IFieldDeclaration;
            if (typeof detectedFormat === 'string') {
                detectedFormat = { name: '', type: detectedFormat };
            }
            detectedFormat.name = name;
            format = detectedFormat;
        }

        record.addField(format, undefined, value);
    }

    /**
     * Создает запись c указанным набором полей
     * @param record Исходная запись
     * @param fields Набор полей, которые следует оставить в записи
     * @static
     */
    protected static filterFields(record: Record, fields: string[]): Record {
        if (!(fields instanceof Array)) {
            throw new TypeError('Argument "fields" should be an instance of Array');
        }

        return Record.filter(record, (name) => {
            return fields.indexOf(name) > -1;
        });
    }

    // endregion

    // region IProducible

    readonly '[Types/_entity/IProducible]': EntityMarker;

    static produceInstance(data?: any, options?: any): any {
        const instanceOptions: IOptions = {
            rawData: data,
        };
        if (options && options.adapter) {
            instanceOptions.adapter = options.adapter;
        }

        return new this(instanceOptions);
    }

    // endregion

    /**
     * @event Происходит после изменения выбранного элемента.
     * @name Types/_entity/Record#onStateChange
     * @param {Env/Event.Object} event Дескриптор события.
     * @param {Types/entity:RecordState} state новое состояние записи.
     * @example
     * <pre>
     *     import {Record} from 'Types/collection';
     *     const article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'Initial Title'
     *         }
     *     });
     *
     *     article.subscribe('onStateChange', (event, state) => {
     *         console.log('New state: ' + state);
     *     });
     *
     *     article.set('title', 'New Title'); // 'NewState: 'changed'
     *     article.getState(); // 'changed'
     *     article.acceptChanges(); // 'NewState: detached'
     *     article.getState(); // 'detached'
     * </pre>
     */
}

Object.assign(Record.prototype, {
    '[Types/_entity/Record]': true,
    '[Types/_collection/IEnumerable]': true,
    '[Types/_entity/IEquatable]': true,
    '[Types/_entity/IObject]': true,
    '[Types/_entity/IObservableObject]': true,
    '[Types/_entity/IProducible]': true,
    '[Types/_entity/relation/IReceiver]': true,
    '[Types/_entity/IStateful]': true,
    _moduleName: 'Types/entity:Record',
    _$state: STATES.DETACHED,
    _$cacheMode: CacheMode.Objects,
    _$cloneChanged: false,
    _$owner: null,
    _acceptedState: undefined,
});

/**
 * Измененные поля и оригинальные значения
 */
Record.prototype[$changedFields as string] = null;

register('Types/entity:Record', Record, { instantiate: false });
