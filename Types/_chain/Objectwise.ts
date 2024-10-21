/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import { enumerator } from '../collection';
import { EntityMarker } from 'Types/declarations';

/**
 * Цепочка по объекту.
 * @public
 */
export default class Objectwise<T> extends Abstract<T, string> {
    protected _source: Record<string, T>;

    constructor(source: Record<string, T>) {
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

    value<S = Record<string, T>>(factory?: Function, ..._optional: any[]): S {
        if (factory instanceof Function) {
            return super.value(factory) as S;
        }

        return this.toObject() as unknown as S;
    }

    // endregion
    readonly '[Types/_chain/Objectwise]': EntityMarker = true;
}
