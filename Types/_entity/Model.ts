/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import OurRecord, {
    IOptions as IRecordOptions,
    ISerializableState as IRecordSerializableState,
    pairsTuple,
} from './Record';
import { AdapterDescriptor } from './FormattableMixin';
import InstantiableMixin from './InstantiableMixin';
import IStateful from './IStateful';
import { IState as IDefaultSerializableState } from './SerializableMixin';
import { IAdapter } from './adapter';
import { Compute, ICompute, Track, ITrack } from './functor';
import { enumerator, EnumeratorCallback } from '../collection';
import { create } from '../di';
import { applyMixins, deprecateExtend, logger } from '../util';
import { Map, Set } from '../shim';
import { EntityMarker, IObjectKey } from 'Types/declarations';

/*
 * A flag which indicates that property is calculating at very moment
 */
const isCalculating = Symbol('isCalculating');

/**
 *
 */
export type PropertyDefault<T, U> = (this: T, value?: U) => U;

/**
 * @public
 */
export interface IPropertyGetter<T, U> extends Partial<ICompute>, Partial<ITrack> {
    (this: T, value?: U): U;
    [isCalculating]: boolean;
}
/**
 * @public
 */
export interface IPropertySetter<T, U> extends Partial<ICompute>, Partial<ITrack> {
    (this: T, value: U): U;
    [isCalculating]: boolean;
}

/**
 * @public
 */
export interface IProperty<T = Model, U = any> {
    /**
     * Значение по умолчанию (используется, если свойства нет в сырых данных).
     */
    get?: IPropertyGetter<T, U>;
    /**
     * Метод, возвращающий значение свойства. Первым аргументом придет значение свойства в сырых данных (если оно там есть).
     */
    set?: IPropertySetter<T, U>;
    /**
     * Метод, устанавливающий значение свойства. Если метод вернет значение, отличное от undefined, то будет осуществлена попытка сохранить его в сырых данных.
     */
    def?: string | number | boolean | PropertyDefault<T, U>;
}

/**
 * @public
 */
export interface IOptions extends IRecordOptions {
    /**
     *
     */
    properties?: Record<string, IProperty>;
    /**
     *
     */
    instanceState?: Record<string, unknown>;
    /**
     *
     */
    keyProperty?: string;
}

interface ISerializableState extends IRecordSerializableState {
    $options: IOptions;
    _instanceId: string;
    _isDeleted: boolean;
    _defaultPropertiesValues: Record<string, any>;
}

/*
 * Separator for path in object
 */
const ROUTE_SEPARATOR = '.';

