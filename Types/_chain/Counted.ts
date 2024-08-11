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
export type KeyFunc = (key: any) => string;
/**
 *
 */
export type KeyType = string | KeyFunc | undefined;

/**
 * Агрегирующее звено цепочки, подсчитывающие количество элементов, объединенных по какому-то принципу.
 * @public
 */
export default class Counted<T> extends Abstract<T> {
    /**
     * Функция, возвращающая ключ группировки для каждого элемента
     */
    protected _key: KeyType;

    /**
     * Конструктор агрегирующего звена цепочки, подсчитывающего количество элементов, объединенных по какому-то принципу.
     * @param source Предыдущее звено.
     * @param key Поле агрегации или функция агрегации для каждого элемента.
     */
    constructor(source: Abstract<T>, key: KeyType) {
        super(source);
        this._key = key;
    }

    destroy(): void {
        // @ts-ignore
        this._key = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): enumerator.Mapwise<T> {
        const toKey = Abstract.propertyMapper(this._key);

        return new enumerator.Mapwise(
            this._previous.reduce<Map<string, any>>(
                // @ts-ignore
                (memo: Map<string, any>, item: T, index) => {
                    const key = toKey(item, index);
                    const count = memo.has(key) ? (memo.get(key) as number) : 0;
                    memo.set(key, count + 1);
                    return memo;
                },
                new Map<string, any>()
            )
        );
    }

    // endregion
    readonly '[Types/_chain/Counted]': EntityMarker = true;
}

Object.assign(Counted.prototype, {
    _key: null,
});
