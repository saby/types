/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
import IEquatable from '../_entity/IEquatable';

type UnknownObject = Record<string, unknown>;

function isEquatable(obj: unknown): obj is IEquatable {
    // @ts-ignore
    return obj && obj['[Types/_entity/IEquatable]'];
}

function isTraversable(value: unknown): value is UnknownObject {
    let proto;

    if (value && typeof value === 'object') {
        if (value instanceof Date) {
            return true;
        }

        if (value instanceof String) {
            return true;
        }

        proto = Object.getPrototypeOf(value);

        return proto === null || proto === Object.prototype;
    }

    return false;
}

function isEqualArrays(arr1: unknown[], arr2: unknown[]): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let index = 0; index < arr1.length; index++) {
        if (!isEqual(arr1[index], arr2[index])) {
            return false;
        }
    }

    return true;
}

function isEqualObjects(obj1: UnknownObject, obj2: UnknownObject): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    if (keys1.length > 0) {
        keys1.sort();
        keys2.sort();

        return !keys1.some((key, index) => {
            return !(keys2[index] === key && isEqual(obj1[key], obj2[key]));
        });
    }

    return Object.getPrototypeOf(obj1) === Object.getPrototypeOf(obj2);
}

/**
 * Рекурсивно сравнивает два объекта или массива.
 * @remark
 * Объекты считаются равными тогда, когда они равны по оператору ===, или когда они являются plain Object и у них
 * одинаковые наборы внутренних ключей, и по каждому ключу значения равны, причём, если эти значения - объекты или
 * массивы, то они сравниваются рекурсивно. Если объект не является plain Object, но поддерживает интерфейс
 * {@link Types/_entity/IEquatable}, то такие объекты сравниваются через вызов метода isEqual().
 * Функция возвращает true, когда оба объекта/массива идентичны.
 *
 * <h2>Пример использования</h2>
 * <pre>
 *     import {isEqual} from 'Types/object';
 *
 *     // true
 *     console.log(isEqual({foo: 'bar'}, {foo: 'bar'}));
 *
 *     // false
 *     console.log(isEqual([0], ['0']));
 * </pre>
 *
 * @param obj1 Первый объект
 * @param obj2 Второй объект
 * @public
 */
export default function isEqual(obj1: unknown, obj2: unknown): boolean {
    // Deal with strict equal of any type
    if (obj1 === obj2) {
        return true;
    }

    // Deal with arrays
    const isArray1 = Array.isArray(obj1);
    const isArray2 = Array.isArray(obj2);

    if (isArray1 !== isArray2) {
        return false;
    }

    if (isArray1 && isArray2) {
        return isEqualArrays(obj1, obj2);
    }

    // Deal with traversable objects
    if (isTraversable(obj1) && isTraversable(obj2)) {
        let val1;
        let val2;

        if (obj1.valueOf && obj1.valueOf === obj2.valueOf) {
            val1 = obj1.valueOf();
            val2 = obj2.valueOf();
        } else {
            val1 = obj1;
            val2 = obj2;
        }

        return val1 === obj1 && val2 === obj2 ? isEqualObjects(obj1, obj2) : isEqual(val1, val2);
    }

    // Deal with equatable objects
    if (isEquatable(obj1)) {
        return obj1.isEqual(obj2 as IEquatable);
    }

    if (isEquatable(obj2)) {
        return obj2.isEqual(obj1 as IEquatable);
    }

    // Deal with NaNs because comparison NaN === NaN gives false
    if (Number.isNaN(obj1) && Number.isNaN(obj2)) {
        return true;
    }

    // Unknown types which are not strict equal
    return false;
}
