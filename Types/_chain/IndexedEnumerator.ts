/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import { IEnumerator } from '../collection';
import { EntityMarker } from '../_declarations';
import { EnumeratorMap } from './types';

/**
 * Индексирующий энумератор
 * @private
 */
export default class IndexedEnumerator<T, U> implements IEnumerator<T, U> {
    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;
    protected previous: Abstract<T, U>;
    protected _items: EnumeratorMap<T, U>;
    private index: number;

    /**
     * Конструктор.
     * @param previous Предыдущее звено.
     */
    constructor(previous: Abstract<T, U>) {
        this.previous = previous;
        this.reset();
    }

    getCurrent(): T | undefined {
        const items = this._getItems();
        const current = items[this.index];
        return current ? current[1] : undefined;
    }

    getCurrentIndex(): U {
        const items = this._getItems();
        const current = items[this.index];
        return current ? current[0] : (-1 as unknown as U);
    }

    moveNext(): boolean {
        if (this.index >= this._getItems().length - 1) {
            return false;
        }
        this.index++;
        return true;
    }

    reset(): void {
        // @ts-ignore
        this._items = null;
        this.index = -1;
    }

    _getItems(): EnumeratorMap<T, U> {
        if (!this._items) {
            this._items = [];
            const enumerator = this.previous.getEnumerator();
            while (enumerator.moveNext()) {
                this._items.push([enumerator.getCurrentIndex(), enumerator.getCurrent()]);
            }
        }

        return this._items;
    }
}

Object.assign(IndexedEnumerator.prototype, {
    previous: null,
    index: -1,
    _items: null,
});
