/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */
import { EntityMarker } from 'Types/declarations';
import Abstract from './Abstract';
import UniquelyEnumerator from './UniquelyEnumerator';

/**
 *
 */
export type ExtractFunc = (item: any, index: string | number) => string | number;

/**
 * Звено цепочки, обеспечивающее уникальность.
 * @public
 */
export default class Uniquely<T> extends Abstract<T> {
    /**
     * Возвращает уникальный идентификатор для каждого элемента.
     */
    protected _idExtractor: ExtractFunc;

    /**
     * Конструктор звена цепочки, обеспечивающего уникальность.
     * @param source Предыдущее звено.
     * @param idExtractor Возвращает уникальный идентификатор для каждого элемента.
     */
    constructor(source: Abstract<T>, idExtractor: ExtractFunc) {
        super(source);
        this._idExtractor = idExtractor;
    }

    destroy(): void {
        // @ts-ignore
        this._idExtractor = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): UniquelyEnumerator<T> {
        return new UniquelyEnumerator(this._previous, this._idExtractor);
    }

    toArray(): T[] {
        const source = this._previous.toArray();

        if (this._idExtractor) {
            const valueMap = new Map();
            source.forEach((item, index) => {
                const key = this._idExtractor(item, index);
                if (valueMap.has(key)) {
                    return;
                }
                valueMap.set(key, item);
            });
            return Array.from(valueMap, ([_, value]) => {
                return value;
            });
        }

        return Array.from(new Set(source));
    }

    // endregion
    readonly '[Types/_chain/Uniquely]': EntityMarker = true;
}

Object.assign(Uniquely.prototype, {
    _idExtractor: null,
});
