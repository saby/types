/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 * @public
 */
import { controller } from 'I18n/i18n';
import ILocale from 'I18n/interfaces/ILocale';
import * as translate from 'i18n!Types';

const getLocaleConfig = (): ILocale => {
    return controller.currentLocaleConfig;
};

/**
 * Constants with predefined patterns
 */
const patterns = {
    decimal: {
        positivePattern: '{number}',
        negativePattern: '{minusSign}{number}',
    },
    percent: {
        positivePattern: '{number} {percentSign}',
        negativePattern: '{minusSign}{number} {percentSign}',
    },
};

interface ISymbolConst {
    readonly NAN: string;
    readonly PLUS_SIGN: string;
    readonly MINUS_SIGN: string;
    readonly PERCENT_SIGN: string;
    readonly INFINITY: string;
}
/**
 * Constants with predefined symbols
 */
const SymbolConstants: ISymbolConst = {
    get NAN(): string {
        return translate('nan');
    },
    PLUS_SIGN: '+',
    MINUS_SIGN: '-',
    PERCENT_SIGN: '%',
    INFINITY: '∞',
};

const groupSize = 3;

const DEFAULT_MAXIMUM_FRACTION_DIGITS = 3;
const DEFAULT_MAXIMUM_SIGNIFICANT_DIGITS = 21;

/**
 * Режим округления
 * Подробнее - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#roundingmode MDN}
 */
export enum RoundingMode {
    /**
     * Округление в сторону 0.
     * Пример: 4.51 -> 4
     */
    Trunc = 'trunc',
    /**
     * Округление от 0.
     * Пример: 4.51 -> 5
     */
    HalfExpand = 'halfExpand',
}

/**
 * Вариации аргумента формата числа
 * @public
 */
export interface IFormat {
    /**
     * Минимальное количество целых чисел. Возможные значения от 1 до 21. по умолчанию - 1.
     */
    minimumIntegerDigits?: number;
    /**
     * Минимальное количество дробных чисел. Возможные значения от 0 до 20;
     */
    minimumFractionDigits?: number;
    /**
     * Максимальное количество дробных чисел. Возможные значения от 0 до 20;
     */
    maximumFractionDigits?: number;
    /**
     * Минимальное количество значащих чисел. Возможные значения от 1 до 21; по умолчанию - 1
     */
    minimumSignificantDigits?: number;
    /**
     * Максимальное количество значащих чисел. Возможные значения от 1 до 21; по умолчанию - 21.
     */
    maximumSignificantDigits?: number;
    /**
     * Разделитель для дробной части. Если не задан, возмётся из настроек локали.
     */
    fractionSeparator?: string;
    /**
     * Использовать ли группирующие разделители, такие как разделители тысяч или тысячные/сто тысячные/крор разделители. Возможные значения: true и false. по умолчанию - true.
     */
    useGrouping?: boolean;
    /**
     * Разделитель для групп(триад). Если не задан, возмётся из настроек локали.
     */
    groupSeparator?: string;
    /**
     * Стиль форматирования, который будет использован. Возможные значения: «десятичное» для простого форматирования чисел и «процент» для процентного форматирования. По умолчанию - «десятичный».
     */
    style?: 'decimal' | 'percent';
    /**
     * Режим округления. Возможные значения: 'trunc' и 'halfExpand'; по умолчанию - 'halfExpand'
     */
    roundingMode?: RoundingMode;
    /**
     * Строка-приписка, которая будет приклеина к полученому числу через проблем. Наприме 1 000 шт.
     */
    postfix?: string;
}

interface IInnerFormat extends IFormat {
    style: 'decimal' | 'percent';
    useGrouping: boolean;
    minimumIntegerDigits: number;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
    roundingMode: RoundingMode;
    groupSeparator?: string;
    fractionSeparator?: string;
}

interface IPattern {
    type: string;
    value: number | string | undefined;
}

