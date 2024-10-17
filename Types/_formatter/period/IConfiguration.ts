/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */

import { type FormatName } from '../date';

/**
 * Типы наборов форматов для периода. Описание наборов в {@link http://axure.tensor.ru/StandardsV8/форматы_дат_и_времени.html спецификациях}.
 */
export enum ConfigurationType {
    /**
     * Набор форматов по умолчанию.
     */
    Default = 'Default',
    /**
     * Текстовый набор форматов.
     */
    Text = 'Text',
    /**
     * Бухгалтерский набор форматов.
     */
    Accounting = 'Accounting',
    /**
     * Набор форматов где не указывается год для периода в рамках одного года.
     */
    WithoutYear = 'WithoutYear',
}

/**
 * Настройки для отображения периода.
 * @public
 */
export default interface IPeriodConfiguration {
    /**
     * Набор форматов с сокращёнными названиями.
     */
    short: IPeriodFormats;
    /**
     * Набор форматов без сокращений.
     */
    full: IPeriodFormats;
}

/**
 *
 */
export type PeriodTypeName = keyof typeof PeriodType;

/**
 * Типы периодов. Подробное описание типов в {@link http://axure.tensor.ru/StandardsV8/форматы_дат_и_времени.html спецификациях}.
 */
export enum PeriodType {
    /**
     * Один день.
     */
    oneDay = 'oneDay',
    /**
     * Дни в рамках одного месяца.
     */
    daysOneMonth = 'daysOneMonth',
    /**
     * Дни в рамках одного года.
     */
    daysMonthsOneYear = 'daysMonthsOneYear',
    /**
     * Дни в рамках нескольких лет.
     */
    daysMonthsYears = 'daysMonthsYears',

    /**
     * Один месяц.
     */
    oneMonth = 'oneMonth',
    /**
     * Месяцы в рамках года.
     */
    monthsOneYear = 'monthsOneYear',
    /**
     * Месяцы в рамках нескольких лет.
     */
    monthsYears = 'monthsYears',

    /**
     * Один квартал.
     */
    oneQuarter = 'oneQuarter',
    /**
     * Кварталы в рамках одного года.
     */
    quartersOneYear = 'quartersOneYear',
    /**
     * Строковой шаблон, когда кварталы в одном году.
     */
    quartersOneYearsTemplate = 'quartersOneYearsTemplate',
    /**
     * Кварталы в рамках нескольких лет.
     */
    quartersYears = 'quartersYears',

    /**
     * Одно полугодие.
     */
    oneHalfYear = 'oneHalfYear',
    /**
     * Полугодия в рамках нескольких лет.
     */
    halfYearsYears = 'halfYearsYears',

    /**
     * Один год.
     */
    oneYear = 'oneYear',
    /**
     * Несколько лет.
     */
    years = 'years',

    /**
     * Период с неуказанной начальной границей.
     */
    openStartPeriod = 'openStartPeriod',
    /**
     * Строковой шаблон периода с неуказанной начальной границей. Дата подставляется вместо DIGIT_TOKEN.
     */
    openStartPeriodTemplate = 'openStartPeriodTemplate',
    /**
     * Период с неуказанной конечной границей.
     */
    openFinishPeriod = 'openFinishPeriod',
    /**
     * Строковой шаблон периода с неуказанной конечной границей. Дата подставляется вместо DIGIT_TOKEN.
     */
    openFinishPeriodTemplate = 'openFinishPeriodTemplate',

    /**
     * Период с неуказанными границами.
     */
    allPeriod = 'allPeriod',
    /**
     * Текущий день.
     */
    today = 'today',
}

/**
 * Форматы отображения периода.
 * @public
 */
export interface IPeriodFormats {
    /**
     * Один день.
     */
    oneDay: FormatName[];
    /**
     * Дни в рамках одного месяца.
     */
    daysOneMonth: FormatName[];
    /**
     * Дни в рамках одного года.
     */
    daysMonthsOneYear: FormatName[];
    /**
     * Дни в рамках нескольких лет.
     */
    daysMonthsYears: FormatName[];

    /**
     * Один месяц.
     */
    oneMonth: FormatName[];
    /**
     * Месяцы в рамках года.
     */
    monthsOneYear: FormatName[];
    /**
     * Месяцы в рамках нескольких лет.
     */
    monthsYears: FormatName[];

    /**
     * Один квартал.
     */
    oneQuarter: FormatName[];
    /**
     * Кварталы в рамках одного года.
     */
    quartersOneYear: FormatName[];
    /**
     * Строковой шаблон, когда кварталы в одном году.
     */
    quartersOneYearsTemplate: string;
    /**
     * Кварталы в рамках нескольких лет.
     */
    quartersYears: FormatName[];

    /**
     * Одно полугодие.
     */
    oneHalfYear: FormatName[];
    /**
     * Полугодия в рамках нескольких лет.
     */
    halfYearsYears: FormatName[];

    /**
     * Один год.
     */
    oneYear: FormatName[];
    /**
     * Несколько лет.
     */
    years: FormatName[];

    /**
     * Период с неуказанной начальной границей.
     */
    openStartPeriod: FormatName;
    /**
     * Строковой шаблон периода с неуказанной начальной границей. Дата подставляется вместо DIGIT_TOKEN.
     */
    openStartPeriodTemplate: string;

    /**
     * Период с неуказанной конечной границей.
     */
    openFinishPeriod: FormatName;
    /**
     * Строковой шаблон периода с неуказанной конечной границей. Дата подставляется вместо DIGIT_TOKEN.
     */
    openFinishPeriodTemplate: string;

    /**
     * Период с неуказанными границами.
     */
    allPeriod: string;
    /**
     * Текущий день.
     */
    today: string;
}
