/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { IHashMap } from '../../_declarations';
import { register } from '../../di';

type Dictionary = string[] | IHashMap<string>;

export interface IDateTimeMeta {
    withoutTimeZone: boolean;
}

export interface IDictionaryMeta {
    dictionary: Dictionary;
    localeDictionary?: Dictionary;
}

export interface IRealMeta {
    precision: number;
}

export interface IMoneyMeta extends IRealMeta {
    large: boolean;
}

export interface IIdentityMeta {
    separator: string;
}

export interface IArrayMeta {
    kind: string;
}

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
 * @private
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
