import Abstract from './Abstract';

export interface ITrack {
    readonly propertyName: string;
}

/**
 * Функтор, генерирующий события об изменении значения собственных свойств у {@link Types/entity:Model Model}.
 * @remark
 * Для лучшей производительности изменения в {@link Types/entity:Model#properties собственных} свойствах у модели не отслеживаются.
 * Если требуется генерировать события об изменении свойства, определите его через функтор Track.
 * @example
 * Определим функтор, который отслеживает изменения значения свойства '_nickname':
 * <pre>
 *     import {Model, functor} from 'Types/entity';
 *
 *     class User extends Model {
 *         protected _nickname: string;
 *         protected _$properties: object = {
 *             nickname: {
 *                 get(): string {
 *                     return this._nickname;
 *                 },
 *                 set: functor.Track.create(
 *                     (value) => { this._nickname = value; }
 *                 )
 *             }
 *         }
 *     }
 *
 *     const user = new User();
 *     user.subscribe('onPropertyChange', (changed) => {
 *         console.log('On change', changed);
 *     });
 *
 *     user.set('nickname', 'BestMan'); // Causes console log 'On change {nickname: "BestMan"}'
 * </pre>
 * @class Types/_entity/functor/Track
 * @public
 */

/*
 * A functor that points at tracking and holds property name which saves tracking value.
 * @example
 * Let's define a functor which points at tracking value related to '_foo' property:
 * <pre>
 *     import {functor} from 'Types/entity';
 *
 *     const storage = {foo: null};
 *     const setFoo = functor.Track.create(
 *         (value) => {storage.foo = value},
 *         'foo'
 *     );
 *
 *     setFoo('bar');
 *     console.log(storage[setFoo.propertyName]); // 'bar'
 * </pre>
 * @class Types/_entity/functor/Track
 * @public
 * @author Буранов А.Р.
 */
export default class Track<T> extends Abstract<T> implements ITrack {
    readonly propertyName: string;

    /**
     * Создает функтор.
     * @param fn Функция для вызова.
     * @param [propertyName] Имя объекта отслеживания.
     */

    /*
     * Creates the functor.
     * @param fn Function to call
     * @param [propertyName] Property name to track
     */
    static create<T = Function>(fn: T, propertyName?: string): T & ITrack {
        const result = Abstract.create.call(this, fn);

        Object.defineProperty(result, 'propertyName', {
            get(): string {
                return propertyName;
            },
        });

        return result;
    }
}
