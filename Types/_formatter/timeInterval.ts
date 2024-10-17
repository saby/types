/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 * @public
 */
import { controller } from 'I18n/i18n';
import ILocale from 'I18n/interfaces/ILocale';
import ITimeUnits from 'I18n/interfaces/ITimeUnits';

const COUNT_MONTH_IN_YEAR = 12;
const TWO_DIGIT = 10;
const getLocaleConfig = (): ILocale => {
    return controller.currentLocaleConfig;
};

/**
 * Режимы отображения временного интервала.
 */
export enum DisplayMode {
    /**
     * Отображает интервал в формате Ч:ММ:СС, последнее и предпоследнее значение отображаются всегда даже при нулевых значениях.
     */
    Numeric = 0,
    /**
     * Отображает интервал c буквенными обозначениями временных единиц X л Y мес Z дн A ч B мин C сек
     */
    Literal = 1,
    /**
     * Если интервал меньше дня, то применяться Numeric, иначе Literal.
     */
    Mixed = 2,
}

/**
 * Обозначения единиц времени для конфигурации временного интервала.
 */
export interface ITimeIntervalUnits {
    /**
     * Года
     */
    years?: boolean;
    /**
     * Месяца
     */
    months?: boolean;
    /**
     * Недели
     */
    weeks?: boolean;
    /**
     * Дни
     */
    days?: boolean;
    /**
     * Часы
     */
    hours?: boolean;
    /**
     * Минуты
     */
    minutes?: boolean;
    /**
     * Секунды
     */
    seconds?: boolean;
}

/**
 * Конфигурация для функции форматирования временного интервала.
 */
export interface IConfig {
    /**
     * Временной интервал в миллисекундах. Обязательный параметр, если не передан startDate.
     */
    time?: number;
    /**
     * Дата начала временного интервала.
     */
    startDate?: Date;
    /**
     * Дата конца временного интервала, если не передан, считаем концом нынешнюю дату.
     */
    finishDate?: Date;
    /**
     * Режимы отображения временного интервала.
     */
    displayMode?: DisplayMode;
    /**
     * Количество отображаемых временных единиц в интервале. По умолчанию отображаем все не нулевые.
     */
    displayedUnitsNumber?: number;
    /**
     * Список отображаемых временных единиц. По умолчанию все true, если какое-то значение надо отключить, указать для него false.
     */
    displayedUnits?: ITimeIntervalUnits;
    /**
     * Показывать лидирующий ноль в временной единице.
     */
    leadZero?: boolean;
    /**
     * Показывать в интервале нулевые значения после не нулевых. 1 день 1 мин - 1 день 0 часов 1 мин 0 сек
     */
    showNullUnits?: boolean;
    /**
     * Использовать сокращённые обозначения временных единиц.
     */
    short?: boolean;
}

interface IInnerConfig extends IConfig {
    time: number;
    startDate: Date;
    finishDate: Date;
    displayMode: DisplayMode;
    short: boolean;
    displayedUnitsNumber: number;
    displayedUnits: ITimeIntervalUnits;
}

type TimeUnitType = 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';

export enum TimeUnits {
    Second = 1000,
    Minute = 60000,
    Hour = 3600000,
    Day = 86400000,
    Week = 604800000,
}

interface ITimeIntervalUnitsInMs {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
}

const msInUnits: ITimeIntervalUnitsInMs = {
    seconds: TimeUnits.Second,
    minutes: TimeUnits.Minute,
    hours: TimeUnits.Hour,
    days: TimeUnits.Day,
    weeks: TimeUnits.Week,
};

/*
 * Задача этой функции отделить года.
 * ВАЖНО: на выходе из функции год у начала/конца должен быть одинаковый, чтобы разница по getTime составляла меньше 1 года
 */
function detectedYears(config: IInnerConfig) {
    const start = config.startDate;
    const finish = config.finishDate;
    let result = 0;

    if (start.getFullYear() === finish.getFullYear()) {
        return result;
    }

    const years = finish.getFullYear() - start.getFullYear();

    // пытаемся определить, что в интервале есть полноценный год
    // если разница больше одного года, мы уверены, что между интервалами точно есть полный год
    if (years > 1) {
        result += years - 1;
        start.setFullYear(finish.getFullYear() - 1);
    }

    if (start.getMonth() > finish.getMonth()) {
        // если стартовый месяц больше финишного, то в интервале нет года
        return result;
    }

    if (start.getMonth() === finish.getMonth() && start.getDate() > finish.getDate()) {
        return result;
    }

    result++;
    start.setFullYear(finish.getFullYear());

    return result;
}

/*
 * Задача этой функции отделить месяцы.
 * ВАЖНО: на выходе из функции год/месяц у начала/конца должен быть одинаковый, чтобы разница по getTime составляла меньше 1 месяца
 */