function formatNumberToString(numberFormat: IInnerFormat, x: number): string {
    if (
        numberFormat.hasOwnProperty('minimumSignificantDigits') ||
        numberFormat.hasOwnProperty('maximumSignificantDigits')
    ) {
        return toRawPrecision(
            x,
            numberFormat.minimumSignificantDigits || 1,
            numberFormat.maximumSignificantDigits || DEFAULT_MAXIMUM_SIGNIFICANT_DIGITS,
            numberFormat.roundingMode
        );
    }

    return toRawFixed(
        x,
        numberFormat.minimumIntegerDigits,
        numberFormat.minimumFractionDigits,
        numberFormat.maximumFractionDigits,
        numberFormat.roundingMode
    );
}

function partitionNumberPattern(numberFormat: IInnerFormat, x: number): IPattern[] {
    const style = numberFormat.style || 'decimal';

    let pattern;
    if (!isNaN(x) && x < 0) {
        x = -x;
        pattern = patterns[style].negativePattern;
    } else {
        pattern = patterns[style].positivePattern;
    }

    const result: IPattern[] = [];
    let beginIndex = pattern.indexOf('{', 0);
    let endIndex = 0;
    let nextIndex = 0;
    const length = pattern.length;
    while (beginIndex > -1 && beginIndex < length) {
        endIndex = pattern.indexOf('}', beginIndex);
        if (endIndex === -1) {
            throw new Error();
        }

        if (beginIndex > nextIndex) {
            const literal = pattern.substring(nextIndex, beginIndex);
            result.push({ type: 'literal', value: literal });
        }

        const p = pattern.substring(beginIndex + 1, endIndex);
        if (p === 'number') {
            if (isNaN(x)) {
                const n = SymbolConstants.NAN;
                result.push({ type: 'nan', value: n });
            } else if (!isFinite(x)) {
                const n = SymbolConstants.INFINITY;
                result.push({ type: 'infinity', value: n });
            } else {
                if (numberFormat.style === 'percent') {
                    x *= 100;
                }

                const n = formatNumberToString(numberFormat, x);

                let integer;
                let fraction;
                const decimalSepIndex = n.indexOf('.', 0);
                if (decimalSepIndex > 0) {
                    integer = n.substring(0, decimalSepIndex);
                    fraction = n.substring(decimalSepIndex + 1);
                } else {
                    integer = n;
                    fraction = undefined;
                }
                if (numberFormat.useGrouping === true) {
                    const groupSepSymbol = numberFormat.groupSeparator;
                    const groups = [];
                    if (integer.length > groupSize) {
                        const end = integer.length - groupSize;
                        let idx = end % groupSize;
                        const start = integer.slice(0, idx);
                        if (start.length) {
                            groups.push(start);
                        }
                        while (idx < end) {
                            groups.push(integer.slice(idx, idx + groupSize));
                            idx += groupSize;
                        }
                        groups.push(integer.slice(end));
                    } else {
                        groups.push(integer);
                    }
                    if (groups.length === 0) {
                        throw new Error('group is empty');
                    }
                    while (groups.length) {
                        const integerGroup = groups.shift();
                        result.push({ type: 'integer', value: integerGroup });
                        if (groups.length) {
                            result.push({
                                type: 'group',
                                value: groupSepSymbol,
                            });
                        }
                    }
                } else {
                    result.push({ type: 'integer', value: integer });
                }
                if (fraction !== undefined) {
                    const decimalSepSymbol = numberFormat.fractionSeparator;
                    result.push({ type: 'decimal', value: decimalSepSymbol });
                    result.push({ type: 'fraction', value: fraction });
                }
            }
        } else if (p === 'plusSign') {
            const plusSignSymbol = SymbolConstants.PLUS_SIGN;
            result.push({ type: 'plusSign', value: plusSignSymbol });
        } else if (p === 'minusSign') {
            const minusSignSymbol = SymbolConstants.MINUS_SIGN;
            result.push({ type: 'minusSign', value: minusSignSymbol });
        } else if (p === 'percentSign' && numberFormat.style === 'percent') {
            const percentSignSymbol = SymbolConstants.PERCENT_SIGN;
            result.push({ type: 'literal', value: percentSignSymbol });
        } else {
            const literal = pattern.substring(beginIndex, endIndex);
            result.push({ type: 'literal', value: literal });
        }
        nextIndex = endIndex + 1;
        beginIndex = pattern.indexOf('{', nextIndex);
    }
    if (nextIndex < length) {
        const literal = pattern.substring(nextIndex, length);
        result.push({ type: 'literal', value: literal });
    }

    return result;
}