/**
 * Абстрактная модель.
 * Модели обеспечивают доступ к данным и поведению объектов предметной области (сущностям).
 * Такими сущностями могут быть, например, товары, пользователи, документы - и другие предметы окружающего мира, которые вы моделируете в своем приложении.
 * @remark
 * В основе абстрактной модели лежит {@link Types/_entity/Record запись}.
 * Основные аспекты модели (дополнительно к аспектам записи):
 * <ul>
 *    <li>определение {@link Types/_entity/Model#properties собственных свойств} сущности;</li>
 *    <li>{@link Types/_entity/Model#keyProperty уникальный идентификатор сущности} среди ей подобных.</li>
 * </ul>
 *
 * Поведенческие аспекты каждой сущности реализуются ее прикладным модулем в виде публичных методов.
 * Прикладные модели могут внедряться в порождающие их объекты, такие как {@link Types/_source/Base#model источники данных} или {@link Types/_collection/RecordSet#model рекордсеты}.
 *
 * Для реализации конкретной модели используется наследование от абстрактной либо промежуточной.
 *
 * Для корректной {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/serialization/#nota-bene сериализации и клонирования} моделей необходимо выносить их в отдельные модули и указывать имя модуля в свойстве _moduleName каждого наследника:
 * <pre>
 *     //My/Awesome/Model.ts
 *     import {Model} from 'Types/entity';
 *     export default class AwesomeModel extends Model {
 *         protected _moduleName: string = 'My/Awesome/Model';
 *         //...
 *     });
 *
 *     return AwesomeModel;
 * </pre>
 *
 * Определим модель записи автомобиля:
 * <pre>
 *     //My/Awesome/Model.ts
 *     import {Model, format} from 'Types/entity';
 *
 *    export default class Car extends Model{
 *       protected _$format: format.FormatDeclaration = [
 *          {name: 'id', type: 'integer'},
 *          {name: 'brand', type: 'string'},
 *          {name: 'model', type: 'string'},
 *          {name: 'price', type: 'money'}
 *       ];
 *       protected _$keyProperty: string = 'id';
 *       discount(percent: number): string {
 *          // ... some logic here
 *       }
 *     });
 * </pre>
 * Создадим модель записи автомобиля:
 * <pre>
 *     //My/Awesome/DiscountManager.ts
 *     import Car from 'Application/Model/Car';
 *
 *     const car = new Car();
 *     car.set({
 *         brand: 'DeLorean',
 *         model: 'DMC-12',
 *         price: 38000
 *     });
 *     const newPrice = car.discount(20);
 * </pre>
 *
 * Модели могут объединяться по принципу "матрёшки" - сырыми данными одной модели является другая модель. Для организации такой структуры следует использовать {@link Types/_entity/adapter/RecordSet адаптер рекордсета}:
 * <pre>
 *     import {Model, adapter} from 'Types/entity';
 *
 *     class MyEngine extends Model {
 *         protected _$properties = {
 *             fuelType: {
 *                 get() {
 *                     return 'Diesel';
 *                 }
 *             }
 *         }
 *     }
 *
 *     class MyTransmission extends Model {
 *         protected _$properties = {
 *             transmissionType: {
 *                 get() {
 *                     return 'Manual';
 *                 }
 *             }
 *         }
 *     }
 *
 *     const myCar = new MyEngine({
 *         rawData: new MyTransmission({
 *             rawData: {
 *                 color: 'Red',
 *                 fuelType: '',
 *                 transmissionType: ''
 *             }
 *         }),
 *         adapter: new adapter.RecordSet()
 *     });
 *
 *     console.log(myCar.get('fuelType')); // 'Diesel'
 *     console.log(myCar.get('transmissionType')); // 'Manual'
 *     console.log(myCar.get('color')); // 'Red'
 * </pre>
 * @public
 */
