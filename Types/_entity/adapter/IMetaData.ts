/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from '../format/Field';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера для работы с метаданными
 * @public
 */
export default interface IMetaData {
    readonly '[Types/_entity/adapter/IMetaData]': EntityMarker;

    /**
     * Возвращает описание метаданных
     */
    getMetaDataDescriptor(): Field[];

    /**
     * Возвращает перечисляемое всех поддерживаемых полей метаданных
     */
    getMetaFieldEnumerator(meta: object): Field[];

    /**
     * Возвращает значение из метаданных по имени
     * @param name Поле метаданных
     */
    getMetaData(name: string): any;

    /**
     * Сохраняет значение в метаданных с указанным именем
     * @param name Поле метаданных
     * @param value Значение
     */
    setMetaData(name: string, value: any): void;
}
