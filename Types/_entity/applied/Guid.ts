/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */

/**
 * Тип GUID.
 * @public
 */
export default class Guid {
    /**
     * Возвращает строку, заполненную случайными числами, которая выглядит, как GUID.
     * @example
     * <pre>
     * import {applied} from 'Types/entity';
     *
     * const guid = applied.Guid.create();
     * </pre>
     */
    static create(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // eslint-disable-next-line no-bitwise
            const r = (Math.random() * 16) | 0;
            // eslint-disable-next-line no-bitwise
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * Действительно ли значение является GUID.
     * @param value Проверяемое значение.
     */
    static isValid(value: string): boolean {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            value
        );
    }
}
