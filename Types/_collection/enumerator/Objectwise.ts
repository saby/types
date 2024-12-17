/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnumerator from '../IEnumerator';
import { EntityMarker } from 'Types/declarations';

/**
 * Энумератор для собственных свойств объекта
 * @public
 */
export default class Objectwise<T> implements IEnumerator<T, string> {
    /**
     * Объект
     */
    protected _items: Record<string, T>;

    /**
     * Набор свойств объекта
     */
    protected _keys: string[];

    /**
     * Текущий индекс
     */
    protected _index: number;

    /**
     * Фильтр элементов
     */
    protected _filter: (item: any, index: any) => boolean;

    // region IEnumerator

    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;

    /**
     * Конструктор
     * @param items Массив
     */
    constructor(items: Record<string, T>) {
        let checkedItems = items;
        if (checkedItems === undefined) {
            checkedItems = {};
        }

        if (!(checkedItems instanceof Object)) {
            throw new Error('Argument items should be an instance of Object');
        }

        this._items = checkedItems;
        this._keys = Object.keys(checkedItems);
    }

    getCurrent(): T | undefined {
        if (this._index < 0) {
            return undefined;
        }
        return this._items[this._keys[this._index]];
    }

    moveNext(): boolean {
        if (1 + this._index >= this._keys.length) {
            return false;
        }
        this._index++;

        const current = this.getCurrent();
        if (this._filter && !this._filter(current, this.getCurrentIndex())) {
            return this.moveNext();
        }
        return true;
    }

    reset(): void {
        this._index = -1;
    }

    // endregion

    // region Public methods

    getCurrentIndex(): string {
        return this._keys[this._index];
    }

    /**
     * Устанавливает фильтр элементов
     * @param filter Функция обратного вызова, которая должна для каждого элемента вернуть признак,
     * проходит ли он фильтр
     */
    setFilter(filter: (item: any, index: any) => boolean): void {
        this._filter = filter;
    }

    // endregion
}

Object.assign(Objectwise.prototype, {
    '[Types/_collection/enumerator/Objectwise]': true,
    _items: null,
    _keys: null,
    _index: -1,
    _filter: null,
});
