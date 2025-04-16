import { getMergeableProperty } from '../entity';
import { EntityMarker } from 'Types/declarations';

/**
 * @public
 */
export interface IOptionsOption {
    /**
     * Режим отладки.
     */
    debug?: boolean;
}

/**
 * @public
 */
export interface IOptions {
    /**
     *
     */
    options?: IOptionsOption;
}

/**
 * Миксин, позволяющий задавать опциональные настройки источника данных.
 * @public
 */
export default abstract class OptionsMixin {
    readonly '[Types/_source/OptionsMixin]': EntityMarker;

    /**
     * Дополнительные настройки источника данных.
     */
    protected _$options: IOptionsOption;

    /**
     * Возвращает дополнительные настройки источника данных.
     */
    getOptions(): IOptionsOption {
        return { ...this._$options };
    }

    setOptions(options: IOptionsOption): void {
        this._$options = { ...this._$options, ...(options || {}) };
    }

    /**
     * Объединяет набор опций суперкласса с наследником
     * @param Super Суперкласс
     * @param options Опции наследника
     */
    static addOptions<T>(Super: Function, options: T): T {
        return { ...Super.prototype._$options, ...options };
    }
}

Object.assign(OptionsMixin.prototype, {
    '[Types/_source/OptionsMixin]': true,

    _$options: getMergeableProperty<IOptionsOption>({
        debug: false,
    }),
});
