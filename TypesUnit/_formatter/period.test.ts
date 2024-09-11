import { assert } from 'chai';
import { stub } from 'sinon';
import period, { Type } from 'Types/_formatter/period';
import IPeriodConfiguration, {
    PeriodType,
    ConfigurationType,
} from 'Types/_formatter/_period/IConfiguration';
import { controller } from 'I18n/i18n';
import en from 'I18n/locales/en';
import kk from 'I18n/locales/kk';
import ru from 'I18n/locales/ru';

import { DefaultFullFormats, DefaultShortFormats } from 'Types/_formatter/_period/Default';

type testingTupleComp = [Date, Date, Type, string];
type ITestingTuple = {
    [name in PeriodType]: [Date | null, Date | null, string];
};

function setLang(locale: string): () => void {
    const stubEnabled = stub(controller, 'isEnabled');
    const stubGetLang = stub(controller, 'currentLang');
    stubEnabled.get(() => {
        return true;
    });
    stubGetLang.get(() => {
        return locale;
    });

    const beforeLocale = controller.currentLang;
    controller.setLang(locale);

    return () => {
        stubEnabled.restore();
        stubGetLang.restore();
        controller.setLang(beforeLocale);
    };
}

describe('Types/_formatter/period', () => {
    const startYear = 2021;
    const firstMonth = 0;
    const firstDay = 1;

    const finishYear = 2022;
    const finishMonth = 6;
    const finishDay = 5;

    const start = new Date(startYear, firstMonth, firstDay);
    const finishAnotherYear = new Date(finishYear, firstMonth, firstDay);
    const finishAnotherMonth = new Date(startYear, finishMonth, firstDay);
    const finishAnotherDay = new Date(startYear, firstMonth, finishDay);

    const lastMonthOfThirdQuarter = 8;
    const lastMonthOfFirstQuarter = 2;
    const finishOfFirstQuarter = new Date(startYear, lastMonthOfFirstQuarter, firstDay);
    const finishOfThirdQuarter = new Date(startYear, lastMonthOfThirdQuarter, firstDay);
    const finishOfFirstQuarterAnotherYear = new Date(finishYear, lastMonthOfFirstQuarter, firstDay);

    const lastMonthOfHalfYear = 5;
    const finishOfHalfYear = new Date(startYear, lastMonthOfHalfYear, firstDay);
    const finishOfHalfYearAnotherYear = new Date(finishYear, lastMonthOfHalfYear, firstDay);

    let undo;

    controller.addLang('en', en);
    controller.addLang('ru', ru);
    controller.addLang('kk', kk);

    beforeEach(() => {
        undo = setLang('en');
    });

    afterEach(() => {
        undo();
    });

    it('should format open period if start or finish is not Date', () => {
        const date = new Date(startYear, firstMonth, finishDay);

        assert.strictEqual(period(null, date), "to 5 January'21");
        assert.strictEqual(period(date, null), "from 5 January'21");
    });

    it('should format undefined period if start and finish is not Date', () => {
        const options = {
            undefinedPeriod: 'WholePeriod',
        };

        assert.strictEqual(period(null, null, options), 'WholePeriod');
    });

    // TODO Поддержка старой сигнатуры period. Удалить в 21.4000.
    describe('Compatibility', () => {
        // eslint-disable-next-line no-magic-numbers
        const commonStart = new Date(2018, 1, 2);
        // eslint-disable-next-line no-magic-numbers
        const anotherYear = new Date(2019, 9, 8);
        // eslint-disable-next-line no-magic-numbers
        const anotherMonth = new Date(2018, 9, 8);
        // eslint-disable-next-line no-magic-numbers
        const anotherDay = new Date(2018, 1, 7);

        const expectedList: testingTupleComp[] = [
            [commonStart, anotherYear, Type.Digital, '02.02.18-08.10.19'],
            [commonStart, anotherYear, Type.FullDate, "2 February'18-8 October'19"],
            [commonStart, anotherYear, Type.ShortDate, "2 Feb'18-8 Oct'19"],
            [commonStart, anotherYear, Type.FullDate, "2 February'18-8 October'19"],
            [commonStart, anotherYear, Type.ShortDate, "2 Feb'18-8 Oct'19"],
            [commonStart, anotherYear, Type.FullDate, "2 February'18-8 October'19"],
            [commonStart, anotherYear, Type.ShortDate, "2 Feb'18-8 Oct'19"],
            [commonStart, anotherYear, Type.FullMonth, "February'18-October'19"],
            [commonStart, anotherYear, Type.ShortMonth, "Feb'18-Oct'19"],
            [commonStart, anotherYear, Type.FullQuarter, "Quarter 1'18-Quarter 4'19"],
            [commonStart, anotherYear, Type.ShortQuarter, "Q1'18-Q4'19"],
            [commonStart, anotherYear, Type.FullHalfYear, "Half 1'18-Half 2'19"],
            [commonStart, anotherYear, Type.ShortHalfYear, "H1'18-H2'19"],
            [commonStart, anotherYear, Type.Year, '2018-2019'],

            [commonStart, anotherMonth, Type.Digital, '02.02.18-08.10.18'],
            [commonStart, anotherMonth, Type.FullDate, "2 February'18-8 October'18"],
            [commonStart, anotherMonth, Type.ShortDate, "2 Feb-8 Oct'18"],
            [commonStart, anotherMonth, Type.FullDate, "2 February'18-8 October'18"],
            [commonStart, anotherMonth, Type.ShortDate, "2 Feb-8 Oct'18"],
            [commonStart, anotherMonth, Type.FullDate, "2 February'18-8 October'18"],
            [commonStart, anotherMonth, Type.ShortDate, "2 Feb-8 Oct'18"],
            [commonStart, anotherMonth, Type.FullMonth, "February-October'18"],
            [commonStart, anotherMonth, Type.ShortMonth, "Feb-Oct'18"],
            [commonStart, anotherMonth, Type.FullQuarter, "Quarter 1'18-Quarter 4'18"],
            [commonStart, anotherMonth, Type.ShortQuarter, "Q1'18-Q4'18"],
            [commonStart, anotherMonth, Type.FullHalfYear, "Half 1'18-Half 2'18"],
            [commonStart, anotherMonth, Type.ShortHalfYear, "H1'18-H2'18"],

            [commonStart, anotherDay, Type.Digital, '02.02.18-07.02.18'],
            [commonStart, anotherDay, Type.FullDate, "2 February'18-7 February'18"],
            [commonStart, anotherDay, Type.ShortDate, "2-7 Feb'18"],
            [commonStart, anotherDay, Type.FullDate, "2 February'18-7 February'18"],
            [commonStart, anotherDay, Type.ShortDate, "2-7 Feb'18"],
            [commonStart, anotherDay, Type.FullDate, "2 February'18-7 February'18"],
            [commonStart, anotherDay, Type.ShortDate, "2-7 Feb'18"],
            [commonStart, anotherDay, Type.FullMonth, "February'18"],
            [commonStart, anotherDay, Type.ShortMonth, "Feb'18"],
            [commonStart, anotherDay, Type.FullQuarter, "Quarter 1'18"],
            [commonStart, anotherDay, Type.ShortQuarter, "Q1'18"],
            [commonStart, anotherDay, Type.FullHalfYear, "Half 1'18"],
            [commonStart, anotherDay, Type.ShortHalfYear, "H1'18"],
        ];

        expectedList.forEach(([start, finish, type, expected], index) => {
            it(`should format period from '${start}' to '${finish}' with ${type} as '${expected}'} at ${index}`, () => {
                const given = period(start, finish, type);
                assert.strictEqual(given, expected);
            });
        });
    });

    describe('Default configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 January'21"],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, "January'21"],
                monthsOneYear: [start, finishAnotherMonth, "January-July'21"],
                monthsYears: [start, finishAnotherYear, "January'21-January'22"],
                oneQuarter: [start, finishOfFirstQuarter, "Quarter 1'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "Quarters 1-3'21"],
                quartersYears: [
                    start,
                    finishOfFirstQuarterAnotherYear,
                    "Quarter 1'21-Quarter 1'22",
                ],
                oneHalfYear: [start, finishOfHalfYear, "Half 1'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "Half 1'21-Half 1'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to 5 January'21"],
                openFinishPeriod: [finishAnotherDay, null, "from 5 January'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to 5 January'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from 5 January'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        type: key as PeriodType,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 Jan'21"],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, "Jan'21"],
                monthsOneYear: [start, finishAnotherMonth, "Jan-Jul'21"],
                monthsYears: [start, finishAnotherYear, "Jan'21-Jan'22"],
                oneQuarter: [start, finishOfFirstQuarter, "Q1'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "Q1-3'21"],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "Q1'21-Q1'22"],
                oneHalfYear: [start, finishOfHalfYear, "H1'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "H1'21-H1'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to 5 Jan'21"],
                openFinishPeriod: [finishAnotherDay, null, "from 5 Jan'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to 5 Jan'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from 5 Jan'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        type: key as PeriodType,
                        short: true,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('Text configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 January'21"],
                daysOneMonth: [start, finishAnotherDay, "1-5 January'21"],
                daysMonthsOneYear: [start, finishAnotherMonth, "1 January-1 July'21"],
                daysMonthsYears: [start, finishAnotherYear, "1 January'21-1 January'22"],
                oneMonth: [start, start, "January'21"],
                monthsOneYear: [start, finishAnotherMonth, "January-July'21"],
                monthsYears: [start, finishAnotherYear, "January'21-January'22"],
                oneQuarter: [start, finishOfFirstQuarter, "January-March'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "January-September'21"],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "January'21-March'22"],
                oneHalfYear: [start, finishOfHalfYear, "January-June'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "January'21-June'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to 5 January'21"],
                openFinishPeriod: [finishAnotherDay, null, "from 5 January'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to 5 January'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from 5 January'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Text,
                        type: key as PeriodType,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 Jan'21"],
                daysOneMonth: [start, finishAnotherDay, "1-5 Jan'21"],
                daysMonthsOneYear: [start, finishAnotherMonth, "1 Jan-1 Jul'21"],
                daysMonthsYears: [start, finishAnotherYear, "1 Jan'21-1 Jan'22"],
                oneMonth: [start, start, "Jan'21"],
                monthsOneYear: [start, finishAnotherMonth, "Jan-Jul'21"],
                monthsYears: [start, finishAnotherYear, "Jan'21-Jan'22"],
                oneQuarter: [start, finishOfFirstQuarter, "Jan-Mar'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "Jan-Sep'21"],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "Jan'21-Mar'22"],
                oneHalfYear: [start, finishOfHalfYear, "Jan-Jun'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "Jan'21-Jun'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to 5 Jan'21"],
                openFinishPeriod: [finishAnotherDay, null, "from 5 Jan'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to 5 Jan'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from 5 Jan'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Text,
                        type: key as PeriodType,
                        short: true,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('Accounting configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 January'21"],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, "January'21"],
                monthsOneYear: [start, finishAnotherMonth, "January-July'21"],
                monthsYears: [start, finishAnotherYear, "January'21-January'22"],
                oneQuarter: [start, finishOfFirstQuarter, "January-March'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "January-September'21"],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "January'21-March'22"],
                oneHalfYear: [start, finishOfHalfYear, "January-June'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "January'21-June'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to 5 January'21"],
                openFinishPeriod: [finishAnotherDay, null, "from 5 January'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to 5 January'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from 5 January'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Accounting,
                        type: key as PeriodType,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 Jan'21"],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, "Jan'21"],
                monthsOneYear: [start, finishAnotherMonth, "Jan-Jul'21"],
                monthsYears: [start, finishAnotherYear, "Jan'21-Jan'22"],
                oneQuarter: [start, finishOfFirstQuarter, "Jan-Mar'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "Jan-Sep'21"],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "Jan'21-Mar'22"],
                oneHalfYear: [start, finishOfHalfYear, "Jan-Jun'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "Jan'21-Jun'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to 5 Jan'21"],
                openFinishPeriod: [finishAnotherDay, null, "from 5 Jan'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to 5 Jan'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from 5 Jan'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.Accounting,
                        type: key as PeriodType,
                        short: true,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('WithoutYear configuration', () => {
        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 January'],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, 'January'],
                monthsOneYear: [start, finishAnotherMonth, 'January-July'],
                monthsYears: [start, finishAnotherYear, "January'21-January'22"],
                oneQuarter: [start, finishOfFirstQuarter, 'Quarter 1'],
                quartersOneYear: [start, finishOfThirdQuarter, 'Quarters 1-3'],
                quartersYears: [
                    start,
                    finishOfFirstQuarterAnotherYear,
                    "Quarter 1'21-Quarter 1'22",
                ],
                oneHalfYear: [start, finishOfHalfYear, 'Half 1'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "Half 1'21-Half 1'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 January'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 January'],
                openStartPeriodTemplate: [null, finishAnotherDay, 'to 5 January'],
                openFinishPeriodTemplate: [finishAnotherDay, null, 'from 5 January'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.WithoutYear,
                        type: key as PeriodType,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, '1 Jan'],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, 'Jan'],
                monthsOneYear: [start, finishAnotherMonth, 'Jan-Jul'],
                monthsYears: [start, finishAnotherYear, "Jan'21-Jan'22"],
                oneQuarter: [start, finishOfFirstQuarter, 'Q1'],
                quartersOneYear: [start, finishOfThirdQuarter, 'Q1-3'],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "Q1'21-Q1'22"],
                oneHalfYear: [start, finishOfHalfYear, 'H1'],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "H1'21-H1'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 5 Jan'],
                openFinishPeriod: [finishAnotherDay, null, 'from 5 Jan'],
                openStartPeriodTemplate: [null, finishAnotherDay, 'to 5 Jan'],
                openFinishPeriodTemplate: [finishAnotherDay, null, 'from 5 Jan'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: ConfigurationType.WithoutYear,
                        type: key as PeriodType,
                        short: true,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('custom openPeriod format', () => {
        class CustomFullFormat extends DefaultFullFormats {
            static openStartPeriod: string = 'DIGITAL_MONTH_FULL_YEAR';
            static openFinishPeriod: string = 'DIGITAL_MONTH_FULL_YEAR';
        }

        class CustomShortFormat extends DefaultShortFormats {
            static openStartPeriod: string = 'SHORT_MONTH';
            static openFinishPeriod: string = 'SHORT_MONTH';
        }

        // тестируем все форматы, чтобы исключить влияние openPeriod на остальные
        const customFormat: IPeriodConfiguration = {
            full: CustomFullFormat,
            short: CustomShortFormat,
        };

        describe('full', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 January'21"],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, "January'21"],
                monthsOneYear: [start, finishAnotherMonth, "January-July'21"],
                monthsYears: [start, finishAnotherYear, "January'21-January'22"],
                oneQuarter: [start, finishOfFirstQuarter, "Quarter 1'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "Quarters 1-3'21"],
                quartersYears: [
                    start,
                    finishOfFirstQuarterAnotherYear,
                    "Quarter 1'21-Quarter 1'22",
                ],
                oneHalfYear: [start, finishOfHalfYear, "Half 1'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "Half 1'21-Half 1'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, 'to 01.2021'],
                openFinishPeriod: [finishAnotherDay, null, 'from 01.2021'],
                openStartPeriodTemplate: [null, finishAnotherDay, 'to 01.2021'],
                openFinishPeriodTemplate: [finishAnotherDay, null, 'from 01.2021'],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: customFormat,
                        type: key as PeriodType,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });

        describe('short', () => {
            const testCase: ITestingTuple = {
                oneDay: [start, start, "1 Jan'21"],
                daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                oneMonth: [start, start, "Jan'21"],
                monthsOneYear: [start, finishAnotherMonth, "Jan-Jul'21"],
                monthsYears: [start, finishAnotherYear, "Jan'21-Jan'22"],
                oneQuarter: [start, finishOfFirstQuarter, "Q1'21"],
                quartersOneYear: [start, finishOfThirdQuarter, "Q1-3'21"],
                quartersYears: [start, finishOfFirstQuarterAnotherYear, "Q1'21-Q1'22"],
                oneHalfYear: [start, finishOfHalfYear, "H1'21"],
                halfYearsYears: [start, finishOfHalfYearAnotherYear, "H1'21-H1'22"],
                oneYear: [start, start, '2021'],
                years: [start, finishAnotherYear, '2021-2022'],
                openStartPeriod: [null, finishAnotherDay, "to Jan'21"],
                openFinishPeriod: [finishAnotherDay, null, "from Jan'21"],
                openStartPeriodTemplate: [null, finishAnotherDay, "to Jan'21"],
                openFinishPeriodTemplate: [finishAnotherDay, null, "from Jan'21"],
                allPeriod: [null, null, 'Whole period'],
                today: [start, start, 'Today'],
            };

            for (const [key, test] of Object.entries(testCase)) {
                it(`Type - ${key}`, () => {
                    const options = {
                        configuration: customFormat,
                        type: key as PeriodType,
                        short: true,
                    };

                    assert.strictEqual(period(test[0], test[1], options), test[2]);
                });
            }
        });
    });

    describe('i18n', () => {
        describe('for locale kk', () => {
            let undo;

            beforeEach(() => {
                undo = setLang('kk');
            });

            afterEach(() => {
                undo();
            });

            describe('default configuration', () => {
                describe('full', () => {
                    const testCase: ITestingTuple = {
                        oneDay: [start, start, "1 қаңтар'21"],
                        daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                        daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                        daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                        oneMonth: [start, start, "Қаңтар'21"],
                        monthsOneYear: [start, finishAnotherMonth, "Қаңтар-Шілде'21"],
                        monthsYears: [start, finishAnotherYear, "Қаңтар'21-Қаңтар'22"],
                        oneQuarter: [start, finishOfFirstQuarter, "I тоқсан'21"],
                        quartersOneYear: [start, finishOfThirdQuarter, "I-III тоқсан'21"],
                        quartersYears: [
                            start,
                            finishOfFirstQuarterAnotherYear,
                            "I тоқсан'21-I тоқсан'22",
                        ],
                        oneHalfYear: [start, finishOfHalfYear, "I жарты жылдық'21"],
                        halfYearsYears: [
                            start,
                            finishOfHalfYearAnotherYear,
                            "I жарты жылдық'21-I жарты жылдық'22",
                        ],
                        oneYear: [start, start, '2021'],
                        years: [start, finishAnotherYear, '2021-2022'],
                        openStartPeriod: [null, finishAnotherDay, "5 қаңтар'21 дейін"],
                        openFinishPeriod: [finishAnotherDay, null, "5 қаңтар'21 бастап"],
                        openStartPeriodTemplate: [null, finishAnotherDay, "5 қаңтар'21 дейін"],
                        openFinishPeriodTemplate: [finishAnotherDay, null, "5 қаңтар'21 бастап"],
                        allPeriod: [null, null, 'кезең бойы'],
                        today: [start, start, 'бүгін'],
                    };

                    for (const [key, test] of Object.entries(testCase)) {
                        it(`Type - ${key}`, () => {
                            const options = {
                                type: key as PeriodType,
                            };

                            assert.strictEqual(period(test[0], test[1], options), test[2]);
                        });
                    }
                });
                describe('short', () => {
                    const testCase: ITestingTuple = {
                        oneDay: [start, start, "1 қаң'21"],
                        daysOneMonth: [start, finishAnotherDay, '01.01.21-05.01.21'],
                        daysMonthsOneYear: [start, finishAnotherMonth, '01.01.21-01.07.21'],
                        daysMonthsYears: [start, finishAnotherYear, '01.01.21-01.01.22'],
                        oneMonth: [start, start, "Қаң'21"],
                        monthsOneYear: [start, finishAnotherMonth, "Қаң-Шіл'21"],
                        monthsYears: [start, finishAnotherYear, "Қаң'21-Қаң'22"],
                        oneQuarter: [start, finishOfFirstQuarter, "I тоқ'21"],
                        quartersOneYear: [start, finishOfThirdQuarter, "I-III тоқ'21"],
                        quartersYears: [
                            start,
                            finishOfFirstQuarterAnotherYear,
                            "I тоқ'21-I тоқ'22",
                        ],
                        oneHalfYear: [start, finishOfHalfYear, "I жж'21"],
                        halfYearsYears: [start, finishOfHalfYearAnotherYear, "I жж'21-I жж'22"],
                        oneYear: [start, start, '2021'],
                        years: [start, finishAnotherYear, '2021-2022'],
                        openStartPeriod: [null, finishAnotherDay, "5 қаң'21 дейін"],
                        openFinishPeriod: [finishAnotherDay, null, "5 қаң'21 бастап"],
                        openStartPeriodTemplate: [null, finishAnotherDay, "5 қаң'21 дейін"],
                        openFinishPeriodTemplate: [finishAnotherDay, null, "5 қаң'21 бастап"],
                        allPeriod: [null, null, 'кезең бойы'],
                        today: [start, start, 'бүгін'],
                    };

                    for (const [key, test] of Object.entries(testCase)) {
                        it(`Type - ${key}`, () => {
                            const options = {
                                type: key as PeriodType,
                                short: true,
                            };

                            assert.strictEqual(period(test[0], test[1], options), test[2]);
                        });
                    }
                });
            });
        });
    });
});
