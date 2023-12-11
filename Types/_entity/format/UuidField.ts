/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля UUID.
 * @remark
 * Создадим поле c типом "UUID":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'uuid'
 *     };
 * </pre>
 * @extends Types/_entity/format/Field
 * @public
 */
export default class UuidField extends Field {}

Object.assign(UuidField.prototype, {
    '[Types/_entity/format/UuidField]': true,
    _moduleName: 'Types/entity:format.UuidField',
    _typeName: 'Uuid',
});

register('Types/entity:format.UuidField', UuidField, { instantiate: false });
