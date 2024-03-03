/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import { DefaultFullFormats, DefaultShortFormats } from './Default';
import IPeriodConfiguration from './IConfiguration';

export class AccountingFullFormats extends DefaultFullFormats {
    static oneQuarter: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersOneYear: string[] = ['MONTH', 'FULL_MONTH'];
    static quartersYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];

    static oneHalfYear: string[] = ['MONTH', 'FULL_MONTH'];
    static halfYearsYears: string[] = ['FULL_MONTH', 'FULL_MONTH'];
}

export class AccountingShortFormats extends DefaultShortFormats {
    static oneQuarter: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersOneYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static quartersYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];

    static oneHalfYear: string[] = ['SHR_MONTH', 'SHORT_MONTH'];
    static halfYearsYears: string[] = ['SHORT_MONTH', 'SHORT_MONTH'];
}

const Accounting: IPeriodConfiguration = {
    full: AccountingFullFormats,
    short: AccountingShortFormats,
};

export default Accounting;
