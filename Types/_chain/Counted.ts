/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import { enumerator } from '../collection';
import { Map } from '../shim';

type KeyFunc = (key: any) => string;

/**
 * Агрегирующее звено цепочки, подсчитывающие количество элементов, объединенных по какому-то принципу.
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Counted<T> extends Abstract<T> {
    /**
     * Функция, возвращающая ключ группировки для каждого элемента
     */
    protected _key: string | KeyFunc;

    /**
     * Конструктор агрегирующего звена цепочки, подсчитывающего количество элементов, объединенных по какому-то принципу.
     * @param source Предыдущее звено.
     * @param [key] Поле агрегации или функция агрегации для каждого элемента.
     */
    constructor(source: Abstract<T>, key?: string | KeyFunc) {
        super(source);
        this._key = key;
    }

    destroy(): void {
        this._key = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): enumerator.Mapwise<T> {
        const toKey = Abstract.propertyMapper(this._key);

        return new enumerator.Mapwise(
            this._previous.reduce((memo, item, index) => {
                const key = toKey(item, index);
                const count = memo.has(key) ? memo.get(key) : 0;
                memo.set(key, count + 1);
                return memo;
            }, new Map())
        );
    }

    // endregion
}

Object.assign(Counted.prototype, {
    '[Types/_chain/Counted]': true,
    _key: null,
});
