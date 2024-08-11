/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 * @module
 * @public
 */
import Abstract from './Abstract';

/**
 * @public
 */
export interface ITrack {
    /**
     *
     */
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
 * @public
 */
export default class Track<T> extends Abstract<T> implements ITrack {
    readonly propertyName: string;

    /**
     * Создает функтор.
     * @param fn Функция для вызова.
     * @param propertyName Имя объекта отслеживания.
     */
    static create<T = Function>(fn: T, propertyName?: string): T & ITrack {
        const result = Abstract.create.call(this, fn);

        Object.defineProperty(result, 'propertyName', {
            get(): string {
                // Но обращение к propertyName может произойти при мерже и упадёт ошибка.
                // Так что сохраню старое поведение и буду возвращать undefined, если не задали.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return propertyName;
            },
        });

        return result as T & ITrack;
    }
}
