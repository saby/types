/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import RealField, { IOptions as IRealFieldOptions } from './RealField';
import { register } from '../../di';

export interface IOptions extends IRealFieldOptions {
    large?: boolean;
}

/**
 * Формат денежного поля.
 * @remark
 * Создадим поле c типом "Деньги":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'money'
 *     };
 * </pre>
 * @public
 */
export default class MoneyField extends RealField {
    /**
     * Большие деньги (значение передается строкой, чтобы избежать погрешностей выполнения операций с
     * плавающей запятой)
     * @see {@link isLarge}
     */
    protected _$large: boolean;

    constructor(options?: IOptions) {
        super(options);
    }

    // region Public methods

    /**
     * Возвращает признак "Большие деньги"
     */
    isLarge(): boolean {
        return this._$large;
    }

    // endregion Public methods
}

export const DEFAULT_PRECISION = 2;

Object.assign(MoneyField.prototype, {
    '[Types/_entity/format/MoneyField]': true,
    _moduleName: 'Types/entity:format.MoneyField',
    _typeName: 'Money',
    _$precision: DEFAULT_PRECISION,
    _$large: false,
});

register('Types/entity:format.MoneyField', MoneyField, { instantiate: false });
