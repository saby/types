/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { mixin } from '../../util';
import DestroyableMixin from '../DestroyableMixin';
import IEquatable from '../IEquatable';
import OptionsToPropertyMixin from '../OptionsToPropertyMixin';
import SerializableMixin from '../SerializableMixin';
import CloneableMixin from '../CloneableMixin';
import { isEqual } from '../../object';
import { EntityMarker } from 'Types/declarations';

/**
 * @public
 */
export interface IOptions {
    /**
     *
     */
    name?: string;
    /**
     *
     */
    type?: string | Function;
    /**
     *
     */
    defaultValue?: unknown;
    /**
     *
     */
    nullable?: boolean;
}

/**
 * Прототип поля записи.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @public
 */
export default abstract class Field
    extends mixin<DestroyableMixin, OptionsToPropertyMixin, SerializableMixin, CloneableMixin>(
        DestroyableMixin,
        OptionsToPropertyMixin,
        SerializableMixin,
        CloneableMixin
    )
    implements IEquatable
{
    /**
     * Имя поля
     * @see {@link getName}
     * @see {@link setName}
     */
    protected _$name: string;

    /**
     * Модуль, который является конструктором значения поля
     * @remark
     * Поддерживается указание типа поля строковом представлении:
     * <pre>
     *     const field = {
     *         name: 'foo',
     *         type: 'time'
     *     };
     * </pre>
     * Список всех поддерживаемых типов полей в строковом представлении:
     * <ul>
     *     <li>type: 'array' - массив значений;</li>
     *     <li>type: 'binary' - двоичный тип;</li>
     *     <li>type: 'boolean' - логический тип;</li>
     *     <li>type: 'string' - строка;</li>
     *     <li>type: 'integer' - целочисленный тип;</li>
     *     <li>type: 'real' - вещественный тип;</li>
     *     <li>type: 'money' - тип "Деньги";</li>
     *     <li>type: 'date' - тип "Дата";</li>
     *     <li>type: 'dateTime' - тип "Дата и время";</li>
     *     <li>type: 'time' - тип "Время";</li>
     *     <li>type: 'timeinterval' - тип "Временной интервал";</li>
     *     <li>type: 'dictionary' - словарь значений;</li>
     *     <li>type: 'enum' - тип "Перечисляемое";</li>
     *     <li>type: 'flags' - тип "Флаги";</li>
     *     <li>type: 'hierarchy' - поля иерархии;</li>
     *     <li>type: 'identity' - тип "Идентификатор";</li>
     *     <li>type: 'link' -  тип "Связь";</li>
     *     <li>type: 'object' - JSON-объект;</li>
     *     <li>type: 'record' - тип "Запись";</li>
     *     <li>type: 'recordset' - тип "Рекордсет";</li>
     *     <li>type: 'rpcfile' - тип "Файл-RPC";</li>
     *     <li>type: 'uuid' - тип "UUID";</li>
     *     <li>type: 'xml' - строка в формате XML.;</li>
     * </ul>
     * @see {@link getType}
     */
    protected _$type: string | Function;

    /**
     * Значение поля по умолчанию
     * @see {@link getDefaultValue}
     * @see {@link setDefaultValue}
     */
    protected _$defaultValue: unknown;

    /**
     * Значение может быть null
     * @see {@link isNullable}
     * @see {@link setNullable}
     */
    protected _$nullable: boolean;

    /**
     * Название типа поля
     */
    protected _typeName: string;

    // region Types/_entity/IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker = true;

    constructor(options?: IOptions) {
        super(options);
        OptionsToPropertyMixin.initMixin(this, options);
    }

    /**
     * Сравнивает 2 формата поля на идентичность: совпадает тип, название, значение по умолчанию, признак isNullable.
     * Для полей со словарем - словарь.
     * @param to Формат поля, с которым сравнить
     */
    isEqual(to: Field): boolean {
        if (to === this) {
            return true;
        }
        const selfProto = Object.getPrototypeOf(this);
        const toProto = Object.getPrototypeOf(to);

        return (
            selfProto === toProto &&
            this.getName() === to.getName() &&
            isEqual(this.getDefaultValue(), to.getDefaultValue()) &&
            this.isNullable() === to.isNullable()
        );
    }

    // endregion

    // region Types/_entity/CloneableMixin

    clone<T = this>(shallow?: boolean): T {
        return super.clone(shallow);
    }

    // endregion

    // region Public methods

    /**
     * Возвращает модуль, который является конструктором значения поля
     */
    getType(): string | Function {
        return this._$type || this.getTypeName();
    }

    /**
     * Возвращает название типа поля
     */
    getTypeName(): string {
        return this._typeName;
    }

    /**
     * Возвращает имя поля
     * @see {@link setName}
     */
    getName(): string {
        return this._$name;
    }

    /**
     * Устанавливает имя поля
     * @param name Имя поля
     * @see {@link getName}
     */
    setName(name: string): void {
        this._$name = name;
    }

    /**
     * Возвращает значение поля по умолчанию
     * @see {@link setDefaultValue}
     */
    getDefaultValue(serialize?: boolean): any;
    getDefaultValue(): any {
        return this._$defaultValue;
    }

    /**
     * Устанавливает значение поля по умолчанию
     * @param value Значение поля по умолчанию
     * @see {@link getDefaultValue}
     */
    setDefaultValue(value: any): void {
        this._$defaultValue = value;
    }

    /**
     * Возвращает признак, что значение может быть null
     * @see {@link setNullable}
     */
    isNullable(): boolean {
        return this._$nullable;
    }

    /**
     * Устанавливает признак, что значение может быть null
     * @param nullable Значение может быть null
     * @see {@link isNullable}
     */
    setNullable(nullable: boolean): void {
        this._$nullable = nullable;
    }

    /**
     * Копирует формат поля из другого формата
     * @param format Формат поля, который надо скопировать
     */
    copyFrom(format: Field): void {
        const formatOptions = format._getOptions();
        let key;
        for (const option in formatOptions) {
            if (formatOptions.hasOwnProperty(option)) {
                key = '_$' + option;
                if (key in this) {
                    this[key as keyof this] = formatOptions[option];
                }
            }
        }
    }

    // endregion Public methods
}

Object.assign(Field.prototype, {
    '[Types/_entity/format/DestroyableMixin]': true,
    _$name: '',
    _$type: null,
    _$defaultValue: null,
    _$nullable: true,
    _typeName: '',
});
