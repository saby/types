import ICrud, { EntityKey } from './ICrud';
import ICrudPlus from './ICrudPlus';
import IDecorator from './IDecorator';
import OptionsMixin from './OptionsMixin';
import Query from './Query';
import DataSet from './DataSet';
import {
    OptionsToPropertyMixin,
    SerializableMixin,
    Record,
    Model,
    ISerializableState,
} from '../entity';
import { RecordSet } from '../collection';
import { mixin } from '../util';
import { EntityMarker } from 'Types/declarations';

/**
 * @public
 */
export interface IData {
    /**
     * Предварительно выбранные данные для метода {@link Types/source:ICrud#read}.
     */
    read?: Model;
    /**
     * Предварительно выбранные данные для метода {@link Types/source:ICrud#query}.
     */
    query?: DataSet | Error;
    /**
     * Предварительно выбранные данные для метода {@link Types/source:ICrudPlus#copy}.
     */
    copy?: Model;
}

/**
 * @public
 */
export interface IDone {
    /**
     *
     */
    read?: boolean;
    /**
     *
     */
    query?: boolean;
    /**
     *
     */
    copy?: boolean;
}

interface IPrefetchProxySerializableState extends ISerializableState {
    _done: IDone;
}

/**
 * @public
 */
export type ITarget = ICrud | ICrudPlus | (ICrud & IDecorator) | (ICrudPlus & IDecorator);

/**
 * @public
 */
export interface IValidators {
    /**
     *
     */
    read?: (data: Record, done?: IDone, key?: EntityKey, meta?: object) => boolean;
    /**
     *
     */
    query?: (data: DataSet | Error, done?: IDone, query?: Query) => boolean;
    /**
     *
     */
    copy?: (data: Record, done?: IDone, key?: EntityKey, meta?: object) => boolean;
}

/**
 * @public
 */
export interface IOptions {
    /**
     *
     */
    target: ITarget;
    /**
     *
     */
    data?: IData;
    /**
     *
     */
    validators?: IValidators;
}

const defaultValidators: IValidators = {
    read: (data: Record, done?: IDone): boolean => {
        if (data && done && !done.read) {
            done.read = true;
            return true;
        }
        return false;
    },
    query: (data: DataSet | Error, done?: IDone): boolean => {
        if (data && done && !done.query) {
            done.query = true;
            return true;
        }
        return false;
    },
    copy: (data: Record, done?: IDone): boolean => {
        if (data && done && !done.copy) {
            done.copy = true;
            return true;
        }
        return false;
    },
};

export function isDecorator(value: any): value is IDecorator {
    return value['[Types/_source/IDecorator]'];
}

/**
 * Источник данных, который содержит предварительно отобранные данные и возвращает их при первом вызове любого метода для чтения.
 * Второй и последующие вызовы будут переданы на целевой источник данных.
 * @remark
 * <b>Обратите внимание!</b> В качестве значения опции data допускается использование только {@link Types/source:DataSet DataSet}.
 *
 * Создадим источник данных с предварительно отобранными данными для метода query():
 * <pre>
 *     import { PrefetchProxy, Memory, DataSet } from 'Types/source';
 *
 *     const fastFoods = new PrefetchProxy({
 *         data: {
 *             query: new DataSet({
 *                 rawData: [
 *                     {id: 1, name: 'Mret a Panger'},
 *                     {id: 2, name: 'Cofta Cosfee'},
 *                     {id: 3, name: 'AET'},
 *                 ]
 *             })
 *         },
 *         target: new Memory({
 *             data: [
 *                 {id: 1, name: 'Kurger Bing'},
 *                 {id: 2, name: 'DcMonald\'s'},
 *                 {id: 3, name: 'CFK'},
 *                 {id: 4, name: 'Kuicq'}
 *             ],
 *         })
 *     });
 *
 *     // Первый запрос вернет предварительно отобранные данные
 *     fastFoods.query().then((spots) => {
 *         spots.getAll().forEach((spot) => {
 *             console.log(spot.get('name'));//'Mret a Panger', 'Cofta Cosfee', 'AET'
 *         });
 *     }, console.error);
 *
 *     // Второй запрос вернет данные, полученные из целевого источника
 *     fastFoods.query().then((spots) => {
 *         spots.getAll().forEach((spot) => {
 *             console.log(spot.get('name'));//'Kurger Bing', 'DcMonald's', 'CFK', 'Kuicq'
 *         });
 *     }, console.error);
 * </pre>
 *
 * Создадим источник данных с пустым набором предварительно отобранных данных для метода query():
 * <pre>
 *     import { PrefetchProxy, Memory, DataSet } from 'Types/source';
 *
 *     const fastFoods = new PrefetchProxy({
 *         data: {
 *             query: new DataSet()
 *         },
 *         target: new Memory({
 *             data: [
 *                 {id: 1, name: 'Kurger Bing'},
 *                 {id: 2, name: 'DcMonald\'s'},
 *                 {id: 3, name: 'CFK'},
 *                 {id: 4, name: 'Kuicq'}
 *             ],
 *         })
 *     });
 * </pre>
 *
 * Создадим источник данных с предварительно отобранными данными в {@link Types/collection:RecordSet RecordSet} для метода query():
 * <pre>
 *     import { PrefetchProxy, SbisService, DataSet } from 'Types/source';
 *
 *     const recordset = getRecordSetFromSomewhere();
 *     recordset.getAdapter(); // adapter.Sbis
 *
 *     const users = new PrefetchProxy({
 *         data: {
 *             query: new DataSet({
 *                 rawData: recordSet.getRawData(),
 *                 adapter: recordSet.getAdapter()
 *             })
 *         },
 *         target: new SbisService()
 *     });
 * </pre>
 * @public
 */
