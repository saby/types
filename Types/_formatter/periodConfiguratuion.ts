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
} from './period/IConfiguration';
export { default as Default, DefaultShortFormats, DefaultFullFormats } from './period/Default';
export {
    default as Accounting,
    AccountingFullFormats,
    AccountingShortFormats,
} from './period/Accounting';
export { default as Text, TextFullFormats, TextShortFormats } from './period/Text';
