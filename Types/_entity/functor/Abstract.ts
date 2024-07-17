/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */

const $functors = Symbol('functors');

/**
 * Абстрактный функтор.
 * @public
 */

/*
 * Abstract functor.
 * @class Types/_entity/functor/Abstract
 * @public
 * @author Буранов А.Р.
 */
export default class Abstract<T = Function> {
    /**
     * Конструктор.
     * @param fn Функция при вызове функтора.
     * @param args... Возможные аргументы.
     */

    /*
     * Constructor.
     * @param fn Function to call when functor calls
     * @param args... Possible arguments
     */
    constructor(fn: T, ...args: any[]) {
        return Object.getPrototypeOf(this).constructor.create(fn, ...args);
    }

    /**
     * Создает новый функтор.
     * @param fn Функция при вызове функтора.
     */

    /*
     * Creates new functor.
     * @param fn Function to call when functor calls
     */
    static create<T = Function>(fn: T): T {
        if (!(fn instanceof Function)) {
            throw new TypeError('Argument "fn" be an instance of Function');
        }

        const functor = this;
        const inheritedFunctors = (fn as any)[$functors] ? (fn as any)[$functors].slice() : [];
        Object.defineProperty(fn, $functors, {
            get(): Function {
                return inheritedFunctors.concat(functor);
            },
        });

        return fn;
    }

    static isFunctor(fn: any): boolean {
        return Boolean(fn && fn[$functors] && fn[$functors].indexOf(this) > -1);
    }
}
