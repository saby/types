import { assert } from 'chai';
import { stub } from 'sinon';
import number, { RoundingMode } from 'Types/_formatter/number';
import { controller } from 'I18n/i18n';
import enUS from 'I18n/locales/en-US';
import ruRU from 'I18n/locales/ru-RU';

describe('Types/_formatter/number', () => {
    controller.addLocale('en-US', enUS);
    controller.addLocale('ru-RU', ruRU);

    function setLocale(locale: string): () => void {
        const stubEnabled = stub(controller, 'isEnabled');
        const stubGetLang = stub(controller, 'currentLocale');
        stubEnabled.get(() => {
            return true;
        });
        stubGetLang.get(() => {
            return locale;
        });

        const beforeLocale = controller.currentLocale;
        controller.setLocale(locale);

        return () => {
            stubEnabled.restore();
            stubGetLang.restore();
            controller.setLocale(beforeLocale);
        };
    }

    const locales = ['ru-RU', 'en-US'];

    locales.forEach((locale) => {
        let undo;

        beforeEach(() => {
            undo = setLocale(locale);
        });

        afterEach(() => {
            undo();
        });

        describe('for locale "' + locale + '"', () => {

            it('should format Number', () => {
                const expect = {
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    'en-US': '1 234.5',
                    'ru-RU': '1 234.5',
                };
                const value = 1234.5;

                assert.equal(expect[locale], number(value));
            });

            it('should drop the fractional part', () => {
                const testValue1 = 4.5;
                const testValue2 = 4.3;

                assert.equal(
                    '5',
                    number(testValue1, { maximumFractionDigits: 0 })
                );
                assert.equal(
                    '4',
                    number(testValue2, { maximumFractionDigits: 0 })
                );

                assert.equal(
                    '5',
                    number(testValue1, { maximumSignificantDigits: 1 })
                );
                assert.equal(
                    '4',
                    number(testValue2, { maximumSignificantDigits: 1 })
                );
            });

            it('should add two zero the fractional part', () => {
                const expect = {
                    'en-US': '4.00',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    'ru-RU': '4.00'
                };
                const testValue = 4;

                assert.equal(
                    expect[locale],
                    number(testValue, { minimumFractionDigits: 2 })
                );
                assert.equal(
                    expect[locale],
                    number(testValue, { minimumSignificantDigits: 3 })
                );
            });

            it('should round the integer part to one sign', () => {
                const testValue1 = 451;
                const testValue2 = 441;

                assert.equal(
                    '500',
                    number(testValue1, { maximumSignificantDigits: 1 })
                );
                assert.equal(
                    '400',
                    number(testValue2, { maximumSignificantDigits: 1 })
                );
            });

            it('should set 3 sign in the integer part', () => {
                const testValue1 = 5;
                const testValue2 = 5.2;
                const expect = {
                    'en-US': '005.2',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    'ru-RU': '005.2',
                };

                assert.equal(
                    '005',
                    number(testValue1, { minimumIntegerDigits: 3 })
                );
                assert.equal(
                    expect[locale],
                    number(testValue2, { minimumIntegerDigits: 3 })
                );
            });

            it('should set one sign in the fractional part', () => {
                const expect = {
                    'en-US': '4.5',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    'ru-RU': '4.5',
                };
                const testValue = 4.512;

                assert.equal(
                    expect[locale],
                    number(testValue, { maximumFractionDigits: 1 })
                );
                assert.equal(
                    expect[locale],
                    number(testValue, { maximumSignificantDigits: 2 })
                );
            });
        });
    });

    describe('options', () => {
        let undo;

        beforeEach(() => {
            undo = setLocale('ru-RU');
        });

        afterEach(() => {
            undo();
        });

        it('roundingMode', () => {
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
                    const expect = reference[index];
                    assert.equal(
                        formatted,
                        expect,
                        `value: ${value}, expected: ${expect}, result: ${formatted}, mode: ${mode}`
                    );
                });
            });
        });

        Object.values(RoundingMode).forEach((mode) => {
            it('should format Number', () => {
                const expect = {
                    [RoundingMode.Trunc]: '1 234',
                    [RoundingMode.HalfExpand]: '1 235',
                };
                const value = 1234.5;

                assert.equal(
                    expect[mode],
                    number(value, {
                        maximumFractionDigits: 0,
                        roundingMode: mode,
                    })
                );
            });

            it('should drop the fractional part', () => {
                const expect = {
                    [RoundingMode.Trunc]: '4',
                    [RoundingMode.HalfExpand]: '5',
                };
                const testValue = 4.5;

                assert.equal(
                    expect[mode],
                    number(testValue, {
                        maximumFractionDigits: 0,
                        roundingMode: mode,
                    })
                );
                assert.equal(
                    expect[mode],
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });

            it('should drop the fractional part', () => {
                const expect = {
                    [RoundingMode.Trunc]: '4',
                    [RoundingMode.HalfExpand]: '4',
                };
                const testValue = 4.3;

                assert.equal(
                    expect[mode],
                    number(testValue, {
                        maximumFractionDigits: 0,
                        roundingMode: mode,
                    })
                );
                assert.equal(
                    expect[mode],
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });

            it('should add two zero the fractional part', () => {
                const expect = {
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    [RoundingMode.Trunc]: '4.00',
                    [RoundingMode.HalfExpand]: '4.00',
                };
                const testValue = 4;

                assert.equal(
                    expect[mode],
                    number(testValue, {
                        minimumFractionDigits: 2,
                        roundingMode: mode,
                    })
                );
                assert.equal(
                    expect[mode],
                    number(testValue, {
                        minimumSignificantDigits: 3,
                        roundingMode: mode,
                    })
                );
            });

            it('should round the integer part of 451 to one sign', () => {
                const expect = {
                    [RoundingMode.Trunc]: '400',
                    [RoundingMode.HalfExpand]: '500',
                };
                const testValue = 451;

                assert.equal(
                    expect[mode],
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });

            it('should round the integer part of 441 to one sign', () => {
                const expect = {
                    [RoundingMode.Trunc]: '400',
                    [RoundingMode.HalfExpand]: '400',
                };
                const testValue = 441;

                assert.equal(
                    expect[mode],
                    number(testValue, {
                        maximumSignificantDigits: 1,
                        roundingMode: mode,
                    })
                );
            });
        });
    });
});
