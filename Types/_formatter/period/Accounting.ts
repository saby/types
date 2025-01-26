/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import {
    DefaultFullFormats,
    DefaultFullWithoutYearFormats,
    DefaultShortFormats,
    DefaultShortWithoutYearFormats,
} from './Default';
import IPeriodConfiguration from './IConfiguration';
import { type FormatName } from '../date';

export class AccountingFullFormats extends DefaultFullFormats {
    static oneQuarter: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static quartersOneYear: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static quartersYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: FormatName[] = ['MONTH', 'FULL_MONTH'];
    static halfYearsYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];
}

export class AccountingShortFormats extends DefaultShortFormats {
    static oneQuarter: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersOneYear: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: FormatName[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static halfYearsYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

export class AccountingFullWithoutYearFormats extends DefaultFullWithoutYearFormats {
    static oneQuarter: FormatName[] = ['MONTH', 'MONTH'];
    static quartersOneYear: FormatName[] = ['MONTH', 'MONTH'];
    static quartersYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: FormatName[] = ['MONTH', 'MONTH'];
    static halfYearsYears: FormatName[] = ['FULL_MONTH', 'FULL_MONTH'];
}

export class AccountingShortWithoutYearFormats extends DefaultShortWithoutYearFormats {
    static oneQuarter: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];
    static quartersOneYear: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];
    static quartersYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: FormatName[] = ['SHR_MONTH', 'SHR_MONTH'];
    static halfYearsYears: FormatName[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

const Accounting: IPeriodConfiguration = {
    full: AccountingFullFormats,
    short: AccountingShortFormats,
    fullWithoutYear: AccountingFullWithoutYearFormats,
    shortWithoutYear: AccountingShortWithoutYearFormats,
};

export default Accounting;
