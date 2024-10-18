/**
 * Библиотека, которая предоставляет механизм внедрения зависимостей.
 * Работает через алиасы на основе Service Locator.
 * @module
 * @public
 * @library
 * @remark
 * Внедрение зависимостей (dependency injection) - шаблон проектирования приложения, в котором класс запрашивает зависимости от внешних источников, а не создает их сам.
 * Подробнее про внедрение зависимостей в {@link https://ru.wikipedia.org/wiki/%D0%92%D0%BD%D0%B5%D0%B4%D1%80%D0%B5%D0%BD%D0%B8%D0%B5_%D0%B7%D0%B0%D0%B2%D0%B8%D1%81%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D0%B8 Википедии}.
 *
 * Внедрение зависимостей с помощью библиотеки Types/di решает следующие задачи в рамках Types/*:
 * <ul>
 *     <li>разрешение зависимости от прикладных моделей при работе Record/RecordSet</li>
 *     <li>создание экземпляра типизированного поля в Record</li>
 *     <li>получение типизированного объекта через Types/_entity/factory</li>
 *     <li>разрешение зависимостей при десериализации</li>
 * </ul>
 * @example
 * Зарегистрируем модель пользователя:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class User extends Model {
 *         // ...
 *     }
 *
 *     register('My/User', User, {instantiate: false});
 *     register('My/user', User);
 * </pre>
 *
 * Разрешаем зависимость в другом месте:
 * <pre>
 *     import {resolve} from 'Types/di';
 *
 *     const User = di.resolve('My/User');
 *     const newUserA = new User({
 *         login: 'root'
 *     });
 *     // ...or the same result via:
 *     const newUserB = di.resolve('My/User', {
 *         login: 'root'
 *     });
 * </pre>
 *
 * Удаляем регистрацию зависимости
 * <pre>
 *     import {unregister} from 'Types/di';
 *     unregister('My/User');
 * </pre>
 * @see {@link Types/collection:RecordSet#getModel}
 */

import { IHashMap } from 'Types/declarations';

type IStorageElement = [any, IOptions | undefined, object?];
const SINGLETONE_MAP_INDEX = 2;
const map = new Map<string, IStorageElement>();

/**
 * Опция для register
 */
export interface IOptions {
    /**
     * Инстанциировать только один объект
     */
    instantiate?: boolean;

    /**
     * Создавать новый экземпляр или использовать переданный инстанс
     */
    single?: boolean;
}

/**
 * Проверяет валидность названия зависимости
 * @param alias Название зависимости
 */
function checkAlias(alias: unknown): void {
    if (typeof alias !== 'string') {
        throw new TypeError('Alias should be a string');
    }
    if (!alias) {
        throw new TypeError('Alias is empty');
    }
}

/**
 * Регистрирует зависимость
 * @param alias Название зависимости
 * @param factory Фабрика объектов или готовый инстанс
 * @param options Опции
 * @public
 * @example
 * Зарегистрируем модель пользователя:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class User extends Model {
 *         // ...
 *     }
 *
 *     register('My/User', User, {instantiate: false});
 *     register('My/user', User);
 * </pre>
 * Зарегистрируем экземпляр текущего пользователя системы:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     const currentUser = new Model();
 *     register('application/user', currentUser, {instantiate: false});
 * </pre>
 * Зарегистрируем логер, который будет singleton:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class Logger {
 *         log() {
 *             // ...
 *         }
 *     }
 *
 *     register('application/logger', Logger, {single: true});
 * </pre>
 * Зарегистрируем модель пользователя с переопределенными аргументами конструктора:
 * <pre>
 *     import {register} from 'Types/di';
 *     import {Model} from 'Types/entity';
 *
 *     class User extends Model {
 *         // ...
 *     }
 *
 *     register('application/models/user/crm', (options) => new User({...options, {
 *        context: 'crm',
 *        dateFormat: 'Y/m/d'
 *     }}));
 * </pre>
 */
