/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field, { IOptions as IFieldOptions } from './Field';
import { IHashMap } from '../../_declarations';
import { register } from '../../di';

type Dictionary = string[] | IHashMap<string>;

interface IOptions extends IFieldOptions {
    dictionary?: Dictionary;
    localeDictionary?: Dictionary;
}

/**
 * Формат поля со словарём (абстрактный класс)
 * @extends Types/_entity/format/Field
 * @public
 */
export default class DictionaryField extends Field {
    /**
     * @cfg {Array.<String>} Словарь возможных значений
     * @name Types/_entity/format/DictionaryField#dictionary
     * @see getDictionary
     */
    protected _$dictionary: Dictionary;

    protected _$localeDictionary: Dictionary;

    constructor(options?: IOptions) {
        super(options);
    }

    // region Public methods

    /**
     * Возвращает словарь возможных значений
     * @see dictionary
     */
    getDictionary(): Dictionary {
        return this._$dictionary;
    }

    getLocaleDictionary(): Dictionary {
        return this._$localeDictionary;
    }

    // endregion Public methods
}

Object.assign(DictionaryField.prototype, {
    ['[Types/_entity/format/DictionaryField]']: true,
    _moduleName: 'Types/entity:format.DictionaryField',
    _typeName: 'Dictionary',
    _$dictionary: null,
    _$localeDictionary: null,
});

register('Types/entity:format.DictionaryField', DictionaryField, {
    instantiate: false,
});
