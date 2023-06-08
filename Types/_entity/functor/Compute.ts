/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Abstract from './Abstract';

export interface ICompute {
    readonly properties: string[];
}

/**
 * Функтор, позволяющий явно указать список свойств {@link Types/entity:Model модели}, от которых зависит результат вычисления значения.
 * @remark
 * Для лучшей производительности вычисляемые значения свойств модели кэшируются. Функтор Compute позволяет сбросить кэш при изменении значения свойств, переданных списком.
 * Необходимо дополнительно использовать функтор {@link Types/entity:functor.Track Track} для отслеживания изменения {@link Types/entity:Model#properties собственных} свойств модели.
 * @example
 * Определим функтор, отслеживающий изменения других свойств модели:
 * <pre>
 *     import {Model, functor} from 'Types/entity';
 *
 *     class User extends Model {
 *         protected _$properties: object = {
 *             birthDay: {
 *                 get: functor.Compute.create(
 *                     () => { return this.get('passportBirthDay') || this.get('profileBirthDay'); },
 *                     ['passportBirthDay', 'profileBirthDay']
 *                 )
 *             }
 *         }
 *     }
 *
 *     const user = new User();
 *     user.set('profileBirthDay', new Date(2001, 1, 2));
 *     console.log(user.get('birthDay')); // Fri Feb 02 2001 00:00:00
 *
 *     user.set('passportBirthDay', new Date(2001, 3, 4));
 *     console.log(user.get('birthDay')); // Wed Apr 04 2001 00:00:00
 * </pre>
 * @class Types/_entity/functor/Compute
 * @public
 */

/*
 * A functor that holds data about properties on which calculation result is depends on.
 * @example
 * Let's define a functor which shows that function result is depends on 'amount' property:
 * <pre>
 *     import {functor} from 'Types/entity';
 *
 *     const getTax = functor.Compute.create(
 *         (totals, percent) => totals.amount * percent / 100,
 *         ['amount']
 *     );
 *
 *     const tax = getTax({
 *         count: 5,
 *         amount: 250
 *     }, 20);
 *     console.log(tax); // 50
 *     console.log(getTax.properties); // ['amount']
 * </pre>
 * @class Types/_entity/functor/Compute
 * @public
 * @author Буранов А.Р.
 */
export default class Compute<T> extends Abstract<T> implements ICompute {
    readonly properties: string[];

    /**
     * Создает функтор.
     * @param fn Функция вызова.
     * @param properties Свойства, от которых зависит результат расчета.
     */

    /*
     * Creates the functor.
     * @param fn Function to call
     * @param properties Properties on which calculation result is depends on
     */
    static create<T = Function>(fn: T, properties?: string[]): T & ICompute {
        const result = Abstract.create.call(this, fn);

        properties = properties || [];
        if (!(properties instanceof Array)) {
            throw new TypeError('Argument "properties" should be an instance of Array');
        }

        Object.defineProperty(result, 'properties', {
            get(): string[] {
                return properties;
            },
        });

        return result;
    }
}
