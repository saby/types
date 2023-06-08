import ICrud from './ICrud';
import { EntityMarker } from '../_declarations';

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
