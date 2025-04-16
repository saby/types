/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import { CompareFunction, EntityMarker } from 'Types/declarations';
import Abstract from './Abstract';
import SortedEnumerator from './SortedEnumerator';

/**
 * Сортирующее звено цепочки.
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
     * @param compareFunction Функция сравнения
     */
    constructor(source: Abstract<T, U>, compareFunction: CompareFunction<T>) {
        super(source);
        this._compareFunction = compareFunction;
    }

    destroy(): void {
        // @ts-ignore
        this._compareFunction = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): SortedEnumerator<T, U> {
        return new SortedEnumerator(this._previous, this._compareFunction);
    }

    // endregion
    readonly '[Types/_chain/Sorted]': EntityMarker = true;
}

Object.assign(Sorted.prototype, {
    _compareFunction: null,
});
