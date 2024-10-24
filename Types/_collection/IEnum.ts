/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import { EntityMarker } from 'Types/declarations';

/**
 *
 */
export type ISafeIndex = number | string;

/**
 *
 */
export type IIndex = ISafeIndex | null;

/**
 * Интерфейс перечисляемого типа.
 * Это перечисляемая коллекция ключей и значений, один из которых может быть выбран или нет.
 * @public
 */
export default interface IEnum<T> {
    readonly '[Types/_collection/IEnum]': EntityMarker;
    /**
     * Возвращает ключ выбранного элемента.
     * @example
     * <pre>
     *     import {Enum} from 'Types/collection';
     *     const colors = new Enum({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         index: 1
     *     });
     *
     *     console.log(colors.get());//1
     * </pre>
     */
    get(): IIndex;

    /**
     * Устанавливает элемент с заданным ключом в качестве выбранного. Если такой ключ не определен, генерирует исключение.
     * @param index Ключ выбранного элемента.
     * @example
     * <pre>
     *     import {Enum} from 'Types/collection';
     *     const colors = new Enum({
     *         dictionary: ['Red', 'Green', 'Blue']
     *     });
     *
     *     colors.set(1);
     *     console.log(colors.get());//1
     * </pre>
     */
    set(index: IIndex): void;

    /**
     * Возвращает значение выбранного элемента.
     * @param localizeДолжен вернуть локализованное значение.
     * @example
     * <pre>
     *     import {Enum} from 'Types/collection';
     *     const colors = new Enum({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         index: 1
     *     });
     *
     *     console.log(colors.getAsValue());//Green
     * </pre>
     */
    getAsValue(localize?: boolean): T;

    /**
     * Устанавливает элемент с заданным значением в качестве выбранного. Если такой ключ не определен, генерирует исключение.
     * @param value Значение выбранного элемента.
     * @param localizeЛокализованное значение.
     * @example
     * <pre>
     *     import {Enum} from 'Types/collection';
     *     const colors = new Enum({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         index: 1
     *     });
     *
     *     colors.setByValue('Green');
     *     console.log(colors.get());//1
     * </pre>
     */
    setByValue(value: T): void;

    /**
     * Возвращает оригинальный ключ выбранного элемента.
     * @example
     * <pre>
     *     import {Enum} from 'Types/collection';
     *     const colors = new Enum({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         index: 1
     *     });
     *
     *     colors.get(); //1
     *     colors.set(2);
     *     colors.get() // 2
     *     colors.getOriginal(); // 1
     * </pre>
     */

    getOriginal(): IIndex;

    /**
     * Возвращает оригинальное значение выбранного элемента.
     * @param localizeДолжен вернуть локализованное значение.
     * @example
     * <pre>
     *     import {Enum} from 'Types/collection';
     *     const colors = new Enum({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         index: 1
     *     });
     *
     *     colors.getAsValue(); //Green
     *     colors.setAsValue('Red');
     *     colors.getAsValue(); //Red
     *     colors.getOriginalAsValue(); //Green
     * </pre>
     */
    getOriginalAsValue(localize?: boolean): T;
}
