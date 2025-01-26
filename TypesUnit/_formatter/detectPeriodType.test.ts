import detectPeriodType from 'Types/_formatter/detectPeriodType';

describe('auto detecting to period type', () => {
    const firstDay = 1;
    const firstMonth = 0;
    const startYear = 2021;
    const finishYear = 2022;
    const start = new Date(startYear, firstMonth, firstDay);

    test('February in leap year', () => {
        const leapYear = 2020;
        const february = 1;
        const lastDayOfFebruary = 29;
        const finish = new Date(leapYear, february, lastDayOfFebruary);

        expect(detectPeriodType(new Date(leapYear, february, firstDay), finish)).toStrictEqual(
            'oneMonth'
        );
    });

    describe('year', () => {
        const lastDayOfYear = 31;
        const lastMonthOfYear = 11;

        test('one year', () => {
            const finish = new Date(startYear, lastMonthOfYear, lastDayOfYear);

            expect(detectPeriodType(start, finish)).toStrictEqual('oneYear');
        });

        test('different years', () => {
            const finish = new Date(finishYear, lastMonthOfYear, lastDayOfYear);

            expect(detectPeriodType(start, finish)).toStrictEqual('years');
        });
    });

    describe('half year', () => {
        const lastDayOfHalfYear = 30;
        const lastMonthOfHalfYear = 5;

        test('one half year', () => {
            const finish = new Date(startYear, lastMonthOfHalfYear, lastDayOfHalfYear);

            expect(detectPeriodType(start, finish)).toStrictEqual('oneHalfYear');
        });

        test('half years in different years', () => {
            const finish = new Date(finishYear, lastMonthOfHalfYear, lastDayOfHalfYear);

            expect(detectPeriodType(start, finish)).toStrictEqual('halfYearsYears');
        });
    });

    describe('quarter', () => {
        const lastDayOfFirstQuarter = 31;
        const lastMonthOfFirstQuarter = 2;
        const lastDayOfThirdQuarter = 30;
        const lastMonthOfThirdQuarter = 8;

        test('one quarter', () => {
            const finish = new Date(startYear, lastMonthOfFirstQuarter, lastDayOfFirstQuarter);

            expect(detectPeriodType(start, finish)).toStrictEqual('oneQuarter');
        });

        test('quarters in one year', () => {
            const finish = new Date(startYear, lastMonthOfThirdQuarter, lastDayOfThirdQuarter);

            expect(detectPeriodType(start, finish)).toStrictEqual('quartersOneYear');
        });

        test('quarters in different years', () => {
            const finish = new Date(finishYear, lastMonthOfThirdQuarter, lastDayOfThirdQuarter);

            expect(detectPeriodType(start, finish)).toStrictEqual('quartersYears');
        });
    });

    describe('month', () => {
        const lastDayOfMonth = 31;
        const fifthMonth = 4;

        test('one month', () => {
            const finish = new Date(startYear, firstMonth, lastDayOfMonth);

            expect(detectPeriodType(start, finish)).toStrictEqual('oneMonth');
        });

        test('months in one year', () => {
            const finish = new Date(startYear, fifthMonth, lastDayOfMonth);

            expect(detectPeriodType(start, finish)).toStrictEqual('monthsOneYear');
        });

        test('months in different years', () => {
            const finish = new Date(finishYear, fifthMonth, lastDayOfMonth);

            expect(detectPeriodType(start, finish)).toStrictEqual('monthsYears');
        });
    });

    describe('day', () => {
        const fifthDay = 5;
        const fifthMonth = 4;

        test('one day', () => {
            expect(detectPeriodType(start, start)).toStrictEqual('oneDay');
        });

        test('days in one month', () => {
            const finish = new Date(startYear, firstMonth, fifthDay);

            expect(detectPeriodType(start, finish)).toStrictEqual('daysOneMonth');
        });

        test('days in different months but in one year', () => {
            const finish = new Date(startYear, fifthMonth, fifthDay);

            expect(detectPeriodType(start, finish)).toStrictEqual('daysMonthsOneYear');
        });

        test('full date', () => {
            const finish = new Date(finishYear, fifthMonth, fifthDay);

            expect(detectPeriodType(start, finish)).toStrictEqual('daysMonthsYears');
        });
    });
});
