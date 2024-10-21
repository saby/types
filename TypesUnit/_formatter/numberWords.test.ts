import { assert } from 'chai';
import { stub } from 'sinon';
import numberWords from 'Types/_formatter/numberWords';
import * as en from 'json!Types/lang/en/en.json';
import * as ru from 'json!Types/lang/ru/ru.json';
import { controller, Translator } from 'I18n/i18n';

describe('Types/_formatter/numberWords', () => {
    const locales = ['en', 'ru'];
    let stubEnabled;
    let stubTranslate;

    before(() => {
        stubEnabled = stub(controller, 'isEnabled');
        stubEnabled.get(() => {
            return true;
        });

        const translator = new Translator(
            {
                ru,
                en,
            },
            controller
        );

        stubTranslate = stub(Translator.prototype, 'translate');

        stubTranslate.callsFake((key, pluralNumber) => {
            return translator.translateKey(key, undefined, pluralNumber);
        });
    });

    after(() => {
        stubEnabled.restore();
        stubTranslate.restore();
    });

    locales.forEach((locale) => {
        describe(`if locale "${locale}" is enabled`, () => {
            let getLangStub;

            beforeEach(() => {
                getLangStub = stub(controller, 'currentLang');
                getLangStub.get(() => {
                    return locale;
                });
            });

            afterEach(() => {
                getLangStub.restore();
                getLangStub = undefined;
            });

            it('should format 0 to words', () => {
                const expect = {
                    en: 'zero',
                    ru: 'ноль',
                };
                assert.equal(expect[locale], numberWords(0));
            });

            it('should format 2 to words', () => {
                const expect = {
                    en: 'two',
                    ru: 'два',
                };
                assert.equal(expect[locale], numberWords(2));
            });

            it('should format 13 to words', () => {
                const expect = {
                    en: 'thirteen',
                    ru: 'тринадцать',
                };
                assert.equal(expect[locale], numberWords(13));
            });

            it('should format 23 to words', () => {
                const expect = {
                    en: 'twenty-three',
                    ru: 'двадцать три',
                };
                assert.equal(expect[locale], numberWords(23));
            });

            it('should format 300 to words', () => {
                const expect = {
                    en: 'three hundred',
                    ru: 'триста',
                };
                assert.equal(expect[locale], numberWords(300));
            });

            it('should format 123 to words', () => {
                const expect = {
                    en: 'one hundred and twenty-three',
                    ru: 'сто двадцать три',
                };
                assert.equal(expect[locale], numberWords(123));
            });

            it('should format 2123 to words', () => {
                const expect = {
                    en: 'two thousands, one hundred and twenty-three',
                    ru: 'две тысячи сто двадцать три',
                };
                assert.equal(expect[locale], numberWords(2123));
            });

            it('should format 23015000 to words', () => {
                const expect = {
                    en: 'twenty-three millions, fifteen thousands',
                    ru: 'двадцать три миллиона пятнадцать тысяч',
                };
                assert.equal(expect[locale], numberWords(23015000));
            });

            it('should format -6 to words', () => {
                const expect = {
                    en: 'minus six',
                    ru: 'минус шесть',
                };
                assert.equal(expect[locale], numberWords(-6));
            });
        });
    });
});
