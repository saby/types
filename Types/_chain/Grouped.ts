/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import { enumerator } from '../collection';
import { Map } from '../shim';
import { EntityMarker } from 'Types/_declarations';

type GroupFunc = (item: any) => string;

type ValueFunc = (item: any) => any;

type TKey = string | GroupFunc | undefined;
type TValue = string | ValueFunc | undefined;

/**
 * Группирующее звено цепочки.
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Grouped<T> extends Abstract<T> {
    /**
     * Функция, возвращающая ключ группировки для каждого элемента
     */
    protected _key: TKey;

    /**
     * Функция, возвращающая значение для каждого элемента
     */
    protected _value: TValue;

    /**
     * Конструктор группирующего звена цепочки.
     * @param source Предыдущее звено.
     * @param Поле группировки или функция группировки для каждого элемента.
     * @param [value] Поле значения или функция, возвращающая значение для каждого элемента.
     */
    constructor(source: Abstract<T>, key?: TKey, value?: TValue) {
        super(source);
        this._key = key;
        this._value = value;
    }

    destroy(): void {
        // @ts-ignore
        this._key = null;
        // @ts-ignore
        this._value = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): enumerator.Mapwise<T> {
        const toKey = Abstract.propertyMapper(this._key);
        const toValue = Abstract.propertyMapper(this._value);

        return new enumerator.Mapwise(
            this._previous.reduce((memo, item, index) => {
                const key = toKey(item, index);
                const value = toValue(item, index);
                let group: any[];

                if (memo.has(key)) {
                    group = memo.get(key);
                } else {
                    group = [];
                    memo.set(key, group);
                }
                group.push(value);

                return memo;
            }, new Map())
        );
    }

    // endregion
    readonly '[Types/_chain/Grouped]': EntityMarker = true;
}

Object.assign(Grouped.prototype, {
    _key: null,
    _value: null,
});
