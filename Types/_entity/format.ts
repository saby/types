/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * Библиотека форматов.
 * @remark
 * При декларативном описании форматов названия типов соответствуют названиям классов:
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
 * @library Types/_entity/format
 * @includes Field Types/_entity/format/Field
 * @includes ArrayField Types/_entity/format/ArrayField
 * @includes BinaryField Types/_entity/format/BinaryField
 * @includes BooleanField Types/_entity/format/BooleanField
 * @includes DateField Types/_entity/format/DateField
 * @includes DateTimeField Types/_entity/format/DateTimeField
 * @includes DictionaryField Types/_entity/format/DictionaryField
 * @includes EnumField Types/_entity/format/EnumField
 * @includes fieldsFactory Types/_entity/format/fieldsFactory
 * @includes FlagsField Types/_entity/format/FlagsField
 * @includes IdentityField Types/_entity/format/IdentityField
 * @includes IntegerField Types/_entity/format/IntegerField
 * @includes MoneyField Types/_entity/format/MoneyField
 * @includes ObjectField Types/_entity/format/ObjectField
 * @includes RealField Types/_entity/format/RealField
 * @includes RecordField Types/_entity/format/RecordField
 * @includes RecordSetField Types/_entity/format/RecordSetField
 * @includes RpcFileField Types/_entity/format/RpcFileField
 * @includes StringField Types/_entity/format/StringField
 * @includes TimeField Types/_entity/format/TimeField
 * @includes TimeIntervalField Types/_entity/format/TimeIntervalField
 * @includes UuidField Types/_entity/format/UuidField
 * @includes XmlField Types/_entity/format/XmlField
 * @public
 */

/*
 * Formats library.
 * @library Types/_entity/format
 * @includes Field Types/_entity/format/Field
 * @includes ArrayField Types/_entity/format/ArrayField
 * @includes BinaryField Types/_entity/format/BinaryField
 * @includes BooleanField Types/_entity/format/BooleanField
 * @includes DateField Types/_entity/format/DateField
 * @includes DateTimeField Types/_entity/format/DateTimeField
 * @includes DictionaryField Types/_entity/format/DictionaryField
 * @includes EnumField Types/_entity/format/EnumField
 * @includes fieldsFactory Types/_entity/format/fieldsFactory
 * @includes FlagsField Types/_entity/format/FlagsField
 * @includes IdentityField Types/_entity/format/IdentityField
 * @includes IntegerField Types/_entity/format/IntegerField
 * @includes MoneyField Types/_entity/format/MoneyField
 * @includes ObjectField Types/_entity/format/ObjectField
 * @includes RealField Types/_entity/format/RealField
 * @includes RecordField Types/_entity/format/RecordField
 * @includes RecordSetField Types/_entity/format/RecordSetField
 * @includes RpcFileField Types/_entity/format/RpcFileField
 * @includes StringField Types/_entity/format/StringField
 * @includes TimeField Types/_entity/format/TimeField
 * @includes TimeIntervalField Types/_entity/format/TimeIntervalField
 * @includes UuidField Types/_entity/format/UuidField
 * @includes XmlField Types/_entity/format/XmlField
 * @public
 * @author Буранов А.Р.
 */

export { default as Field } from './format/Field';
export { default as ArrayField } from './format/ArrayField';
export { default as BinaryField } from './format/BinaryField';
export { default as BooleanField } from './format/BooleanField';
export { default as DateField } from './format/DateField';
export { default as DateTimeField } from './format/DateTimeField';
export { default as DictionaryField } from './format/DictionaryField';
export { default as EnumField } from './format/EnumField';
export {
    default as fieldsFactory,
    IDeclaration as IFieldDeclaration,
    IShortDeclaration,
    FormatDeclaration,
} from './format/fieldsFactory';
export { default as FlagsField } from './format/FlagsField';
export { default as HierarchyField } from './format/HierarchyField';
export { default as IdentityField } from './format/IdentityField';
export { default as IntegerField } from './format/IntegerField';
export { default as LinkField } from './format/LinkField';
export { default as MoneyField } from './format/MoneyField';
export { default as ObjectField } from './format/ObjectField';
export { default as RealField } from './format/RealField';
export { default as RecordField } from './format/RecordField';
export { default as RecordSetField } from './format/RecordSetField';
export { default as RpcFileField } from './format/RpcFileField';
export { default as StringField } from './format/StringField';
export { default as TimeField } from './format/TimeField';
export { default as TimeIntervalField } from './format/TimeIntervalField';
export {
    default as UniversalField,
    IMeta as IUniversalFieldMeta,
    IDateTimeMeta as IUniversalFieldDateTimeMeta,
    IDictionaryMeta as IUniversalFieldDictionaryMeta,
    IRealMeta as IUniversalFieldRealMeta,
    IMoneyMeta as IUniversalFieldMoneyMeta,
    IIdentityMeta as IUniversalFieldIdentityMeta,
    IArrayMeta as IUniversalFieldArrayMeta,
} from './format/UniversalField';
export { default as UuidField } from './format/UuidField';
export { default as XmlField } from './format/XmlField';
