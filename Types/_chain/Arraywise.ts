/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import { enumerator } from '../collection';

/**
 * Цепочка по массиву.
 * @class Types/_chain/Array
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Arraywise<T> extends Abstract<T, number> {
    protected _source: T[];

    constructor(source: T[]) {
        if (!(source instanceof Array)) {
            throw new TypeError('Source should be an instance of Array');
        }
        super(source);
    }

    // region IEnumerable

    getEnumerator(): enumerator.Arraywise<T> {
        return new enumerator.Arraywise(this._source);
    }

    each(callback: (item: T, index: number) => void, context?: object): void {
        for (let i = 0, count = this._source.length; i < count; i++) {
            callback.call(context || this, this._source[i], i);
        }
    }

    // endregion

    // region Public

    toArray(): any[] {
        return this._source.slice();
    }

    // endregion
}

Arraywise.prototype['[Types/_chain/Arraywise]'] = true;

Object.defineProperty(Arraywise.prototype, 'shouldSaveIndices', {
    value: false,
});
