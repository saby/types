/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { dateToSql, TO_SQL_MODE } from '../../formatter';
import { register } from '../../di';

/**
 * Формат поля для времени.
 * @remark
 * Создадим поле c типом "Время":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'time'
 *     };
 * </pre>
 * @public
 */
export default class TimeField extends Field {
    protected _$defaultValue: string | Date;

    // region Public methods

    getDefaultValue(serialize: boolean = false): string | Date {
        if (serialize && this._$defaultValue instanceof Date) {
            return dateToSql(this._$defaultValue, TO_SQL_MODE.TIME);
        }

        return this._$defaultValue;
    }

    // endregion Public methods
}

Object.assign(TimeField.prototype, {
    '[Types/_entity/format/TimeField]': true,
    _moduleName: 'Types/entity:format.TimeField',
    _typeName: 'Time',
});

register('Types/entity:format.TimeField', TimeField, { instantiate: false });
