/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import { DefaultFullFormats, DefaultShortFormats } from './Default';
import IPeriodConfiguration from './IConfiguration';
import { type FormatName } from '../date';

export class WithoutYearFullFormats extends DefaultFullFormats {
    static oneDay: FormatName[] = ['SHORT_DATE_FULL_MONTH'];

    static oneMonth: FormatName[] = ['MONTH'];
    static monthsOneYear: FormatName[] = ['MONTH', 'MONTH'];

    static oneQuarter: FormatName[] = ['ONLY_QUARTER'];
    static quartersOneYear: FormatName[] = ['QUARTER', 'ONLY_QUARTER'];

    static oneHalfYear: FormatName[] = ['ONLY_HALF_YEAR'];

    static openStartPeriod: FormatName = 'SHORT_DATE_FULL_MONTH';

    static openFinishPeriod: FormatName = 'SHORT_DATE_FULL_MONTH';
}

export class WithoutYearShortFormats extends DefaultShortFormats {
    static oneDay: FormatName[] = ['SHORT_DATE_SHORT_MONTH'];

    static oneMonth: FormatName[] = ['SHR_MONTH'];
    static monthsOneYear: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];

    static oneQuarter: FormatName[] = ['ONLY_SHORT_QUARTER'];
    static quartersOneYear: FormatName[] = ['QUARTER', 'ONLY_SHORT_QUARTER'];

    static oneHalfYear: FormatName[] = ['ONLY_SHORT_HALF_YEAR'];

    static openStartPeriod: FormatName = 'SHORT_DATE_SHORT_MONTH';

    static openFinishPeriod: FormatName = 'SHORT_DATE_SHORT_MONTH';
}

const WithoutYear: IPeriodConfiguration = {
    full: WithoutYearFullFormats,
    short: WithoutYearShortFormats,
};

export default WithoutYear;
