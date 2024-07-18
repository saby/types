import { assert } from 'chai';
import { stub } from 'sinon';
import format from 'Types/_formatter/date';
import { DateFormattingStrategyType } from 'Types/_formatter/_date/IDateFormat';
import en from 'I18n/locales/en';
import ru from 'I18n/locales/ru';
import { controller } from 'I18n/i18n';

describe('Types/_formatter/date', () => {
    controller.addLang('en', en);
    controller.addLang('ru', ru);

    function setLang(locale: string): () => void {
        const stubEnabled = stub(controller, 'isEnabled');
        const stubGetLang = stub(controller, 'currentLang');
        stubEnabled.get(() => {
            return true;
        });
        stubGetLang.get(() => {
            return locale;
        });

        return () => {
            stubEnabled.restore();
            stubGetLang.restore();
        };
    }

    const check = (date, pattern, expected) => {
        return () => {
            const given = format(date, pattern);
            if (expected instanceof Function) {
                assert.isTrue(expected(given));
            } else {
                assert.strictEqual(given, expected);
            }
        };
    };

    const date = new Date(2009, 1, 7, 3, 4, 5, 678);

    const generic = {
        SSS: '678',
        s: '5',
        ss: '05',
        m: '4',
        mm: '04',
        h: '3',
        H: '3',
        HH: '03',
        HHH: '342768',
        'h:m:s': '3:4:5',
        'hh:mm:ss': '03:04:05',
        D: '7',
        DD: '07',
        M: '2',
        MM: '02',
        Q: '1',
        Y: '9',
        YY: '09',
        YYYY: '2009',
        Yh: '1',
    };

    const localized = {
        ru: {
            a: 'дп',
            dd: 'Сб',
            ddl: 'сб',
            ddd: 'Сбт',
            dddl: 'сбт',
            dddd: 'Суббота',
            ddddl: 'суббота',
            MMM: 'Фев',
            MMMl: 'фев',
            MMMM: 'Февраль',
            MMMMl: 'февраль',
            MMMMo: 'Февраля',
            MMMMgen: 'Февраля',
            MMMMloc: 'Феврале',
            MMMMlo: 'февраля',
            MMMMlgen: 'февраля',
            MMMMlloc: 'феврале',
            QQr: 'I кв',
            QQQr: 'I квр',
            QQQQr: 'I квартал',
            YYhr: 'I пл',
            YYYYhr: 'I полугодие',
        },
        en: {
            a: 'am',
            dd: 'Sa',
            ddl: 'Sa',
            ddd: 'Sat',
            dddl: 'Sat',
            dddd: 'Saturday',
            ddddl: 'Saturday',
            MMM: 'Feb',
            MMMl: 'Feb',
            MMMM: 'February',
            MMMMl: 'February',
            MMMMo: 'February',
            MMMMlo: 'February',
            QQr: 'QI',
            QQQr: 'QI',
            QQQQr: 'Quarter I',
            YYhr: 'HI',
            YYYYhr: 'Half I',
        },
    };

    Object.keys(generic).forEach((pattern) => {
        const expected = generic[pattern];
        it(
            `should format "${pattern}"${
                expected instanceof Function ? '' : ' as "' + expected + '"'
            }`,
            check(date, pattern, expected)
        );
    });

    Object.keys(localized).forEach((locale) => {
        context('for locale"' + locale + '"', () => {
            let undo;

            beforeEach(() => {
                undo = setLang(locale);
            });

            afterEach(() => {
                undo();
            });

            const data = localized[locale];
            Object.keys(data).forEach((pattern) => {
                const expected = data[pattern];
                it(
                    `should format "${pattern}"${
                        expected instanceof Function ? '' : ' as "' + expected + '"'
                    }`,
                    check(date, pattern, expected)
                );
            });
        });
    });

    it('should format "h" as "12" for midnight', () => {
        const date = new Date(2018, 1, 1, 0, 0, 0);
        assert.equal(format(date, 'h'), '12');
    });

    it('should format "h" as "12" for noon', () => {
        const date = new Date(2018, 1, 1, 12, 0, 0);
        assert.equal(format(date, 'h'), '12');
    });

    it('should format "h" as "1" for a hour past noon', () => {
        const date = new Date(2018, 1, 1, 13, 0, 0);
        assert.equal(format(date, 'h'), '1');
    });

    it('should format "a" as "am" for midnight', () => {
        const date = new Date(2018, 1, 1, 0, 0, 0);
        assert.include(['am', 'дп'], format(date, 'a'));
    });

    it('should format "a" as "pm" for noon', () => {
        const date = new Date(2018, 1, 1, 15, 0, 0);
        assert.include(['pm', 'пп'], format(date, 'a'));
    });

    it('should format "Q" as "1" for January', () => {
        const date = new Date(2018, 0, 1);
        assert.equal(format(date, 'Q'), '1');
    });

    it('should format "Q" as "2" for April', () => {
        const date = new Date(2018, 3, 1);
        assert.equal(format(date, 'Q'), '2');
    });

    it('should format "Q" as "3" for July', () => {
        const date = new Date(2018, 6, 1);
        assert.equal(format(date, 'Q'), '3');
    });

    it('should format "Q" as "4" for October', () => {
        const date = new Date(2018, 9, 1);
        assert.equal(format(date, 'Q'), '4');
    });

    it('should format "Q" as "4" for December', () => {
        const date = new Date(2018, 11, 1);
        assert.equal(format(date, 'Q'), '4');
    });

    it('should format "Yh" as "1" for January', () => {
        const date = new Date(2018, 0, 1);
        assert.equal(format(date, 'Yh'), '1');
    });

    it('should format "Yh" as "1" for June', () => {
        const date = new Date(2018, 5, 1);
        assert.equal(format(date, 'Yh'), '1');
    });

    it('should format "Yh" as "2" for July', () => {
        const date = new Date(2018, 6, 1);
        assert.equal(format(date, 'Yh'), '2');
    });

    it('should format "Yh" as "2" for December', () => {
        const date = new Date(2018, 11, 1);
        assert.equal(format(date, 'Yh'), '2');
    });

    it('should format "ddl" with not a date', () => {
        const dt: any = {
            getDay: () => {
                return -1;
            },
        };
        assert.equal(format(dt, 'ddl'), 'undefined');
    });

    describe('for certain timezone', () => {
        let timezoneOffsetStub;
        let date;

        beforeEach(() => {
            date = new Date(2018, 11, 1);
            timezoneOffsetStub = stub(date, 'getTimezoneOffset');
        });

        afterEach(() => {
            timezoneOffsetStub.restore();
        });

        it('should format "Z" as timezone east', () => {
            timezoneOffsetStub.callsFake(() => {
                return -180;
            });
            assert.equal(format(date, 'Z'), '+03');
        });

        it('should format "Z" as timezone west', () => {
            timezoneOffsetStub.callsFake(() => {
                return 180;
            });
            assert.equal(format(date, 'Z'), '-03');
        });

        it('should format "Z" as timezone with minutes', () => {
            timezoneOffsetStub.callsFake(() => {
                return 210;
            });
            assert.equal(format(date, 'Z'), '-03:30');
        });

        it('should format "ZZ" as timezone without colon', () => {
            timezoneOffsetStub.callsFake(() => {
                return 210;
            });
            assert.equal(format(date, 'ZZ'), '-0330');
        });

        it('should format "DD.MM HH:mm Z" as UTC+0 for date given as UTC+3', () => {
            const date = new Date(2020, 4, 1, 1, 50, 0); // 01.05 01:50 +03
            timezoneOffsetStub.callsFake(() => {
                return -180;
            });
            assert.equal(format(date, 'DD.MM HH:mm Z', 0), '30.04 22:50 +00');
        });
    });

    it('should escape square brackets', () => {
        const date = new Date(2018, 4, 7);
        assert.equal(
            format(date, '[Today is ]D.MM, YY. [How long ago it was?]'),
            'Today is 7.05, 18. How long ago it was?'
        );
    });

    describe('constants', () => {
        describe('if there is special constant in locale config', () => {
            const constantNames = [
                'FULL_DATE_DOW',
                'FULL_DATE',
                'FULL_DATE_FULL_MONTH',
                'FULL_DATE_FULL_MONTH_FULL_YEAR',
                'FULL_DATE_FULL_YEAR',
                'FULL_DATE_SHORT_MONTH',
                'FULL_DATE_SHORT_MONTH_FULL_YEAR',
                'FULL_HALF_YEAR',
                'FULL_MONTH',
                'FULL_QUARTER',
                'FULL_TIME',
                'SHORT_DATE_DOW',
                'SHORT_DATE',
                'SHORT_DATE_FULL_MONTH',
                'SHORT_DATE_SHORT_MONTH',
                'SHORT_HALF_YEAR',
                'SHORT_MONTH',
                'SHORT_QUARTER',
                'SHORT_TIME',
            ];

            for (const constName of constantNames) {
                const expected = controller.currentLocaleConfig.date[constName];

                it(`Should return ${expected} for ${constName}`, () => {
                    assert.strictEqual(format[constName], expected);
                });
            }
        });

        describe('if there is no special constant in locale config', () => {
            let undo;

            before(() => {
                undo = setLang('en');
            });

            after(() => {
                undo();
            });

            const map = {
                DIGITAL_MONTH_FULL_YEAR: 'MM.YYYY',
                DURATION_FULL_TIME: 'HHH:mm:ss',
                DURATION_SHORT_TIME: 'HHH:mm',
                FULL_DATETIME: "D MMMlo'YY HH:mm",
                FULL_TIME_FRACTION: 'HH:mm:ss.SSS',
                FULL_DATE_FULL_TIME: 'DD.MM.YY HH:mm:ss',
                FULL_DATE_FULL_TIME_FRACTION: 'DD.MM.YY HH:mm:ss.SSS',
                FULL_DATE_FULL_YEAR_SHORT_TIME: 'DD.MM.YYYY HH:mm',
                FULL_DATE_FULL_YEAR_FULL_TIME: 'DD.MM.YYYY HH:mm:ss',
                FULL_DATE_FULL_YEAR_FULL_TIME_FRACTION: 'DD.MM.YYYY HH:mm:ss.SSS',
                FULL_DATE_SHORT_TIME: 'DD.MM.YY HH:mm',
                FULL_YEAR: 'YYYY',
                ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZZ',
                ISO_DATETIME_SQL: 'YYYY-MM-DD HH:mm:ss.SSSZZ',
                SHORT_DATE_SHORT_TIME: 'DD.MM HH:mm',
                SHORT_DATE_FULL_TIME: 'DD.MM HH:mm:ss',
                SHORT_DATE_FULL_TIME_FRACTION: 'DD.MM HH:mm:ss.SSS',
                SHORT_DATETIME: 'D MMMlo HH:mm',
            };

            Object.keys(map).forEach((name) => {
                const expected = map[name];
                it(`should return ${expected} for ${name}`, () => {
                    assert.strictEqual(format[name], expected);
                });
            });
        });
    });

    describe('for date with month of May', () => {
        const date = new Date(2021, 4, 12, 1, 40, 0);

        const pluralFormats = {
            MMMo: 'Мая',
            MMMlo: 'мая',
            MMMMo: 'Мая',
            MMMMlo: 'мая',
        };

        Object.keys(pluralFormats).forEach((pattern) => {
            const expected = pluralFormats[pattern];
            it(
                `should format "${pattern}"${
                    expected instanceof Function ? '' : ' as plural "' + expected + '"'
                }`,
                check(date, pattern, expected)
            );
        });
    });

    describe('for date with specific case', () => {
        it('should correctly convert month to genitive case', () => {
            const date = new Date(2021, 5, 12, 1, 40, 0);

            const genetiveFormats = {
                MMMgen: 'Июня',
                MMMlgen: 'июня',
                MMMMgen: 'июн',
                MMMMlgen: 'июн',
            };

            Object.keys(genetiveFormats).forEach((pattern) => {
                const expected = genetiveFormats[pattern];
                it(
                    `should format "${pattern}"${
                        expected instanceof Function ? '' : ' as genitive "' + expected + '"'
                    }`,
                    check(date, pattern, expected)
                );
            });
        });

        it('should correctly convert month of may to genitive case', () => {
            const date = new Date(2021, 4, 12, 1, 40, 0);

            const genetiveFormats = {
                MMMgen: 'Мая',
                MMMlgen: 'мая',
                MMMMgen: 'Мая',
                MMMMlgen: 'мая',
            };

            Object.keys(genetiveFormats).forEach((pattern) => {
                const expected = genetiveFormats[pattern];
                it(
                    `should format "${pattern}"${
                        expected instanceof Function ? '' : ' as genitive "' + expected + '"'
                    }`,
                    check(date, pattern, expected)
                );
            });
        });

        it('should correctly convert month to locative case', () => {
            const date = new Date(2021, 5, 12, 1, 40, 0);

            const genetiveFormats = {
                MMMgen: 'Июне',
                MMMlgen: 'июне',
                MMMMgen: 'июн',
                MMMMlgen: 'июн',
            };

            Object.keys(genetiveFormats).forEach((pattern) => {
                const expected = genetiveFormats[pattern];
                it(
                    `should format "${pattern}"${
                        expected instanceof Function ? '' : ' as locative "' + expected + '"'
                    }`,
                    check(date, pattern, expected)
                );
            });
        });

        it('should correctly convert month of may to locative case', () => {
            const date = new Date(2021, 4, 12, 1, 40, 0);

            const genetiveFormats = {
                MMMloc: 'Мае',
                MMMlloc: 'мае',
                MMMMloc: 'Мае',
                MMMMlloc: 'мае',
            };

            Object.keys(genetiveFormats).forEach((pattern) => {
                const expected = genetiveFormats[pattern];
                it(
                    `should format "${pattern}"${
                        expected instanceof Function ? '' : ' as locative "' + expected + '"'
                    }`,
                    check(date, pattern, expected)
                );
            });
        });
    });

    describe('argument validation', () => {
        it('should throw an error on Invalid Date argument', () => {
            const invalidDate = new Date('test');

            assert.throws(() => {
                return format(invalidDate, 'HH:mm');
            });
        });

        it('should throw an error on Invalid Date argument', () => {
            const invalidDate = 'Invalid Date String';

            assert.throws(() => {
                return format(invalidDate as any, 'HH:mm');
            });
        });

        it('should throw an error on null Date argument', () => {
            assert.throws(() => {
                return format(null, 'HH:mm');
            });
        });

        it('should throw an error on undefined Date argument', () => {
            assert.throws(() => {
                return format(undefined, 'HH:mm');
            });
        });
    });

    describe('strategies', () => {
        let undo;

        beforeEach(() => {
            undo = setLang('en');
        });

        afterEach(() => {
            undo();
        });

        describe('Registry', () => {
            it('should return hours and minute if event date is current day', () => {
                const eventDate = new Date(2022, 7, 5, 11, 0, 0);
                const config = {
                    currentDate: new Date(2022, 7, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '11:00');
            });

            it('should return date and month if event date differs from current date only by day', () => {
                const eventDate = new Date(2023, 3, 25, 11, 0, 0);
                const config = {
                    currentDate: new Date(2023, 3, 4, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '25 Apr');
            });

            it('should return date and month if event date was not more six month ago this year', () => {
                const eventDate = new Date(2022, 1, 5, 13, 0, 0);
                const config = {
                    currentDate: new Date(2022, 7, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '5 Feb');
            });

            it('should return full date if event date was more six month ago this year', () => {
                const eventDate = new Date(2022, 0, 5, 11, 0, 0);
                const config = {
                    currentDate: new Date(2022, 7, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '05.01.22');
            });

            it('should return date and month if event date was not more four month ago past year', () => {
                const eventDate = new Date(2021, 9, 5, 13, 0, 0);
                const config = {
                    currentDate: new Date(2022, 1, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '5 Oct');
            });

            it('should return full date if event date was not more four month ago past year', () => {
                const eventDate = new Date(2021, 8, 5, 12, 0, 0);
                const config = {
                    currentDate: new Date(2022, 1, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '05.09.21');
            });

            it('should return date and month if event date will not more two month later', () => {
                const eventDate = new Date(2022, 3, 5, 11, 0, 0);
                const config = {
                    currentDate: new Date(2022, 1, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '5 Apr');
            });

            it('should return full date if event date will more two month later', () => {
                const eventDate = new Date(2022, 4, 5, 11, 0, 0);
                const config = {
                    currentDate: new Date(2022, 1, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.Registry,
                };

                assert.strictEqual(format(eventDate, config), '05.05.22');
            });
        });

        describe('OnlyDate', () => {
            it('should return hours and minute if event date is current day', () => {
                const eventDate = new Date(2022, 7, 5, 11, 0, 0);
                const config = {
                    currentDate: new Date(2022, 7, 5, 12, 0, 0),
                    strategy: DateFormattingStrategyType.OnlyDate,
                };

                assert.strictEqual(format(eventDate, config), '5 Aug');

                it('should return date and month if event date was not more six month ago this year', () => {
                    const eventDate = new Date(2022, 1, 5, 13, 0, 0);
                    const config = {
                        currentDate: new Date(2022, 7, 5, 12, 0, 0),
                        strategy: DateFormattingStrategyType.OnlyDate,
                    };

                    assert.strictEqual(format(eventDate, config), '5 Feb');
                });

                it('should return full date if event date was more six month ago this year', () => {
                    const eventDate = new Date(2022, 0, 5, 11, 0, 0);
                    const config = {
                        currentDate: new Date(2022, 7, 5, 12, 0, 0),
                        strategy: DateFormattingStrategyType.OnlyDate,
                    };

                    assert.strictEqual(format(eventDate, config), '05.01.22');
                });

                it('should return date and month if event date was not more four month ago past year', () => {
                    const eventDate = new Date(2021, 9, 5, 13, 0, 0);
                    const config = {
                        currentDate: new Date(2022, 1, 5, 12, 0, 0),
                        strategy: DateFormattingStrategyType.OnlyDate,
                    };

                    assert.strictEqual(format(eventDate, config), '5 Oct');
                });

                it('should return full date if event date was not more four month ago past year', () => {
                    const eventDate = new Date(2021, 8, 5, 12, 0, 0);
                    const config = {
                        currentDate: new Date(2022, 1, 5, 12, 0, 0),
                        strategy: DateFormattingStrategyType.OnlyDate,
                    };

                    assert.strictEqual(format(eventDate, config), '05.09.21');
                });

                it('should return date and month if event date will not more two month later', () => {
                    const eventDate = new Date(2022, 3, 5, 11, 0, 0);
                    const config = {
                        currentDate: new Date(2022, 1, 5, 12, 0, 0),
                        strategy: DateFormattingStrategyType.OnlyDate,
                    };

                    assert.strictEqual(format(eventDate, config), '5 Apr');
                });

                it('should return full date if event date will more two month later', () => {
                    const eventDate = new Date(2022, 4, 5, 11, 0, 0);
                    const config = {
                        currentDate: new Date(2022, 1, 5, 12, 0, 0),
                        strategy: DateFormattingStrategyType.OnlyDate,
                    };

                    assert.strictEqual(format(eventDate, config), '05.05.22');
                });
            });
        });

        describe('Default', () => {
            it('should return full date always', () => {
                const config = {
                    currentDate: new Date(2022, 7, 5, 12, 0, 0),
                };

                assert.strictEqual(format(new Date(2022, 7, 5, 11, 0, 0), config), '05.08.22');
                assert.strictEqual(format(new Date(2022, 1, 5, 13, 0, 0), config), '05.02.22');
                assert.strictEqual(format(new Date(2022, 9, 5, 11, 0, 0), config), '05.10.22');
            });
        });
    });
});
