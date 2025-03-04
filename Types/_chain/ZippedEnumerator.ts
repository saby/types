/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */
import { IEnumerable, IEnumerator } from '../collection';
import Abstract from './Abstract';
import { EntityMarker } from 'Types/declarations';
import { EnumeratorIndex } from './types';

/**
 * Объединяющий энумератор
 * @private
 */
export default class ZippedEnumerator<TResult, TSource1, TSource2>
    implements IEnumerator<TResult, EnumeratorIndex>
{
    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;
    private previous: Abstract<TSource1>;
    private items: TSource2[];
    private current: TResult;
    private index: EnumeratorIndex;
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

    getCurrentIndex(): EnumeratorIndex {
        return this.index;
    }

    moveNext(): boolean {
        this.enumerator = this.enumerator || (this.enumerator = this.previous.getEnumerator());

        const hasNext = this.enumerator.moveNext();
        let current: TResult;
        let item: IEnumerable<TSource2, EnumeratorIndex>;
        let itemEnumerator;

        if (hasNext) {
            //@ts-ignore
            this.index++;

            current = [this.enumerator.getCurrent()] as unknown as TResult;
            for (let i = 0; i < this.items.length; i++) {
                item = this.items[i] as unknown as IEnumerable<TSource2, EnumeratorIndex>;
                if (item instanceof Array) {
                    // @ts-ignore
                    current.push(item[this.index]);
                } else if (item && item['[Types/_collection/IEnumerable]']) {
                    itemEnumerator =
                        this.itemsEnumerators[i] ||
                        (this.itemsEnumerators[i] = item.getEnumerator());
                    if (itemEnumerator.moveNext()) {
                        // @ts-ignore
                        current.push(itemEnumerator.getCurrent());
                    } else {
                        // @ts-ignore
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
        // @ts-ignore
        this.enumerator = null;
        this.index = -1;
        // @ts-ignore
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
