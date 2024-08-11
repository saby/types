import { assert } from 'chai';
import { stub } from 'sinon';
import number, { RoundingMode } from 'Types/_formatter/number';
import { controller } from 'I18n/i18n';
import en from 'I18n/locales/en';
import ru from 'I18n/locales/ru';

describe('Types/_formatter/number', () => {
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

        const beforeLocale = controller.currentLang;
        controller.setLang(locale);

        return () => {
            stubEnabled.restore();
            stubGetLang.restore();
            controller.setLang(beforeLocale);
        };
    }

    const locales = ['ru', 'en'];

    locales.forEach((locale: string) => {
        let undo: () => void;

        beforeEach(() => {
            undo = setLang(locale);
        });

        afterEach(() => {
            undo();
        });

        describe('for locale "' + locale + '"', () => {
            it('should format Number', () => {
                const expect: Record<string, string> = {
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    en: '1 234.5',
                    ru: '1 234.5',
                };
                const value = 1234.5;

                assert.equal(expect[locale], number(value));
            });

            it('should drop the fractional part', () => {
                const testValue1 = 4.5;
                const testValue2 = 4.3;

                assert.equal('5', number(testValue1, { maximumFractionDigits: 0 }));
                assert.equal('4', number(testValue2, { maximumFractionDigits: 0 }));

                assert.equal('5', number(testValue1, { maximumSignificantDigits: 1 }));
                assert.equal('4', number(testValue2, { maximumSignificantDigits: 1 }));
            });

            it('should add two zero the fractional part', () => {
                const expect: Record<string, string> = {
                    en: '4.00',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    ru: '4.00',
                };
                const testValue = 4;

                assert.equal(expect[locale], number(testValue, { minimumFractionDigits: 2 }));
                assert.equal(expect[locale], number(testValue, { minimumSignificantDigits: 3 }));
            });

            it('should round the integer part to one sign', () => {
                const testValue1 = 451;
                const testValue2 = 441;

                assert.equal('500', number(testValue1, { maximumSignificantDigits: 1 }));
                assert.equal('400', number(testValue2, { maximumSignificantDigits: 1 }));
            });

            it('should set 3 sign in the integer part', () => {
                const testValue1 = 5;
                const testValue2 = 5.2;
                const expect: Record<string, string> = {
                    en: '005.2',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    ru: '005.2',
                };

                assert.equal('005', number(testValue1, { minimumIntegerDigits: 3 }));
                assert.equal(expect[locale], number(testValue2, { minimumIntegerDigits: 3 }));
            });

            it('should set one sign in the fractional part', () => {
                const expect: Record<string, string> = {
                    en: '4.5',
                    // https://online.sbis.ru/opendoc.html?guid=c102fb77-64bb-417d-b072-1373b9d33341&client=3
                    ru: '4.5',
                };
                const testValue = 4.512;

                assert.equal(expect[locale], number(testValue, { maximumFractionDigits: 1 }));
                assert.equal(expect[locale], number(testValue, { maximumSignificantDigits: 2 }));
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

        it('fractionSeparator', () => {
            const value = number(100.12, {
                maximumFractionDigits: 1,
                fractionSeparator: '!',
            });

            assert.strictEqual(value, '100!1');
        });

        it('groupSeparator', () => {
            const value = number(100100, {
                groupSeparator: '~',
            });

            assert.strictEqual(value, '100~100');
        });

        it('postfix', () => {
            const value = number(100, {
                postfix: 'шт',
            });

            assert.strictEqual(value, '100 шт');
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
