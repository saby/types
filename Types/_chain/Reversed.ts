/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import ReversedEnumerator from './ReversedEnumerator';

/**
 * Реверсивное звено цепочки.
 * @class Types/_chain/Reversed
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Reversed<T, U> extends Abstract<T, U> {
    // IEnumerable

    getEnumerator(): ReversedEnumerator<T, U> {
        return new ReversedEnumerator(this._previous);
    }

    // endregion
}

Reversed.prototype['[Types/_chain/Reversed]'] = true;
