/**
 * Библиотека конфигураций периода.
 * @library
 * @private
 * @module
 */

export {
    default as IPeriodConfiguration,
    PeriodType as PeriodTypes,
    IPeriodFormats,
    ConfigurationType as PeriodConfigurationType,
} from './_period/IConfiguration';
export { default as Default, DefaultShortFormats, DefaultFullFormats } from './_period/Default';
export {
    default as Accounting,
    AccountingFullFormats,
    AccountingShortFormats,
} from './_period/Accounting';
export { default as Text, TextFullFormats, TextShortFormats } from './_period/Text';
