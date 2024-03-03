/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import ZippedEnumerator from './ZippedEnumerator';
import { EntityMarker } from '../_declarations';

/**
 * Объединяющее звено цепочки.
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Zipped<TResult, TSource1, TSource2> extends Abstract<TResult> {
    /**
     * Коллекции для объединения
     */
    protected _items: TSource2[];

    /**
     * Конструктор объединяющего звена цепочки.
     * @param source Предыдущее звено.
     * @param items Коллекции для объединения.
     */
    constructor(source: Abstract<TSource1>, items: TSource2[]) {
        super(source);
        this._items = items;
    }

    destroy(): void {
        // @ts-ignore
        this._items = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): ZippedEnumerator<TResult, TSource1, TSource2> {
        return new ZippedEnumerator<TResult, TSource1, TSource2>(
            this._previous as unknown as Abstract<TSource1>,
            this._items
        );
    }

    // endregion
    readonly '[Types/_chain/Zipped]': EntityMarker = true;
}

Object.assign(Zipped.prototype, {
    _items: null,
});
