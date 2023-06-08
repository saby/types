/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from '../_declarations';

/**
 * Интерфейс сериализуемого объекта.
 * @interface Types/_entity/ISerializable
 */

/*
 * Interface of serializable instance
 * @interface Types/_entity/ISerializable
 * @author Буранов А.Р.
 */
export default interface ISerializable {
    readonly '[Types/_entity/ISerializable]': EntityMarker;

    /**
     * Instance module name
     */
    _moduleName: string;
}
