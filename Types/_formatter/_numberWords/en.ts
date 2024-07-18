/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import { iterateNumber } from './utils';
import * as translate from 'i18n!Types';

const DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const TENS = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
];

const TWENTIES = {
    2: 'twenty',
    3: 'thirty',
    4: 'forty',
    5: 'fifty',
    6: 'sixty',
    7: 'seventy',
    8: 'eighty',
    9: 'ninety',
};

const THOUSANDS = {
    1: 'thousand',
    2: 'million',
    3: 'billion',
    4: 'trillion',
    5: 'quadrillion',
    6: 'quintillion',
    7: 'sextillion',
    8: 'septillion',
    9: 'octillion',
    10: 'nonillion',
    11: 'decillion',
};

const negword = 'minus';

interface IWordConcatnumberUS {
    value: number;
    title: string;
}

function concat(right: IWordConcatnumberUS, left: IWordConcatnumberUS): IWordConcatnumberUS {
    // eslint-disable-next-line eqeqeq
    if (left.value == 1 && right.value < 100) {
        return right;
    } else if (left.value < 100 && left.value > right.value) {
        return {
            title: `${left.title}-${right.title}`,
            value: left.value + right.value,
        };
    } else if (left.value >= 100 && left.value > right.value) {
        return {
            title: `${left.title} and ${right.title}`,
            value: left.value + right.value,
        };
    }
    return {
        title: `${left.title} ${right.title}`,
        value: left.value + right.value,
    };
}

export default function numberWordsEN(num: string): string {
    if (num[0] === '-') {
        return negword + ' ' + numberWordsEN(num.slice(1));
    }

    const words = [];
    // let chunks = list(splitbyx(str(n), 3))
    iterateNumber(num, (three: any, counter: number): void => {
        const prepareWord = [];
        if (three[0] !== '0') {
            prepareWord.push({
                title: `${DIGITS[three[0]]} hundred`,
                value: three[0] * 100,
            });
        }
        if (three[1] > 1) {
            prepareWord.push({
                title: TWENTIES[three[1]],
                value: three[1] * 10,
            });
        }
        // eslint-disable-next-line eqeqeq
        if (three[1] == 1) {
            prepareWord.push({ title: TENS[three[2]], value: +three.slice(1) });
        } else if (three[2] > 0 || (+three === 0 && words.length === 0)) {
            prepareWord.push({ title: DIGITS[three[2]], value: +three[2] });
        }
        if (prepareWord.length > 0) {
            let word = prepareWord.reduceRight(concat).title;
            // eslint-disable-next-line eqeqeq
            if (counter > 0 && +three != 0) {
                word += ' ' + translate(THOUSANDS[counter], +three);
            }

            words.push(word);
        }
    });

    return words.join(', ');
}
