/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
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
