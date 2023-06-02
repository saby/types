/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import { CompareFunction } from '../_declarations';
import Abstract from './Abstract';
import SortedEnumerator from './SortedEnumerator';

/**
 * Сортирующее звено цепочки.
 * @class Types/_chain/Sorted
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Sorted<T, U> extends Abstract<T, U> {
    /**
     * Функция сравнения
     */
    protected _compareFunction: CompareFunction<T>;

    /**
     * Конструктор сортирующего звена цепочки.
     * @param source Предыдущее звено.
     * @param [compareFunction] Функция сравнения
     */
    constructor(source: Abstract<T, U>, compareFunction?: CompareFunction<T>) {
        super(source);
        this._compareFunction = compareFunction;
    }

    destroy(): void {
        this._compareFunction = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): SortedEnumerator<T, U> {
        return new SortedEnumerator(this._previous, this._compareFunction);
    }

    // endregion
}

Object.assign(Sorted.prototype, {
    '[Types/_chain/Sorted]': true,
    _compareFunction: null,
});
