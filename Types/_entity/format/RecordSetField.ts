/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля для рекордсета.
 * @remark
 * Создадим поле c типом "Рекордсет":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'recordset'
 *     };
 * </pre>
 * @class Types/_entity/format/RecordSetField
 * @extends Types/_entity/format/Field
 * @public
 */
export default class RecordSetField extends Field {}

Object.assign(RecordSetField.prototype, {
    '[Types/_entity/format/RecordSetField]': true,
    _moduleName: 'Types/entity:format.RecordSetField',
    _typeName: 'RecordSet',
});

register('Types/entity:format.RecordSetField', RecordSetField, {
    instantiate: false,
});
