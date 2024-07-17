/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * Тип ULID.
 * @public
 */

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford's Base32
const ENCODING_LEN = ENCODING.length;
const TIME_LEN = 10;
const RANDOM_LEN = 16;
const ULID_LEN = TIME_LEN + RANDOM_LEN;

function encodeTime(now: number, len: number): string {
    let mod;
    let str = '';

    for (; len > 0; len--) {
        mod = now % ENCODING_LEN;
        str = ENCODING.charAt(mod) + str;
        now = (now - mod) / ENCODING_LEN;
    }

    return str;
}

function randomChar(): string {
    let rand = Math.floor(Math.random() * ENCODING_LEN);

    if (rand === ENCODING_LEN) {
        rand = ENCODING_LEN - 1;
    }

    return ENCODING.charAt(rand);
}

function encodeRandom(): string {
    let str = '';

    for (let len = RANDOM_LEN; len > 0; len--) {
        str = randomChar() + str;
    }

    return str;
}

export default class Ulid {
    /**
     * Возвращает строку, заполненную случайными числами, которая выглядит, как ULID.
     * @param { number } [seedTime] Количество миллесекунд, результат вызова Date.now() или (new Date()).getTime(). По умолчанию берёться берёться результат вызова Date.now().
     * @example
     * <pre>
     * import { Ulid } from 'Types/entity';
     *
     * const ulid = Ulid.create();
     * </pre>
     */
    static create(seedTime: number = Date.now()) {
        return `${encodeTime(seedTime, TIME_LEN)}${encodeRandom()}`;
    }

    /**
     * Действительно ли значение является ULID.
     * @param { String } value Проверяемое значение.
     */
    static isValid(value: string): boolean {
        if (value.length !== ULID_LEN) {
            return false;
        }

        for (let index = ULID_LEN - 1; index >= 0; index--) {
            if (!ENCODING.includes(value[index] as string)) {
                return false;
            }
        }

        return true;
    }
}
