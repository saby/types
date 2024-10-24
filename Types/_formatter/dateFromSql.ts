/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import { constants } from 'Env/Env';

// Date format which is preferred in SQL
const SQL_FORMAT = /([0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?)([+-])([0-9]{2})[:-]*([0-9]{2})*$/;

/**
 * Создает экземпляр даты из строки в формате SQL. Если в этой строке есть информация о часовом поясе, дата результата будет преобразована в местный часовой пояс.
 * @example
 * Все примеры приведены в местном часовом поясе UTC+3.
 * <b>Вариант 1.</b> В строке есть информация о часовом поясе.
 * <pre>
 *     import {dateFromSql} from 'Types/formatter';
 *     formatter.dateFromSql("2022-05-14 08:15:21+05");
 *     // Sat May 14 2022 06:15:21 GMT+0300
 * </pre>
 * <b>Вариант 2.</b> В строке есть информация о нулевом часовом поясе.
 * <pre>
 *     import {dateFromSql} from 'Types/formatter';
 *     formatter.dateFromSql("2022-05-14 08:15:21+00");
 *     // Sat May 14 2022 11:15:21 GMT+0300
 * </pre>
 * <b>Вариант 3.</b> В строке нет информации о часовом поясе
 * <pre>
 *     import {dateFromSql} from 'Types/formatter';
 *     formatter.dateFromSql("2022-05-14 08:15:21");
 *     // Sat May 14 2022 08:15:21 GMT+0300
 * </pre>
 * @param dateTime Дата и/или время в формате SQL.
 * @param defaultTimeZone Используйте данный часовой пояс для преобразования указанной даты (содержит смещение от UTC в минутах). Используется, если указанная дата не содержит информацию о часовом поясе.
 * @public
 */
export default function dateFromSql(dateTime: string, defaultTimeZone?: number): Date {
    let dateSep = dateTime.indexOf('-');
    const timeSep = dateTime.indexOf(':');
    const millisecSep = dateTime.indexOf('.');
    const tz = dateTime.match(SQL_FORMAT);
    // @ts-ignore
    const tzSep = (tz && tz.index + tz[1].length) || -1;
    const retval = new Date();
    let ms = null;
    let msStr;
    let y;
    let m;
    let d;

    retval.setHours(0, 0, 0, 0);

    if (timeSep === -1 && dateSep === -1) {
        return retval;
    }

    // It's only time with negative time zone
    if (timeSep > -1 && dateSep > timeSep) {
        dateSep = -1;
    }

    // Looking for milliseconds
    if (millisecSep !== -1) {
        msStr = dateTime.substr(
            millisecSep + 1,
            (tzSep === -1 ? dateTime.length : tzSep) - (millisecSep + 1)
        );
        if (msStr.length > 3) {
            msStr = msStr.substr(0, 3);
        }
        ms = parseInt(msStr, 10);
        if (msStr.length < 3) {
            ms *= msStr.length === 2 ? 10 : 100;
        }
    }

    // Apply date if defined
    if (dateSep !== -1) {
        y = parseInt(dateTime.substr(dateSep - 4, 4), 10);
        m = parseInt(dateTime.substr(dateSep + 1, 2), 10) - 1;
        d = parseInt(dateTime.substr(dateSep + 4, 2), 10);

        if (constants.compatibility.dateBug && m === 0 && d === 1) {
            retval.setHours(1);
        }

        retval.setFullYear(y, m, d);
    }
    const timeZoneOffset = retval.getTimezoneOffset();
    // Apply time if defined
    if (timeSep !== -1) {
        retval.setHours(
            parseInt(dateTime.substr(timeSep - 2, 2), 10),
            parseInt(dateTime.substr(timeSep + 1, 2), 10),
            parseInt(dateTime.substr(timeSep + 4, 2), 10),
            // @ts-ignore Передача undefined ломатет дату к чертям, приходиться передовать null
            ms
        );

        // First use default time zone
        let timeOffset = defaultTimeZone;

        // Use time zone from dateTime if available
        if (tz) {
            timeOffset = Number(tz[2] + '1') * (Number(tz[3]) * 60 + (Number(tz[4]) * 1 || 0));
        }

        // Apply time zone by shifting minutes
        if (timeOffset !== undefined) {
            retval.setMinutes(retval.getMinutes() - timeOffset - timeZoneOffset);
        }
    }

    return retval;
}
