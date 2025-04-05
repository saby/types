/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import IndexedEnumerator from './IndexedEnumerator';

/**
 * Реверсивный энумератор
 * @private
 */
export default class ReversedEnumerator<T, U> extends IndexedEnumerator<T, U> {
    _getItems(): ReturnType<IndexedEnumerator<T, U>['_getItems']> {
        if (!this._items) {
            const items = super._getItems();
            this._items = items;
            items.reverse();

            // Build indices in natural order if necessary
            if (!this.previous.shouldSaveIndices) {
                this._items = items.map((item, index) => {
                    return [index as unknown as U, item[1]];
                }, this);
            }
        }

        return this._items;
    }
}
