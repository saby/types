/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field, { IOptions as IFieldOptions } from './Field';
import { register } from '../../di';

interface IOptions extends IFieldOptions {
    kind?: string;
}

/**
 * Формат поля для массива значений.
 * @remark
 * Создадим поле с типом "Массив значений":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'array',
 *         kind: 'integer'
 *     };
 * </pre>
 * @public
 */
export default class ArrayField extends Field {
    /**
     * Тип элементов
     * @see {@link getKind}
     */
    protected _$kind: string;

    constructor(options?: IOptions) {
        super(options);
    }

    // region Public methods

    /**
     * Возвращает тип элементов
     */
    getKind(): string {
        return this._$kind;
    }

    // endregion Public methods
}

Object.assign(ArrayField.prototype, {
    '[Types/_entity/format/ArrayField]': true,
    _moduleName: 'Types/entity:format.ArrayField',
    _typeName: 'Array',
    _$kind: '',
});

register('Types/entity:format.ArrayField', ArrayField, { instantiate: false });
