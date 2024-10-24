const OBJECT_TAG = '[object Object]';

/**
 * Проверяет, является ли переданный объект простым (экземпляром Object, который не является наследником Object).
 *
 * @param obj Проверяемый объект.
 * @returns true, если передан простой объект.
 *
 * @example
 * <h2>Пример использования</h2>
 * <pre>
 *     import { isPlainObject } from 'Types/object';
 *
 *     // true
 *     console.log(isPlainObject({}));
 *
 *     // false
 *     console.log(isPlainObject(new Date()));
 * </pre>
 *
 * @public
 */
export default function isPlainObject(obj: unknown): boolean {
    return !!(
        obj &&
        Object.prototype.toString.call(obj) === OBJECT_TAG &&
        Object.getPrototypeOf(obj) === Object.prototype
    );
}
