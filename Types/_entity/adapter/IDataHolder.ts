/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from 'Types/declarations';

/**
 * Адаптер, содержащий данные для поддержки процессов инициализации.
 * @public
 */
export default interface IDataHolder<T> {
    readonly '[Types/_entity/adapter/IDataHolder]': EntityMarker;

    /**
     * Свойство для хранения данных.
     */
    dataReference: T;
}