function detectedMonths(config: IInnerConfig) {
    // если год скрыт, значит он перетекает в месяцы.
    // иначе начинаем с 0 месяцев
    let result = config.displayedUnits.years ? 0 : detectedYears(config) * COUNT_MONTH_IN_YEAR;
    const start = config.startDate;
    const finish = config.finishDate;

    if (sameMonth(start, finish) && sameYear(start, finish)) {
        return result;
    }

    let months;
    if (sameYear(start, finish)) {
        months = finish.getMonth() - start.getMonth();
    } else {
        // если года отличаются, надо вычислить количество месяцев между датами
        months = COUNT_MONTH_IN_YEAR - (start.getMonth() - finish.getMonth());
    }

    if (months > 1) {
        // если разница между датами составляет больше 1 месяца, считаем что все месяцы кроме последнего полноценные
        // а насчет последнего еще не уверены
        result += months - 1;

        // если месяцев больше 1, мы можем не учитывать год для вычисления дней между месяцами
        start.setFullYear(finish.getFullYear());

        // выравниваем месяцы с учетом отступа для одного неполноценного месяца
        start.setMonth(finish.getMonth() - 1);
    }

    // В этом месте мы гарантируем, что months === 1
    // Это значит, что остался один месяц, который нужно проверить на полноценность
    if (start.getDate() > finish.getDate()) {
        return result;
    }

    // если дошли до сюда, значит месяц полноценный
    result++;

    // выравниваем месяц и год
    start.setMonth(finish.getMonth());
    start.setFullYear(finish.getFullYear());

    return result;
}

function detectedUnits(config: IInnerConfig): ITimeUnits {
    const result: ITimeUnits = {};
    let count = 0;
    let isFirstUnit = true;
    const displayedUnits = Object.entries(config.displayedUnits) as [TimeUnitType, boolean][];

    for (const [nameUnit, enable] of displayedUnits) {
        if (!enable) {
            continue;
        }

        let res;

        switch (nameUnit) {
            case 'years': {
                res = detectedYears(config);
                config.time = getTimeInterval(config.startDate, config.finishDate);

                break;
            }
            case 'months': {
                res = detectedMonths(config);
                config.time = getTimeInterval(config.startDate, config.finishDate);

                break;
            }
            default: {
                res = Math.floor(config.time / msInUnits[nameUnit]);
                config.time = config.time % msInUnits[nameUnit];
            }
        }

        if (res || (!isFirstUnit && config.showNullUnits)) {
            isFirstUnit = false;
            result[nameUnit] = res;
            count++;
        }

        if (count === config.displayedUnitsNumber) {
            return result;
        }
    }

    return result;
}

function getTimeInterval(start: Date, finish: Date): number {
    return Math.abs(finish.getTime() - start.getTime());
}

function sameYear(start: Date, finish: Date): boolean {
    return start.getFullYear() === finish.getFullYear();
}

function sameMonth(start: Date, finish: Date): boolean {
    return start.getMonth() === finish.getMonth();
}

function buildStr(timeUnits: ITimeUnits, leadZero: boolean = false): string {
    const units = Object.values(timeUnits);

    if (units.length === 0) {
        return leadZero ? '00:00' : '0:00';
    }

    if (units.length === 1) {
        return `${leadZero ? '00' : '0'}:${units[0] < TWO_DIGIT ? `0${units[0]}` : units[0]}`;
    }

    return units
        .map((value, index) => {
            if (index === 0 && leadZero && value < TWO_DIGIT) {
                return `0${value}`;
            }
            return index !== 0 && value < TWO_DIGIT ? `0${value}` : value;
        })
        .join(':');
}

function buildConfig(configuration: IConfig): IInnerConfig {
    if (!(typeof configuration.time === 'number' || configuration.startDate instanceof Date)) {
        throw new TypeError('Type is incorrect for field "time" or "startDate"');
    }

    const config: IConfig = {
        displayMode: DisplayMode.Numeric,
        short: true,
        displayedUnitsNumber: 6,
        ...configuration,
    };

    config.displayedUnits = {
        years: true,
        months: true,
        weeks: false,
        days: true,
        hours: true,
        minutes: true,
        seconds: true,
        ...configuration.displayedUnits,
    };

    if (!config.startDate) {
        config.displayedUnits.years = false;
        config.displayedUnits.months = false;
    } else {
        config.startDate = new Date(config.startDate.getTime());
        config.finishDate = config.finishDate ? new Date(config.finishDate.getTime()) : new Date();
        config.time = getTimeInterval(config.startDate, config.finishDate);
    }

    if (config.displayMode === DisplayMode.Mixed) {
        if ((config.time as number) / TimeUnits.Day < 1) {
            config.displayMode = DisplayMode.Numeric;
        } else {
            config.displayMode = DisplayMode.Literal;
            config.displayedUnits.minutes = false;
            config.displayedUnits.seconds = false;
        }
    }

    if (config.displayMode === DisplayMode.Numeric) {
        config.showNullUnits = true;
        config.displayedUnits.years = false;
        config.displayedUnits.months = false;
        config.displayedUnits.days = false;
    }

    return config as IInnerConfig;
}

