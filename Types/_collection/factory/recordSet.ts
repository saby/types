/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnumerable from '../IEnumerable';
import RecordSet, { IOptions } from '../RecordSet';
import { Record } from '../../entity';
import { create } from '../../di';

/**
 * Фабрика для получения рекордсета из Types/_collection/IEnumerable.
 * @param items Коллекция записей
 * @param options Опции конструктора рекордсета
 * @public
 */
export default function recordSet(
    items: IEnumerable<Record>,
    options: IOptions = {}
): RecordSet<Record> {
    if (!items || !items['[Types/_collection/IEnumerable]']) {
        throw new TypeError('Argument "items" should implement Types/collection:IEnumerable');
    }

    delete options.rawData;

    const result = create<RecordSet<Record>>('Types/collection:RecordSet', options);
    items.each((item) => {
        result.add(item);
    });

    return result;
}
