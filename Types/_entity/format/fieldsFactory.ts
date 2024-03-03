/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import BooleanField from './BooleanField';
import IntegerField from './IntegerField';
import RealField, { IOptions as IRealFieldOptions } from './RealField';
import MoneyField, { IOptions as IMoneyFieldOptions } from './MoneyField';
import StringField from './StringField';
import XmlField from './XmlField';
import DateTimeField from './DateTimeField';
import DateField from './DateField';
import TimeField from './TimeField';
import TimeIntervalField from './TimeIntervalField';
import LinkField from './LinkField';
import IdentityField from './IdentityField';
import EnumField from './EnumField';
import FlagsField from './FlagsField';
import RecordField from './RecordField';
import RecordSetField from './RecordSetField';
import BinaryField from './BinaryField';
import UuidField from './UuidField';
import RpcFileField from './RpcFileField';
import ObjectField from './ObjectField';
import ArrayField from './ArrayField';
import Field from './Field';
import { isRegistered, resolve } from '../../di';
import { logger } from '../../util';
import { IHashMap } from '../../_declarations';

type Dictionary = string[] | IHashMap<string>;

/**
 * Перечисление типов полей.
 * @public
 */
export enum FieldTypeEnum {
    /**
     * Логический тип
     */
    boolean = 'boolean',
    /**
     * Целое число
     */
    integer = 'integer',
    /**
     * Реальное число
     */
    real = 'real',
    /**
     * Денежный тип
     */
    money = 'money',
    /**
     * Строчный тип
     */
    string = 'string',
    /**
     * Строка в XML-формате
     */
    xml = 'xml',
    /**
     * Дата и время
     */
    datetime = 'datetime',
    /**
     * Дата
     */
    date = 'date',
    /**
     * Время
     */
    time = 'time',
    /**
     * Временной интервал
     */
    timeinterval = 'timeinterval',
    /**
     * Идентификатор базы данных
     */
    identity = 'identity',
    /**
     * Перечисляемый тип
     */
    enum = 'enum',
    /**
     * Флаг
     */
    flags = 'flags',
    /**
     * Запись
     */
    record = 'record',
    /**
     * Модель
     */
    model = 'model',
    /**
     * RecordSet
     */
    recordset = 'recordset',
    /**
     * Двоичные данные
     */
    binary = 'binary',
    /**
     * uuid
     */
    uuid = 'uuid',
    /**
     * RPC-файл
     */
    rpcfile = 'rpcfile',
    /**
     * JSON-объект
     */
    object = 'object',
    /**
     * Массив
     */
    array = 'array',
}

export type FieldAliasType = `${FieldTypeEnum}`;

/**
 * Интерфейс короткого декларативного описания формата
 * @public
 */
export interface IShortDeclaration {
    /**
     * Тип поля (имя типа или конструктор типа)
     */
    type: FieldAliasType | string | Function;

    /**
     * Значение по умолчанию
     */
    defaultValue?: unknown;

    /**
     * Тип элементов в массиве
     * @see Types/_entity/format/ArrayField#kind
     */
    kind?: string;

    /**
     * Значение может быть нулевым.
     */
    nullable?: boolean;

    /**
     * Максимальное количество знаков в дробной части
     * @see Types/_entity/format/RealField#precision
     */
    precision?: number;

    /**
     * Большие деньги (значение передается строкой, чтобы избежать погрешностей выполнения операций с плавающей запятой)
     * @see Types/_entity/format/MoneyField#large
     */
    large?: boolean;

    /**
     * Без указания временной зоны
     * @see Types/_entity/format/DateTimeField#withoutTimeZone
     */
    withoutTimeZone?: boolean;

    /**
     * Словарь возможных значений
     * @see Types/_entity/format/FlagsField#dictionary
     * @see Types/_entity/format/EnumField#dictionary
     */
    dictionary?: Dictionary;
}

/**
 * Интерфейс полного декларативного описания формата
 * @public
 */
export interface IDeclaration extends IShortDeclaration {
    /**
     * Название поля
     */
    name: string;
}

export type FormatDeclaration =
    | IDeclaration[]
    | IHashMap<IShortDeclaration>
    | IHashMap<Function>
    | IHashMap<string>;

/**
 * Создает формат поля по его декларативному описанию.
 * @param declaration Декларативное описание.
 * @returns Формат поля.
 * @public
 */

/*
 * Creates field format by its declarative definition.
 * @param declaration Declarative definition
 * @returns Field format.
 * @public
 * @author Буранов А.Р.
 */
