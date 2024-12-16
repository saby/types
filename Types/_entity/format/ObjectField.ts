/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля для JSON-объекта.
 * @remark
 * Создадим поле c типом "JSON-объект":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'object'
 *     };
 * </pre>
 * @public
 */
export default class ObjectField extends Field {}

Object.assign(ObjectField.prototype, {
    '[Types/_entity/format/ObjectField]': true,
    _moduleName: 'Types/entity:format.ObjectField',
    _typeName: 'Object',
});

register('Types/entity:format.ObjectField', ObjectField, {
    instantiate: false,
});
