/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from 'Types/declarations';

/**
 * Интерфейс экземпляра класса, полученного через фабричный метод
 * @public
 */
export default interface IProducible {
    readonly '[Types/_entity/IProducible]': EntityMarker;
}

/**
 * Интерфейс получения экземпляра класса через фабричный метод
 * @private
 */
export interface IProducibleConstructor extends Function {
    /**
     * Создает экземпляр класса.
     * @param data Исходные данные.
     * @param options Дополнительные данные.
     */
    produceInstance<T>(data?: any, options?: any): T;
}
