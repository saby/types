/**
 * @kaizenZone faaaaa9d-8939-4bca-9a9a-323fbc20ad8b
 */
import { ExtendDate } from 'Types/declarations';

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
 * @param obj Объект или массив, который надо клонировать.
 * @public
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
