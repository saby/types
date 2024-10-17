/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from 'Types/declarations';

/**
 * Интерфейс уведомлений об изменении к свойств объекта.
 * @public
 */
export default interface IObservableObject {
    readonly '[Types/_entity/IObservableObject]': EntityMarker;
}
