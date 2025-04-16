/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import { EntityMarker } from 'Types/declarations';
import Abstract from './Abstract';
import FlattenedEnumerator from './FlattenedEnumerator';

/**
 * Разворачивающее звено цепочки.
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
