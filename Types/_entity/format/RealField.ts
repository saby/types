/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field, { IOptions as IFieldOptions } from './Field';
import { register } from '../../di';

export interface IOptions extends IFieldOptions {
    defaultValue?: number;
    precision?: number;
}

/**
 * Формат вещественного поля.
 * @remark
 * Создадим поле вещественного типа:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'real',
 *         precision: 4
 *     };
 * </pre>
 * @public
 */
export default class RealField extends Field {
    protected _$defaultValue: number;

    /**
     * Максимальное количество знаков в дробной части
     * @see {@link getPrecision}
     * @see {@link setPrecision}
     */
    protected _$precision: number;

    constructor(options?: IOptions) {
        super(options);
    }

    // region Public methods

    /**
     * Возвращает максимальное количество знаков в дробной части
     * @see {@link setPrecision}
     */
    getPrecision(): number {
        return this._$precision;
    }

    /**
     * Устанавливает максимальное количество знаков в дробной части
     * @param value
     * @see {@link getPrecision}
     */
    setPrecision(value: number): void {
        this._$precision = value;
    }

    // endregion Public methods
}

export const DEFAULT_PRECISION = 16;

Object.assign(RealField.prototype, {
    '[Types/_entity/format/RealField]': true,
    _moduleName: 'Types/entity:format.RealField',
    _typeName: 'Real',
    _$defaultValue: 0,
    _$precision: DEFAULT_PRECISION,
});

register('Types/entity:format.RealField', RealField, { instantiate: false });
