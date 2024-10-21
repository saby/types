/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker, IObjectKey } from 'Types/declarations';

export type TRecMapped = { [key: IObjectKey]: unknown };

/**
 * Интерфейс доступа к свойствам объекта.
 * Позволяет читать и записывать значения свойств, а также проверять их наличие.
 * @public
 */
export default interface IObject<DeclaredType extends object = any> {
    readonly '[Types/_entity/IObject]': EntityMarker;

    /**
     * Возвращает значение свойства.
     * Если свойство не существует, возвращает undefined.
     * Если свойство является объектом, то всегда возвращается один и тот же объект (если он не был заменен через вызов метода set).
     * @param name Название свойства
     * @return
     * @example
     * Получим имя и сведения о родителях персонажа:
     * <pre>
     *     var timeline = 'before s6e10',
     *         character = new Record({
     *             rawData: {
     *                 name: 'Jon',
     *                 familyName: 'Snow',
     *                 father: {
     *                     name: 'Eddard',
     *                     familyName: 'Stark'
     *                 }
     *             }
     *         });
     *
     *     character.get('name');//'Jon'
     *     character.get('father');//{name: 'Eddard', familyName: 'Stark'}
     *     character.get('mother');//undefined
     * </pre>
     */
    get<K extends keyof DeclaredType>(name: K): DeclaredType[K];

    /**
     * Устанавливает значение свойства.
     * Если свойство только для чтения, генерирует исключение.
     * @param name Название свойства или набор названий свойств и их значений
     * @param value Значение свойства (передается в случае, если name - строка)
     * @example
     * Установим имя персонажа:
     * <pre>
     *     var character = new Record();
     *     character.set('name', 'Jon');
     * </pre>
     * Установим данные персонажа:
     * <pre>
     *     var character = new Record();
     *     character.set({
     *         name: 'Jon',
     *         familyName: 'Snow',
     *         house: 'House Stark'
     *     });
     * </pre>
     */
    set<K extends keyof DeclaredType>(name: K, value: DeclaredType[K]): void;

    /**
     * Проверяет наличие свойства у объекта.
     * @param name Название свойства
     * @return
     * @example
     * Проверим наличие связей персонажа:
     * <pre>
     *     var timeline = 'before s6e10',
     *         character = new Record({
     *             rawData: {
     *                 name: 'Jon',
     *                 familyName: 'Snow',
     *                 father: {
     *                     name: 'Eddard',
     *                     familyName: 'Stark'
     *                 }
     *             }
     *         });
     *
     *     character.has('father');//true
     *     character.has('mother');//false
     * </pre>
     */
    has<K extends keyof DeclaredType>(name: K): boolean;
}

/**
 *
 */
export type IObjectConstructor = new () => IObject;
