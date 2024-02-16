/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import format from './date';
import * as translate from 'i18n!Types';

/**
 * Тип квантификации
 * @typedef {String} RetrospectType
 * @variant Auto Автоопределение
 * @variant Time По времени
 * @variant Date По дням
 */
export enum RetrospectType {
    Auto,
    Time,
    Date,
}

function isThisDay(date: Date, thisDate: Date): boolean {
    const thisYear = thisDate.getFullYear();
    const thisMonth = thisDate.getMonth();
    const thisDay = thisDate.getDate();

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return year === thisYear && month === thisMonth && day === thisDay;
}

/**
 * Преобразует дату в строку относительно текущего момента времени ('сегодня', 'вчера' и т.п.).
 * @example
 * Выведем дату в с квантированием по дням:
 * <pre>
 *     import {retrospect, RetrospectType} from 'Types/formatter';
 *     const today = new Date();
 *     console.log(retrospect(today, RetrospectType.Date)); // 'Сегодня'
 * </pre>
 *
 * @param date Дата
 * @param {Types/formatter/retrospect/RetrospectType.typedef} type Тип кванта
 * @returns Дата в текстовом виде
 * @public
 */
export default function retrospect(date: Date, type: RetrospectType = RetrospectType.Auto): string {
    // Check arguments
    if (!(date instanceof Date)) {
        throw new TypeError('Argument "date" should be an instance of Date');
    }

    switch (type) {
        case RetrospectType.Date:
            const today = new Date();
            if (isThisDay(date, today)) {
                return translate('Today');
            }

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (isThisDay(date, yesterday)) {
                return translate('Yesterday');
            }

            return format(date, format.FULL_DATE);
    }

    return '[Under construction]';
}
