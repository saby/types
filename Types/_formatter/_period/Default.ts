/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import IPeriodConfiguration from './IConfiguration';
import 'i18n!controller?';
import { controller } from 'I18n/i18n';

export class DefaultFullFormats {
    static oneDay: string[] = ['FULL_DATE_FULL_MONTH'];
    static daysOneMonth: string[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsOneYear: string[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsYears: string[] = ['FULL_DATE', 'FULL_DATE'];

    static oneMonth: string[] = ['FULL_MONTH'];
    static monthsOneYear: string[] = ['MONTH', 'FULL_MONTH'];
    static monthsYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneQuarter: string[] = ['FULL_QUARTER'];
    static quartersOneYear: string[] = ['QUARTER', 'FULL_QUARTER'];
    static get quartersOneYearsTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.manyQuarter;
    }
    static quartersYears: string[] = ['FULL_QUARTER', 'FULL_QUARTER'];

    static oneHalfYear: string[] = ['FULL_HALF_YEAR'];
    static halfYearsYears: string[] = ['FULL_HALF_YEAR', 'FULL_HALF_YEAR'];

    static oneYear: string[] = ['FULL_YEAR'];
    static years: string[] = ['FULL_YEAR', 'FULL_YEAR'];

    static openStartPeriod: string = 'FULL_DATE_FULL_MONTH';
    static get openStartPeriodTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.openStartPeriod;
    }

    static openFinishPeriod: string = 'FULL_DATE_FULL_MONTH';
    static get openFinishPeriodTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.openFinishPeriod;
    }

    static get allPeriod(): string {
        return controller.currentLocaleConfig.calendarEntities.allPeriod;
    }

    static get today(): string {
        return controller.currentLocaleConfig.calendarEntities.today;
    }
}

export class DefaultShortFormats {
    static oneDay: string[] = ['FULL_DATE_SHORT_MONTH'];
    static daysOneMonth: string[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsOneYear: string[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsYears: string[] = ['FULL_DATE', 'FULL_DATE'];

    static oneMonth: string[] = ['SHORT_MONTH'];
    static monthsOneYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static monthsYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneQuarter: string[] = ['SHORT_QUARTER'];
    static quartersOneYear: string[] = ['QUARTER', 'SHORT_QUARTER'];
    static get quartersOneYearsTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.shortQuarter;
    }
    static quartersYears: string[] = ['SHORT_QUARTER', 'SHORT_QUARTER'];

    static oneHalfYear: string[] = ['SHORT_HALF_YEAR'];
    static halfYearsYears: string[] = ['SHORT_HALF_YEAR', 'SHORT_HALF_YEAR'];

    static oneYear: string[] = ['FULL_YEAR'];
    static years: string[] = ['FULL_YEAR', 'FULL_YEAR'];

    static openStartPeriod: string = 'FULL_DATE_SHORT_MONTH';
    static get openStartPeriodTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.openStartPeriod;
    }

    static openFinishPeriod: string = 'FULL_DATE_SHORT_MONTH';
    static get openFinishPeriodTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.openFinishPeriod;
    }

    static get allPeriod(): string {
        return controller.currentLocaleConfig.calendarEntities.allPeriod;
    }

    static get today(): string {
        return controller.currentLocaleConfig.calendarEntities.today;
    }
}

const Default: IPeriodConfiguration = {
    full: DefaultFullFormats,
    short: DefaultShortFormats,
};

export default Default;
