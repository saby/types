/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import Abstract from './Abstract';
import MappedEnumerator from './MappedEnumerator';
import { IEnumerator } from '../collection';
import { EntityMarker } from 'Types/_declarations';
import { MapFunc } from './types';

/**
 * Преобразующее звено цепочки.
 * @extends Types/_chain/Abstract
 * @public
 */
export default class Mapped<T> extends Abstract<T> {
    /**
     * Функция, возвращающая новый элемент
     */
    protected _callback: MapFunc;

    /**
     * Контекст вызова _callback
     */
    protected _callbackContext: object;

    /**
     * Конструктор преобразующего звена цепочки.
     * @param source Предыдущее звено.
     * @param callback Функция, возвращающая новый элемент.
     * @param [callbackContext] Контекст вызова callback
     */
    constructor(source: Abstract<T>, callback?: MapFunc, callbackContext?: object) {
        super(source);
        this._callback = callback;
        this._callbackContext = callbackContext;
    }

    destroy(): void {
        this._callback = null;
        this._callbackContext = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): IEnumerator<T> {
        return new MappedEnumerator(this._previous, this._callback, this._callbackContext);
    }

    // endregion
    readonly '[Types/_chain/Mapped]': EntityMarker = true;
}

Object.assign(Mapped.prototype, {
    _callback: null,
    _callbackContext: null,
});
