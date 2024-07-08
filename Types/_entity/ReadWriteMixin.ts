/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import OptionsToPropertyMixin from './OptionsToPropertyMixin';
import ObservableMixin, { IOptions as IOptionsObservableMixin } from './ObservableMixin';
import ManyToManyMixin from './ManyToManyMixin';
import { EntityMarker } from '../_declarations';

/**
 * Интерфейс опций конструктора ReadWriteMixin
 * @interface Types/entity:IReadWriteMixinOptions
 * @public
 */
export interface IOptions extends IOptionsObservableMixin {
    /**
     * Признак возможности записи.
     */
    writable?: boolean;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Свойство, хранящее признак возможности записи
 */
const $writable = Symbol('writable');

/**
 * Миксин, позволяющий ограничивать запись и чтение.
 * @remark
 * Подмешивается после Types/_entity/ObservableMixin и после Types/_entity/ManyToManyMixin, перекрывая часть их методов
 * @public
 */
export default abstract class ReadWriteMixin {
    '[Types/_entity/ReadWriteMixin]': EntityMarker;

    /**
     * @deprecated Старомодные параметры.
     */

    /*
     * @deprecated Old-fashioned options
     */
    protected _options: any;

    get writable(): boolean {
        return this[$writable];
    }

    constructor(options?: IOptions) {
        ReadWriteMixin.initMixin(this, options);
    }

    static initMixin(instance: any, options?: IOptions) {
        if (instance._options && hasOwnProperty.call(instance._options, 'writable')) {
            instance[$writable] = instance._options.writable;
        }

        if (options && hasOwnProperty.call(options, 'writable')) {
            instance[$writable] = options.writable;
        }

        if (instance[$writable]) {
            ObservableMixin.initMixin(instance, options);
        }
    }

    // This method calls implicitly when mixing in a row with DestroyableMixin
    destroy(...args: unknown[]): void {
        if (this[$writable]) {
            ObservableMixin.prototype.destroy.call(this);
            ManyToManyMixin.prototype.destroy.call(this);
        }
    }

    // endregion

    // region ObservableMixin

    subscribe(event: string, handler: Function, ctx?: object): void {
        if (this[$writable]) {
            return ObservableMixin.prototype.subscribe.call(this, event, handler, ctx);
        }
    }

    unsubscribe(event: string, handler: Function, ctx?: object): void {
        if (this[$writable]) {
            return ObservableMixin.prototype.unsubscribe.call(this, event, handler, ctx);
        }
    }

    // endregion

    // region OptionsToPropertyMixin

    protected _getOptions(): object {
        const options = (OptionsToPropertyMixin.prototype as any)._getOptions.call(this);

        // Delete "writable" property received from _options
        delete options.writable;
        return options;
    }

    // endregion
}

Object.assign(ReadWriteMixin.prototype, {
    '[Types/_entity/ReadWriteMixin]': true,

    // region ObservableMixin

    _publish(...events: string[]): void {
        if (this[$writable]) {
            return (ObservableMixin.prototype as any)._publish.apply(this, arguments);
        }
    },

    _notify(event: string, ...args: any[]): any {
        if (this[$writable]) {
            return (ObservableMixin.prototype as any)._notify.apply(this, arguments);
        }
    },

    // endregion
});

const IS_BROWSER = typeof window !== 'undefined';
const IS_TESTING = !!(
    typeof globalThis !== 'undefined' &&
    globalThis.assert &&
    globalThis.assert.strictEqual
);

/**
 * @property {Boolean} Объект можно модифицировать.
 * Запрет модификации выключит механизмы генерации событий (ObservableMixin).
 */
Object.defineProperty(ReadWriteMixin.prototype, $writable, {
    writable: true,
    value: IS_BROWSER || IS_TESTING,
});
