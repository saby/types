/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
const nativeStringifier = Object.prototype.toString;
const objectTag = '[object Object]';

/**
 * Проверяет, является ли объект пустой. Проверяются только собственные перечисляемые свойства.
 * @example
 * <h2>Пример использования</h2>
 * <pre>
 *     import {isEmpty} from 'Types/object';
 *
 *     // true
 *     console.log(isEmpty({});
 *
 *     // false
 *     console.log(isEmpty({
 *         foo: 'bar'
 *     });
 * </pre>
 *
 * @param obj Проверяемый объект.
 * @public
 */
export default function isEmpty(obj: any): boolean {
    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    const tag = nativeStringifier.call(obj);
    if (tag === objectTag || obj instanceof Object) {
        return Object.keys(obj).length === 0;
    }

    return true;
}
