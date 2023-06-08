import Field from './Field';
import { register } from '../../di';

/**
 * Формат целочисленного поля.
 * @remark
 * Создадим поле целочисленного типа:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'integer'
 *     };
 * </pre>
 * @class Types/_entity/format/IntegerField
 * @extends Types/_entity/format/Field
 * @public
 */
export default class IntegerField extends Field {
    protected _$defaultValue: number;
}

Object.assign(IntegerField.prototype, {
    '[Types/_entity/format/IntegerField]': true,
    _moduleName: 'Types/entity:format.IntegerField',
    _typeName: 'Integer',
    _$defaultValue: 0,
});

register('Types/entity:format.IntegerField', IntegerField, {
    instantiate: false,
});
