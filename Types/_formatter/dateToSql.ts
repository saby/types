/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import dateFormatter from './date';
import type { DateTime } from 'Types/entity';

/**
 * Режим сериализации даты
 */
export type SerializationMode = 'time' | 'date' | 'datetime';

/**
 * Режимы сериализации даты
 */
export const MODE: Record<string, SerializationMode> = {
    TIME: 'time',
    DATE: 'date',
    DATETIME: 'datetime',
};

const FORMAT = {
    time: 'HH:mm:ss${ms}Z',
    date: 'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD HH:mm:ss${ms}Z',
};

const UNIX_EPOCH_START = new Date(0);

/**
 * Сериализует дату в предпочтительный формат SQL.
 * @param date Дата для сериализации.
 * @param mode Режим сериализации.
 * @public
 */
export default function dateToSQL(date: Date, mode: SerializationMode = MODE.DATETIME): string {
    let format = FORMAT[mode];

    // There is some problem with integer timezone offsets in dates before UNIX epoch (maybe not only these ones)
    // because we'll lose time shift and get wrong result during next fromSql() call. Let's see an example:
    // var dt = new Date(0, 0, 1, 18, 00, 00);
    // console.log(dt);//Mon Jan 01 1900 18:00:00 GMT+0230 (Moscow standard time)
    // console.log(toSql(dt, 'time'));//18:00:00+02
    // The problem is '+02' because the real shift should be '+02.50'
    // We would really deal with it if we use timezone offsets with floating numbers.
    if ((mode === MODE.TIME && date < UNIX_EPOCH_START) || (date as DateTime).withoutTimeZone) {
        format = format.replace('Z', '');
    }

    const ms = date.getMilliseconds() > 0 ? '.SSS' : '';
    format = format.replace('${ms}', ms);
    return dateFormatter(date, format);
}
