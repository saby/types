/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
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
 * @public
 */
export default class DateTimeField extends Field {
    /**
     * Без указания временной зоны
     * @see {@link isWithoutTimeZone}
     */
    protected _$withoutTimeZone: boolean;

    constructor(options?: IOptions) {
        super(options);
    }

    // region Public methods

    /**
     * Возвращает признак указания временной зоны
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
