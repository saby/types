/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import { ExtendDate } from '../_declarations';

type UnknownObject = Record<string, unknown> | unknown[];

function isTraversable(obj: unknown): obj is UnknownObject {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    if (Array.isArray(obj) || obj.constructor === Date) {
        return true;
    }

    if (obj.constructor === Object) {
        return !('$constructor' in obj);
    }

    return false;
}

/**
 * Рекурсивно копирует объект или массив.
 * @example
 * <h2>Пример использования</h2>
 * <pre>
 *     import { clone } from 'Types/object';
 *
 *     // { foo: { data: 'bar' } }
 *    console.log(clone({ foo: { data: 'bar' } }));
 * </pre>
 * @param obj {Object|Array} Объект или массив, который надо клонировать.
 */
export default function clone<T>(obj: T): T {
    if (!isTraversable(obj)) {
        return obj;
    }

    if (obj.constructor === Date) {
        // TODO Core/Date навешивает свои свойства на Date, чтобы они не терялись при копирование, вызвать самопальный clone.
        //  Удалить получиться только когда откажемся от Core/Date.
        if (typeof (obj as ExtendDate).clone === 'function') {
            return (obj as ExtendDate).clone() as unknown as T;
        }

        return new Date((obj as Date).getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map((value) => {
            return clone(value);
        }) as unknown as T;
    }

    const result: T | UnknownObject = {};

    for (const [key, value] of Object.entries(obj) as [string, unknown][]) {
        result[key] = clone(value);
    }

    return result as unknown as T;
}
