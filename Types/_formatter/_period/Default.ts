/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import IPeriodConfiguration from './IConfiguration';
import 'i18n!controller?';
import { controller } from 'I18n/i18n';
import { type FormatName } from '../date';

export class DefaultFullFormats {
    static oneDay: FormatName[] = ['FULL_DATE_FULL_MONTH'];
    static daysOneMonth: FormatName[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsOneYear: FormatName[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsYears: FormatName[] = ['FULL_DATE', 'FULL_DATE'];

    static oneMonth: FormatName[] = ['FULL_MONTH'];
    static monthsOneYear: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static monthsYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneQuarter: FormatName[] = ['FULL_QUARTER'];
    static quartersOneYear: FormatName[] = ['QUARTER', 'FULL_QUARTER'];
    static get quartersOneYearsTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.manyQuarter;
    }
    static quartersYears: FormatName[] = ['FULL_QUARTER', 'FULL_QUARTER'];

    static oneHalfYear: FormatName[] = ['FULL_HALF_YEAR'];
    static halfYearsYears: FormatName[] = ['FULL_HALF_YEAR', 'FULL_HALF_YEAR'];

    static oneYear: FormatName[] = ['FULL_YEAR'];
    static years: FormatName[] = ['FULL_YEAR', 'FULL_YEAR'];

    static openStartPeriod: FormatName = 'FULL_DATE_FULL_MONTH';
    static get openStartPeriodTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.openStartPeriod;
    }

    static openFinishPeriod: FormatName = 'FULL_DATE_FULL_MONTH';
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
    static oneDay: FormatName[] = ['FULL_DATE_SHORT_MONTH'];
    static daysOneMonth: FormatName[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsOneYear: FormatName[] = ['FULL_DATE', 'FULL_DATE'];
    static daysMonthsYears: FormatName[] = ['FULL_DATE', 'FULL_DATE'];

    static oneMonth: FormatName[] = ['SHORT_MONTH'];
    static monthsOneYear: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static monthsYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneQuarter: FormatName[] = ['SHORT_QUARTER'];
    static quartersOneYear: FormatName[] = ['QUARTER', 'SHORT_QUARTER'];
    static get quartersOneYearsTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.shortQuarter;
    }
    static quartersYears: FormatName[] = ['SHORT_QUARTER', 'SHORT_QUARTER'];

    static oneHalfYear: FormatName[] = ['SHORT_HALF_YEAR'];
    static halfYearsYears: FormatName[] = ['SHORT_HALF_YEAR', 'SHORT_HALF_YEAR'];

    static oneYear: FormatName[] = ['FULL_YEAR'];
    static years: FormatName[] = ['FULL_YEAR', 'FULL_YEAR'];

    static openStartPeriod: FormatName = 'FULL_DATE_SHORT_MONTH';
    static get openStartPeriodTemplate(): string {
        return controller.currentLocaleConfig.calendarEntities.openStartPeriod;
    }

    static openFinishPeriod: FormatName = 'FULL_DATE_SHORT_MONTH';
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
