/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */
import Abstract from './Abstract';
import { enumerator } from '../collection';
import { Map } from '../shim';
import { EntityMarker } from 'Types/declarations';

/**
 *
 */
export type GroupFunc = (item: any) => string;
/**
 *
 */
export type ValueFunc = (item: any) => any;
/**
 *
 */
export type TKey = string | GroupFunc | undefined;
/**
 *
 */
export type TValue = string | ValueFunc | undefined;

/**
 * Группирующее звено цепочки.
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
     * @param value Поле значения или функция, возвращающая значение для каждого элемента.
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
            this._previous.reduce(
                // @ts-ignore
                (memo: Map<any, Grouped<any>[]>, item, index) => {
                    const key = toKey(item, index);
                    const value = toValue(item, index);
                    let group: Grouped<any>[];

                    if (memo.has(key)) {
                        group = memo.get(key) as Grouped<any>[];
                    } else {
                        group = [];
                        memo.set(key, group);
                    }
                    group.push(value);

                    return memo;
                },
                new Map<any, Grouped<any>[]>()
            )
        );
    }

    // endregion
    readonly '[Types/_chain/Grouped]': EntityMarker = true;
}

Object.assign(Grouped.prototype, {
    _key: null,
    _value: null,
});
