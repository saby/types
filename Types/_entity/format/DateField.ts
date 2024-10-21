/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { dateToSql, TO_SQL_MODE } from '../../formatter';
import { register } from '../../di';

/**
 * Формат поля для даты.
 * @example
 * Создадим поле c типом "Дата":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'date'
 *    };
 * </pre>
 * @remark
 * Обратите внимание: поле для даты работает со строками даты в SQL-формате через {@link Types/formatter:dateFromSql dateFromSql}.
 * @public
 */
export default class DateField extends Field {
    protected _$defaultValue: string | Date;

    // region Public methods

    getDefaultValue(serialize: boolean = false): string | Date {
        if (serialize && this._$defaultValue instanceof Date) {
            return dateToSql(this._$defaultValue, TO_SQL_MODE.DATE);
        }

        return this._$defaultValue;
    }

    // endregion Public methods
}

Object.assign(DateField.prototype, {
    '[Types/_entity/format/DateField]': true,
    _moduleName: 'Types/entity:format.DateField',
    _typeName: 'Date',
});

register('Types/entity:format.DateField', DateField, { instantiate: false });
