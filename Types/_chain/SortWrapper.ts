/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */

/**
 * Обертка для элемента коллекции, позволяющая сохранить информацию о его индексе в коллекции.
 * @param item Элемент коллекции.
 * @param index Индекс элемента коллекции.
 * @protected
 */
export default class SortWrapper<T, U> {
    private readonly item: T;
    private readonly index: U;

    constructor(item: T, index: U) {
        if (item instanceof Object) {
            const indexedItem = item as IndexedObject;
            indexedItem[SortWrapper.indexKey] = index;
            return indexedItem as unknown as SortWrapper<T, U>;
        }
        this.item = item;
        this.index = index;
    }

    valueOf(): T {
        return this.item;
    }

    indexOf(): U {
        return this.index;
    }
    static indexKey: symbol;

    static valueOf<T, U>(item: SortWrapper<T, U>): T {
        return item instanceof SortWrapper ? item.valueOf() : item;
    }

    static indexOf<T, U>(item: SortWrapper<T, U>): U {
        return item instanceof SortWrapper ? item.indexOf() : item[SortWrapper.indexKey];
    }

    static clear<T>(item: T): void {
        if (!(item instanceof SortWrapper)) {
            const indexedItem = item as IndexedObject;
            delete indexedItem[SortWrapper.indexKey];
        }
    }
}

const indexKeySymbol = Symbol('[]');

type IndexedObject = Record<PropertyKey, unknown> & { indexKey: typeof indexKeySymbol };

SortWrapper.indexKey = indexKeySymbol;
