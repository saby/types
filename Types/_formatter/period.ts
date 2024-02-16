/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import dateFormat from './date';
import Default from './_period/Default';
import Accounting from './_period/Accounting';
import Text from './_period/Text';
import IPeriodConfiguration, {
    ConfigurationType,
    IPeriodFormats,
    PeriodType,
} from './_period/IConfiguration';
import detectPeriodType from './detectPeriodType';

/**
 * Настройки для отображения периода.
 * @typedef {Object} IPeriodParams
 * @property {Types/formatter/PeriodConfigurationType.typedef|IPeriodConfiguration} [configuration='Default'] Тип набора форматов для каждого типа периода. Можно передать свой набор.
 * @property {Types/formatter/PeriodTypes.typedef} type Тип периода. Если не указан, будет определён автоматически.
 * @property {String} [undefinedPeriod='Весь период'] Выводимый текст, если период не задан.
 * @property {Boolean} [useToday=false] Использовать "Сегодня", если период это один день.
 * @property {Boolean} [short=false] Использовать сокращённые обозначения.
 */
export interface IPeriodParams {
    configuration?: ConfigurationType | IPeriodConfiguration;
    type?: PeriodType;
    undefinedPeriod?: string;
    useToday?: boolean;
    short?: boolean;
}

const SEPARATOR = '-';
const DIGIT_TOKEN = '$digit$s$';
const configurations = {
    Default,
    Accounting,
    Text,
};
const defaultOptions = {
    configuration: ConfigurationType.Default,
    short: false,
    useToday: false,
};

// Compatibility layer region start
// TODO Для поддержка старой сигнатуры period. Удалить в 21.4000
export enum Type {
    /**
     * Автоматически определить подходящий тип
     */
    Auto,

    /**
     * В циыры
     */
    Digital,

    /**
     * В виде дат в полном формате
     */
    FullDate,

    /**
     * В виде дат в коротком формате
     */
    ShortDate,

    /**
     * В виде месяцев в полном формате
     */
    FullMonth,

    /**
     * В виде месяцев в коротком формате
     */
    ShortMonth,

    /**
     * В виде кварталов в полном формате
     */
    FullQuarter,

    /**
     * В виде кварталов в коротком формате
     */
    ShortQuarter,

    /**
     * В виде полугодий в полном формате
     */
    FullHalfYear,

    /**
     * В виде дат полугодий в коротком формате
     */
    ShortHalfYear,

    /**
     * В виде дат в годовом формате
     */
    Year,
}

function generalPeriod(start: Date, finish: Date, format: string): string {
    if (isOpenPeriod(start, finish)) {
        return openPeriod(start, finish, configurations.Default.full);
    }

    const startLabel = dateFormat(start, format);
    const finishLabel = dateFormat(finish, format);

    if (startLabel === finishLabel) {
        return startLabel;
    } else {
        return `${startLabel}${SEPARATOR}${finishLabel}`;
    }
}

function digitalPeriod(start: Date, finish: Date): string {
    const format = dateFormat.FULL_DATE;

    if (isOpenPeriod(start, finish)) {
        return openPeriod(start, finish, configurations.Default.full);
    }

    return `${dateFormat(start, format)}${SEPARATOR}${dateFormat(finish, format)}`;
}

function datesPeriod(start: Date, finish: Date, type: Type): string {
    const format =
        type === Type.FullDate ? dateFormat.FULL_DATE_FULL_MONTH : dateFormat.FULL_DATE_SHORT_MONTH;

    if (isOpenPeriod(start, finish)) {
        return openPeriod(start, finish, configurations.Default.full);
    }

    const onlyMonthFormat =
        type === Type.FullDate
            ? dateFormat.FULL_DATE_FULL_MONTH
            : dateFormat.SHORT_DATE_SHORT_MONTH;
    const onlyDateFormat = type === Type.FullDate ? dateFormat.FULL_DATE_FULL_MONTH : 'D';

    const startDate = start.getDate();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const finishDate = finish.getDate();
    const finishMonth = finish.getMonth();
    const finishYear = finish.getFullYear();

    if (startYear === finishYear) {
        // The same year
        if (startMonth === finishMonth) {
            // The same month
            if (startDate === finishDate) {
                // The same date
                return dateFormat(start, format);
            }
            return `${dateFormat(start, onlyDateFormat)}${SEPARATOR}${dateFormat(finish, format)}`;
        }
        return `${dateFormat(start, onlyMonthFormat)}${SEPARATOR}${dateFormat(finish, format)}`;
    }

    return `${dateFormat(start, format)}${SEPARATOR}${dateFormat(finish, format)}`;
}

function monthsPeriod(start: Date, finish: Date, type: Type): string {
    const format = type === Type.FullMonth ? dateFormat.FULL_MONTH : dateFormat.SHORT_MONTH;

    if (isOpenPeriod(start, finish)) {
        return openPeriod(start, finish, configurations.Default.full);
    }

    const onlyMonthFormat = type === Type.FullMonth ? 'MMMM' : 'MMM';
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const finishMonth = finish.getMonth();
    const finishYear = finish.getFullYear();

    if (startYear === finishYear) {
        if (startMonth === finishMonth) {
            return dateFormat(start, format);
        }
        return `${dateFormat(start, onlyMonthFormat)}${SEPARATOR}${dateFormat(finish, format)}`;
    }

    return `${dateFormat(start, format)}${SEPARATOR}${dateFormat(finish, format)}`;
}

