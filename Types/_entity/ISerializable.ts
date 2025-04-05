/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from 'Types/declarations';

/**
 * Интерфейс сериализуемого объекта.
 * @private
 */
export default interface ISerializable {
    readonly '[Types/_entity/ISerializable]': EntityMarker;

    /**
     * Instance module name
     */
    _moduleName: string;
}
