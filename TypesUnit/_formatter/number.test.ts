import * as ruDict from 'json!Types/lang/ru/ru.json';
import * as enDict from 'json!Types/lang/ru/ru.json';
import { controller, Translator } from 'I18n/i18n';
import { langCode } from 'I18n/interfaces/IAvailableCodes';

jest.mock(
    'i18n!Types',
    () => {
        const translator = new Translator(
            {
                ru: ruDict,
                en: enDict,
            },
            controller
        );

        return (key: string, context: string | number, pluralNumber: number) => {
            return translator.translate(key, context, pluralNumber);
        };
    },
    {
        virtual: true,
    }
);

import en from 'I18n/locales/en';
import ru from 'I18n/locales/ru';
import number, {
    CompactNotationMode,
    CompactDisplayMode,
    NotationMode,
    RoundingMode,
} from 'Types/_formatter/number';

describe('Types/_formatter/number', () => {
    controller.addLang('en', en);
    controller.addLang('ru', ru);

    function setLang(locale: langCode): () => void {
        const beforeLocale = controller.currentLang;
        const stubEnabled = jest.spyOn(controller, 'isEnabled', 'get').mockReturnValue(true);
        const stubGetLang = jest.spyOn(controller, 'currentLang', 'get').mockReturnValue(locale);

        controller.setLang(locale);

        return () => {
            stubEnabled.mockRestore();
            stubGetLang.mockRestore();
            controller.setLang(beforeLocale);
        };
    }

    const locales: langCode[] = ['ru', 'en'];

    locales.forEach((locale) => {
        let undo: ReturnType<typeof setLang>;

        beforeEach(() => {
            undo = setLang(locale);
        });

        afterEach(() => {
            undo();
        });

        describe('for locale "' + locale + '"', () => {
            test('should format Number', () => {
                const expectData: Record<string, string> = {
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    en: '1 234.5',
                    ru: '1 234.5',
                };
                const value = 1234.5;

                expect(expectData[locale]).toEqual(number(value));
            });

            test('should drop the fractional part', () => {
                const testValue1 = 4.5;
                const testValue2 = 4.3;

                expect('5').toEqual(number(testValue1, { maximumFractionDigits: 0 }));
                expect('4').toEqual(number(testValue2, { maximumFractionDigits: 0 }));

                expect('5').toEqual(number(testValue1, { maximumSignificantDigits: 1 }));
                expect('4').toEqual(number(testValue2, { maximumSignificantDigits: 1 }));
            });

            test('should add two zero the fractional part', () => {
                const expectData: Record<string, string> = {
                    en: '4.00',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    ru: '4.00',
                };
                const testValue = 4;

                expect(expectData[locale]).toEqual(number(testValue, { minimumFractionDigits: 2 }));
                expect(expectData[locale]).toEqual(
                    number(testValue, { minimumSignificantDigits: 3 })
                );
            });

            test('should round the integer part to one sign', () => {
                const testValue1 = 451;
                const testValue2 = 441;

                expect('500').toEqual(number(testValue1, { maximumSignificantDigits: 1 }));
                expect('400').toEqual(number(testValue2, { maximumSignificantDigits: 1 }));
            });

            test('should set 3 sign in the integer part', () => {
                const testValue1 = 5;
                const testValue2 = 5.2;
                const expectData: Record<string, string> = {
                    en: '005.2',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    ru: '005.2',
                };

                expect('005').toEqual(number(testValue1, { minimumIntegerDigits: 3 }));
                expect(expectData[locale]).toEqual(number(testValue2, { minimumIntegerDigits: 3 }));
            });

            test('should set one sign in the fractional part', () => {
                const expectData: Record<string, string> = {
                    en: '4.5',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    ru: '4.5',
                };
                const testValue = 4.512;

                expect(expectData[locale]).toEqual(number(testValue, { maximumFractionDigits: 1 }));
                expect(expectData[locale]).toEqual(
                    number(testValue, { maximumSignificantDigits: 2 })
                );
            });
        });
    });

    describe('options', () => {
        let undo: () => void;

        beforeEach(() => {
            undo = setLang('ru');
        });

        afterEach(() => {
            undo();
        });

        test('roundingMode', () => {
            const referenceMap = new Map<number, string[]>([
                [-0.2, ['-0.2', '-0.2']],
                [-0.16, ['-0.1', '-0.2']],
                [-0.15, ['-0.1', '-0.1']],
                [-0.13, ['-0.1', '-0.1']],
                [-0.1, ['-0.1', '-0.1']],
                [-0.06, ['-0.0', '-0.1']],
                [-0.05, ['-0.0', '-0.1']],
                [-0.03, ['-0.0', '-0.0']],
                [0.0, ['0', '0']],
                [0.03, ['0.0', '0.0']],
                [0.05, ['0.0', '0.1']],
                [0.06, ['0.0', '0.1']],
                [0.09, ['0.0', '0.1']],
                [0.1, ['0.1', '0.1']],
                [0.13, ['0.1', '0.1']],
                [0.15, ['0.1', '0.1']],
                [0.16, ['0.1', '0.2']],
                [0.2, ['0.2', '0.2']],
            ]);

            referenceMap.forEach((reference, value) => {
                Object.values(RoundingMode).forEach((mode, index) => {
                    const formatted = number(value, {
                        maximumFractionDigits: 1,
                        roundingMode: mode,
                    });
                    const expectData = reference[index];
                    expect(formatted).toEqual(expectData);
                });
            });
        });

        test('fractionSeparator', () => {
            const value = number(100.12, {
                maximumFractionDigits: 1,
                fractionSeparator: '!',
            });

            expect(value).toBe('100!1');
        });

        test('groupSeparator', () => {
            const value = number(100100, {
                groupSeparator: '~',
            });

            expect(value).toBe('100~100');
        });

        test('postfix', () => {
            const value = number(100, {
                postfix: 'шт',
            });

            expect(value).toBe('100 шт');
        });

        Object.values(RoundingMode).forEach((mode) => {
            test('should format Number', () => {
                const expectData = {
                    [RoundingMode.Trunc]: '1 234',
                    [RoundingMode.HalfExpand]: '1 235',
                };
                const value = 1234.5;

                expect(expectData[mode]).toEqual(
                    number(value, {
                        maximumFractionDigits: 0,
                        roundingMode: mode,
                    })
                );
            });

            test('should drop the fractional part', () => {
                const expectData = {
                    [RoundingMode.Trunc]: '4',
                    [RoundingMode.HalfExpand]: '5',
                };
                const testValue = 4.5;

                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        maximumFractionDigits: 0,
                        roundingMode: mode,
                    })
                );
                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });

            test('should drop the fractional part', () => {
                const expectData = {
                    [RoundingMode.Trunc]: '4',
                    [RoundingMode.HalfExpand]: '4',
                };
                const testValue = 4.3;

                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        maximumFractionDigits: 0,
                        roundingMode: mode,
                    })
                );
                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });

            test('should add two zero the fractional part', () => {
                const expectData = {
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    [RoundingMode.Trunc]: '4.00',
                    [RoundingMode.HalfExpand]: '4.00',
                };
                const testValue = 4;

                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        minimumFractionDigits: 2,
                        roundingMode: mode,
                    })
                );
                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        minimumSignificantDigits: 3,
                        roundingMode: mode,
                    })
                );
            });

            test('should round the integer part of 451 to one sign', () => {
                const expectData = {
                    [RoundingMode.Trunc]: '400',
                    [RoundingMode.HalfExpand]: '500',
                };
                const testValue = 451;

                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });

            test('should round the integer part of 441 to one sign', () => {
                const expectData = {
                    [RoundingMode.Trunc]: '400',
                    [RoundingMode.HalfExpand]: '400',
                };
                const testValue = 441;

                expect(expectData[mode]).toEqual(
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });
        });
    });

    describe('Notation', () => {
        let undo: () => void;

        beforeEach(() => {
            undo = setLang('ru');
        });

        afterEach(() => {
            undo();
        });

        test('long', () => {
            const testMap = {
                '1 тысяча': 1_000,
                '10 тысяч': 10_000,
                '999 тысяч': 999_000,
                '1.5 тысячи': 1_500,
                '1 миллион': 1_000_000,
                '10 миллионов': 10_000_000,
                '999 миллионов': 999_000_000,
                '1.5 миллиона': 1_500_000,
                '1 миллиард': 1_000_000_000,
                '10 миллиардов': 10_000_000_000,
                '999 миллиардов': 999_000_000_000,
                '1.5 миллиарда': 1_500_000_000,
                '1 триллион': 1_000_000_000_000,
                '10 триллионов': 10_000_000_000_000,
                '999 триллионов': 999_000_000_000_000,
                '1.5 триллиона': 1_500_000_000_000,
            };

            for (const [expectData, num] of Object.entries(testMap)) {
                const result = number(num, {
                    notation: NotationMode.Compact,
                    compactDisplay: CompactDisplayMode.Long,
                });

                expect(result).toBe(expectData);
            }
        });

        test('short', () => {
            const testMap = {
                '1 тыс': 1_000,
                '10 тыс': 10_000,
                '999 тыс': 999_000,
                '1.5 тыс': 1_500,
                '1 млн': 1_000_000,
                '10 млн': 10_000_000,
                '999 млн': 999_000_000,
                '1.5 млн': 1_500_000,
                '1 млрд': 1_000_000_000,
                '10 млрд': 10_000_000_000,
                '999 млрд': 999_000_000_000,
                '1.5 млрд': 1_500_000_000,
                '1 трлн': 1_000_000_000_000,
                '10 трлн': 10_000_000_000_000,
                '999 трлн': 999_000_000_000_000,
                '1.5 трлн': 1_500_000_000_000,
            };

            for (const [expectData, num] of Object.entries(testMap)) {
                const result = number(num, {
                    notation: NotationMode.Compact,
                });

                expect(result).toBe(expectData);
            }
        });

        test('superShort', () => {
            const testMap = {
                '1 к': 1_000,
                '10 к': 10_000,
                '999 к': 999_000,
                '1.5 к': 1_500,
                '1 м': 1_000_000,
                '10 м': 10_000_000,
                '999 м': 999_000_000,
                '1.5 м': 1_500_000,
                '1 г': 1_000_000_000,
                '10 г': 10_000_000_000,
                '999 г': 999_000_000_000,
                '1.5 г': 1_500_000_000,
                '1 т': 1_000_000_000_000,
                '10 т': 10_000_000_000_000,
                '999 т': 999_000_000_000_000,
                '1.5 т': 1_500_000_000_000,
            };

            for (const [expectData, num] of Object.entries(testMap)) {
                const result = number(num, {
                    notation: NotationMode.Compact,
                    compactDisplay: CompactDisplayMode.SuperShort,
                });

                expect(result).toBe(expectData);
            }
        });

        test('notationMode', () => {
            expect(
                number(500_000, {
                    notation: NotationMode.Compact,
                    compactNotation: CompactNotationMode.Thousands,
                })
            ).toBe('500 тыс');

            expect(
                number(500_000, {
                    notation: NotationMode.Compact,
                    compactNotation: CompactNotationMode.Millions,
                })
            ).toBe('0.5 млн');

            expect(
                number(500_000_000, {
                    notation: NotationMode.Compact,
                    compactNotation: CompactNotationMode.Billions,
                })
            ).toBe('0.5 млрд');

            expect(
                number(500_000_000_000, {
                    notation: NotationMode.Compact,
                    compactNotation: CompactNotationMode.Trillion,
                })
            ).toBe('0.5 трлн');
        });
    });
});
