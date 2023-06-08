/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля "Связь".
 * @remark
 * Создадим поле c типом "Связь":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'link'
 *     };
 * </pre>
 * @class Types/_entity/format/LinkField
 * @extends Types/_entity/format/Field
 * @deprecated Модуль будет удален в 3.18.10
 */
export default class LinkField extends Field {
    protected _$defaultValue: number;
}

Object.assign(LinkField.prototype, {
    '[Types/_entity/format/LinkField]': true,
    _moduleName: 'Types/entity:format.LinkField',
    _typeName: 'Link',
    _$defaultValue: 0,
});

register('Types/entity:format.LinkField', LinkField, { instantiate: false });
