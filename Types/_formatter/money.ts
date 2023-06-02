import { controller } from 'I18n/i18n';
import number from './number';

/**
 * Режимы отображения денежной единицы.
 * @typedef {Number} CurrencyName
 * @variant SuperShort Отображает однобуквенное сокращение денежной единицы, если такой нет берёт трёхбуквенное название.
 * @variant Short Отображает трёхбуквенное сокращение денежной единицы, если такой нет берёт полное название.
 * @variant Full Отображает полное название денежной единицы.
 * @variant Symbol Отображает символ валюты, в таким режиме, дробные части может быть только в числовом виде.
 */
export enum CurrencyName {
    SuperShort,
    Short,
    Full,
    Symbol
}

/**
 * Режимы отображения денег.
 * @typedef {Number} MoneyDisplayMode
 * @variant Numeric Отображает только число.
 * @variant Literal Отображает число и название денежной единицы.
 */
export enum DisplayMode {
    Numeric,
    Literal
}

/**
 * Конфигурация для функции форматирования денег.
 * @typedef {Object} IMoneyConfig
 * @property {Types/formatter/CurrencyName.typedef} [currencyName = 'Short'] Вариант отображения названия валюты и дробной части.
 * @property {Types/formatter/MoneyDisplayMode.typedef} [subunit = 'Numeric'] Вариант отображения дробной части.
 * @property {Boolean} [showEmptySubunit = true] Отображать ли ндробную часть, если она равна нулю. По умолчанию true.
 */
export interface IConfig {
    currencyName?: CurrencyName;
    subunit?: DisplayMode;
    showEmptySubunit?: boolean;
}

const defaultConfig: IConfig = {
    currencyName: CurrencyName.Short,
    subunit: DisplayMode.Numeric,
    showEmptySubunit: true
};

function getNameCurrency(number: number, lengthName: CurrencyName) {
    const langCode = controller.currentLang;
    const localeConfig = controller.currentLocaleConfig;

    switch (lengthName) {
        case CurrencyName.Short: {
            return localeConfig.money[langCode].shortCurrency;
        }

        case CurrencyName.SuperShort: {
            return localeConfig.money[langCode].superShortCurrency;
        }

        case CurrencyName.Symbol: {
            return localeConfig.money.symbol;
        }

        case CurrencyName.Full: {
            return localeConfig.plural(number, ...localeConfig.money[langCode].currency);
        }
    }
}

function getNameSubunit(number: number, lengthName: CurrencyName) {
    const langCode = controller.currentLang;
    const localeConfig = controller.currentLocaleConfig;

    switch (lengthName) {
        case CurrencyName.Short: {
            return localeConfig.money[langCode].shortSubunit;
        }

        case CurrencyName.SuperShort: {
            return localeConfig.money[langCode].superShortSubunit;
        }

        case CurrencyName.Full: {
            return localeConfig.plural(number, ...localeConfig.money[langCode].subunit);
        }
    }
}

function getFractionToString(money: number, showEmpty: boolean) {
    const fractionStr = ('' + money).split('.')[1] || '00';
    const fraction = +fractionStr;

    if (fractionStr.startsWith('00')) {
        return showEmpty ? '00' : '';
    }

    return number(fraction, {
        minimumIntegerDigits: 2
    });
}

/**
 * Функция форматирования типа денег в строковое значение.
 * @example
 * Выведем деньги с дробной частью в Numeric режиме.
 * <pre>
 *     import {money} from 'Types/formatter';
 *
 *     // 1 000.00 руб
 *     money(1000);
 * </pre>
 * Выведем деньги с дробной частью в Literal режиме.
 * <pre>
 *     import { money , MoneyDisplayMode } from 'Types/formatter';
 *
 *     // 1 000 руб 00 коп
 *     money(1000, {
 *         subunit: MoneyDisplayMode.Literal
 *     });
 *
 *     // 1 000 руб 55 коп
 *     money(1000.55, {
 *         subunit: MoneyDisplayMode.Literal
 *     });
 *
 * </pre>
 * Выведем деньги с полным названием валюты и дробной части.
 * <pre>
 *     import { money } from 'Types/formatter';
 *
 *     // 1 000 рублей 55 копеек
 *     money(1000.55, {
 *         currencyName: CurrencyName.Full,
 *         subunit: MoneyDisplayMode.Literal
 *     });
 *
 *     // 1 рубль 00 копеек
 *     money(1, {
 *         currencyName: CurrencyName.Full,
 *         subunit: MoneyDisplayMode.Literal
 *     });
 *
 * </pre>
 * Выведем деньги с коротким и супер коротким названием валюты и дробной части.
 * <pre>
 *     import { money } from 'Types/formatter';
 *
 *     // 1 000 руб 55 коп
 *     money(1000.55, {
 *         currencyName: CurrencyName.Short,
 *         subunit: MoneyDisplayMode.Literal
 *     });
 *
 *     // 1 000 р 55 к
 *     money(1000.55, {
 *         currencyName: CurrencyName.SuperShort,
 *         subunit: MoneyDisplayMode.Literal
 *     });
 *
 * </pre>
 * Выведем деньги с символом валюты.
 * <pre>
 *     import { money, CurrencyName } from 'Types/formatter';
 *
 *     // 1 000.00 ₽
 *     money(1000, {
 *         currencyName: CurrencyName.Symbol
 *     });
 * </pre>
 * Выведем деньги отключив отображения нулевой дробной части.
 * <pre>
 *     import { money } from 'Types/formatter';
 *
 *     // 1 000 руб
 *     money(1000, {
 *         showEmptySubunit: false
 *     });
 *
 * </pre>
 * @param {Types/formatter/ITimeIntervalConfig.typedef} configuration Конфигурация форматирования временного интервала.
 * @returns {String} Интервал в текстовом виде.
 * @public
 */
export default function money(money: number, configuration?: IConfig) {
    const config = configuration ? {...defaultConfig, ...configuration} : defaultConfig;

    if (config.currencyName === CurrencyName.Symbol) {
        config.subunit = DisplayMode.Numeric;
    }

    switch (config.subunit) {
        case DisplayMode.Numeric: {
            const nameCurrency = getNameCurrency(money, config.currencyName);
            const integerStr = number(Math.trunc(money));
            const separator = controller.currentLocaleConfig.number.fractionSeparator;
            const fractionStr = getFractionToString(money, config.showEmptySubunit);

            if (!fractionStr) {
                return `${integerStr} ${nameCurrency}`;
            }

            return `${integerStr}${separator}${fractionStr} ${nameCurrency}`;
        }

        case DisplayMode.Literal: {
            const integer = Math.trunc(money);
            const nameCurrency = getNameCurrency(integer, config.currencyName);
            const integerStr = number(integer);
            const fractionStr = getFractionToString(money, config.showEmptySubunit);

            if (!fractionStr) {
                return `${integerStr} ${nameCurrency}`;
            }

            const subunitName = getNameSubunit(+fractionStr, config.currencyName);

            return `${integerStr} ${nameCurrency} ${fractionStr} ${subunitName}`;
        }
    }
}