/**
 * When the toRawPrecision abstract operation is called with arguments x (which
 * must be a finite non-negative number), minPrecision, and maxPrecision (both
 * must be integers between 1 and 21) the following steps are taken:
 */
function toRawPrecision(
    x: number,
    minPrecision: number,
    maxPrecision: number,
    roundingMode: RoundingMode
): string {
    const digit = x;
    let digitStr = digit.toString();
    const [int, fraction = '']: string[] = digitStr.split('.');
    const lengthDigit = int.length + fraction.length;

    if (lengthDigit >= minPrecision && lengthDigit <= maxPrecision) {
        return digitStr;
    }

    if (lengthDigit < minPrecision) {
        return digit.toFixed(minPrecision - int.length);
    }

    const lengthDifference = lengthDigit - maxPrecision;

    if (fraction.length >= lengthDifference) {
        return round(digit, maxPrecision - int.length, roundingMode);
    }

    const integerShift = lengthDifference - fraction.length;
    digitStr = round(digit / Math.pow(10, integerShift), 0, roundingMode);

    return digitStr.padEnd(int.length, '0');
}

/**
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * When the toRawFixed abstract operation is called with arguments x (which must
 * be a finite non-negative number), minInteger (which must be an integer between
 * 1 and 21), minFraction, and maxFraction (which must be integers between 0 and
 * 20) the following steps are taken:
 */
function toRawFixed(
    x: number,
    minInteger: number,
    minFraction: number,
    maxFraction: number,
    roundingMode: RoundingMode
): string {
    const digit = x;
    let digitStr = digit.toString();
    const [int, fraction = '']: string[] = digitStr.split('.');

    if (fraction.length < minFraction) {
        digitStr = digit.toFixed(minFraction);
    }

    if (fraction.length > maxFraction) {
        digitStr = round(digit, maxFraction, roundingMode);
    }

    if (int.length < minInteger) {
        const [int, fraction = '']: string[] = digitStr.split('.');

        return `${int.padStart(minInteger, '0')}${fraction ? '.' + fraction : ''}`;
    }

    return digitStr;
}

/**
 * Выпонляет скругление числа в соответствии с выбранным режимом скругления.
 * @remark
 * Следует считать, что у числа всегда дробная часть больше fractionDigits, всегда нужно отсекать.
 * @param x число.
 * @param fractionDigits количество дробных чисел.
 * @param roundingMode  режим округления.
 * @returns отформатированное число.
 */
function round(x: number, fractionDigits: number, roundingMode: RoundingMode): string {
    switch (roundingMode) {
        case RoundingMode.Trunc:
            const digitStr = x.toString();
            const [int, fraction = '']: string[] = digitStr.split('.');
            if (fractionDigits === 0) {
                return int;
            }
            return `${int}${fraction ? '.' + fraction.substring(0, fractionDigits) : ''}`;
        case RoundingMode.HalfExpand:
        default:
            return x.toFixed(fractionDigits);
    }
}

function getNumberFormat(options?: IFormat): IInnerFormat {
    return {
        ...{
            style: 'decimal',
            useGrouping: true,
            minimumIntegerDigits: 1,
            minimumFractionDigits: 0,
            maximumFractionDigits: DEFAULT_MAXIMUM_FRACTION_DIGITS,
            roundingMode: RoundingMode.HalfExpand,
            fractionSeparator: getLocaleConfig().number.fractionSeparator,
            groupSeparator: getLocaleConfig().number.triadDelimiter,
        },
        ...(options || {}),
    };
}

