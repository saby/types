/**
 * Набор утилит для работы с объектами
 * @public
 */

// TODO: Сюда нужно возвращаться после работы над entity, они сильно связаны
// @ts-nocheck

import { IObject, ICloneable } from '../entity';
import { getJsonReplacerWithStorage, getJsonReviverWithStorage } from '../formatter';

interface IOptions {
    keepUndefined?: boolean;
    processCloneable?: boolean;
}

const defaultOtions: IOptions = {
    keepUndefined: true,
    processCloneable: true,
};

const PLAIN_OBJECT_PROTOTYPE = Object.prototype;
const PLAIN_OBJECT_STRINGIFIER = Object.prototype.toString;

function getPropertyMethodName(property: string, prefix: string): string {
    return prefix + property.substr(0, 1).toUpperCase() + property.substr(1);
}

function isImplementsIObject(obj: unknown): boolean {
    const type = typeof obj;

    return (
        (type === 'object' || type === 'function') && '[Types/_entity/IObject]' in (obj as object)
    );
}

/**
 * Возвращает значение свойства объекта
 * @param obj Объект.
 * @param property Название свойства.
 */
export function getPropertyValue<T>(obj: unknown | IObject, property: string): T {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }

    const checkedProperty = property || '';

    if (checkedProperty in obj) {
        return obj[checkedProperty];
    }

    if (isImplementsIObject(obj)) {
        return (obj as IObject).get(checkedProperty);
    }

    const getter = getPropertyMethodName(checkedProperty as string, 'get');
    if (typeof obj[getter] === 'function' && !obj[getter].deprecated) {
        return obj[getter]();
    }

    return undefined;
}

/**
 * Устанавливает значение свойства объекта
 * @param obj Объект.
 * @param property Название свойства.
 * @param value Значение свойства.
 */
export function setPropertyValue<T>(obj: unknown | IObject, property: string, value: T): void {
    if (!obj || typeof obj !== 'object') {
        throw new TypeError('Argument object should be an instance of Object');
    }

    const checkedProperty = property || '';

    if (checkedProperty in obj) {
        obj[checkedProperty] = value;
        return;
    }

    if (isImplementsIObject(obj) && (obj as IObject).has(checkedProperty as string)) {
        (obj as IObject).set(checkedProperty, value);
        return;
    }

    const setter = getPropertyMethodName(checkedProperty as string, 'set');
    if (typeof obj[setter] === 'function' && !obj[setter].deprecated) {
        obj[setter](value);
        return;
    }

    throw new ReferenceError(`Object doesn't have setter for property "${property}"`);
}

/**
 * Извлекает значение по пути, ведущим вглубь объекта
 * @param obj Объект
 * @param path Путь внутри объекта
 * @param onElementResolve Обработчик при извлечении очередного элемента
 */
export function extractValue<T>(
    obj: unknown,
    path: string[],
    onElementResolve?: (name: string, scope: unknown, depth: number) => void
): T {
    let result: unknown = obj;

    for (let i = 0; i < path.length; i++) {
        if (result === undefined || result === null) {
            return undefined;
        }

        const name = path[i];
        if (isImplementsIObject(result) && (result as IObject).has(name)) {
            result = (result as IObject).get(name);
        } else {
            /**
             * if we want get "_options" field
             * we maybe want all fields from current scope
             * It is actual for stateless wml files
             */
            if (name !== '_options' || result[name]) {
                if (onElementResolve) {
                    onElementResolve(name, result, i);
                }
                result = result[name];
            }
        }
    }

    return result as T;
}

/**
 * Вставляет значение по пути, ведущим вглубь объекта
 * @param obj Объект
 * @param path Путь внутри объекта
 */
export function implantValue<T>(obj: unknown, path: string[], value: T): boolean {
    const lastPathPart = path.pop();
    const lastObj = extractValue(obj, path);

    if (lastObj) {
        if ((lastObj as IObject).set) {
            (lastObj as IObject).set(lastPathPart, value);
        } else {
            lastObj[lastPathPart] = value;
        }
        return true;
    }

    return false;
}

/**
 * Клонирует объект путем сериализации в строку и последующей десериализации.
 * @param original Объект для клонирования
 * @return Клон объекта
 */
export function clone<T>(original: T | ICloneable): T {
    if (original instanceof Object) {
        if (original['[Types/_entity/ICloneable]']) {
            return (original as ICloneable).clone<T>();
        } else {
            const functionsStorage: Map<number, Function> = new Map();
            const replacer = getJsonReplacerWithStorage(functionsStorage);
            const reviver = getJsonReviverWithStorage(undefined, functionsStorage);
            return JSON.parse(JSON.stringify(original, replacer), reviver);
        }
    } else {
        return original;
    }
}

/**
 * Рекурсивно клонирует простые объекты и массивы. Сложные объекты передаются по ссылке.
 * @param original Объект для клонирования
 * @param [options] Опции клонирования
 * @return Клон объекта
 */
export function clonePlain<T>(original: T | ICloneable, options?: IOptions | boolean): T {
    const normalizedOptions: IOptions =
        options === false ? { processCloneable: false } : options === true ? {} : options;

    return clonePlainInner(original, { ...defaultOtions, ...(normalizedOptions || {}) }, new Set());
}

function clonePlainInner<T>(
    original: T | ICloneable,
    options: IOptions,
    inProgress: Set<Object>
): T {
    // Avoid recursion through repeatable objects
    if (inProgress.has(original)) {
        return original as T;
    }

    let result;

    if (PLAIN_OBJECT_STRINGIFIER.call(original) === '[object Array]') {
        inProgress.add(original);
        result = (original as unknown as T[]).map((item) => {
            return clonePlainInner<T>(item, options, inProgress);
        });
        inProgress.delete(original);
    } else if (original && typeof original === 'object') {
        if (Object.getPrototypeOf(original) === PLAIN_OBJECT_PROTOTYPE) {
            inProgress.add(original);
            result = {};
            Object.entries(original).forEach(([key, value]) => {
                // Omit undefined values as JSON.stringify() does
                if (!options.keepUndefined && value === undefined) {
                    return;
                }

                result[key] = clonePlainInner(value, options, inProgress);
            });
            inProgress.delete(original);
        } else if (options.processCloneable && original['[Types/_entity/ICloneable]']) {
            result = (original as ICloneable).clone<T>();
        } else {
            result = original;
        }
    } else {
        result = original;
    }

    return result;
}
