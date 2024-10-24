/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { register } from '../../di';

/**
 * Тип данных "Идентификатор".
 * @public
 * @example
 * <pre>
 *     import {Identity} from 'Types/entity';
 *
 *     const id = new Identity([1, 'Employees']);
 *     console.log(id.getValue()); // 1
 *     console.log(id.getName()); // 'Employees'
 *     console.log(String(id)); // '1,Employees'
 * </pre>
 */
export default class Identity {
    /**
     * Разделитель значений
     */
    _separator: string;

    /**
     * Значение идентификатора
     */
    _value: any[];

    /**
     * Конструктор типа "Идентификатор".
     * @param value Значение идентификатора
     */
    constructor(value: any[] | string | number) {
        if (!(value instanceof Array)) {
            if (typeof value === 'string') {
                value = value.split(this._separator);
            } else {
                value = [value];
            }
        }
        this._value = value;
    }

    // region Public methods

    /**
     * Возвращает значение поля таблицы.
     */
    getValue(): number | null {
        return this._value[0];
    }

    /**
     * Возвращает название таблицы.
     */
    getName(): string {
        return this._value[1];
    }

    valueOf(): any[] {
        return this._value;
    }

    toString(): string | null {
        return this._value[0] === null ? null : this._value.join(',');
    }

    // endregion
}

// @ts-ignore
Identity.prototype['[Types/_entity/applied/Identity]'] = true;
Identity.prototype._separator = ',';
// @ts-ignore
Identity.prototype._value = null;

register('Types/entity:Identity', Identity, { instantiate: false });
