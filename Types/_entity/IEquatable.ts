/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from '../_declarations';

/**
 * Интерфейс сравнения объектов.
 * @interface Types/_entity/IEquatable
 * @public
 */
export default interface IEquatable {
    readonly '[Types/_entity/IEquatable]': EntityMarker;

    /**
     * Проверяет эквивалентность текущего объекта другому объекту.
     * @param {Object} to Объект, с которым сравнивается текущий объект.
     * @return {Boolean}
     * @example
     * Проверим идентичность записей до и после изменения поля:
     * <pre>
     *     import {Record} from 'Types/entity';
     *
     *     const articleA = new Record({
     *         rawData: {
     *             foo: 'bar'
     *         }
     *     });
     *     var articleB = articleA.clone();
     *
     *     articleA.isEqual(articleB);//true
     *     articleA.set('title', 'New Title');
     *     articleA.isEqual(articleB);//false
     * </pre>
     */
    isEqual(to: this): boolean;
}
