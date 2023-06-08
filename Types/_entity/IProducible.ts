import { EntityMarker } from '../_declarations';

/**
 * Интерфейс экземпляра класса, полученного через фабричный метод
 * @interface Types/_entity/IProducible
 */
export default interface IProducible {
    readonly '[Types/_entity/IProducible]': EntityMarker;
}

/**
 * Интерфейс получения экземпляра класса через фабричный метод
 * @interface Types/_entity/IProducibleConstructor
 */
export interface IProducibleConstructor extends Function {
    /**
     * Создает экземпляр класса.
     * @param [data] Исходные данные.
     * @param [options] Дополнительные данные.
     */
    produceInstance<T>(data?: any, options?: any): T;
}