export function register(alias: string, factory: Function | object, options?: IOptions): void {
    checkAlias(alias);
    map.set(alias, [factory, options]);
}

/**
 * Удаляет регистрацию зависимости
 * @param alias Название зависимости
 * @public
 * @example
 * <pre>
 *     import {unregister} from 'Types/di';
 *     unregister('application/user');
 * </pre>
 */
export function unregister(alias: string): void {
    checkAlias(alias);
    map.delete(alias);
}

/**
 * Проверяет регистрацию зависимости с указанным названием
 * @param alias Название зависимости
 * @public
 * @example
 * <pre>
 *     import {isRegistered} from 'Types/di';
 *     console.log(isRegistered('application/user'));
 * </pre>
 */
export function isRegistered(alias: string): boolean {
    checkAlias(alias);
    return map.has(alias);
}

/**
 * Возвращает значение флага 'instantiate', с которым зарегистрирована зависимость
 * @param alias Название зависимости
 * @public
 * @example
 * <pre>
 *     import {register, isInstantiable} from 'Types/di';
 *
 *     class Foo {
 *         // ...
 *     }
 *     register('foo', Foo);
 *     console.log(isInstantiable('Foo')); // true
 *
 *
 *     class Bar {
 *         // ...
 *     }
 *     register('Bar', Bar, {instantiate: false});
 *     console.log(isInstantiable('Bar')); // false
 * </pre>
 */
export function isInstantiable(alias: string): boolean | void {
    if (isRegistered(alias)) {
        const config = (map.get(alias) as string[])[1] as IOptions;
        return (config && config.instantiate) !== false;
    }
}

/**
 * Создает экземпляр зарегистрированной зависимости.
 * @param alias Название зависимости, или конструктор объекта или инстанс объекта
 * @param options Опции конструктора
 * @public
 * @example
 * <pre>
 *     import {register, create} from 'Types/di';
 *
 *     class User {
 *         // ...
 *     }
 *
 *     register('application/User', User, {instantiate: false});
 *
 *     const newUser = create<User>('application/User', {
 *         login: 'root'
 *     });
 * </pre>
 */
export function create<TResult, TOptions = IHashMap<any>>(
    alias: string | Function | object,
    options?: TOptions
): TResult {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = resolve<TResult>(alias, options);
    if (typeof result === 'function') {
        return resolve(result, options);
    }
    return result;
}

/**
 * Разрешает зависимость
 * @param alias Название зависимости, или конструктор объекта или инстанс объекта
 * @param options Опции конструктора
 * @public
 * @example
 * <pre>
 *     import {register, resolve} from 'Types/di';
 *
 *     class User {
 *         // ...
 *     }
 *
 *     register('application/User', User, {instantiate: false});
 *     register('application/user', User);
 *
 *     // ...
 *
 *     const User = di.resolve('application/User');
 *     const newUserA = new User({
 *         login: 'root'
 *     });
 *     // ...or the same result via:
 *     const newUserB = di.resolve('application/user', {
 *         login: 'root'
 *     });
 * </pre>
 */
export function resolve<TResult, TOptions = IHashMap<any>>(
    alias: string | Function | object,
    options?: TOptions
): TResult {
    const aliasType = typeof alias;
    let Factory;
    let config: IOptions | undefined;
    let singleInst;

    switch (aliasType) {
        case 'function':
            Factory = alias;
            break;
        case 'object':
            Factory = alias;
            config = { instantiate: false };
            break;
        default:
            if (!isRegistered(alias as string)) {
                throw new ReferenceError(`Alias "${alias}" is not registered`);
            }
            [Factory, config, singleInst] = map.get(alias as string) as IStorageElement;
    }

    if (config) {
        if (config.instantiate === false) {
            return Factory;
        }
        if (config.single === true) {
            if (singleInst === undefined) {
                const singleConfig = map.get(alias as string);

                if (singleConfig) {
                    singleInst = singleConfig[SINGLETONE_MAP_INDEX] = new Factory(options);
                }
            }
            return singleInst;
        }
    }

    return new Factory(options);
}
