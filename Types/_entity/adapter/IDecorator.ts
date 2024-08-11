/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import IAdapter from './IAdapter';
import ITable from './ITable';
import IRecord from './IRecord';
import { EntityMarker } from 'Types/declarations';

/**
 *
 * @param value
 */
export function isDecorator(value: any): value is IDecorator {
    return !!value['[Types/_entity/adapter/IDecorator]'];
}

/**
 * Интерфейс адаптера, являющегося декоратором
 * @public
 */
export default interface IDecorator {
    readonly '[Types/_entity/adapter/IDecorator]': EntityMarker;
    /**
     * Возвращает оригинальный адаптер
     */
    getOriginal(): IAdapter | ITable | IRecord;
}
