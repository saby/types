/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarkerCompat as EntityMarker } from 'Types/declarations';

/**
 * Интерфейс получения уникального идентификатора для экземпляра класса
 * @public
 */
export default interface IInstantiable {
    readonly '[Types/_entity/IInstantiable]': EntityMarker;

    /**
     * Возвращает уникальный идентификатор экземпляра класса.
     */
    getInstanceId(): string;
}
