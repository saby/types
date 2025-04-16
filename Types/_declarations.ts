/**
 * Пометка что это сущность из Types/entity
 */
export type EntityMarker = true;

/**
 * Пометка что это сущность из Types/entity
 */
export type EntityMarkerCompat = boolean;

/**
 *
 */
export type CompareFunction<T = unknown> = (a: T, b: T) => number;

/**
 * @public
 */
export interface IHashMap<T> {
    [key: string]: T;
}

/**
 * Конструктор расширенного класса Date
 * @public
 */
export interface IExtendDateConstructor extends DateConstructor {
    SQL_SERIALIZE_MODE_DATE: undefined;
    SQL_SERIALIZE_MODE_TIME: boolean;
    SQL_SERIALIZE_MODE_DATETIME: boolean;
    SQL_SERIALIZE_MODE_AUTO: null;
}

/**
 * Расширенный класс Date
 * @public
 */
export class ExtendDate extends Date {
    getSQLSerializationMode: () => any;
    setSQLSerializationMode: (mode: any) => void;
    clone: () => ExtendDate;
}

/**
 *
 */
export type IObjectKey = string;

/**
 *
 */
export type ComplexTypeMarker = 'record' | 'recordset';

/**
 *
 */
export type FormatNameMarker = ComplexTypeMarker | string;
