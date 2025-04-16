/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат двоичного поля.
 * @remark
 * Создадим поле двоичного типа:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'binary'
 *     };
 * </pre>
 * @public
 */
export default class BinaryField extends Field {}

Object.assign(BinaryField.prototype, {
    '[Types/_entity/format/BinaryField]': true,
    _moduleName: 'Types/entity:format.BinaryField',
    _typeName: 'Binary',
});

register('Types/entity:format.BinaryField', BinaryField, {
    instantiate: false,
});
