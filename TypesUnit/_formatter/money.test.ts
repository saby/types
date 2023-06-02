import { assert } from 'chai';
import { stub } from 'sinon';
import money, { DisplayMode, CurrencyName } from 'Types/_formatter/money';
import { controller } from 'I18n/i18n';

describe('Types/_formatter/money', () => {
    let stubEnabled;

    before(() => {
        stubEnabled = stub(controller, 'isEnabled');
        stubEnabled.get(() => {
            return false;
        });
    });

    after(() => {
        stubEnabled.restore();
    });

    describe('Display mode numeric', () => {
        it('should return money with short currency name', () => {
            assert.strictEqual(money(1000), '1 000.00 руб');
        });

        it('should return money with super short currency name', () => {
            assert.strictEqual(money(1000, {
                currencyName: CurrencyName.SuperShort
            }), '1 000.00 р');
        });

        it('should return money with full currency name', () => {
            assert.strictEqual(money(1, {
                currencyName: CurrencyName.Full
            }), '1.00 рубль');
            assert.strictEqual(money(2, {
                currencyName: CurrencyName.Full
            }), '2.00 рубля');
            assert.strictEqual(money(1000, {
                currencyName: CurrencyName.Full
            }), '1 000.00 рублей');
        });

        it('should return money in Numeric if currency name symbol', () => {
            assert.strictEqual(money(1000, {
                currencyName: CurrencyName.Symbol
            }), '1 000.00 ₽');
            assert.strictEqual(money(1000, {
                subunit: DisplayMode.Literal,
                currencyName: CurrencyName.Symbol
            }), '1 000.00 ₽');
        });

        it('should return money without subunit if it is zero', () => {
            assert.strictEqual(money(1000, {
                showEmptySubunit: false
            }), '1 000 руб');
            assert.strictEqual(money(1000.00, {
                showEmptySubunit: false
            }), '1 000 руб');
            assert.strictEqual(money(1000.005, {
                showEmptySubunit: false
            }), '1 000 руб');
        });
    });

    describe('Display mode literal', () => {
        it('should return money with short currency and subunit name', () => {
            assert.strictEqual(money(1000.05, {
                subunit: DisplayMode.Literal
            }), '1 000 руб 05 коп');
        });

        it('should return money with super short currency and subunit name', () => {
            assert.strictEqual(money(1000.05, {
                subunit: DisplayMode.Literal,
                currencyName: CurrencyName.SuperShort
            }), '1 000 р 05 к');
        });

        it('should return money with full currency and subunit name', () => {
            assert.strictEqual(money(1000.01, {
                currencyName: CurrencyName.Full,
                subunit: DisplayMode.Literal
            }), '1 000 рублей 01 копейка');
            assert.strictEqual(money(1000.02, {
                currencyName: CurrencyName.Full,
                subunit: DisplayMode.Literal
            }), '1 000 рублей 02 копейки');
            assert.strictEqual(money(1000.05, {
                currencyName: CurrencyName.Full,
                subunit: DisplayMode.Literal
            }), '1 000 рублей 05 копеек');
        });

        it('should return money without subunit if it is zero', () => {
            assert.strictEqual(money(1000.00, {
                subunit: DisplayMode.Literal,
                showEmptySubunit: false
            }), '1 000 руб');
            assert.strictEqual(money(1000.005, {
                subunit: DisplayMode.Literal,
                showEmptySubunit: false
            }), '1 000 руб');
            assert.strictEqual(money(1000, {
                subunit: DisplayMode.Literal,
                showEmptySubunit: false
            }), '1 000 руб');
        });
    });
});
