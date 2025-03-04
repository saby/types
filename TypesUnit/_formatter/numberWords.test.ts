import * as en from 'json!Types/lang/en/en.json';
import * as ru from 'json!Types/lang/ru/ru.json';
import { controller, Translator } from 'I18n/i18n';

jest.mock(
    'i18n!Types',
    () => {
        const translator = new Translator(
            {
                ru,
                en,
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

import numberWords from 'Types/_formatter/numberWords';
import { langCode } from 'I18n/interfaces/IAvailableCodes';

type testLangCode = 'en' | 'ru';

describe('Types/_formatter/numberWords', () => {
    const locales: testLangCode[] = ['en', 'ru'];

    beforeEach(() => {
        jest.spyOn(controller, 'isEnabled', 'get').mockReturnValue(true);
    });

    locales.forEach((locale) => {
        describe(`if locale "${locale}" is enabled`, () => {
            beforeEach(() => {
                jest.spyOn(controller, 'currentLang', 'get').mockReturnValue(locale);
            });

            test('should format 0 to words', () => {
                const expectData: Record<Extract<langCode, testLangCode>, string> = {
                    en: 'zero',
                    ru: 'ноль',
                };

                expect(numberWords(0)).toStrictEqual(expectData[locale]);
            });

            test('should format 2 to words', () => {
                const expectData = {
                    en: 'two',
                    ru: 'два',
                };

                expect(numberWords(2)).toStrictEqual(expectData[locale]);
            });

            test('should format 13 to words', () => {
                const expectData = {
                    en: 'thirteen',
                    ru: 'тринадцать',
                };

                expect(numberWords(13)).toStrictEqual(expectData[locale]);
            });

            test('should format 23 to words', () => {
                const expectData = {
                    en: 'twenty-three',
                    ru: 'двадцать три',
                };

                expect(numberWords(23)).toStrictEqual(expectData[locale]);
            });

            test('should format 300 to words', () => {
                const expectData = {
                    en: 'three hundred',
                    ru: 'триста',
                };

                expect(numberWords(300)).toStrictEqual(expectData[locale]);
            });

            test('should format 123 to words', () => {
                const expectData = {
                    en: 'one hundred and twenty-three',
                    ru: 'сто двадцать три',
                };

                expect(numberWords(123)).toStrictEqual(expectData[locale]);
            });

            test('should format 2123 to words', () => {
                const expectData = {
                    en: 'two thousands, one hundred and twenty-three',
                    ru: 'две тысячи сто двадцать три',
                };

                expect(numberWords(2123)).toStrictEqual(expectData[locale]);
            });

            test('should format 23015000 to words', () => {
                const expectData = {
                    en: 'twenty-three millions, fifteen thousands',
                    ru: 'двадцать три миллиона пятнадцать тысяч',
                };

                expect(numberWords(23015000)).toStrictEqual(expectData[locale]);
            });

            test('should format -6 to words', () => {
                const expectData = {
                    en: 'minus six',
                    ru: 'минус шесть',
                };

                expect(numberWords(-6)).toStrictEqual(expectData[locale]);
            });
        });
    });
});
