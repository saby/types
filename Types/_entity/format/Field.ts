import { mixin } from '../../util';
import DestroyableMixin from '../DestroyableMixin';
import IEquatable from '../IEquatable';
import OptionsToPropertyMixin from '../OptionsToPropertyMixin';
import SerializableMixin from '../SerializableMixin';
import CloneableMixin from '../CloneableMixin';
import { isEqual } from '../../object';
import { EntityMarker } from '../../_declarations';

export interface IOptions {
    name?: string;
    type?: string | Function;
    defaultValue?: unknown;
    nullable?: boolean;
}

/**
 * Прототип поля записи.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class Types/_entity/format/Field
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/IEquatable
 * @mixes Types/_entity/OptionsMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 */
export default abstract class Field
    extends mixin<
        DestroyableMixin,
        OptionsToPropertyMixin,
        SerializableMixin,
        CloneableMixin
    >(
        DestroyableMixin,
        OptionsToPropertyMixin,
        SerializableMixin,
        CloneableMixin
    )
    implements IEquatable
{
    /**
     * @cfg {String} Имя поля
     * @name Types/_entity/format/Field#name
     * @see getName
     * @see setName
     */
    protected _$name: string;

    /**
     * @cfg Модуль, который является конструктором значения поля
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
     * @name Types/_entity/format/Field#type
     * @see getType
     */
    protected _$type: string | Function;

    /**
     * @cfg {*} Значение поля по умолчанию
     * @name Types/_entity/format/Field#defaultValue
     * @see getDefaultValue
     * @see setDefaultValue
     */
    protected _$defaultValue: unknown;

    /**
     * @cfg {Boolean} Значение может быть null
     * @name Types/_entity/format/Field#nullable
     * @see isNullable
     * @see setNullable
     */
    protected _$nullable: boolean;

    /**
     * Название типа поля
     */
    protected _typeName: string;

    // region Types/_entity/IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker;

    constructor(options?: IOptions) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
    }

    /**
     * Сравнивает 2 формата поля на идентичность: совпадает тип, название, значение по умолчанию, признак isNullable.
     * Для полей со словарем - словарь.
     * @param {Types/_entity/format/Field} to Формат поля, с которым сравнить
     * @return {Boolean}
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
     * @return {String|Function}
     */
    getType(): string | Function {
        return this._$type || this.getTypeName();
    }

    /**
     * Возвращает название типа поля
     * @return {String}
     */
    getTypeName(): string {
        return this._typeName;
    }

    /**
     * Возвращает имя поля
     * @return {String}
     * @see name
     * @see setName
     */
    getName(): string {
        return this._$name;
    }

    /**
     * Устанавливает имя поля
     * @param {String} name Имя поля
     * @see name
     * @see getName
     */
    setName(name: string): void {
        this._$name = name;
    }

    /**
     * Возвращает значение поля по умолчанию
     * @return {*}
     * @see defaultValue
     * @see setDefaultValue
     */
    getDefaultValue(serialize: boolean = false): any {
        return this._$defaultValue;
    }

    /**
     * Устанавливает значение поля по умолчанию
     * @param {*} value Значение поля по умолчанию
     * @see defaultValue
     * @see getDefaultValue
     */
    setDefaultValue(value: any): void {
        this._$defaultValue = value;
    }

    /**
     * Возвращает признак, что значение может быть null
     * @return {Boolean}
     * @see name
     * @see setNullable
     */
    isNullable(): boolean {
        return this._$nullable;
    }

    /**
     * Устанавливает признак, что значение может быть null
     * @param {Boolean} nullable Значение может быть null
     * @see name
     * @see isNullable
     */
    setNullable(nullable: boolean): void {
        this._$nullable = nullable;
    }

    /**
     * Копирует формат поля из другого формата
     * @param {Types/_entity/format/Field} format Формат поля, который надо скопировать
     */
    copyFrom(format: Field): void {
        const formatOptions = format._getOptions();
        let key;
        for (const option in formatOptions) {
            if (formatOptions.hasOwnProperty(option)) {
                key = '_$' + option;
                if (key in this) {
                    this[key] = formatOptions[option];
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
