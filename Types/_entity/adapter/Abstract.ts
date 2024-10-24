/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5

 */
import DestroyableMixin from '../DestroyableMixin';
import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';
import SerializableMixin, { ISignature } from '../SerializableMixin';
import { mixin } from '../../util';
import { EntityMarker } from 'Types/declarations';

/**
 * Абстрактный адаптер для данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @public
 */
export default abstract class Abstract
    extends mixin<DestroyableMixin, SerializableMixin>(DestroyableMixin, SerializableMixin)
    implements IAdapter
{
    readonly '[Types/_entity/adapter/IAdapter]': EntityMarker;

    /**
     * Разделитель для обозначения пути в данных
     */
    protected _pathSeparator: string;

    constructor() {
        super();
    }

    getProperty(data: any, property: string): any {
        property = property || '';
        const parts = property.split(this._pathSeparator);
        let result;
        for (let i = 0; i < parts.length; i++) {
            result = i
                ? result
                    ? result[parts[i]]
                    : undefined
                : data
                ? data[parts[i]]
                : undefined;
        }
        return result;
    }

    setProperty(data: any, property: string, value: any): void {
        if (!data || !(data instanceof Object)) {
            return;
        }
        property = property || '';
        const parts = property.split(this._pathSeparator);
        let current = data;
        for (let i = 0, max = parts.length - 1; i <= max; i++) {
            if (i === max) {
                current[parts[i]] = value;
            } else {
                if (current[parts[i]] === undefined) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
        }
    }

    forRecord(): IRecord {
        throw new Error('Method must be implemented');
    }

    forTable(): ITable {
        throw new Error('Method must be implemented');
    }

    getKeyField(_?: any): string | undefined {
        throw new Error('Method must be implemented');
    }

    // region SerializableMixin

    static fromJSON<T = Abstract, K = any>(data: ISignature<K>): T {
        //@ts-ignore
        return SerializableMixin.fromJSON.call(this, data);
    }

    // endregion
}

Object.assign(Abstract.prototype, {
    '[Types/_entity/adapter/Abstract]': true,
    '[Types/_entity/adapter/IAdapter]': true,
    _pathSeparator: '.',
});