class Model<DeclaredType extends object = any>
    extends OurRecord<DeclaredType>
    implements IStateful
{
    readonly '[Types/_entity/Model]': EntityMarker = true;

    /**
     * Описание собственных свойств модели. Дополняет/уточняет свойства, уже существующие в сырых данных.
     * @see {@link getProperties}
     * @example
     * Создадим модель пользователя со свойствами:
     * <ul>
     *     <li>id (чтение/запись, динамическая конвертация, хранится в сырых данных)</li>
     *     <li>group (чтение/запись, хранится в защищенном свойстве)</li>
     *     <li>guid (только чтение, значение по умолчанию генерируется динамически)</li>
     * </ul>
     * <pre>
     *     import {Model, IModelProperty} from 'Types/entity';
     *
     *     interface IGroup {
     *         id: sting
     *         name: sting
     *     }
     *
     *     class User extends Model {
     *         protected _$properties: Record<string,IModelProperty<User>> = {
     *             id: {
     *                 get(value: string): string {
     *                     return '№' + value;
     *                 },
     *                 set(value: string): string {
     *                     return (value + '')[0] === '№' ? value.substr(1) : value;
     *                 }
     *             },
     *             group: {
     *                 get(): IGroup {
     *                     return this._group;
     *                 },
     *                 set(value: IGroup): void {
     *                     this._group = value;
     *                 }
     *             },
     *             guid: {
     *                 def(): number {
     *                     return Math.random() * 999999999999999;
     *                 },
     *                 get(value: number): number {
     *                     return value;
     *                 }
     *             }
     *         },
     *         protected _group: IGroup = null
     *     }
     *
     *     const user = new User({
     *         rawData: {
     *             id: 5,
     *             login: 'Keanu',
     *             firstName: 'Johnny',
     *             lastName: 'Mnemonic',
     *             job: 'Memory stick'
     *         }
     *     });
     *
     *     console.log(user.get('id'));//№5
     *     console.log(user.get('group'));//null
     *     console.log(user.get('guid'));//010a151c-1160-d31d-11b3-18189155cc13
     *     console.log(user.get('job'));//Memory stick
     *     console.log(user.get('uptime'));//undefined
     *
     *     user.set('id', '№6');
     *     console.log(user.getRawData().id);//6
     *
     *     user.set('group', {id: 1, name: 'The One'});
     *     console.log(user.get('group'));//{id: 1, name: 'The One'}
     *
     *     user.set('guid', 'new-one');//ReferenceError 'Model::set(): property "guid" is read only'
     * </pre>
     * Создадим модель пользователя со свойством displayName, которое вычисляется с использованием значений других свойств:
     * <pre>
     *     import {Model, IModelProperty} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _$properties: Record<string,IModelProperty<User>> = {
     *             displayName: {
     *                 get() {
     *                    return this.get('firstName') + ' a.k.a "' + this.get('login') + '" ' + this.get('lastName');
     *                 }
     *             }
     *         }
     *     });
     *
     *     const user = new User({
     *         rawData: {
     *             login: 'Keanu',
     *             firstName: 'Johnny',
     *             lastName: 'Mnemonic'
     *         }
     *     });
     *     console.log(user.get('displayName'));//Johnny a.k.a "Keanu" Mnemonic
     * </pre>
     * Для лучшей производительности изменения в свойствах не отслеживаются. Если требуется генерировать события об изменении свойства, определите его через функтор Track:
     * <pre>
     *     import {Model, IModelProperty, functor} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _nickname: string;
     *         protected _$properties: Record<string,IModelProperty<User>> = {
     *             nickname: {
     *                 get: function(): string {
     *                     return this._nickname;
     *                 }
     *                 set: functor.Track.create(function(value: string) {
     *                     this._nickname = value;
     *                 })
     *             }
     *         }
     *     }
     *
     *     const user = new User();
     *     user.subscribe('onPropertyChange', (changed) => {
     *         console.log('On change', changed);
     *     });
     *
     *     user.set('nickname', 'YouWontKnow'); // Causes console log 'On change {nickname: "YouWontKnow"}'
     * </pre>
     * Если вы используете модель в рекордсете, то вы можете обеспечить передачу значений свойств, хранящихся на экземпляре модели, передав имя свойства в функтор Track:
     * <pre>
     *     import {Model, IModelProperty, functor} from 'Types/entity';
     *     import {RecordSet} from 'Types/collection';
     *
     *     class Avenger extends Model {
     *         protected _nickname: string;
     *         protected _$properties: Record<string,IModelProperty<User>> = {
     *             nickname: {
     *                 get: function(): string {
     *                     return this._nickname;
     *                 }
     *                 set: functor.Track.create(function(value: string) {
     *                     this._nickname = value;
     *                 }, '_nickname')
     *             }
     *         }
     *     }
     *
     *     const avengers = new RecordSet({model: Avenger});
     *
     *     const originalFury = new Avenger();
     *     originalFury.set('nickname', 'Nick Fury');
     *
     *     const addedFury = avengers.add(originalFury);
     *     console.log(originalFury === addedFury); // false
     *     console.log(addedFury.get('nickname')); // 'Nick Fury'
     * </pre>
     * Можно явно указать список свойств, от которых зависит другое свойство. В этом случае для свойств-объектов будет сбрасываться кэш, хранящий результат предыдущего вычисления:
     * <pre>
     *     import {Model, IModelProperty, functor} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _$properties: Record<string,IModelProperty> = {
     *             birthDay: {
     *                 get: functor.Compute.create(function(): Date {
     *                     return this.get('facebookBirthDay') || this.get('linkedInBirthDay');
     *                 }, ['facebookBirthDay', 'linkedInBirthDay'])
     *             }
     *         }
     *     }
     *
     *     const user = new User();
     *     user.set('linkedInBirthDay', new Date(2010, 1, 2));
     *     console.log(user.get('birthDay')); // Tue Feb 02 2010 00:00:00
     *
     *     user.set('facebookBirthDay', new Date(2011, 3, 4));
     *     console.log(user.get('birthDay')); // Mon Apr 04 2011 00:00:00
     * </pre>
     */
    protected _$properties: Record<string, IProperty>;

    /**
     * Название свойства, содержащего первичный ключ
     * @see {@link getKeyProperty}
     * @see {@link setKeyProperty}
     * @see {@link getKey}
     * @example
     * Зададим первичным ключом модели свойство с названием id:
     * <pre>
     *    var article = new Model({
     *       keyProperty: 'id',
     *       rawData: {
     *          id: 1,
     *          title: 'How to make a Model'
     *       }
     *    });
     *    article.getKey(); // 1
     * </pre>
     */
    protected _$keyProperty: string;

    /**
     * Модель удалена в источнике данных, из которого она взята.
     */
    protected _isDeleted: boolean;

    /**
     * Модель изменена.
     */
    protected _isChanged: boolean;

    /**
     * Значения по умолчанию для вычисляемых свойств.
     */
    protected _defaultPropertiesValues: Record<string, any>;

    /**
     * Карта зависимостей свойств, такая как 'имя свойства' -> ['имена свойств, которые зависят от этого']
     */
    protected _propertiesDependency: Map<string, Set<string>>;

    /**
     * Имя свойства, для которого сейчас собираются зависимости.
     */
    protected _propertiesDependencyGathering: string | undefined;

    /**
     * Свойства задаются через параметры конструктора.
     */
    protected _propertiesInjected: boolean;

    /**
     * Имена свойств и значения, которые были затронуты во время вызовов рекурсивного метода set().
     */
    protected _deepChangedProperties: object | null;

    // endregion

    // region IStateful

    readonly '[Types/_entity/IStateful]': EntityMarker = true;

    // тип для итератора по вычисляемым свойствам.
    [key: string]: unknown;

    constructor(options?: IOptions) {
        super(options);

        this.initModel(options);
    }

    protected initModel(options?: IOptions): void {
        this._propertiesInjected = !!options && 'properties' in options;

        if (options && options.instanceState) {
            this._setInstanceState(options.instanceState);
        }

        // Support deprecated  option 'idProperty'
        if (!this._$keyProperty && options && (options as any).idProperty) {
            this._$keyProperty = (options as any).idProperty;
        }

        // FIXME: backward compatibility for _options
        if (this._options) {
            // for _$properties
            if (this._options.properties) {
                const properties = {};
                Object.assign(properties, this._$properties);
                Object.assign(properties, this._options.properties);
                this._$properties = properties;
            }

            // for _$keyProperty get from deprecated option 'idProperty'
            if (!this._$keyProperty && this._options.idProperty) {
                this._$keyProperty = this._options.idProperty;
            }
        }
    }

    destroy(): void {
        //@ts-ignore
        this._defaultPropertiesValues = null;
        //@ts-ignore
        this._propertiesDependency = null;
        //@ts-ignore
        this._deepChangedProperties = null;

        super.destroy();
    }

    // region IObject
    get<K extends keyof DeclaredType>(name: K): DeclaredType[K] {
        this._pushDependency(name as string);

        if (this._fieldsCache.has(name as string)) {
            return this._fieldsCache.get(name as string);
        }

        const property = this._$properties && this._$properties[name as string];

        const superValue = super.get(name);
        if (!property) {
            return superValue;
        }

        let preValue = superValue;
        if ('def' in property && !this._getRawDataAdapter().has(name as string)) {
            preValue = this.getDefault(name as string);
        }

        if (!property.get) {
            return preValue;
        }

        const value = this._processCalculatedValue(name as string, preValue, property.get, true);

        if (value !== superValue) {
            this._removeChild(superValue);
            this._addChild(value, this._getRelationNameForField(name as string));
        }

        if (this._isFieldValueCacheable(value)) {
            this._fieldsCache.set(name as string, value);
        } else if (this._fieldsCache.has(name as string)) {
            this._fieldsCache.delete(name as string);
        }
        return value;
    }

    set<K extends keyof DeclaredType>(name: K, value: DeclaredType[K]): void;
    set(name: Partial<DeclaredType>): void;
    set<K extends keyof DeclaredType>(
        name: K | Partial<DeclaredType>,
        value?: DeclaredType[K]
    ): void {
        if (!this._$properties) {
            // @ts-ignore не понятно почему это ошибка, если сигнатура одинаковая
            super.set(name, value);
            return;
        }

        const map = this._getHashMap(name, value);
        const pairs: pairsTuple[] = [];
        const propertiesErrors: Error[] = [];
        const hasCalculating =
            this._$properties &&
            Object.values(this._$properties).some((property) => {
                return (
                    (property.get && property.get[isCalculating]) ||
                    (property.set && property.set[isCalculating])
                );
            });

        Object.keys(map).forEach((key) => {
            const typedKey = key as keyof DeclaredType;
            this._deleteDependencyCache(key);

            // Try to set every property
            let value = map[typedKey];
            try {
                const property = this._$properties && this._$properties[key];
                if (property) {
                    if (property.set) {
                        // Get old value for tracking property
                        const isTracking = Track.isFunctor(property.set);
                        const oldValue = isTracking ? this.get(key as K) : undefined;

                        // Remove cached value
                        if (this._fieldsCache.has(key)) {
                            this._removeChild(this._fieldsCache.get(key));
                            this._fieldsCache.delete(key);
                        }

                        // Calculate new value
                        value = this._processCalculatedValue(key, value, property.set, false);
                        const storeInRawData = value !== undefined;

                        if (isTracking) {
                            // Track value change by adding in pairs
                            pairs.push([key, this.get(key as K), oldValue, storeInRawData]);
                            return;
                        } else if (!storeInRawData) {
                            // Just continue if there is nothing to save in raw data
                            return;
                        }
                    } else if (property.get) {
                        propertiesErrors.push(new ReferenceError(`Property "${key}" is read only`));
                        return;
                    }
                }

                pairs.push([key, value, OurRecord.prototype.get.call(this, key), true]);
            } catch (err) {
                // Collecting errors for every property
                if (err instanceof Error) {
                    propertiesErrors.push(err);
                }
            }
        });

        // Collect pairs of properties
        const pairsErrors: Error[] = [];
        let changedProperties = super._setPairs(pairs, pairsErrors);

        if (hasCalculating && changedProperties) {
            // Here is the set() that recursive calls from another set() so just accumulate the changes
            this._deepChangedProperties = this._deepChangedProperties || {};
            Object.assign(this._deepChangedProperties, changedProperties);
        } else if (!hasCalculating && this._deepChangedProperties) {
            // Here is the top level set() so do merge with accumulated changes
            if (changedProperties) {
                Object.assign(this._deepChangedProperties, changedProperties);
            }
            changedProperties = this._deepChangedProperties;
            this._deepChangedProperties = null;
        }

        // It's top level set() so notify changes if have some
        if (!hasCalculating && changedProperties) {
            const changed = Object.keys(changedProperties).reduce(
                (memo: Record<string, any>, key) => {
                    memo[key] = this.get(key as K);
                    return memo;
                },
                {}
            );
            this._notifyChange(changed);
        }

        this._checkErrors([...propertiesErrors, ...pairsErrors]);
    }

    has<K extends keyof DeclaredType>(name: K): boolean {
        return (this._$properties && this._$properties.hasOwnProperty(name)) || super.has(name);
    }

    // endregion

    // region IEnumerable

    /**
     * Возвращает энумератор для перебора названий свойств модели
     * @example
     * Смотри пример {@link Types/entity:Record#getEnumerator для записи}:
     */
    getEnumerator(): enumerator.Arraywise<string> {
        return create<enumerator.Arraywise<string>>(
            'Types/collection:enumerator.Arraywise',
            this._getAllProperties()
        );
    }

    /**
     * Перебирает все свойства модели (включая имеющиеся в "сырых" данных)
     * @param callback Ф-я обратного вызова для каждого свойства. Первым аргументом придет название свойства, вторым - его значение.
     * @param context Контекст вызова callback.
     * @example
     * Смотри пример {@link Types/entity:Record#each для записи}:
     */
    each(callback: EnumeratorCallback<any>, context?: object): void {
        return super.each(callback, context);
    }

    // endregion

    // region IReceiver

    relationChanged(which: any, route: string[]): any {
        // Delete cache for properties related of changed one use in-deep route
        const curr: string[] = [];
        const routeLastIndex = route.length - 1;
        route.forEach((name, index) => {
            const fieldName = this._getFieldFromRelationName(name);
            if (fieldName) {
                curr.push(fieldName);
                this._deleteDependencyCache(curr.join(ROUTE_SEPARATOR));

                if (index === routeLastIndex && which.data instanceof Object) {
                    Object.keys(which.data).forEach((key) => {
                        this._deleteDependencyCache(curr.concat([key]).join(ROUTE_SEPARATOR));
                    });
                }
            }
        });

        return super.relationChanged(which, route);
    }

    getInstanceState<T = Record<string, any>>(): T | null {
        if (!this._$properties) {
            return null;
        }

        return Object.keys(this._$properties)
            .map((propertyName) => {
                const property = this._$properties[propertyName];
                let name;
                if (Track.isFunctor(property.get)) {
                    name = property.get.propertyName;
                }
                if (!name && Track.isFunctor(property.set)) {
                    name = property.set.propertyName;
                }
                return name;
            })
            .filter((name) => {
                return !!name;
            })
            .reduce<T>((memo, name) => {
                let localMemo = memo;
                if (name === undefined) {
                    return localMemo;
                }
                const value = this[name];
                if (value !== undefined) {
                    localMemo = memo;
                    // @ts-ignore
                    localMemo[name] = this[name];
                }
                return localMemo;
            }, {} as T);
    }

    protected _setInstanceState<T extends Record<string, any> = Record<string, any>>(
        this: any,
        state: T
    ): void {
        if (!state) {
            return;
        }
        Object.keys(state).forEach((name) => {
            this[name] = state[name];
        });
    }

    // IStateful

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        const resultState = super._getSerializableState(state) as ISerializableState;

        // Properties are owned by class, not by instance
        if (!this._propertiesInjected) {
            delete resultState.$options.properties;
        }

        resultState._instanceId = this.getInstanceId();
        resultState._isDeleted = this._isDeleted;
        if (this._defaultPropertiesValues) {
            resultState._defaultPropertiesValues = this._defaultPropertiesValues;
        }

        return resultState;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSuper = super._setSerializableState(state);
        return function (this: Model): void {
            fromSuper.call(this);

            this._instanceId = state._instanceId;
            this._isDeleted = state._isDeleted;
            if (state._defaultPropertiesValues) {
                this._defaultPropertiesValues = state._defaultPropertiesValues;
            }
        };
    }

    // endregion

    // region OurRecord

    rejectChanges(fields?: string[] | boolean, spread?: boolean, cascade?: boolean): void {
        super.rejectChanges(fields, spread, cascade);
        if (!(fields instanceof Array)) {
            this._isChanged = false;
        }
    }

    acceptChanges(fields?: string[] | boolean, spread?: boolean, cascade?: boolean): void {
        super.acceptChanges(fields, spread, cascade);
        if (!(fields instanceof Array)) {
            this._isChanged = false;
        }
    }

    isChanged(name?: string): boolean {
        if (!name && this._isChanged) {
            return true;
        }
        return super.isChanged(name);
    }

    // endregion

    // region Public methods

    /**
     * Возвращает описание свойств модели.
     * @example
     * Получим описание свойств модели:
     * <pre>
     *     import {Model, IModelProperty} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _$properties: Record<string,IModelProperty<User>> = {
     *             id: {
     *                 get(): number {
     *                     return this._id;
     *                 },
     *                 set(value: number): void {
     *                     this._id = value;
     *                 }
     *             },
     *             group: {
     *                 get(): number {
     *                     return this._group;
     *                 }
     *             }
     *         };
     *         protected _id: number = 0;
     *         protected _group: number = null
     *     }
     *
     *     const user = new User();
     *
     *     console.log(user.getProperties()); // {id: {get: Function, set: Function}, group: {get: Function}}
     * </pre>
     */
    getProperties(): Record<string, IProperty> {
        return this._$properties;
    }

    /**
     * Возвращает значение свойства по умолчанию
     * @param name Название свойства
     * @example
     * Получим дефолтное значение свойства id:
     * <pre>
     *     import {Model, IModelProperty} from 'Types/entity';
     *
     *     class User extends Model {
     *         protected _$properties: Record<string,IModelProperty<User>> = {
     *             id: {
     *                 get(): number {
     *                     this._id;
     *                 },
     *                 def(): number {
     *                     return Date.now();
     *                 }
     *             }
     *         };
     *         protected _id: number = 0;
     *     }
     *
     *     const user = new User();
     *     console.log(user.getDefault('id')); // 1466419984715
     *     setTimeout(() => {
     *         console.log(user.getDefault('id')); // still 1466419984715
     *     }, 1000);
     * </pre>
     */
    getDefault(name: string): any {
        let defaultPropertiesValues = this._defaultPropertiesValues;
        if (!defaultPropertiesValues) {
            defaultPropertiesValues = this._defaultPropertiesValues = {};
        }

        if (!defaultPropertiesValues.hasOwnProperty(name)) {
            const property = this._$properties[name];
            if (property && 'def' in property) {
                defaultPropertiesValues[name] = [
                    property.def instanceof Function ? property.def.call(this) : property.def,
                ];
            } else {
                defaultPropertiesValues[name] = [];
            }
        }
        return defaultPropertiesValues[name][0];
    }

    /**
     * Объединяет модель с данными другой модели
     * @param source Модель, с которой будет произведено объединение
     * @example
     * Объединим модели пользователя и группы пользователей:
     * <pre>
     *     var user = new Model({
     *             rawData: {
     *                 id: 1,
     *                 login: 'user1',
     *                 group_id: 3
     *             }
     *         }),
     *         userGroup = new Model({
     *             rawData: {
     *                 group_id: 3,
     *                 group_name: 'Domain Users',
     *                 group_members: 126
     *             }
     *         });
     *
     *     user.merge(userGroup);
     *     user.get('id');//1
     *     user.get('group_id');//3
     *     user.get('group_name');//'Domain Users'
     * </pre>
     */
    merge(source: Model): void {
        super.merge(source);
    }

    /**
     * Возвращает значение первичного ключа модели
     * @see {@link getKeyProperty}
     * @see {@link setKeyProperty}
     * @example
     * Получим значение первичного ключа статьи:
     * <pre>
     *    var article = new Model({
     *       keyProperty: 'id',
     *       rawData: {
     *          id: 1,
     *          title: 'How to make a Model'
     *       }
     *    });
     *    article.getKey(); // 1
     * </pre>
     */
    getKey(): IObjectKey {
        const keyProperty = this.getKeyProperty();
        if (!keyProperty) {
            logger.info(this._moduleName + '::getKey(): keyProperty is not defined');
            //@ts-ignore
            return undefined;
        }
        //@ts-ignore
        return this.get(keyProperty);
    }

    /**
     * Возвращает название свойства, в котором хранится первичный ключ модели
     * @see {@link setKeyProperty}
     * @see {@link getKey}
     * @example
     * Получим название свойства первичного ключа:
     * <pre>
     *    var article = new Model({
     *       keyProperty: 'id',
     *       rawData: {
     *          id: 1,
     *          title: 'How to make a Model'
     *       }
     *    });
     *    article.getKeyProperty();//'id'
     * </pre>
     */
    getKeyProperty(): string {
        if (!this._$keyProperty) {
            this._$keyProperty =
                (this._getAdapter() as IAdapter).getKeyField(this._getRawData()) || '';
        }
        return this._$keyProperty;
    }

    /**
     * Устанавливает название свойства, в котором хранится первичный ключ модели
     * @param name Название свойства для первичного ключа модели.
     * @see {@link getKeyProperty}
     * @see {@link getKey}
     * @example
     * Зададим название свойства первичного ключа:
     * <pre>
     *    var article = new Model({
     *       rawData: {
     *          id: 1,
     *          title: 'How to make a Model'
     *       }
     *    });
     *    article.setKeyProperty('id');
     *    article.getKey(); // 1
     * </pre>
     */
    setKeyProperty(name: string): void {
        if (this._$keyProperty === name) {
            return;
        }
        if (name && !this.has(name as keyof DeclaredType)) {
            logger.info(
                this._moduleName + '::setKeyProperty(): property "' + name + '" is not defined'
            );
            return;
        }
        this._$keyProperty = name;
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает массив названий всех свойств (включая свойства в "сырых" данных)
     */
    protected _getAllProperties(): string[] {
        const fields = this._getRawDataFields();
        if (!this._$properties) {
            return fields;
        }

        const objProps = this._$properties;
        const props = Object.keys(objProps);
        return props.concat(
            fields.filter((field) => {
                return !objProps.hasOwnProperty(field);
            })
        );
    }

    /**
     * Вычисляет/записывает значение свойства
     * @param name Имя свойства
     * @param value Значение свойства
     * @param method Метод вычисления свойства
     * @param isReading Вычисление или запись
     */
    protected _processCalculatedValue(
        name: string,
        value: any,
        method: IPropertyGetter<Model, unknown>,
        isReading?: boolean
    ): any {
        // Check for recursive calculating
        if (method[isCalculating]) {
            throw new Error(
                `Recursive value ${
                    isReading ? 'reading' : 'writing'
                } detected for property "${name}"`
            );
        }

        // Initial conditions
        const isFunctor = isReading && Compute.isFunctor(method);
        const doGathering = isReading && !isFunctor;

        // Automatic dependencies gathering
        let prevGathering;
        if (isReading) {
            prevGathering = this._propertiesDependencyGathering;
            this._propertiesDependencyGathering = doGathering ? name : '';
        }

        // Save user defined dependencies
        if (isFunctor) {
            method.properties?.forEach((dependFor) => {
                this._pushDependencyFor(dependFor, name);
            });
        }

        // Get or set property value
        try {
            method[isCalculating] = true;
            value = method.call(this, value);
        } finally {
            if (isReading) {
                this._propertiesDependencyGathering = prevGathering;
            }
            method[isCalculating] = false;
        }

        return value;
    }

    /**
     * Добавляет зависимое свойство для текущего рассчитываемого
     * @param name Название свойства.
     */
    protected _pushDependency(name: string): void {
        if (this._propertiesDependencyGathering && this._propertiesDependencyGathering !== name) {
            this._pushDependencyFor(name, this._propertiesDependencyGathering);
        }
    }

    /**
     * Добавляет зависимое свойство
     * @param name Название свойства.
     * @param dependFor Название свойства, которое зависит от name
     */
    protected _pushDependencyFor(name: string, dependFor: string): void {
        let propertiesDependency = this._propertiesDependency;
        if (!propertiesDependency) {
            propertiesDependency = this._propertiesDependency = new Map();
        }

        let data;
        if (propertiesDependency.has(name)) {
            data = propertiesDependency.get(name);
        } else {
            data = new Set<string>();
            propertiesDependency.set(name, data);
        }
        if (data && !data.has(dependFor)) {
            data.add(dependFor);
        }
    }

    /**
     * Удаляет закешированное значение для свойства и всех от него зависимых свойств
     * @param name Название свойства.
     */
    protected _deleteDependencyCache(name: string): void {
        const propertiesDependency = this._propertiesDependency;

        if (propertiesDependency && propertiesDependency.has(name)) {
            propertiesDependency.get(name)?.forEach((related) => {
                this._removeChild(this._fieldsCache.get(related));
                const wasCached = this._fieldsCache.delete(related);
                this._fieldsClone.delete(related);
                // If cached property cleared that means it's not changed.
                if (wasCached) {
                    this._unsetChangedField(related);
                }

                this._deleteDependencyCache(related);
            });
        }
    }

    // endregion

    // region Statics
    static fromObject<T extends object = object>(data: T, adapter?: AdapterDescriptor): Model {
        return OurRecord.fromObject.call(this, data, adapter) as unknown as Model;
    }

    // endregion

    // region Deprecated
    static extend(mixinsList: any, classExtender: any): Function {
        return deprecateExtend(this, classExtender, mixinsList, 'Types/_entity/Model');
    }

    static es5Constructor(options?: IOptions): void {
        OurRecord.es5Constructor.call(this, options);

        Model.prototype.initModel.call(this, options);
    }

    // endregion
}

applyMixins(Model, InstantiableMixin);

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Model<DeclaredType extends object = any>
    extends OurRecord<DeclaredType>,
        InstantiableMixin,
        IStateful {}

Object.assign(Model.prototype, {
    '[Types/_entity/Model]': true,
    '[Types/_entity/IStateful]': true,
    _moduleName: 'Types/entity:Model',
    _instancePrefix: 'model-',
    _$properties: null,
    _$keyProperty: '',
    _isDeleted: false,
    _defaultPropertiesValues: null,
    _propertiesDependency: null,
    _propertiesDependencyGathering: '',
    _deepChangedProperties: null,
    getId: Model.prototype.getKey,
    getIdProperty: Model.prototype.getKeyProperty,
    setIdProperty: Model.prototype.setKeyProperty,
});

export default Model;

/**
 *
 */
export type ModelConstructor<DeclaredType extends object = any> = new () => Model<DeclaredType>;

// FIXME: backward compatibility for Core/core-extend: Model should have exactly its own property 'produceInstance'
// @ts-ignore
Model.produceInstance = OurRecord.produceInstance;
