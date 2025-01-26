import money, { DisplayMode, CurrencyName } from 'Types/_formatter/money';
import { controller } from 'I18n/i18n';

describe('Types/_formatter/money', () => {
    beforeEach(() => {
        jest.spyOn(controller, 'isEnabled', 'get').mockReturnValue(false);
    });

    describe('Display mode numeric', () => {
        test('should return money with short currency name', () => {
            expect(money(1000)).toStrictEqual('1 000.00 руб');
        });

        test('should return money with super short currency name', () => {
            expect(
                money(1000, {
                    currencyName: CurrencyName.SuperShort,
                })
            ).toStrictEqual('1 000.00 р');
        });

        test('should return money with full currency name', () => {
            expect(
                money(1, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('1.00 рубль');

            expect(
                money(2, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('2.00 рубля');

            expect(
                money(1000, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('1 000.00 рублей');
        });

        test('should return money in Numeric if currency name symbol', () => {
            expect(
                money(1000, {
                    currencyName: CurrencyName.Symbol,
                })
            ).toStrictEqual('1 000.00 ₽');

            expect(
                money(1000, {
                    subunit: DisplayMode.Literal,
                    currencyName: CurrencyName.Symbol,
                })
            ).toStrictEqual('1 000.00 ₽');
        });

        test('should return money without subunit if it is zero', () => {
            expect(
                money(1000, {
                    showEmptySubunit: false,
                })
            ).toStrictEqual('1 000 руб');

            expect(
                money(1000.0, {
                    showEmptySubunit: false,
                })
            ).toStrictEqual('1 000 руб');

            expect(
                money(1000.005, {
                    showEmptySubunit: false,
                })
            ).toStrictEqual('1 000 руб');
        });

        test('should return correct money for edge cases', () => {
            expect(
                money(1.1, {
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 руб 10 коп');

            expect(
                money(1.5, {
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 руб 50 коп');

            expect(
                money(1.05, {
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 руб 05 коп');

            expect(
                money(1.1234, {
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 руб 12 коп');
        });
    });

    describe('Display mode literal', () => {
        test('should return money with short currency and subunit name', () => {
            expect(
                money(1000.05, {
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 000 руб 05 коп');
        });

        test('should return money with super short currency and subunit name', () => {
            expect(
                money(1000.05, {
                    subunit: DisplayMode.Literal,
                    currencyName: CurrencyName.SuperShort,
                })
            ).toStrictEqual('1 000 р 05 к');
        });

        test('should return money with full currency and subunit name', () => {
            expect(
                money(1000.01, {
                    currencyName: CurrencyName.Full,
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 000 рублей 01 копейка');

            expect(
                money(1000.02, {
                    currencyName: CurrencyName.Full,
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 000 рублей 02 копейки');

            expect(
                money(1000.05, {
                    currencyName: CurrencyName.Full,
                    subunit: DisplayMode.Literal,
                })
            ).toStrictEqual('1 000 рублей 05 копеек');
        });

        test('should return money without subunit if it is zero', () => {
            expect(
                money(1000.0, {
                    subunit: DisplayMode.Literal,
                    showEmptySubunit: false,
                })
            ).toStrictEqual('1 000 руб');

            expect(
                money(1000.005, {
                    subunit: DisplayMode.Literal,
                    showEmptySubunit: false,
                })
            ).toStrictEqual('1 000 руб');

            expect(
                money(1000, {
                    subunit: DisplayMode.Literal,
                    showEmptySubunit: false,
                })
            ).toStrictEqual('1 000 руб');
        });

        test('should return correct money for edge cases', () => {
            expect(
                money(1.1, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('1.10 рубля');

            expect(
                money(1.5, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('1.50 рубля');

            expect(
                money(1.05, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('1.05 рубля');

            expect(
                money(1.1234, {
                    currencyName: CurrencyName.Full,
                })
            ).toStrictEqual('1.12 рубля');
        });
    });
});
