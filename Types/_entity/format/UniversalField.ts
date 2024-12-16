/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { IHashMap } from 'Types/declarations';
import { register } from '../../di';

type Dictionary = string[] | IHashMap<string>;

/**
 * @public
 */
export interface IDateTimeMeta {
    withoutTimeZone: boolean;
}

/**
 * @public
 */
export interface IDictionaryMeta {
    dictionary: Dictionary;
    localeDictionary?: Dictionary;
}

/**
 * @public
 */
export interface IRealMeta {
    precision?: number;
}

/**
 * @public
 */
export interface IMoneyMeta extends IRealMeta {
    large: boolean;
}

/**
 * @public
 */
export interface IIdentityMeta {
    separator: string;
}

/**
 * @public
 */
export interface IArrayMeta {
    kind: string;
}

/**
 *
 */
export type IMeta =
    | IDateTimeMeta
    | IDictionaryMeta
    | IRealMeta
    | IMoneyMeta
    | IIdentityMeta
    | IArrayMeta
    | {};

/**
 * Универсальное поле.
 * @public
 */
export default class UniversalField {
    /**
     * Field type
     */
    type: string;

    /**
     * Field name
     */
    name: string;

    /**
     * Default value
     */
    defaultValue: any;

    /**
     * Value can be null
     */
    nullable: boolean;

    /**
     * Metadata
     */
    meta: IMeta;
}

Object.assign(UniversalField.prototype, {
    '[Types/_entity/format/UniversalField]': true,
    _moduleName: 'Types/entity:format.UniversalField',
    type: '',
    name: '',
    defaultValue: null,
    nullable: false,
    meta: null,
});

register('Types/entity:format.UniversalField', UniversalField, {
    instantiate: false,
});
