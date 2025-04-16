/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import IEnumerable from '../IEnumerable';
import List from '../List';

/**
 * Фабрика для получения списка из Types/_collection/IEnumerable.
 * @param items Коллекция
 * @public
 */
export default function list<T>(items: IEnumerable<T>): List<T> {
    if (!items || !items['[Types/_collection/IEnumerable]']) {
        throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
    }

    const itemsArray: T[] = [];
    items.each((item) => {
        itemsArray.push(item);
    });

    return new List({ items: itemsArray });
}
