/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import ConcatenatedEnumerator from './ConcatenatedEnumerator';
import { IEnumerable } from '../collection';

/**
 * Объединяющее звено цепочки.
 * @class Types/_chain/Concatenated
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Concatenated<T> extends Abstract<T> {
    /**
     * Коллекции для объединения
     */
    protected _items: (T[] | IEnumerable<T>)[];

    /**
     * Конструктор объединяющего звена цепочки.
     * @param source Предыдущее звено.
     * @param items Коллекции для объединения.
     */
    constructor(source: Abstract<T>, items: (T[] | IEnumerable<T>)[]) {
        super(source);
        this._items = items;
    }

    destroy(): void {
        this._items = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): ConcatenatedEnumerator<T> {
        return new ConcatenatedEnumerator(this._previous, this._items);
    }

    // endregion
}

Object.assign(Concatenated.prototype, {
    '[Types/_chain/Concatenated]': true,
    _items: null,
});

Object.defineProperty(Concatenated.prototype, 'shouldSaveIndices', {
    value: false,
});