/**
 *
 * Метод возвращает строку с чувствительным к языку представлением этого числа.
 * @remark
 * Вариации аргумента options:
 * <ul>
 *     <li> style - Стиль форматирования, который будет использован. Возможные значения: «десятичное» для простого форматирования чисел и «процент» для процентного форматирования. По умолчанию - «десятичный».<li>
 *  useGrouping - Использовать ли группирующие разделители, такие как разделители тысяч или тысячные/сто тысячные/крор разделители. Возможные значения: true и false. по умолчанию - true.
 *  Следующие параметры делятся на две группы: minimumIntegerDigits, minimumFractionDigits, и maximumFractionDigits в одной группе, minimumSignificantDigits и maximumSignificantDigits в другой группе.
 *  Если хотя бы один параметр из второй группы определен, то первая группа игнорируется.
 *     </li>
 *     <li>minimumIntegerDigits - Минимальное количество целых чисел. Возможные значения от 1 до 21. по умолчанию - 1.</li>
 *     <li>
 *         minimumFractionDigits - Минимальное количество дробных чисел. Возможные значения от 0 до 20;
 *         по умолчанию для простого числа и процента - 0; по умолчанию для форматирования валюты используется количество младших разрядов, представленное в списке кодов валют ISO 4217 (2, если в списке нет этой информации).
 *     </li>
 *     <li>
 *         maximumFractionDigits - Максимальное количество дробных чисел. Возможные значения от 0 до 20;
 *         по умолчанию для обычного форматирования числа больше, чем "minimalFractionDigits" и 3;
 *         значение по умолчанию для форматирования валюты - большее из minimumFractionDigits и числа младших цифр, предоставленных списком кодов валют IS O 4217 (2, если список не предоставляет эту информацию);
 *         значение по умолчанию для форматирования в процентах - это больше, чем minimumFractionDigits и 0.
 *     </li>
 *     <li>minimumSignificantDigits - Минимальное количество значащих чисел. Возможные значения от 1 до 21; по умолчанию - 1.</li>
 *     <li>maximumSignificantDigits - Максимальное количество значащих чисел. Возможные значения от 1 до 21; по умолчанию - 21.</li>
 *     <li>roundingMode - Режим округления чисел. Возможные значения: 'trunc' и 'halfExpand'; по умолчанию - 'halfExpand'</li>
 * </ul>
 * Если локализация не включена, будет использоваться локаль «en-US».
 *
 * <b>Пример №1.</b>
 * <pre>
 *     import {number as formatNumber} from 'Types/formatter';
 *     formatNumber(12325.13) // return '12,325.13' for en-US locale and '12 325,13' for ru-RU
 * </pre>
 * <b>Пример №2.</b> Использование режима округления.
 * <pre>
 *     import {number as formatNumber, RoundingMode} from 'Types/formatter';
 *     formatNumber(123.56, {maximumFractionDigits: 0, roundingMode: RoundingMode.Trunc}) // return '123'
 *     formatNumber(123.56, {maximumFractionDigits: 0, roundingMode: RoundingMode.HalfExpand}) // return '124'
 * </pre>
 * Подробнее - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat MDN}.
 *
 * @param value Число
 * @param options Опции
 * @returns Строка с числом в указанном формате.
 * @public
 */
export default function number(value: number, options?: IFormat): string {
    const numberFormat = getNumberFormat(options);
    const parts = partitionNumberPattern(numberFormat, value);
    let result = '';

    for (let i = 0; parts.length > i; i++) {
        const part = parts[i];

        result += part.value;
    }

    if (numberFormat.postfix) {
        return `${result} ${numberFormat.postfix}`;
    }

    return result;
}