export default class PrefetchProxy
    extends mixin<OptionsToPropertyMixin, SerializableMixin>(
        OptionsToPropertyMixin,
        SerializableMixin
    )
    implements IDecorator, ICrud, ICrudPlus
{
    readonly '[Types/_source/PrefetchProxy]': EntityMarker = true;

    /**
     * Целевой источник данных.
     */
    //@ts-ignore
    protected _$target: ITarget = null;

    /**
     * Предварительно выбранные данные для методов, которые обеспечивают операции чтения.
     */
    protected _$data: IData = {
        read: undefined,
        query: undefined,
        copy: undefined,
    };

    /**
     * Валидаторы данных, которые решают, являются ли они действительными или нет, и, соответственно, должны ли они возвращать предварительно выбранные данные или вызывать целевой источник.
     * @example
     * В аргументы валидатора передаются:
     * - предварительно выбранные данные для валидируемого метода;
     * - статус отработки по каждому методу;
     * - оригинальные аргументы метода по CRUD-контракту.
     *
     * Давайте закешируем данные за одну минуту.
     * <pre>
     *     import {PrefetchProxy, Memory, DataSet} from 'Types/source';
     *
     *     const EXPIRATION_INTERVAL = 60000;
     *     const EXPIRATION_TIME = Date.now() + EXPIRATION_INTERVAL;
     *
     *     const forecast = new PrefetchProxy({
     *         target: new Memory({
     *             data: [
     *                 {id: 1, name: 'Moscow', temperature: -25},
     *                 {id: 2, name: 'Los Angeles', temperature: 20}
     *             ],
     *         }),
     *         data: {
     *             query: new DataSet({
     *                 rawData: [
     *                     {id: 1, name: 'Moscow', temperature: -23},
     *                     {id: 2, name: 'Los Angeles', temperature: 22}
     *                 ]
     *             })
     *         },
     *         validators: {
     *             query: (data) => {
     *                 return Date.now() < EXPIRATION_TIME;
     *             }
     *         }
     *     });
     *
     *     //First 60 seconds source will be returning prefetched data
     *     forecast.query().then((cities) => {
     *         cities.getAll().forEach((city) => {
     *             console.log(city.get('name') + ': ' + city.get('temperature'));//'Moscow: -25', 'Los Angeles: 20'
     *         });
     *     }, console.error);
     *
     *     //60 seconds later source will be returning updated data
     *     setTimeout(() => {
     *         forecast.query().then((cities) => {
     *             cities.getAll().forEach((city) => {
     *                 console.log(city.get('name') + ': ' + city.get('temperature'));//'Moscow: -23', 'Los Angeles: 22'
     *             });
     *         }, console.error);
     *     }, EXPIRATION_INTERVAL);
     * </pre>
     */
    protected _$validators: IValidators;

    /**
     * По умолчанию и вводится через валидаторы опций, которые объединены вместе.
     */
    protected _validators: IValidators = defaultValidators;

    /**
     * Состояние чтения предварительно выбранных данных.
     */
    protected _done: IDone = {};

    // region IDecorator

    readonly '[Types/_source/IDecorator]': EntityMarker = true;

    // endregion

    // region ICrud

    readonly '[Types/_source/ICrud]': EntityMarker = true;

    // endregion

    // region ICrudPlus

    readonly '[Types/_source/ICrudPlus]': EntityMarker = true;

    /**
     *
     * @param options
     */
    constructor(options: IOptions) {
        super(options);
        OptionsToPropertyMixin.initMixin(this, options);
        this._checkOptions(options);

        // Combine _$validators and _validators together
        if (this._$validators) {
            this._validators = { ...this._validators, ...this._$validators };
        }

        if (!this._$target) {
            throw new ReferenceError('Option "target" is required.');
        }
    }

    /**
     * Возвращает данные для методов, которые обеспечивают операции чтения.
     */
    getData(): IData {
        return { ...this._$data };
    }

    getOriginal<T = ITarget>(): T {
        const original = this._$target;
        return (isDecorator(original) ? original.getOriginal() : original) as T;
    }

    create(meta?: object): Promise<Model> {
        return (this._$target as ICrud).create(meta) as Promise<Model>;
    }

    read(key: EntityKey, meta?: object): Promise<Model> {
        if (
            this._validators.read &&
            this._$data.read &&
            this._validators.read(this._$data.read, this._done, key, meta)
        ) {
            return Promise.resolve(this._$data.read);
        }
        return (this._$target as ICrud).read(key, meta) as Promise<Model>;
    }

    update(data: Record | RecordSet, meta?: object): Promise<void> {
        return (this._$target as ICrud).update(data, meta);
    }

    destroy(keys: EntityKey | EntityKey[], meta?: object): Promise<void> {
        return (this._$target as ICrud).destroy(keys, meta);
    }

    query(query?: Query): Promise<DataSet> {
        if (
            this._validators.query &&
            this._$data.query &&
            this._validators.query(this._$data.query, this._done, query)
        ) {
            if (this._$data.query instanceof Error) {
                return Promise.reject(this._$data.query);
            }
            return Promise.resolve(this._$data.query);
        }
        return (this._$target as ICrud).query(query);
    }

    merge(target: EntityKey, merged: EntityKey | EntityKey[]): Promise<void> {
        return (this._$target as ICrudPlus).merge(target, merged);
    }

    copy(key: EntityKey, meta?: object): Promise<Model> {
        if (
            this._validators.copy &&
            this._$data.copy &&
            this._validators.copy(this._$data.copy, this._done, key, meta)
        ) {
            return Promise.resolve(this._$data.copy);
        }
        return (this._$target as ICrudPlus).copy(key, meta) as Promise<Model>;
    }

    move(items: EntityKey | EntityKey[], target: EntityKey, meta?: object): Promise<void> {
        return (this._$target as ICrudPlus).move(items, target, meta);
    }

    // endregion

    // region OptionsMixin

    getOptions(): object {
        if (this._$target && (this._$target as unknown as OptionsMixin).getOptions) {
            return (this._$target as unknown as OptionsMixin).getOptions();
        }
        return {};
    }

    setOptions(options: object): void {
        if (this._$target && (this._$target as unknown as OptionsMixin).setOptions) {
            return (this._$target as unknown as OptionsMixin).setOptions(options);
        }
        throw new TypeError('Option "target" should be an instance of Types/_source/OptionsMixin');
    }

    // endregion

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): IPrefetchProxySerializableState {
        const resultState = super._getSerializableState(state) as IPrefetchProxySerializableState;
        resultState._done = this._done;

        return resultState;
    }

    _setSerializableState(state: IPrefetchProxySerializableState): Function {
        const fromSerializableMixin = super._setSerializableState(state);
        return function (this: PrefetchProxy): void {
            fromSerializableMixin.call(this);
            this._done = state._done;
        };
    }

    // endregion

    protected _checkOptions(options: IOptions): void {
        if (!options) {
            return;
        }
    }
}

Object.assign(PrefetchProxy.prototype, {
    '[Types/_source/PrefetchProxy]': true,
    _moduleName: 'Types/source:PrefetchProxy',
    _$data: null,
    _$validators: null,
});
