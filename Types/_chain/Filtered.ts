/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import Abstract from './Abstract';
import FilteredEnumerator from './FilteredEnumerator';
import { EntityMarker } from 'Types/declarations';
import { CallbackFunc } from './types';

/**
 * Фильтрующее звено цепочки.
 * @public
 */
export default class Filtered<T> extends Abstract<T> {
    /**
     * Фильтр
     */
    protected _callback: CallbackFunc;

    /**
     * Контекст вызова _callback
     */
    protected _callbackContext: object;

    /**
     * Конструктор фильтрующего звена цепочки.
     * @param source Предыдущее звено.
     * @param callback Фильтр
     * @param callbackContext Контекст вызова callback
     */
    constructor(source: Abstract<T>, callback: CallbackFunc, callbackContext: object) {
        super(source);
        this._callback = callback;
        this._callbackContext = callbackContext;
    }

    destroy(): void {
        // @ts-ignore
        this._callback = null;
        // @ts-ignore
        this._callbackContext = null;
        super.destroy();
    }

    // region IEnumerable

    getEnumerator(): FilteredEnumerator<T> {
        return new FilteredEnumerator(this._previous, this._callback, this._callbackContext);
    }

    // endregion

    readonly '[Types/_chain/Filtered]': EntityMarker = true;
}
