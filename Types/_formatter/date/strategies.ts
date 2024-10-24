/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import { controller } from 'I18n/i18n';
import getTzDate from './getTzDate';

import {
    DateFormattingStrategyType,
    IDateFormatConfig,
    DateFormattingStrategy,
} from './IDateFormat';

function getFormatForRegistry(date: Date, currentDate: Date): string {
    const isOneYear = currentDate.getFullYear() === date.getFullYear();
    const boundaryDate = new Date(currentDate.getTime());

    if (date.getTime() > currentDate.getTime()) {
        boundaryDate.setMonth(currentDate.getMonth() + 2);

        if (boundaryDate.getTime() > date.getTime()) {
            return controller.currentLocaleConfig.date.SHORT_DATE_SHORT_MONTH;
        }
    } else {
        const offsetLength = isOneYear ? 6 : 4;

        boundaryDate.setMonth(currentDate.getMonth() - offsetLength);

        if (boundaryDate.getTime() < date.getTime()) {
            return controller.currentLocaleConfig.date.SHORT_DATE_SHORT_MONTH;
        }
    }

    return controller.currentLocaleConfig.date.FULL_DATE;
}

function isOneDay(date: Date, currentDate: Date): boolean {
    return (
        currentDate.getDate() === date.getDate() &&
        currentDate.getMonth() === date.getMonth() &&
        currentDate.getFullYear() === date.getFullYear()
    );
}

const strategies: Record<DateFormattingStrategyType, DateFormattingStrategy> = {
    Registry: (date: Date, config: IDateFormatConfig): string => {
        const currentDate = getTzDate(config.currentDate || new Date(), config.timeZoneOffset);

        if (isOneDay(date, currentDate)) {
            return controller.currentLocaleConfig.date.SHORT_TIME;
        }

        return getFormatForRegistry(date, currentDate);
    },

    OnlyDate: (date: Date, config: IDateFormatConfig): string => {
        const currentDate = getTzDate(config.currentDate || new Date(), config.timeZoneOffset);

        if (isOneDay(date, currentDate)) {
            return controller.currentLocaleConfig.date.SHORT_DATE_SHORT_MONTH;
        }

        return getFormatForRegistry(date, currentDate);
    },

    Default: (): string => {
        return controller.currentLocaleConfig.date.FULL_DATE;
    },
};

export default strategies;