export default function <T extends Field = Field>(declaration: IDeclaration): T {
    /**
     * @typedef {String} FieldType
     * @variant boolean Логический тип
     * @variant integer Целое число
     * @variant real Реальное число
     * @variant money Денежный тип
     * @variant string Строчный тип
     * @variant xml Строка в XML-формате
     * @variant datetime Дата и время
     * @variant date Дата
     * @variant time Время
     * @variant timeinterval Временной интервал
     * @variant identity Идентификатор базы данных
     * @variant enum Перечисляемый тип
     * @variant flags Флаг
     * @variant record Запись
     * @variant model Модель
     * @variant recordset RecordSet
     * @variant binary Двоичные данные
     * @variant uuid UUID
     * @variant rpcfile RPC-файл
     * @variant object JSON-объект
     * @variant array Массив
     */

    /*
     * @typedef {String} FieldType
     * @variant boolean Logical
     * @variant integer Integer number
     * @variant real Real number
     * @variant money Money
     * @variant string String
     * @variant xml String in XML format
     * @variant datetime Date and time
     * @variant date Date
     * @variant time Time
     * @variant timeinterval Time interval
     * @variant identity Database identity
     * @variant enum Enum
     * @variant flags Flags
     * @variant record Record
     * @variant model Model
     * @variant recordset RecordSet
     * @variant binary Binary data
     * @variant uuid UUID
     * @variant rpcfile RPC file
     * @variant object JSON object
     * @variant array Array
     */

    /**
     * @typedef {Object} FieldDeclaration
     * @property {String} name Имя поля.
     * @property {FieldType|Function|String} type Тип поля (имя типа или конструктор типа)
     * @property {*} defaultValue Значение по умолчанию.
     * @property {Boolean} nullable Значение может быть нулевым.
     * @property {*} [*] Доступны любые варианты конструктора желаемого типа (Types/_entity/format/*Field).
     * Например, опция "precision" для типа @{link Types/_entity/format/MoneyField money}:
     * {name: 'amount', type: 'money', precision: 4}
     */

    /*
     * @typedef {Object} FieldDeclaration
     * @property {String} name Field name
     * @property {FieldType|Function|String} type Field type (type name or type constructor)
     * @property {*} defaultValue Default value
     * @property {Boolean} nullable Value can be null
     * @property {*} [*] Any constructor options of desired type (Types/_entity/format/*Field) are available.
     * For instance, option "precision" for type @{link Types/_entity/format/MoneyField money}:
     * {name: 'amount', type: 'money', precision: 4}
     */

    if (Object.getPrototypeOf(declaration) !== Object.prototype) {
        throw new TypeError(
            'Types/_entity/format/fieldsFactory: declaration should be an instance of Object'
        );
    }

    let type = declaration.type;
    if (typeof type === 'string') {
        switch (type.toLowerCase()) {
            case 'boolean':
                return new BooleanField(declaration) as T;
            case 'integer':
                return new IntegerField(declaration) as unknown as T;
            case 'real':
                return new RealField(declaration as IRealFieldOptions) as unknown as T;
            case 'money':
                return new MoneyField(declaration as IMoneyFieldOptions) as unknown as T;
            case 'string':
                return new StringField(declaration) as T;
            case 'text':
                logger.error(
                    'Types/_entity/format/fieldsFactory',
                    'Type "text" has been removed in 3.18.10. Use "string" instead.'
                );
                declaration.type = 'string';
                return new StringField(declaration) as T;
            case 'xml':
                return new XmlField(declaration) as unknown as T;
            case 'datetime':
                return new DateTimeField(declaration) as unknown as T;
            case 'date':
                return new DateField(declaration) as unknown as T;
            case 'time':
                return new TimeField(declaration) as unknown as T;
            case 'timeinterval':
                return new TimeIntervalField(declaration) as unknown as T;
            case 'link':
                return new LinkField(declaration) as unknown as T;
            case 'identity':
                return new IdentityField(declaration) as unknown as T;
            case 'enum':
                return new EnumField(declaration) as unknown as T;
            case 'flags':
                return new FlagsField(declaration) as unknown as T;
            case 'record':
            case 'model':
                return new RecordField(declaration) as T;
            case 'recordset':
                return new RecordSetField(declaration) as T;
            case 'binary':
                return new BinaryField(declaration) as T;
            case 'uuid':
                return new UuidField(declaration) as T;
            case 'rpcfile':
                return new RpcFileField(declaration) as T;
            case 'hierarchy':
                logger.error(
                    'Types/_entity/format/fieldsFactory',
                    'Type "hierarchy" has been removed in 3.18.10. Use "identity" instead.'
                );
                declaration.type = 'identity';
                return new IdentityField(declaration) as unknown as T;
            case 'object':
                return new ObjectField(declaration) as T;
            case 'array':
                return new ArrayField(declaration) as unknown as T;
        }

        if (isRegistered(type)) {
            type = resolve(type);
        }
    }

    if (typeof type === 'function') {
        const inst = Object.create(type.prototype);
        if (inst['[Types/_entity/IObject]'] && inst['[Types/_entity/FormattableMixin]']) {
            // Yes it's Types/_entity/Record
            return new RecordField(declaration) as T;
        } else if (inst['[Types/_collection/IList]'] && inst['[Types/_entity/FormattableMixin]']) {
            // Yes it's Types/_collection/RecordSet
            return new RecordSetField(declaration) as T;
        } else if (inst['[Types/_collection/IEnum]']) {
            return new EnumField(declaration) as unknown as T;
        } else if (inst['[Types/_collection/IFlags]']) {
            return new FlagsField(declaration) as unknown as T;
        } else if (inst instanceof Array) {
            return new ArrayField(declaration) as unknown as T;
        } else if (inst instanceof Date) {
            return new DateField(declaration) as unknown as T;
        } else if (inst instanceof String) {
            return new StringField(declaration) as T;
        } else if (inst instanceof Number) {
            return new RealField(declaration as IRealFieldOptions) as unknown as T;
        } else if (type === Object) {
            return new ObjectField(declaration) as T;
        }
    }

    throw new TypeError(
        'Types/_entity/format/fieldsFactory: ' +
            `unsupported field type ${typeof type === 'function' ? type.name : '"' + type + '"'}`
    );
}
