/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */

/**
 * Доступные единицы расчета
 */
export enum Units {
    /**
     * Год
     */
    Year = 'Year',

    /**
     * Месяц
     */
    Month = 'Month',

    /**
     * День
     */
    Day = 'Day',
}

const MONTHS_IN_YEAR = 12;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MS_IN_SEC = 1000;
const SECONDS_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;
const MS_IN_DAY = SECONDS_IN_DAY * MS_IN_SEC;

function getDaysDifference(dateA: Date, dateB: Date): number {
    const dateANoon = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate(), 12);
    const dateBNoon = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate(), 12);

    return (Number(dateBNoon) - Number(dateANoon)) / MS_IN_DAY;
}

function getMonthsDifference(dateA: Date, dateB: Date): number {
    const dateAMonths = MONTHS_IN_YEAR * dateA.getFullYear() + dateA.getMonth();
    const dateBMonths = MONTHS_IN_YEAR * dateB.getFullYear() + dateB.getMonth();
    return dateBMonths - dateAMonths;
}

function getYearsDifference(dateA: Date, dateB: Date): number {
    return dateB.getFullYear() - dateA.getFullYear();
}

/**
 * Рассчитывает разницу между датами в указанных единицах.
 * @remark
 * <h2>Примеры использования.</h2>
 *
 * Выведем число дней между двумя датами:
 * <pre>
 *     import {compare} from 'Types/entity';
 *     const dateA = new Date(2019, 11, 31);
 *     const dateB = new Date(2020, 0, 1);
 *     console.log(compare.dateDifference(dateA, dateB, compare.DateUnits.Day)); // 1
 * </pre>
 *
 * @param dateA Первая дата
 * @param dateB Вторая дата
 * @param units Единица расчета (если не передан, используются миллисекунды)
 * @returns Разница между датами в виде целого числа (дробная часть отбрасывается) в указанных единицах.
 * @public
 */
export default function dateDifference(dateA: Date, dateB: Date, units?: Units): number {
    let output: number;

    if (dateA instanceof Date && dateB instanceof Date) {
        switch (units) {
            case Units.Year:
                output = getYearsDifference(dateA, dateB);
                break;
            case Units.Month:
                output = getMonthsDifference(dateA, dateB);
                break;
            case Units.Day:
                output = getDaysDifference(dateA, dateB);
                break;
            default:
                output = Number(dateB) - Number(dateA);
        }
    } else {
        output = Number(dateB) - Number(dateA);
    }

    return output < 0 ? -Math.floor(-output) : Math.floor(output);
}
