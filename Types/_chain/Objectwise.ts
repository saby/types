/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract, { IObject } from './Abstract';
import { enumerator } from '../collection';
import { IHashMap, EntityMarker } from '../_declarations';

/**
 * Цепочка по объекту.
 * @class Types/_chain/Object
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Objectwise<T> extends Abstract<T, string> {
    protected _source: IHashMap<T>;

    constructor(source: IHashMap<T>) {
        if (!(source instanceof Object)) {
            throw new TypeError('Source should be an instance of Object');
        }
        super(source);
    }

    // region IEnumerable

    getEnumerator(): enumerator.Objectwise<T> {
        return new enumerator.Objectwise(this._source);
    }

    each(callback: (item: T, index: string) => void, context?: object): void {
        const keys = Object.keys(this._source);
        const count = keys.length;
        let key;

        for (let i = 0; i < count; i++) {
            key = keys[i];
            callback.call(context || this, this._source[key], key);
        }
    }

    value<S = IObject<T>>(factory?: Function, ...optional: any[]): S {
        if (factory instanceof Function) {
            return super.value(factory) as S;
        }

        return this.toObject() as unknown as S;
    }

    // endregion
    readonly '[Types/_chain/Objectwise]': EntityMarker = true;
}
