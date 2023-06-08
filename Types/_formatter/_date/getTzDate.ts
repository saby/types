/**
 * Возврщает дату в указанной таймзоной.
 * @param date {Date} Дата, которую надо перевести в другую таймзону.
 * @param timeZoneOffset {Number} Cмещение часового пояса относительно текущей часового пояса UTC в минутах.
 */
export default function getTzDate(date: Date, timeZoneOffset?: number) {
    if (typeof timeZoneOffset !== 'number') {
        return date;
    }

    const localTimeZoneOffset = date.getTimezoneOffset();

    if (timeZoneOffset === localTimeZoneOffset) {
        return date;
    }

    const tzDate = new Date(date.getTime());

    // local time + localTimeZoneOffset = UTC time
    // UTC time - timeZoneOffset = given timezone time
    tzDate.setMinutes(
        tzDate.getMinutes() + localTimeZoneOffset - timeZoneOffset
    );

    // Pretend that the time zone offset is match the desired one
    tzDate.getTimezoneOffset = () => {
        return timeZoneOffset;
    };

    return tzDate;
}