function quartersPeriod(start: Date, finish: Date, type: Type): string {
    return generalPeriod(
        start,
        finish,
        type === Type.FullQuarter ? dateFormat.FULL_QUARTER : dateFormat.SHORT_QUARTER
    );
}

function halvesYearsPeriod(start: Date, finish: Date, type: Type): string {
    return generalPeriod(
        start,
        finish,
        type === Type.FullHalfYear ? dateFormat.FULL_HALF_YEAR : dateFormat.SHORT_HALF_YEAR
    );
}

function yearsPeriod(start: Date, finish: Date): string {
    return generalPeriod(start, finish, 'YYYY');
}

function isOpenPeriod(start: Date, finish: Date): boolean {
    return !(start instanceof Date && finish instanceof Date);
}

function buildCompatibleMode(start: Date, finish: Date, type: Type): string {
    if (type === Type.Digital) {
        return digitalPeriod(start, finish);
    }

    // Dates period
    if (type === Type.FullDate || type === Type.ShortDate) {
        return datesPeriod(start, finish, type);
    }

    // Months period
    if (type === Type.FullMonth || type === Type.ShortMonth) {
        return monthsPeriod(start, finish, type);
    }

    // Quarters period
    if (type === Type.FullQuarter || type === Type.ShortQuarter) {
        return quartersPeriod(start, finish, type);
    }

    // Halves a year period
    if (type === Type.FullHalfYear || type === Type.ShortHalfYear) {
        return halvesYearsPeriod(start, finish, type);
    }

    // Years period
    return yearsPeriod(start, finish);
}
// Compatibility layer region end

function openPeriod(start: Date, finish: Date, formats: IPeriodFormats): string {
    if (!start) {
        return formats[PeriodType.openStartPeriodTemplate].replace(
            DIGIT_TOKEN,
            dateFormat(finish, dateFormat[formats[PeriodType.openStartPeriod]])
        );
    }

    if (!finish) {
        return formats[PeriodType.openFinishPeriodTemplate].replace(
            DIGIT_TOKEN,
            dateFormat(start, dateFormat[formats[PeriodType.openFinishPeriod]])
        );
    }
}

function getFormats(
    configuration: ConfigurationType | IPeriodConfiguration,
    short: boolean
): IPeriodFormats {
    const formats =
        typeof configuration === 'object'
            ? configuration
            : configurations[configuration || 'Default'];

    return short ? formats.short : formats.full;
}

function build(start: Date | null, finish: Date | null, options: IPeriodParams): string {
    const formats = getFormats(options.configuration, options.short);

    if (!(start || finish)) {
        return options.undefinedPeriod || formats.allPeriod;
    }

    if (!(start && finish)) {
        return openPeriod(start, finish, formats);
    }

    const type = options.type || detectPeriodType(start, finish);
    const [startPeriod, finishPeriod] = formats[type];

    if (type === PeriodType.today || (type === PeriodType.oneDay && options.useToday)) {
        return formats.today;
    }

    if (!finishPeriod) {
        return dateFormat(start, dateFormat[startPeriod]);
    }

    return `${dateFormat(start, dateFormat[startPeriod])}${SEPARATOR}${dateFormat(
        finish,
        dateFormat[finishPeriod]
    )}`;
}

/**
 * Преобразует временной период в строку указанного формата {@link https://n.sbis.ru/article/384f11b8-53b8-49ab-a30c-54d756669220 по стандарту}.
 * @example
 * Выведем период в полном формате из дефолтного набора. Тип формата будет определён автоматически:
 * <pre>
 *     import {period} from 'Types/formatter';
 *
 *     // 2021
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 11, 31));
 *     // I полугодие'21
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 5, 30));
 *     // I-III квартал'21
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 8, 30));
 *     // Январь-Апрель'21
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 3, 30));
 *     // 01.01.21-10.01.21
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 0, 10));
 *     // 1 января'21
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 0, 1));
 * </pre>
 *
 * Выведем период в формате короткой даты в текстовом виде:
 * <pre>
 *     import {period} from 'Types/formatter';
 *
 *     const start = new Date(2018, 4, 7);
 *     const finish = new Date(2019, 11, 3);
 *
 *     // 7 май'18-3 дек'19
 *     console.log(period(start, finish, {
 *         configuration: 'Text',
 *         short: true,
 *         type: 'daysMonthsYears'
 *     }));
 * </pre>
 *
 * Выведем "Сегодня", если период это один день:
 * <pre>
 *     import {period} from 'Types/formatter';
 *
 *     // Сегодня
 *     console.log(period(new Date(2021, 0, 1), new Date(2021, 0, 1), {
 *        useToday: true
 *     });
 * </pre>
 * Выведем открытый период:
 * <pre>
 *     import {period} from 'Types/formatter';
 *
 *     const date = new Date(2022, 6, 7);
 *
 *     console.log(period(null, date)); // 'to 7 July\'22'
 *     console.log(period(date, null)); // 'from 7 July\'22'
 * </pre>
 * @param {Date|null} start Дата начала периода.
 * @param {Date|null} finish Дата окончания периода.
 * @param {Types/formatter/IPeriodParams.typedef} [options] Настройки для отображения периода.
 * @returns {String} Период в текстовом виде.
 * @public
 */
export default function period(
    start: Date | null,
    finish: Date | null,
    options: Type | IPeriodParams = defaultOptions
): string {
    // TODO Для поддержка староой сигнатуры period. Удалить в 21.4000
    if (typeof options === 'number') {
        return buildCompatibleMode(start, finish, options);
    }

    return build(start, finish, options);
}
