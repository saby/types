/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import { EntityMarker } from 'Types/_declarations';
import Abstract from './Abstract';
import FlattenedEnumerator from './FlattenedEnumerator';

/**
 * Разворачивающее звено цепочки.
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Flattened<T> extends Abstract<T> {
    // region IEnumerable

    getEnumerator(): FlattenedEnumerator<T> {
        return new FlattenedEnumerator(this._previous);
    }

    // endregion

    readonly '[Types/_chain/Flattened]': EntityMarker = true;
}
