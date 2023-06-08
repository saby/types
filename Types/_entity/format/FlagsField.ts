import DictionaryField from './DictionaryField';
import { register } from '../../di';

/**
 * Формат поля флагов.
 * @remark
 * Создадим поле c типом "Флаги":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'flags',
 *         dictionary: ['one', 'two', 'three']
 *     };
 * </pre>
 * @class Types/_entity/format/FlagsField
 * @extends Types/_entity/format/DictionaryField
 * @public
 */
export default class FlagsField extends DictionaryField {}

Object.assign(FlagsField.prototype, {
    '[Types/_entity/format/FlagsField]': true,
    _moduleName: 'Types/entity:format.FlagsField',
    _typeName: 'Flags',
});

register('Types/entity:format.FlagsField', FlagsField, { instantiate: false });
