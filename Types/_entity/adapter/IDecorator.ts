/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера, являющегося декоратором
 * @interface Types/_entity/adapter/IDecorator
 * @public
 */
export default interface IDecorator {
    readonly '[Types/_entity/adapter/IDecorator]': EntityMarker;
    /**
     * Возвращает оригинальный адаптер
     */
    getOriginal(): IAdapter | ITable | IRecord;
}
