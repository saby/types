/**
 * @kaizen_zone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnumerable from '../IEnumerable';
import List from '../List';

/**
 * Фабрика для получения списка из Types/_collection/IEnumerable.
 * @class Types/_collection/factory/list
 * @param items Коллекция
 * @public
 */
export default function list<T>(items: IEnumerable<T>): List<T> {
    if (!items || !items['[Types/_collection/IEnumerable]']) {
        throw new TypeError(
            'Argument "items" should implement Types/collection:IEnumerable'
        );
    }

    const itemsArray = [];
    items.each((item) => {
        itemsArray.push(item);
    });

    return new List({ items: itemsArray });
}
