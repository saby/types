/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 * @module
 * @public
 */
import { EntityMarker } from 'Types/declarations';

/**
 *
 * @param value
 */
export function isCloneable(value: any): value is ICloneable {
    return !!value['[Types/_entity/ICloneable]'];
}
/**
 * Интерфейс клонирования объекта.
 * @public
 */
export default interface ICloneable {
    readonly '[Types/_entity/ICloneable]': EntityMarker;

    /**
     * Создает новый объект, который является копией текущего экземпляра.
     * @param shallow Создать поверхностную копию (агрегированные объекты не клонируются). Использовать поверхностные копии можно только для чтения, т.к. изменения в них будут отражаться и на оригинале.
     * @return
     * @example
     * Создадим клон книги:
     * <pre>
     *     var book = new Record({
     *             rawData: {
     *                 id: 1,
     *                 title: 'Patterns of Enterprise Application Architecture'
     *             }
     *         }),
     *         clone = book.clone();
     *     book.get('title');//'Patterns of Enterprise Application Architecture'
     *     clone.get('title');//'Patterns of Enterprise Application Architecture'
     *     book.isEqual(clone);//true
     * </pre>
     */
    clone<T = this>(shallow?: boolean): T;
}
