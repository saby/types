import ICrud from './ICrud';
import { EntityMarker } from 'Types/declarations';

export function isDecorator(value: any): value is IDecorator {
    return value['[Types/_source/IDecorator]'];
}
/**
 * Интерфейс источника, являющегося декоратором для другого источника
 * @public
 */
export default interface IDecorator {
    readonly '[Types/_source/IDecorator]': EntityMarker;

    /**
     * Возвращает оригинальный источник данных
     */
    getOriginal<T = ICrud>(): T;
}
