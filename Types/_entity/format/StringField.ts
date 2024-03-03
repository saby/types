/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля для строк.
 * @remark
 * Создадим поле c типом "Строка":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'string'
 *     };
 * </pre>
 * @extends Types/_entity/format/Field
 * @public
 */
export default class StringField extends Field {}

Object.assign(StringField.prototype, {
    '[Types/_entity/format/StringField]': true,
    _moduleName: 'Types/entity:format.StringField',
    _typeName: 'String',
});

register('Types/entity:format.StringField', StringField, {
    instantiate: false,
});
