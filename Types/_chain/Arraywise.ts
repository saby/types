/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import Abstract from './Abstract';
import { enumerator } from '../collection';
import { EntityMarker } from 'Types/declarations';

/**
 * Цепочка по массиву.
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

    readonly '[Types/_chain/Arraywise]': EntityMarker = true;
}

Object.defineProperty(Arraywise.prototype, 'shouldSaveIndices', {
    value: false,
});
