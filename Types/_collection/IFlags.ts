/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 * @module
 * @public
 */
import { EntityMarker } from 'Types/declarations';

/**
 * Значение флага
 */
export type IValue = boolean | null;

/**
 * Интерфейс для типа "Флаг".
 * Это перечисляемая коллекция ключей и значений, каждый из которых может быть выбран или нет.
 * @public
 */
export default interface IFlags<T> {
    readonly '[Types/_collection/IFlags]': EntityMarker;
    /**
     * Возвращает состояние выборки по имени флага. Если такое имя не определено, возвращает 'undefined'.
     * @param name Имя флага.
     * @param localize Должен вернуть локализованное имя флага.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         values: [false, true, false]
     *     });
     *
     *     colors.get('Red');//false
     *     colors.get('Green');//true
     * </pre>
     */
    get(name: T, localize?: boolean): IValue | undefined;

    /**
     * Устанавливает состояние выборки по имени флага. Если такое имя не определено, выдает исключение.
     * @param name Имя флага.
     * @param value Состояние выборки.
     * @param localize Локализованное имя флага.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue']
     *     });
     *
     *     colors.set('Red', false);
     *     colors.set('Green', true);
     *
     *     colors.get('Red');//false
     *     colors.get('Green');//true
     * </pre>
     */
    set(name: T, value: IValue, localize?: boolean): void;

    /**
     * Возвращает состояние выборки по индексу флага. Если такой индекс не определен, возвращает 'undefined'.
     * @param index Индекс флага.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         values: [false, true, false]
     *     });
     *
     *     colors.getByIndex(0);//false
     *     colors.getByIndex(1);//true
     * </pre>
     */
    getByIndex(index: number): IValue | undefined;

    /**
     * Возвращает оригинальное состояние выборки по имени флага. Если такое имя не определено, возвращает 'undefined'.
     * @param name Имя флага.
     * @param localize Должен вернуть локализованное имя флага.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         values: [false, true, false]
     *     });
     *
     *     colors.get('Red'); //false
     *     colors.set('Red', true);
     *     colors.get('Red'); //true
     *     colors.getOriginal('Red'); //false
     * </pre>
     */
    getOriginal(name: T, localize?: boolean): IValue | undefined;

    /**
     * Возвращает оригинальное состояние выборки по индексу флага. Если такой индекс не определен, возвращает 'undefined'.
     * @param index Индекс флага.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         values: [false, true, false]
     *     });
     *
     *     colors.getByIndex(0); //false
     *     colors.setByIndex(0, true); //true
     *     colors.getOriginalByIndex(0); //false
     * </pre>
     */

    getOriginalByIndex(index: number): IValue | undefined;

    /**
     * Устанавливает состояние выборки по индексу флага. Если такой индекс не определен, генерирует исключение.
     * @param index Индекс флага.
     * @param value Состояние выборки.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue'],
     *         values: [false, true, false]
     *     });
     *
     *     colors.setByIndex(0, false);
     *     colors.setByIndex(1, true);
     *
     *     colors.get('Red');//false
     *     colors.get('Green');//true
     * </pre>
     */
    setByIndex(index: number, value: IValue): void;

    /**
     * Устанавливает выборку флагов из массива. Индексы, которых нет в этом массиве, будут установлены в ноль.
     * @param source Массив выбранных флагов.
     * @example
     * <pre>
     *     import {Flags} from 'Types/collection';
     *     const colors = new Flags({
     *         dictionary: ['Red', 'Green', 'Blue']
     *     });
     *
     *     colors.fromArray([false, true]);
     *
     *     colors.get('Red');//false
     *     colors.get('Green');//true
     *     colors.get('Blue');//null
     * </pre>
     */
    fromArray(source: IValue[]): void;

    /**
     * Устанавливает состояние выбора всех флагов на false.
     */
    setFalseAll(): void;

    /**
     * Устанавливает состояние выбора всех флагов на true.
     */
    setTrueAll(): void;

    /**
     * Устанавливает состояние выбора всех флагов на null.
     */
    setNullAll(): void;
}
