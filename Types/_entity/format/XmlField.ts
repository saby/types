/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля для строки в формате XML.
 * @remark
 * Создадим поле c типом "XML":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'xml'
 *     };
 * </pre>
 * @public
 */
export default class XmlField extends Field {
    protected _$defaultValue: string;
}

Object.assign(XmlField.prototype, {
    '[Types/_entity/format/XmlField]': true,
    _moduleName: 'Types/entity:format.XmlField',
    _typeName: 'Xml',
    _$defaultValue: '',
});

register('Types/entity:format.XmlField', XmlField, { instantiate: false });
