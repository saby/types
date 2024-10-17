/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля для идентификатора.
 * @remark
 * Создадим поле c типом "Идентификатор":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'identity'
 *     };
 * </pre>
 * @public
 */
export default class IdentityField extends Field {
    /**
     * Значение поля по умолчанию
     * @see {@link getDefaultValue}
     * @see {@link setDefaultValue}
     */
    protected _$defaultValue: any[];

    protected _separator: string;

    // region Public methods

    /**
     * Возвращает разделитель
     * @return
     */
    getSeparator(): string {
        return this._separator;
    }

    // endregion Public methods
}

Object.assign(IdentityField.prototype, {
    '[Types/_entity/format/IdentityField]': true,
    _moduleName: 'Types/entity:format.IdentityField',
    _typeName: 'Identity',
    _separator: ',',
    _$defaultValue: [null],
});

register('Types/entity:format.IdentityField', IdentityField, {
    instantiate: false,
});
