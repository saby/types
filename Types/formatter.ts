/**
 * Библиотека, которая форматирует типы в строки.
 * @library
 * @public
 * @module
 */

import * as periodConfiguration from './_formatter/periodConfiguratuion';

export { default as cyrTranslit } from './_formatter/cyrTranslit';
export {
    default as date,
    FormatName as DateFormatName,
    format as dateFormatter,
    IFormat as IDateFormat,
    Constants as DateConstants
} from './_formatter/date';
export {
    IDateFormatConfig,
    DateFormattingStrategyType,
    DateFormattingStrategy,
} from './_formatter/_date/IDateFormat';
export { default as dateFromSql } from './_formatter/dateFromSql';
export {
    default as dateToSql,
    SerializationMode as DateSerializationMode,
    MODE as TO_SQL_MODE,
} from './_formatter/dateToSql';
export {
    default as jsonReplacer,
    getReplacerWithStorage as getJsonReplacerWithStorage,
    JsonReplacerFunction,
    ILinkSignature as IJsonReplacerLinkSignature
} from './_formatter/jsonReplacer';
export {
    default as jsonReviver,
    getReviverWithStorage as getJsonReviverWithStorage,
    JsonReviverFunction,
    IConfig as IJsonReviverConfig,
    IUnresolvedInstance
} from './_formatter/jsonReviver';
export { default as numberRoman } from './_formatter/numberRoman';
export { default as numberWords } from './_formatter/numberWords';
export { default as number, IFormat, RoundingMode } from './_formatter/number';
export { default as period, Type as PeriodType, IPeriodParams } from './_formatter/period';
export {
    default as IPeriodConfiguration,
    PeriodType as PeriodTypes,
    IPeriodFormats,
    ConfigurationType as PeriodConfigurationType,
    PeriodTypeName
} from './_formatter/_period/IConfiguration';
export { periodConfiguration };
export { default as retrospect, RetrospectType } from './_formatter/retrospect';
export { default as template } from './_formatter/template';
export {
    default as timeInterval,
    IConfig as ITimeIntervalConfig,
    DisplayMode as TimeIntervalDisplayMode,
    ITimeIntervalUnits,
} from './_formatter/timeInterval';
export {
    default as money,
    IConfig as IMoneyConfig,
    DisplayMode as MoneyDisplayMode,
    CurrencyName,
} from './_formatter/money';
export { default as detectPeriodType } from './_formatter/detectPeriodType';
