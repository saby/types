import Field, { IOptions as IFieldOptions } from './Field';
import { register } from '../../di';

interface IOptions extends IFieldOptions {
    withoutTimeZone?: boolean;
}

/**
 * Формат поля для даты и времени.
 * @remark
 * Создадим поле c типом "Дата и время":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'dateTime'
 *     };
 * </pre>
 * @class Types/_entity/format/DateTimeField
 * @extends Types/_entity/format/Field
 * @public
 */
export default class DateTimeField extends Field {
    /**
     * @cfg {Boolean} Без указания временной зоны
     * @name Types/_entity/format/DateTimeField#withoutTimeZone
     * @see hasTimeZone
     */
    protected _$withoutTimeZone: boolean;

    constructor(options?: IOptions) {
        super(options);
    }

    // region Public methods

    /**
     * Возвращает признак указания временной зоны
     * @return {Boolean}
     */
    isWithoutTimeZone(): boolean {
        return this._$withoutTimeZone;
    }

    // endregion Public methods
}

Object.assign(DateTimeField.prototype, {
    '[Types/_entity/format/DateTimeField]': true,
    _moduleName: 'Types/entity:format.DateTimeField',
    _typeName: 'DateTime',
    _$withoutTimeZone: false,
});

register('Types/entity:format.DateTimeField', DateTimeField, {
    instantiate: false,
});
