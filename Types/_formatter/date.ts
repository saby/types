/**
 * @module
 * @public
 */

import toRoman from './numberRoman';
import { controller } from 'I18n/i18n';
import ILocale from 'I18n/interfaces/ILocale';
import strategies from './_date/strategies';
import getTzDate from './_date/getTzDate';

import {
    DateFormattingStrategyType,
    IDateFormatConfig,
    DateFormattingStrategy,
} from './_date/IDateFormat';

interface IDateFormatOptions {
    lead?: number;
    lower?: boolean;
    separator?: string;
}

type Format = (
    date: Date,
    format?: string | IDateFormatConfig,
    timeZone?: number
) => string;

const AM_PM_BOUNDARY = 12;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const DECIMAL_BASE = 10;
const DECIMAL_POINT = '.';
const PARTS_SPACER = ' ';
const MATCH_DAY_NUMBER = /^DD\.|\.DD/;
const MATCH_HOURS = /HH/;

let tokensRegex: RegExp;
const tokens = {};

const getConfig = (): ILocale => {
    return controller.currentLocaleConfig;
};

/**
 * Проверяет дату на валидность
 * @param date
 */
function isInvalidDate(date: unknown): boolean {
    if (date === null || date === undefined) {
        return true;
    }

    if (date instanceof Date) {
        return !date.getFullYear() || date.toString() === 'Invalid Date';
    }

    if (typeof date === 'string') {
        return new Date(date).toString() === 'Invalid Date';
    }

    return false;
}

/**
 * Добавляет нули в начало числа.
 * @param value Число
 * @param count Максимальное количество цифр.
 * @return Число с нулями в начале.
 */

/*
 * Adds lead zeroes to the Number
 * @param value Number
 * @param count Max digits count
 * @return Number with leading zeroes
 */
function withLeadZeroes(value: number, count: number): string {
    const absValue = String(Math.abs(value));
    const restCount = count - absValue.length;
    const sign = value >= 0 ? '' : '-';
    return (
        sign +
        (String(Math.pow(DECIMAL_BASE, Math.max(0, restCount))).substr(1) +
            absValue)
    );
}

/**
 * Returns hour in 12-hours format
 */
function getTwelveHours(date: Date): number {
    return date.getHours() % AM_PM_BOUNDARY || AM_PM_BOUNDARY;
}

function getTotalHours(date: Date): number {
    const seconds = Math.floor(date.getTime() / 1000);
    return Math.floor(seconds / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR));
}

/**
 * Returns localized am/pm mark
 */
function getAmPm(date: Date): string {
    return date.getHours() >= AM_PM_BOUNDARY
        ? getConfig().calendarEntities.pm
        : getConfig().calendarEntities.am;
}

/**
 * Returns localized day of week in minimized notation
 */
function getDayOfWeekMin(date: Date): string {
    return getConfig().calendarEntities.minDays[date.getDay()];
}

/**
 * Returns localized day of week in short notation
 */
function getDayOfWeekShort(date: Date): string {
    return getConfig().calendarEntities.shortDays[date.getDay()];
}

/**
 * Returns localized day of week in long notation
 */
function getDayOfWeekLong(date: Date): string {
    return getConfig().calendarEntities.longDays[date.getDay()];
}

/**
 * Returns human-friendly month number
 */
function getHumanMonth(date: Date): number {
    return date.getMonth() + 1;
}

/**
 * Returns localized month name in short notation
 */
function getMonthNameShort(date: Date): string {
    return getConfig().calendarEntities.shortMonths[date.getMonth()];
}

/**
 * Returns localized month name in short notation and genitive case
 */
function getMonthNameShortGenitive(date: Date): string {
    return getConfig().calendarEntities.shortGenitiveMonths[date.getMonth()];
}

/**
 * Returns localized month name in short notation and locative case
 */
function getMonthNameShortLocative(date: Date): string {
    return getConfig().calendarEntities.shortLocativeMonths[date.getMonth()];
}

/**
 * Returns localized month name in long notation
 */
function getMonthNameLong(date: Date): string {
    return getConfig().calendarEntities.longMonths[date.getMonth()];
}

/**
 * Returns localized month name in genitive case
 */
