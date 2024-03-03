/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from '../../_declarations';

/**
 * Адаптер, содержащий данные для поддержки процессов инициализации.
 * @public
 */

/*
 * An adapter which holds some data which helps to maintain processes of initialization.
 * @interface Types/_entity/adapter/IDataHolder
 * @public
 * @author Буранов А.Р.
 */
export default interface IDataHolder<T> {
    readonly '[Types/_entity/adapter/IDataHolder]': EntityMarker;

    /**
     * Свойство для хранения данных.
     */

    /*
     * А property to hold the data
     */
    dataReference: T;
}
