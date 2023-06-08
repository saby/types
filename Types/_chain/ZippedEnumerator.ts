import { IEnumerator } from '../collection';
import Abstract from './Abstract';
import { EntityMarker } from '../_declarations';

/**
 * Объединяющий энумератор
 * @private
 */
export default class ZippedEnumerator<TResult, TSource1, TSource2>
    implements IEnumerator<TResult, number>
{
    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;
    private previous: Abstract<TSource1>;
    private items: TSource2[];
    private current: TResult;
    private index: number;
    private enumerator: IEnumerator<TSource1>;
    private itemsEnumerators: IEnumerator<TSource2>[];

    /**
     * Конструктор объединяющего энумератора.
     * @param previous Предыдущее звено.
     * @param items Коллекции для объединения.
     */
    constructor(previous: Abstract<TSource1>, items: TSource2[]) {
        this.previous = previous;
        this.items = items;
        this.reset();
    }

    getCurrent(): TResult {
        return this.current;
    }

    getCurrentIndex(): number {
        return this.index;
    }

    moveNext(): boolean {
        this.enumerator =
            this.enumerator ||
            (this.enumerator = this.previous.getEnumerator());

        const hasNext = this.enumerator.moveNext();
        let current;
        let item;
        let itemEnumerator;

        if (hasNext) {
            this.index++;

            current = [this.enumerator.getCurrent()];
            for (let i = 0; i < this.items.length; i++) {
                item = this.items[i];
                if (item instanceof Array) {
                    current.push(item[this.index]);
                } else if (item && item['[Types/_collection/IEnumerable]']) {
                    itemEnumerator =
                        this.itemsEnumerators[i] ||
                        (this.itemsEnumerators[i] = item.getEnumerator());
                    if (itemEnumerator.moveNext()) {
                        current.push(itemEnumerator.getCurrent());
                    } else {
                        current.push(undefined);
                    }
                } else {
                    throw new TypeError(
                        `Collection at argument ${i} should implement Types/collection#IEnumerable`
                    );
                }
            }
            this.current = current;
        }

        return hasNext;
    }

    reset(): void {
        this.enumerator = null;
        this.index = -1;
        this.current = undefined;
        this.itemsEnumerators = [];
    }
}

Object.assign(ZippedEnumerator.prototype, {
    previous: null,
    items: null,
    itemsEnumerators: null,
    enumerator: null,
    index: null,
    current: undefined,
});