function getMonthGenitive(date: Date): string {
    return getConfig().calendarEntities.longGenitiveMonths[date.getMonth()];
}

/**
 * Returns localized month name in locative case
 */
function getMonthLocative(date: Date): string {
    return getConfig().calendarEntities.longLocativeMonths[date.getMonth()];
}

/**
 * Returns quarter number
 */
function getQuarter(date: Date): number {
    return 1 + Math.floor(date.getMonth() / 3);
}

/**
 * Returns quarter number in roman notation
 */
function getQuarterRoman(date: Date): string {
    return toRoman(getQuarter(date));
}

/**
 * Returns quarter number in minimized roman notation
 */
function getQuarterRomanMin(date: Date): string {
    return getConfig().calendarEntities.minQuarter.replace(
        '$digit$s$',
        getQuarterRoman(date)
    );
}

/**
 * Returns quarter number in short roman notation
 */
function getQuarterRomanShort(date: Date): string {
    return getConfig().calendarEntities.shortQuarter.replace(
        '$digit$s$',
        getQuarterRoman(date)
    );
}

/**
 * Returns quarter number in long roman notation
 */
function getQuarterRomanLong(date: Date): string {
    return getConfig().calendarEntities.longQuarter.replace(
        '$digit$s$',
        getQuarterRoman(date)
    );
}

/**
 * Returns year number in minimized notation
 */
function getYearMin(date: Date): number {
    return date.getFullYear() % 100;
}

/**
 * Returns half a year number (1 or 2)
 */
function getHalfYear(date: Date): number {
    return date.getMonth() < 6 ? 1 : 2;
}

/**
 * Returns half a year number in roman notation
 */
function getHalfYearRoman(date: Date): string {
    return toRoman(getHalfYear(date));
}

/**
 * Returns localized half a year in minimized roman notation
 */
function getHalfYearRomanMin(date: Date): string {
    return getConfig().calendarEntities.minHalfYear.replace(
        '$digit$s$',
        getHalfYearRoman(date)
    );
}

/**
 * Returns localized half a year in long roman notation
 */
function getHalfYearRomanLong(date: Date): string {
    return getConfig().calendarEntities.longHalfYear.replace(
        '$digit$s$',
        getHalfYearRoman(date)
    );
}

/**
 * Returns time zone of given date
 */
function getTimeZone(date: Date, options: IDateFormatOptions): string {
    let totalMinutes = Math.trunc(date.getTimezoneOffset());
    const sign = totalMinutes <= 0 ? '+' : '-';
    totalMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
    const minutes = totalMinutes - MINUTES_IN_HOUR * hours;
    const minutesStr = minutes
        ? options.separator + withLeadZeroes(minutes, 2)
        : '';

    return `${sign}${withLeadZeroes(hours, 2)}${minutesStr}`;
}

/**
 * Returns regular expression to match date tokens in a string
 */
function getTokensRegex(): RegExp {
    if (tokensRegex) {
        return tokensRegex;
    }

    // More longer must match first
    const expr = Object.keys(tokens).sort((a: string, b: string): number => {
        return b.length - a.length;
    });
    tokensRegex = new RegExp('\\[[^\\]]+\\]|(' + expr.join('|') + ')', 'g');

    return tokensRegex;
}

/**
 * Добавляет токен для соответствия.
 * @param token Токен.
 * @param handler Обработчик токена (для String - имя метода в Date.prototype).
 * @param [options] Параметры для передачи обработчику.
 */

/*
 * Adds token to match
 * @param token Token
 * @param handler Token handler (for String is the method name in Date.prototype)
 * @param [options] Options to pass to the handler
 */
function addToken(
    token: string,
    handler: string | Function,
    options: IDateFormatOptions = {}
): void {
    tokens[token] = [handler, options];
    tokensRegex = null;
}

/**
 * Форматирует дату с обработчиком.
 * @param date Дата для форматирования.
 * @param handler Обработчик токена (для String - имя метода в Date.prototype).
 * @param [options] Параметры для передачи обработчику.
 */

/*
 * Formats date with a handler
 * @param date Date to format
 * @param handler Token handler (for String is the method name in Date.prototype)
 * @param [options] Options to pass to the handler
 */
