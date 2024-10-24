import OptionsMixin, { IOptions as IOptionsOptions } from './OptionsMixin';
import LazyMixin from './LazyMixin';
import DataMixin, { IOptions as IDataOptions } from './DataMixin';
import { OptionsToPropertyMixin, ISerializableSignature, SerializableMixin } from '../entity';
import { deprecateExtend, mixin } from '../util';

/**
 * @public
 */
export interface IOptions extends IDataOptions, IOptionsOptions {}

/**
 * Базовый источник данных.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @public
 */
export default abstract class Base extends mixin<
    OptionsToPropertyMixin,
    SerializableMixin,
    OptionsMixin,
    LazyMixin,
    DataMixin
>(OptionsToPropertyMixin, SerializableMixin, OptionsMixin, LazyMixin, DataMixin) {
    /**
     * @param options
     * @protected
     */
    protected constructor(options?: IOptions) {
        options = { ...(options || {}) };

        super(options);

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es 2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this.initBaseSource(options);
    }

    protected initBaseSource(options?: IOptions) {
        OptionsToPropertyMixin.initMixin(this, options);
        DataMixin.initMixin(this, options);
    }

    // region SerializableMixin

    toJSON(): ISerializableSignature<IOptions>;
    toJSON(key?: unknown): string;
    toJSON(_key?: unknown): ISerializableSignature<IOptions> | string {
        // @ts-ignore
        return SerializableMixin.prototype.toJSON.call(this);
    }

    static fromJSON<T = Base, K = IOptions>(data: ISerializableSignature<K>): T {
        // @ts-ignore
        return SerializableMixin.fromJSON.call(this, data);
    }

    // endregion

    /**
     * @deprecated
     */
    static extend(mixinsList: any, classExtender: any): Function {
        return deprecateExtend(this, classExtender, mixinsList, 'Types/_source/Base');
    }

    static es5Constructor(options: IOptions): void {
        options = { ...(options || {}) };

        Base.prototype.initBaseSource.call(this, options);
    }
}

Object.assign(Base.prototype, {
    '[Types/_source/Base]': true,
    _moduleName: 'Types/source:Base',
});
