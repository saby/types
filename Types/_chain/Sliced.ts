/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */
import Abstract from './Abstract';
import SlicedEnumerator from './SlicedEnumerator';
import { EntityMarker } from 'Types/declarations';

/**
 * Вырезающее звено цепочки.
 * @public
 */
export default class Sliced<T> extends Abstract<T> {
    /**
     * Индекс, по которому начинать извлечение
     */
    protected _begin: number;
    /**
     * Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
     */
    protected _end: number;

    /**
     * Конструктор вырезающего звена цепочки.
     * @param source Предыдущее звено.
     * @param begin Индекс, по которому начинать извлечение
     * @param end Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
     */
    constructor(source: Abstract<T>, begin: number, end: number) {
        super(source);
        this._begin = begin;
        this._end = end;
    }

    // region IEnumerable

    getEnumerator(): SlicedEnumerator<T> {
        return new SlicedEnumerator(this._previous, this._begin, this._end);
    }

    // endregion
    readonly '[Types/_chain/Sliced]': EntityMarker = true;
}

Object.assign(Sliced.prototype, {
    _begin: 0,
    _end: 0,
});