function formatByToken(
    date: Date,
    handler: string | Function,
    options: IDateFormatOptions
): string {
    if (typeof handler === 'string') {
        handler = ((method) => {
            return (date) => {
                return date[method]();
            };
        })(handler);
    }

    let result = handler(date, options);

    if (options.lead) {
        result = withLeadZeroes(result, options.lead);
    }

    if (options.lower && typeof result === 'string') {
        result = result.toLowerCase();
    }

    return result;
}

// Time tokens
addToken('SSS', 'getMilliseconds', { lead: 3 });
addToken('s', 'getSeconds');
addToken('ss', 'getSeconds', { lead: 2 });
addToken('m', 'getMinutes');
addToken('mm', 'getMinutes', { lead: 2 });
addToken('h', getTwelveHours);
addToken('hh', getTwelveHours, { lead: 2 });
addToken('H', 'getHours');
addToken('HH', 'getHours', { lead: 2 });
addToken('HHH', getTotalHours);
addToken('a', getAmPm);

// Date tokens
addToken('D', 'getDate');
addToken('DD', 'getDate', { lead: 2 });
addToken('dd', getDayOfWeekMin);
addToken('ddl', getDayOfWeekMin, { lower: true });
addToken('ddd', getDayOfWeekShort);
addToken('dddl', getDayOfWeekShort, { lower: true });
addToken('dddd', getDayOfWeekLong);
addToken('ddddl', getDayOfWeekLong, { lower: true });
addToken('M', getHumanMonth);
addToken('MM', getHumanMonth, { lead: 2 });
addToken('MMM', getMonthNameShort);
addToken('MMMl', getMonthNameShort, { lower: true });
addToken('MMMo', getMonthNameShortGenitive);
addToken('MMMlo', getMonthNameShortGenitive, { lower: true });
addToken('MMMgen', getMonthNameShortGenitive);
addToken('MMMlgen', getMonthNameShortGenitive, { lower: true });
addToken('MMMloc', getMonthNameShortLocative);
addToken('MMMlloc', getMonthNameShortLocative, { lower: true });
addToken('MMMM', getMonthNameLong);
addToken('MMMMl', getMonthNameLong, { lower: true });
addToken('MMMMo', getMonthGenitive);
addToken('MMMMlo', getMonthGenitive, { lower: true });
addToken('MMMMgen', getMonthGenitive);
addToken('MMMMlgen', getMonthGenitive, { lower: true });
addToken('MMMMloc', getMonthLocative);
addToken('MMMMlloc', getMonthLocative, { lower: true });
addToken('Y', getYearMin);
addToken('Yh', getHalfYear);
addToken('YY', getYearMin, { lead: 2 });
addToken('YYhr', getHalfYearRomanMin);
addToken('YYYY', 'getFullYear');
addToken('YYYYhr', getHalfYearRomanLong);
addToken('Q', getQuarter);
addToken('Qr', getQuarterRoman);
addToken('QQr', getQuarterRomanMin);
addToken('QQQr', getQuarterRomanShort);
addToken('QQQQr', getQuarterRomanLong);

// Time zone tokens
addToken('Z', getTimeZone, { separator: ':' });
addToken('ZZ', getTimeZone, { separator: '' });

function buildConfig(
    date: Date,
    config: string | IDateFormatConfig,
    timeZoneOffset?: number
): IDateFormatConfig {
    const result =
        typeof config === 'string'
            ? {
                  mask: config,
                  timeZoneOffset,
              }
            : config;

    result.date = getTzDate(date, result.timeZoneOffset);

    if (!result.mask) {
        result.mask = getStrategy(result.strategy)(result.date, result);
    }

    return result;
}

function getStrategy(strategy: string | DateFormattingStrategy) {
    if (!strategy) {
        return strategies[DateFormattingStrategyType.Default];
    }

    if (typeof strategy === 'string') {
        return (
            strategies[strategy] ||
            strategies[DateFormattingStrategyType.Default]
        );
    }

    return strategy;
}

