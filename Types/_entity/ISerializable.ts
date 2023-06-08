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
