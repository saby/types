/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 * @module
 * @public
 */
import {
    DefaultFullFormats,
    DefaultFullWithoutYearFormats,
    DefaultShortFormats,
    DefaultShortWithoutYearFormats,
} from './Default';
import IPeriodConfiguration from './IConfiguration';
import { type FormatName } from '../date';

export class TextFullFormats extends DefaultFullFormats {
    static oneDay: FormatName[] = ['FULL_DATE_FULL_MONTH'];
    static daysOneMonth: FormatName[] = ['DAY', 'FULL_DATE_FULL_MONTH'];
    static daysMonthsOneYear: FormatName[] = ['SHORT_DATE_FULL_MONTH', 'FULL_DATE_FULL_MONTH'];
    static daysMonthsYears: FormatName[] = ['FULL_DATE_FULL_MONTH', 'FULL_DATE_FULL_MONTH'];

    static oneQuarter: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static quartersOneYear: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static quartersYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static halfYearsYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];
}

export class TextShortFormats extends DefaultShortFormats {
    static oneDay: FormatName[] = ['FULL_DATE_SHORT_MONTH'];
    static daysOneMonth: FormatName[] = ['DAY', 'FULL_DATE_SHORT_MONTH'];
    static daysMonthsOneYear: FormatName[] = ['SHORT_DATE_SHORT_MONTH', 'FULL_DATE_SHORT_MONTH'];
    static daysMonthsYears: FormatName[] = ['FULL_DATE_SHORT_MONTH', 'FULL_DATE_SHORT_MONTH'];

    static oneQuarter: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersOneYear: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static halfYearsYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

export class TextFullWithoutYearFormats extends DefaultFullWithoutYearFormats {
    static daysOneMonth: FormatName[] = ['DAY', 'SHORT_DATE_FULL_MONTH'];
    static daysMonthsOneYear: FormatName[] = ['SHORT_DATE_FULL_MONTH', 'SHORT_DATE_FULL_MONTH'];
    static daysMonthsYears: FormatName[] = ['FULL_DATE_FULL_MONTH', 'FULL_DATE_FULL_MONTH'];

    static oneQuarter: FormatName[] = ['MONTH', 'MONTH'];
    static quartersOneYear: FormatName[] = ['MONTH', 'MONTH'];
    static quartersYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: FormatName[] = ['MONTH', 'MONTH'];
    static halfYearsYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];
}

export class TextShortWithoutYearFormats extends DefaultShortWithoutYearFormats {
    static daysOneMonth: FormatName[] = ['DAY', 'SHORT_DATE_SHORT_MONTH'];
    static daysMonthsOneYear: FormatName[] = ['SHORT_DATE_SHORT_MONTH', 'SHORT_DATE_SHORT_MONTH'];
    static daysMonthsYears: FormatName[] = ['FULL_DATE_SHORT_MONTH', 'FULL_DATE_SHORT_MONTH'];

    static oneQuarter: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];
    static quartersOneYear: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];
    static quartersYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];
    static halfYearsYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

const Text: IPeriodConfiguration = {
    full: TextFullFormats,
    short: TextShortFormats,
    fullWithoutYear: TextFullWithoutYearFormats,
    shortWithoutYear: TextShortWithoutYearFormats,
};

export default Text;
