/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля временной интервал.
 * @remark
 * Создадим поле c типом "Временной интервал":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'timeinterval'
 *     };
 * </pre>
 * @extends Types/_entity/format/Field
 * @public
 */
export default class TimeIntervalField extends Field {
    protected _$defaultValue: number;
}

Object.assign(TimeIntervalField.prototype, {
    '[Types/_entity/format/TimeIntervalField]': true,
    _moduleName: 'Types/entity:format.TimeIntervalField',
    _typeName: 'TimeInterval',
    _$defaultValue: 0,
});

register('Types/entity:format.TimeIntervalField', TimeIntervalField, {
    instantiate: false,
});