/**
 * Функция форматирования временного интервала в строковое значение.
 * @example
 * Выведем интервал в Numeric режиме.
 * <pre>
 *     import {timeInterval} from 'Types/formatter';
 *
 *     // 0:10
 *     console.log(timeInterval({
 *         time: 10000
 *     });
 *
 *     // 1:01
 *     console.log(timeInterval({
 *         time: 61000
 *     });
 *
 *     // 72:00:00
 *     console.log(timeInterval({
 *         startDate: new Date(2023, 1, 1),
 *         finishDate: new Date(2023, 1, 4)
 *     });
 * </pre>
 * Выведем интервал в Literal режиме.
 * <pre>
 *     import { timeInterval, TimeIntervalDisplayMode } from 'Types/formatter';
 *
 *     // 10 сек
 *     timeInterval({
 *         time: 10000,
 *         displayMode: TimeIntervalDisplayMode.Literal
 *     });
 *
 *     // 1 мин 1 сек
 *     timeInterval({
 *         time: 61000,
 *         displayMode: TimeIntervalDisplayMode.Literal
 *     });
 *
 *     // 3 дн
 *     timeInterval({
 *         startDate: new Date(2023, 1, 1),
 *         finishDate: new Date(2023, 1, 4),
 *         displayMode: TimeIntervalDisplayMode.Literal
 *     });
 *
 *     // 1 г 1 мес 1 дн 1 ч 1 мин 1 сек
 *     timeInterval({
 *         startDate: new Date(2022, 1, 1, 1, 1, 1),
 *         finishDate: new Date(2023, 2, 2, 2, 2, 2),
 *         displayMode: TimeIntervalDisplayMode.Literal
 *     });
 * </pre>
 * Выведем интервал в Mixed режиме.
 * <pre>
 *     import { timeInterval, TimeIntervalDisplayMode } from 'Types/formatter';
 *
 *     // 0:10
 *     timeInterval({
 *         time: 10000,
 *         displayMode: TimeIntervalDisplayMode.Mixed
 *     });
 *
 *     // 1:01
 *     timeInterval({
 *         time: 61000,
 *         displayMode: TimeIntervalDisplayMode.Mixed
 *     });
 *
 *     // 1:01:00
 *     timeInterval({
 *         startDate: new Date(2023, 1, 1, 1, 1),
 *         finishDate: new Date(2023, 1, 1, 2, 2),
 *         displayMode: TimeIntervalDisplayMode.Mixed
 *     });
 *
 *     // 3 дн
 *     timeInterval({
 *         startDate: new Date(2023, 1, 1),
 *         finishDate: new Date(2023, 1, 4),
 *         displayMode: TimeIntervalDisplayMode.Mixed
 *     });
 *
 *     // 1 г 1 мес 1 дн 1 ч
 *     timeInterval({
 *         startDate: new Date(2022, 1, 1, 1, 1, 1),
 *         finishDate: new Date(2023, 2, 2, 2, 2, 2),
 *         displayMode: TimeIntervalDisplayMode.Mixed
 *     });
 * </pre>
 * Выведем только две самые большие единицы времени в интервале в Literal режиме.
 * <pre>
 *     import { timeInterval, TimeIntervalDisplayMode } from 'Types/formatter';
 *
 *     // 1 г 1 мес
 *     timeInterval({
 *         startDate: new Date(2022, 1, 1, 1, 1, 1),
 *         finishDate: new Date(2023, 2, 2, 2, 2, 2),
 *         displayMode: TimeIntervalDisplayMode.Literal,
 *         displayedUnitsNumber: 2
 *     });
 * </pre>
 * Отключим вывод секунд в интервале.
 * <pre>
 *     import { timeInterval, TimeIntervalDisplayMode } from 'Types/formatter';
 *
 *     // 1 г 1 мес 1 дн 1 ч 1 мин
 *     timeInterval({
 *         startDate: new Date(2022, 1, 1, 1, 1, 1),
 *         finishDate: new Date(2023, 2, 2, 2, 2, 2),
 *         displayMode: TimeIntervalDisplayMode.Literal,
 *         displayedUnits: {
 *             seconds: false
 *         }
 *     });
 *
 *     // 0:01 Вывелись Ч:ММ
 *     timeInterval({
 *         time: 61000,
 *         displayedUnits: {
 *             seconds: false
 *         }
 *     });
 *
 *     // 72:00
 *     timeInterval({
 *         startDate: new Date(2023, 1, 1),
 *         finishDate: new Date(2023, 1, 4),
 *         displayedUnits: {
 *             seconds: false
 *         }
 *     });
 * </pre>
 * @param configuration Конфигурация форматирования временного интервала.
 * @returns Интервал в текстовом виде.
 * @public
 */
export default function timeInterval(configuration: IConfig) {
    const config = buildConfig(configuration);

    const unitsInterval = detectedUnits(config);

    if (config.displayMode === DisplayMode.Literal) {
        return getLocaleConfig().timeInterval(unitsInterval, config.short);
    }

    return buildStr(unitsInterval, config.leadZero);
}