/**
 * Преобразует дату в строку указанного формата.
 * @name Types/_formatter/date#date
 * @function
 * @remark
 * <h2>Доступные константы для вывода дат {@link https://n.sbis.ru/article/384f11b8-53b8-49ab-a30c-54d756669220 по стандарту} с учетом локализации.</h2>
 * <ul>
 *     <li>FULL_DATE: полная дата, "DD.MM.YY" для "Ru-ru";</li>
 *     <li>FULL_DATE_DOW: полная дата с днем недели, "D MMMMlgen'YY, ddddl" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_MONTH: полная дата с полным названием месяца, "D MMMMlgen'YY" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_MONTH_FULL_YEAR: полная дата с полным названием месяца и полным годом, "D MMMMlgen YYYY" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_YEAR: полная дата с полным годом, "DD.MM.YYYY" для "Ru-ru";</li>
 *     <li>FULL_DATE_SHORT_MONTH: полная дата с кратким названием месяца, "D MMMlgen'YY" для "Ru-ru";</li>
 *     <li>FULL_DATE_SHORT_MONTH_FULL_YEAR: полная дата с кратким названием месяца и полным годом, "D MMMlgen YYYY" для "Ru-ru";</li>
 *     <li>FULL_DATETIME: полный формат даты и времени, "D MMMgen'YY HH:mm" для "Ru-ru";</li>
 *     <li>FULL_HALF_YEAR: полное полугодие и год, "YYYYhr 'YY" для "Ru-ru";</li>
 *     <li>FULL_MONTH: полное название месяца и год, "MMMM'YY" для "Ru-ru";</li>
 *     <li>FULL_QUARTER: полный квартал и год, "QQQQr 'YY" для "Ru-ru";</li>
 *     <li>FULL_TIME: полное время, "HH:mm:ss" для "Ru-ru";</li>
 *     <li>SHORT_DATE: краткая дата, "DD.MM" для "Ru-ru";</li>
 *     <li>SHORT_DATE_DOW: краткая дата с днем недели, "D MMMMlgen, ddddl" для "Ru-ru";</li>
 *     <li>SHORT_DATE_FULL_MONTH: краткая дата с полным названием месяца, "D MMMMlgen" для "Ru-ru";</li>
 *     <li>SHORT_DATE_SHORT_MONTH: краткая дата с кратким названием месяца, "D MMMlgen" для "Ru-ru";</li>
 *     <li>SHORT_DATETIME: краткий формат даты и времени, "D MMMl HH:mm" для "Ru-ru";</li>
 *     <li>SHORT_HALF_YEAR: краткое полугодие, "YYhr 'YY" для "Ru-ru";</li>
 *     <li>SHORT_MONTH: краткое название месяца и год, "MMM'YY" для "Ru-ru";</li>
 *     <li>SHORT_QUARTER: краткий квартал и год, "QQr 'YY" для "Ru-ru";</li>
 *     <li>SHORT_TIME: краткое время, "HH:mm" для "Ru-ru".</li>
 * </ul>
 *
 * <h2>Доступные константы для вывода дат {@link https://n.sbis.ru/article/384f11b8-53b8-49ab-a30c-54d756669220 по стандарту полей ввода} с учетом локализации.</h2>
 * <ul>
 *     <li>FULL_YEAR: полный год, "YYYY" для "Ru-ru";</li>
 *     <li>DIGITAL_MONTH_FULL_YEAR: цифровой формат месяца с полным годом "MM.YYYY" для "Ru-ru".</li>
 *     <li>FULL_TIME_FRACTION: полное время с миллисекундами, "HH:mm:ss.SSS" для "Ru-ru";</li>
 *     <li>FULL_DATE_SHORT_TIME: комбинированный формат полной даты и краткого времени:, "DD.MM.YY HH:mm" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_TIME: комбинированный формат полной даты и полного времени:, "DD.MM.YY HH:mm:ss" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_TIME_FRACTION: комбинированный формат полной даты и полного времени с миллисекундами:, "DD.MM.YY HH:mm:ss.SSS" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_YEAR_SHORT_TIME: комбинированный формат полной даты с полным годом и краткого времени:, "DD.MM.YYYY HH:mm" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_YEAR_FULL_TIME: комбинированный формат полной даты с полным годом и полного времени:, "DD.MM.YYYY HH:mm:ss" для "Ru-ru";</li>
 *     <li>FULL_DATE_FULL_YEAR_FULL_TIME_FRACTION: комбинированный формат полной даты с полным годом и полного времени с миллисекундами:, "DD.MM.YYYY HH:mm:ss.SSS" для "Ru-ru";</li>
 *     <li>SHORT_DATE_SHORT_TIME: комбинированный формат краткой даты и краткого времени:, "DD.MM HH:mm" для "Ru-ru";</li>
 *     <li>SHORT_DATE_FULL_TIME: комбинированный формат краткой даты и полного времени:, "DD.MM HH:mm:ss" для "Ru-ru";</li>
 *     <li>SHORT_DATE_FULL_TIME_FRACTION: комбинированный формат краткой даты и полного времени с миллисекундами:, "DD.MM HH:mm:ss.SSS" для "Ru-ru";</li>
 *     <li>DURATION_SHORT_TIME: продолжительность в кратком формате времени:, "HHH:mm" для "Ru-ru";</li>
 *     <li>DURATION_FULL_TIME: продолжительность в полном формате времени:, "HHH:mm:SS" для "Ru-ru";</li>
 * </ul>
 *
 * <h2>Доступные константы для вывода дат по стандарту {@link https://en.wikipedia.org/wiki/ISO_8601 ISO 8601}.</h2>
 * <ul>
 *     <li>ISO_DATETIME: полные дата и время — "YYYY-MM-DDTHH:mm:ss[.SSS]ZZ";</li>
 *     <li>ISO_DATETIME_SQL: полные дата и время, совместимые со {@link https://en.wikipedia.org/wiki/ISO_8601#cite_note-30 стандартами SQL} — "YYYY-MM-DD HH:mm:ss[.SSS]ZZ";</li>
 * </ul>
 *
 * <h2>Примеры использования констант.</h2>
 *
 * Выведем полную дату:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     const date = new Date(2018, 4, 7);
 *     console.log(format(date, format.FULL_DATE)); // 07.05.18
 * </pre>
 * Выведем полную дату с днем недели:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     const date = new Date(2018, 4, 7);
 *     console.log(format(date, format.FULL_DATE_DOW)); // 07 мая'18, понедельник
 * </pre>
 * Выведем текущее время в часовом поясе клиента:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     import {DateTime} from 'Types/entity';
 *     const date = new Date();
 *     console.log(format(date, format.SHORT_TIME, DateTime.getClientTimezoneOffset()));
 * </pre>
 *
 * <h2>Доступные маски.</h2>
 * <aside>
 *     <b>Не забывайте</b>, что отсчет месяцев в нативном {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth Date} начинается с 0:
 *     <pre>
 *         import {date as format} from 'Types/formatter';
 *
 *         const date = new Date(2023, 1, 15);
 *
 *         format(date, 'YYYY.MM.DD'); // '2023.02.15'
 *     </pre>
 * <aside>
 *
 * Отображение времени:
 * <ul>
 *     <li>s: секунды;</li>
 *     <li>ss: секунды с лидирующим нулем;</li>
 *     <li>m: минуты;</li>
 *     <li>mm: минуты с лидирующим нулем;</li>
 *     <li>h: часы в 12-часовом формате;</li>
 *     <li>hh: часы в 12-часовом формате с лидирующим нулем;</li>
 *     <li>H: часы в 24-часовом формате;</li>
 *     <li>HH: часы в 24-часовом формате с лидирующим нулем;</li>
 *     <li>HHH: число часов в абсолютном формате (0-∞);</li>
 *     <li>a: интервал суток либо до полудня (ante meridiem), либо после полудня (post meridiem) в текущей локали;</li>
 *     <li>SSS: дробная часть секунд (миллисекунды).</li>
 * </ul>
 * Отображение даты:
 * <ul>
 *     <li>D: порядковый номер дня месяца;</li>
 *     <li>DD: порядковый номер дня месяца с лидирующим нулем;</li>
 *     <li>dd: краткое название дня недели в текущей локали с заглавной буквы (например, 'Пн' или 'Mo');</li>
 *     <li>ddl: краткое название дня недели в текущей локали в нижнем регистре (например, 'пн' или 'mo');</li>
 *     <li>ddd: сокращенное название дня недели в текущей локали с заглавной буквы (например, 'Пнд' или 'Mon');</li>
 *     <li>dddl: сокращенное название дня недели в текущей локали в нижнем регистре (например, 'пнд' или 'mon');</li>
 *     <li>dddd: полное название дня недели в текущей локали с заглавной буквы (например, 'Понедельник' или 'Monday');</li>
 *     <li>ddddl: полное название дня недели в текущей локали в нижнем регистре (например, 'понедельник' или 'monday');</li>
 *     <li>M: порядковый номер месяца;</li>
 *     <li>MM: порядковый номер месяца с лидирующим нулем;</li>
 *     <li>MMM: сокращенное название месяца в текущей локали (например, 'Янв' или 'Jan');</li>
 *     <li>MMMgen: сокращенное название месяца в текущей локали в родительском падеже (например, 'Янв' или 'Jan', 'Мая' или 'May');</li>
 *     <li>MMMloc: сокращенное название месяца в текущей локали в местном падеже (например, 'Янв' или 'Jan', 'Мае' или 'May')</li>
 *     <li>MMMl: сокращенное название месяца в текущей локали в нижнем регистре (например, 'янв' или 'jan');</li>
 *     <li>MMMlgen: сокращенное название месяца в текущей локали в родительном падеже в нижнем регистре  (например, 'янв' или 'jan', 'мая' или 'may');</li>
 *     <li>MMMlloc: сокращенное название месяца в текущей локали в местном падеже в нижнем регистре (например, 'янв' или 'jan', 'мае' или 'may')</li>
 *     <li>MMMM: полное название месяца в текущей локали (например, 'Январь' или 'January');</li>
 *     <li>MMMMl: полное название месяца в текущей локали в нижнем регистре (например, 'январь' или 'january');</li>
 *     <li>MMMMgen: полное название месяца в текущей локали в родительном падеже (например, 'Января' или 'January');</li>
 *     <li>MMMMloc: полное название месяца в текущей локали в местном падеже (например, 'Январе' или 'January');</li>
 *     <li>MMMMlgen: полное название месяца в текущей локали в родительном падеже в нижнем регистре (например, 'января' или 'january');</li>
 *     <li>MMMMlloc: полное название месяца в текущей локали в местном падеже в нижнем регистре (например, 'январе' или 'january');</li>
 *     <li>Y: двузначный номер года;</li>
 *     <li>YY: двузначный номер года с лидирующим нулем;</li>
 *     <li>YYYY: четырехзначный номер года;</li>
 *     <li>YYhr: номер полугодия в римской нотации и полугодие в текущей локали в краткой форме (например, 'I пл' или 'I hy');</li>
 *     <li>YYYYhr: номер полугодия в римской нотации и полугодие в текущей локали в полной форме (например, 'I полугодие' или 'I half year');</li>
 *     <li>QQr: номер квартала в римской нотации и квартал в текущей локали в краткой форме (например, 'I кв' или 'I qt');</li>
 *     <li>QQQr: номер квартала в римской нотации и квартал в текущей локали в сокращенной форме (например, 'I квр' или 'I qtr');</li>
 *     <li>QQQQr: номер квартала в римской нотации и квартал в текущей локали в полной форме (например, 'I квартал' или 'I quarter').</li>
 *     <li>Z: Смещение от стандартного времени в виде +-HH:mm например +03 или +03:30</li>
 *     <li>ZZ: Смещение от стандартного времени в виде +-HHmm например +03 или +0330</li>
 * </ul>
 *
 * <h2>Примеры использования масок.</h2>
 * Выведем дату:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     const date = new Date(2018, 4, 7);
 *     console.log(format(date, 'Сегодня ddddl, D MMMMlgen YYYY года.')); // Сегодня понедельник, 7 мая 2018 года.
 * </pre>
 *
 * Для экранирования вывода следует использовать квадратные скобки:
 * <pre>
 *     import {date as format} from 'Types/formatter';
 *     const date = new Date(2018, 4, 7);
 *     console.log(format(date, '[Today is] YYYY/DD/MM')); // Today is 2018/07/05
 * </pre>
 *
 * <h2>Склонение месяца по падежам.</h2>
 * Поддержка всех существующих падежей русского языка невозможна, т.к. сложно привести их к одному виду для всех используемых локалей.
 * Обратите внимание: по стандарту дат название месяца "Май" склоняется даже в короткой форме (MMMgen, MMMloc).
 * <h3>Родительный падеж.</h3>
 * <b>Родительный падеж</b> (genitive case) - падеж, выражающий притяжательные отношения, например, «1 апреля».
 * <ul>
 *     <li>MMMgen: сокращенное название месяца в текущей локали(например, 'Янв' или 'Jan', 'Мая' или 'May');</li>
 *     <li>MMMlgen: сокращенное название месяца в текущей локали в нижнем регистре (например, 'янв' или 'jan', 'мая' или 'may');</li>
 *     <li>MMMMgen: полное название месяца в текущей локали(например, 'Января' или 'January');
 *     <li>MMMMlgen: полное название месяца в текущей локали в нижнем регистре (например, 'января' или 'january');</li>
 * </ul>
 * <h3>Местный падеж.</h3>
 * <b>Местный падеж</b> ({@link https://en.wikipedia.org/wiki/Locative_case locative case} ) - падеж со значением места и времени, например, «в апреле». В русском языке часто совпадает с предложным падежом.
 * <ul>
 *     <li>MMMloc: сокращенное название месяца в текущей локали (например, 'Янв' или 'Jan', 'Мае' или 'May')</li>
 *     <li>MMMlloc: сокращенное название месяца в текущей локали в нижнем регистре (например, 'янв' или 'jan', 'мае' или 'may')</li>
 *     <li>MMMMloc: полное название месяца в текущей локали (например, 'Январе' или 'January');</li>
 *     <li>MMMMlloc: полное название месяца в текущей локали в нижнем регистре (например, 'январе' или 'january');</li>
 * </ul>
 *
 * @param {Date} date Дата.
 * @param {Types/formatter/IDateFormatConfig.typedef} configuration Конфигурация для форматирования даты.
 * @returns {String} Дата в указанном формате.
 * @public
 */
