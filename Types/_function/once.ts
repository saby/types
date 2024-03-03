/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
/**
 * Метод обертки функции: вызовет функцию только один раз.
 * @module
 * @public
 */
import { getStore } from 'Application/Env';
import { isInit } from 'Application/Initializer';

type InnerFunction = (...args: any[]) => any;

const ID_STORE = 'Types_function_storages';

/**
 * Метод обертки функции: вызовет функцию только один раз.
 * Повторные вызовы результирующей функции будут возвращать результат первого вызова.
 * @remark
 * <h2>Пример использования</h2>
 * <pre>
 *     import {once} from 'Types/function';
 *     const foo = (bar) => {
 *         console.log(`foo: ${bar}`);
 *         return 'foo+' + bar;
 *     };
 *     const fooDecorator = once(foo);
 *
 *     console.log(fooDecorator('baz'));//foo: baz, foo+baz
 *     console.log(fooDecorator('baz'));//foo+baz
 * });
 * </pre>
 *
 * @param original Исходная функция, вызов которой нужно выполнить один раз
 * @returns Результирующая функция
 * @public
 */
export default function once<T extends InnerFunction>(
    original: T
): (...args: Parameters<T>) => ReturnType<T> {
    return function (...args: Parameters<T>): ReturnType<T> {
        if (isInit()) {
            const store = getStore(ID_STORE);
            let storage = store.get('once') as unknown as WeakMap<any, any>;

            if (!storage) {
                storage = new WeakMap();

                store.set('once', storage as unknown as string);
            }

            if (!storage.has(original)) {
                const result = original.apply(this, args);

                storage.set(original, result);
            }

            return storage.get(original);
        }

        return original.apply(this, args);
    };
}
