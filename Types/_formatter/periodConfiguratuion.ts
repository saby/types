/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * Библиотека конфигураций периода.
 * @library Types/_formatter/periodConfiguration
 * @includes Default Types/_formatter/_period/Default
 * @includes Accounting Types/_formatter/_period/Accounting
 * @includes Text Types/_formatter/_period/Text
 * @see Types/_formatter/period#
 * @public
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
