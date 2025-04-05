/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import { EntityMarker } from 'Types/declarations';
import Abstract from './Abstract';
import ReversedEnumerator from './ReversedEnumerator';

/**
 * Реверсивное звено цепочки.
 * @public
 */
export default class Reversed<T, U> extends Abstract<T, U> {
    // IEnumerable

    getEnumerator(): ReversedEnumerator<T, U> {
        return new ReversedEnumerator(this._previous);
    }

    // endregion
    readonly '[Types/_chain/Reversed]': EntityMarker = true;
}
