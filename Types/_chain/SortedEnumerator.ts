/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import { CompareFunction } from '../_declarations';
import IndexedEnumerator from './IndexedEnumerator';
import SortWrapper from './SortWrapper';
import Abstract from './Abstract';

/**
 * Сортирующий энумератор
 * @private
 */
export default class SortedEnumerator<T, U> extends IndexedEnumerator<T, U> {
    private compareFunction: CompareFunction<T>;

    /**
     * Конструктор сортирующего энумератора.
     * @param previous Предыдущее звено.
     * @param [compareFunction] Функция сравнения.
     * @protected
     */
    constructor(previous: Abstract<T, U>, compareFunction?: CompareFunction<T>) {
        super(previous);
        this.compareFunction = compareFunction || SortedEnumerator.defaultCompare;
    }

    _getItems(): any[] {
        if (!this._items) {
            const shouldSaveIndices: boolean = this.previous.shouldSaveIndices;
            this._items = super
                ._getItems()
                .map(([index, item]) => {
                    return new SortWrapper(item, index);
                })
                .sort(this.compareFunction as CompareFunction<unknown>)
                .map((item, index): [U, T | undefined] => {
                    const result: [U, T | undefined] = [
                        shouldSaveIndices ? SortWrapper.indexOf(item) : (index as unknown as U),
                        SortWrapper.valueOf(item),
                    ];
                    SortWrapper.clear(item);

                    return result;
                });
        }

        return this._items;
    }

    static defaultCompare<Z>(a: Z, b: Z): number {
        return a === b ? 0 : a > b ? 1 : -1;
    }
}

Object.assign(SortedEnumerator.prototype, {
    compareFunction: null,
});