function format(
    date: Date,
    configuration: string | IDateFormatConfig = {},
    timeZoneOffset?: number
): string {
    if (isInvalidDate(date)) {
        throw new TypeError('Argument "date" should be valid instance of Date');
    }

    const config = buildConfig(date, configuration, timeZoneOffset);

    return String(config.mask).replace(getTokensRegex(), (token) => {
        // Check if to be escaped
        if (token[0] === '[' && token[token.length - 1] === ']') {
            return token.substr(1, token.length - 2);
        }

        return formatByToken(config.date, tokens[token][0], tokens[token][1]);
    });
}

/**
 * Constants with predefined formats
 */
class Constants {
    get DIGITAL_MONTH_FULL_YEAR(): string {
        return this.FULL_DATE_FULL_YEAR.replace(MATCH_DAY_NUMBER, '');
    }
    get DURATION_SHORT_TIME(): string {
        return this.SHORT_TIME.replace(MATCH_HOURS, 'HHH');
    }
    get DURATION_FULL_TIME(): string {
        return this.FULL_TIME.replace(MATCH_HOURS, 'HHH');
    }
    get FULL_DATE_DOW(): string {
        return getConfig().date.fullDateDayOfWeekFormat;
    }
    get DAY(): string {
        return 'D';
    }
    get FULL_DATE(): string {
        return getConfig().date.fullDateFormat;
    }
    get FULL_DATE_FULL_MONTH(): string {
        return getConfig().date.fullDateFullMonthFormat;
    }
    get FULL_DATE_FULL_MONTH_FULL_YEAR(): string {
        return getConfig().date.fullDateFullMonthFullYearFormat;
    }
    get FULL_DATE_FULL_YEAR(): string {
        return getConfig().date.fullDateFullYearFormat;
    }
    get FULL_DATE_SHORT_MONTH(): string {
        return getConfig().date.fullDateShortMonthFormat;
    }
    get FULL_DATE_SHORT_MONTH_FULL_YEAR(): string {
        return getConfig().date.fullDateShortMonthFullYearFormat;
    }
    get FULL_DATE_SHORT_TIME(): string {
        return this.FULL_DATE + PARTS_SPACER + this.SHORT_TIME;
    }
    get FULL_DATE_FULL_TIME(): string {
        return this.FULL_DATE + PARTS_SPACER + this.FULL_TIME;
    }
    get FULL_DATE_FULL_TIME_FRACTION(): string {
        return this.FULL_DATE + PARTS_SPACER + this.FULL_TIME_FRACTION;
    }
    get FULL_DATE_FULL_YEAR_SHORT_TIME(): string {
        return this.FULL_DATE_FULL_YEAR + PARTS_SPACER + this.SHORT_TIME;
    }
    get FULL_DATE_FULL_YEAR_FULL_TIME(): string {
        return this.FULL_DATE_FULL_YEAR + PARTS_SPACER + this.FULL_TIME;
    }
    get FULL_DATE_FULL_YEAR_FULL_TIME_FRACTION(): string {
        return (
            this.FULL_DATE_FULL_YEAR + PARTS_SPACER + this.FULL_TIME_FRACTION
        );
    }
    get FULL_DATETIME(): string {
        return (
            getConfig().date.fullDateShortMonthFormat +
            PARTS_SPACER +
            getConfig().date.shortTimeFormat
        );
    }
    get FULL_HALF_YEAR(): string {
        return getConfig().date.fullHalfYearFormat;
    }
    get FULL_MONTH(): string {
        return getConfig().date.fullMonthFormat;
    }
    get MONTH(): string {
        return 'MMMM';
    }
    get SHR_MONTH(): string {
        return 'MMM';
    }
    get FULL_QUARTER(): string {
        return getConfig().date.fullQuarterFormat;
    }
    get QUARTER(): string {
        return 'Qr';
    }
    get FULL_YEAR(): string {
        return 'YYYY';
    }
    get FULL_TIME(): string {
        return getConfig().date.fullTimeFormat;
    }
    get FULL_TIME_FRACTION(): string {
        return this.FULL_TIME + DECIMAL_POINT + 'SSS';
    }
    get ISO_DATETIME(): string {
        return 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
    }
    get ISO_DATETIME_SQL(): string {
        return 'YYYY-MM-DD HH:mm:ss.SSSZZ';
    }
    get SHORT_DATE_DOW(): string {
        return getConfig().date.shortDateDayOfWeekFormat;
    }
    get SHORT_DATE_SHORT_DOW(): string {
        return getConfig().date.shortDateDayOfShortWeekFormat;
    }
    get SHORT_DATE_SHORT_MONTH_SHORT_DOW(): string {
        return getConfig().date.shortDateDayOfShortWeekShortMonthFormat;
    }
    get SHORT_DATE(): string {
        return getConfig().date.shortDateFormat;
    }
    get SHORT_DATE_FULL_MONTH(): string {
        return getConfig().date.shortDateFullMonthFormat;
    }
    get SHORT_DATE_SHORT_MONTH(): string {
        return getConfig().date.shortDateShortMonthFormat;
    }
    get SHORT_DATE_SHORT_TIME(): string {
        return this.SHORT_DATE + PARTS_SPACER + this.SHORT_TIME;
    }
    get SHORT_DATE_FULL_TIME(): string {
        return this.SHORT_DATE + PARTS_SPACER + this.FULL_TIME;
    }
    get SHORT_DATE_FULL_TIME_FRACTION(): string {
        return this.SHORT_DATE + PARTS_SPACER + this.FULL_TIME_FRACTION;
    }
    get SHORT_DATETIME(): string {
        return (
            getConfig().date.shortDateShortMonthFormat +
            PARTS_SPACER +
            getConfig().date.shortTimeFormat
        );
    }
    get SHORT_HALF_YEAR(): string {
        return getConfig().date.shortHalfYearFormat;
    }
    get SHORT_MONTH(): string {
        return getConfig().date.shortMonthFormat;
    }
    get SHORT_QUARTER(): string {
        return getConfig().date.shortQuarterFormat;
    }
    get SHORT_TIME(): string {
        return getConfig().date.shortTimeFormat;
    }
}

export default format as Format & Constants;

// Process properties from Constants to the format
Object.getOwnPropertyNames(Constants.prototype)
    .filter((name) => {
        return name !== 'constructor';
    })
    .forEach((name) => {
        Object.defineProperty(
            format,
            name,
            Object.getOwnPropertyDescriptor(Constants.prototype, name)
        );
    });
