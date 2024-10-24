/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля иерархии
 * @private
 */
export default class HierarchyField extends Field {
    /**
     * Тип элементов
     * @see {@link getKind}
     */
    protected _$kind: string;

    // region Public methods

    /**
     * Возвращает тип элементов
     */
    getKind(): string {
        return this._$kind;
    }

    getDefaultValue(): any {
        if (this._$kind && this._$kind === 'Identity') {
            return [null];
        }
        return null;
    }

    // endregion Public methods
}

Object.assign(HierarchyField.prototype, {
    '[Types/_entity/format/HierarchyField]': true,
    _moduleName: 'Types/entity:format.HierarchyField',
    _typeName: 'Hierarchy',
    _$kind: '',
});

register('Types/entity:format.HierarchyField', HierarchyField, {
    instantiate: false,
});
