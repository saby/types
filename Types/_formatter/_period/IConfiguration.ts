/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
// TODO убрать когда будет закрыта задача https://online.sbis.ru/opendoc.html?guid=08c63b19-78fc-4c31-a365-8c9074405b91
/**
 * @module
 * @public
 */

import { type FormatName } from '../date';

/**
 * Типы наборов форматов для периода. Описание наборов в {@link http://axure.tensor.ru/StandardsV8/форматы_дат_и_времени.html спецификациях}.
 * @typedef {String} PeriodConfigurationType
 * @variant Default Набор форматов по умолчанию.
 * @variant Text Текстовый набор форматов.
 * @variant Accounting Бухгалтерский набор форматов.
 * @variant WithoutYear Габор форматов где не указывается год для периода в рамках одного года.
 */
export enum ConfigurationType {
    Default = 'Default',
    Text = 'Text',
    Accounting = 'Accounting',
    WithoutYear = 'WithoutYear',
}

/**
 * Настройки для отображения периода.
 * @typedef {Object} IPeriodConfiguration
 * @property {Types/formatter/IPeriodFormats.typedef} short Набор форматов с сокращёнными названиями.
 * @property {Types/formatter/IPeriodFormats.typedef} full Набор форматов без сокращений.
 */
export default interface IPeriodConfiguration {
    short: IPeriodFormats;
    full: IPeriodFormats;
}

export type PeriodTypeName = keyof typeof PeriodType;

/**
 * Типы периодов. Подробное описание типов в {@link http://axure.tensor.ru/StandardsV8/форматы_дат_и_времени.html спецификациях}.
 * @typedef {String} PeriodTypes
 * @variant oneDay Один день.
 * @variant daysOneMonth Дни в рамках одного месяца.
 * @variant daysMonthsOneYear Дни в рамках одного года.
 * @variant daysMonthsYears Дни в рамках нескольких лет.
 * @variant oneMonth Один месяц.
 * @variant monthsOneYear Месяцы в рамках года.
 * @variant monthsYears Месяцы в рамках нескольких лет.
 * @variant oneQuarter Один квартал.
 * @variant quartersOneYear Кварталы в рамках одного года.
 * @variant quartersYears Кварталы в рамках нескольких лет.
 * @variant oneHalfYear Одно полугодие.
 * @variant halfYearsYears Полугодия в рамках нескольких лет.
 * @variant oneYear Один год.
 * @variant years Несколько лет.
 * @variant openStartPeriod Период с неуказанной начальной границей.
 * @variant openFinishPeriod Период с неуказанной конечной границей.
 * @variant allPeriod Период с неуказанными границами.
 * @variant today Текущий день.
 */
export enum PeriodType {
    oneDay = 'oneDay',
    daysOneMonth = 'daysOneMonth',
    daysMonthsOneYear = 'daysMonthsOneYear',
    daysMonthsYears = 'daysMonthsYears',

    oneMonth = 'oneMonth',
    monthsOneYear = 'monthsOneYear',
    monthsYears = 'monthsYears',

    oneQuarter = 'oneQuarter',
    quartersOneYear = 'quartersOneYear',
    quartersOneYearsTemplate = 'quartersOneYearsTemplate',
    quartersYears = 'quartersYears',

    oneHalfYear = 'oneHalfYear',
    halfYearsYears = 'halfYearsYears',

    oneYear = 'oneYear',
    years = 'years',

    openStartPeriod = 'openStartPeriod',
    openStartPeriodTemplate = 'openStartPeriodTemplate',
    openFinishPeriod = 'openFinishPeriod',
    openFinishPeriodTemplate = 'openFinishPeriodTemplate',

    allPeriod = 'allPeriod',
    today = 'today',
}

/**
 * Форматы отображения периода.
 * @typedef {Object} IPeriodFormats
 * @property {Array<String>} oneDay Один день.
 * @property {Array<String>} daysOneMonth Дни в рамках одного месяца.
 * @property {Array<String>} daysMonthsOneYear Дни в рамках одного года.
 * @property {Array<String>} daysMonthsYears Дни в рамках нескольких лет.
 * @property {Array<String>} oneMonth Один месяц.
 * @property {Array<String>} monthsOneYear Месяцы в рамках года.
 * @property {Array<String>} monthsYears Месяцы в рамках нескольких лет.
 * @property {Array<String>} oneQuarter Один квартал.
 * @property {Array<String>} quartersOneYear Кварталы в рамках одного года.
 * @property {Array<String>} quartersYears Кварталы в рамках нескольких лет.
 * @property {Array<String>} oneHalfYear Одно полугодие.
 * @property {Array<String>} halfYearsYears Полугодия в рамках нескольких лет.
 * @property {Array<String>} oneYear Один год.
 * @property {Array<String>} years Несколько лет.
 * @property {String} openStartPeriod Дата в периоде с неуказанной начальной границей.
 * @property {String} openStartPeriodTemplate Строковой шаблон периода с неуказанной начальной границей. Дата подставляется вместо DIGIT_TOKEN.
 * @property {String} openFinishPeriod Дата в периоде с неуказанной конечной границей.
 * @property {String} openFinishPeriodTemplate Строковой шаблон периода с неуказанной конечной границей. Дата подставляется вместо DIGIT_TOKEN.
 * @property {String} openStartPeriod Период с неуказанной начальной границей.
 * @property {String} allPeriod Период с неуказанными границами.
 * @property {String} today Текущий день.
 */
export interface IPeriodFormats {
    oneDay: FormatName[];
    daysOneMonth: FormatName[];
    daysMonthsOneYear: FormatName[];
    daysMonthsYears: FormatName[];

    oneMonth: FormatName[];
    monthsOneYear: FormatName[];
    monthsYears: FormatName[];

    oneQuarter: FormatName[];
    quartersOneYear: FormatName[];
    quartersOneYearsTemplate: string;
    quartersYears: FormatName[];

    oneHalfYear: FormatName[];
    halfYearsYears: FormatName[];

    oneYear: FormatName[];
    years: FormatName[];

    openStartPeriod: FormatName;
    openStartPeriodTemplate: string;

    openFinishPeriod: FormatName;
    openFinishPeriodTemplate: string;

    allPeriod: string;
    today: string;
}
