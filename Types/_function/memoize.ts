/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
/**
 * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возвращающую при повторных вызовах единожды вычисленный результат.
 * @module
 * @public
 */
import { getStore } from 'Application/Env';
import { isInit } from 'Application/Initializer';

const ID_STORE = 'Types_function_storages';

class Memoize {
    memoize(original: Function): any {
        return function (...args: any[]): any {
            if (isInit()) {
                const key = JSON.stringify(args);
                const store = getStore(ID_STORE);
                let storage = store.get('memoize') as unknown as WeakMap<any, any>;
                let cache = {};

                if (!storage) {
                    storage = new WeakMap();

                    store.set('memoize', storage as unknown as string);
                }

                if (storage.has(original)) {
                    cache = storage.get(original) as any[];
                } else {
                    storage.set(original, cache);
                }

                if (cache.hasOwnProperty(key)) {
                    return cache[key];
                }

                const result = original.apply(this, args);

                cache[key] = result;

                return result;
            }

            return original.apply(this, args);
        };
    }

    clear(original: Function, ...args: any[]): void {
        const storage = getStore(ID_STORE).get('memoize') as unknown as WeakMap<any, any>;

        if (storage?.has(original)) {
            const cache = storage.get(original);
            const key = JSON.stringify(args);

            if (cache.hasOwnProperty(key)) {
                delete cache[key];
            }
        }
    }
}

const instance = new Memoize();
const memoize = instance.memoize.bind(instance);
memoize.clear = instance.clear.bind(instance);
memoize.prototype = { _moduleName: 'Types/_function/memoize' };

/**
 * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возвращающую при повторных вызовах единожды вычисленный результат.
 * @function
 * @name Types/_function/memoize#memoize
 * @param {Function} original Метод, результат вызова которого будет запомнен.
 * @param {string} cachedFuncName Имя метода в экземпляре объекта, которому он принадлежит.
 * @returns Результирующая функция
 * @public
 */
export default memoize;
