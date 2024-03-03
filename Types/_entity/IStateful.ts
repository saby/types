/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from '../_declarations';

/**
 * Интерфейс объектов, которые могут сохранять свое состояние.
 * @public
 */

/*
 * An interface that can save its state.
 * @interface Types/_entity/IStateful
 * @public
 * @author Буранов А.Р.
 */
export default interface IStateful {
    readonly '[Types/_entity/IStateful]': EntityMarker;

    /**
     * Подтверждает изменения состояния записи с момента предыдущего вызова acceptChanges():
     * <ul>
     *     <li>Сбрасывает признак изменения для всех измененных полей;
     *     <li>Меняет {@link state} следующим образом:
     *         <ul>
     *             <li>Added или Changed становится Unchanged;</li>
     *             <li>Deleted становится Detached;</li>
     *             <li>остальные не меняются.</li>
     *         </ul>
     *     </li>
     * </ul>
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван acceptChanges для родительского элемента (только для поля, на котором находился дочерний элемент: acceptChanges(['название_поля_с_дочерним_элементом'])).
     * @param [cascade=false] Распространять изменения рекурсивно по вложенным элементам. Если параметр задан, будут вызваны acceptChanges рекурсивно у всех дочерних элементов. Игнорируется для типов Flags и Enum.
     */
    acceptChanges(spread?: boolean, cascade?: boolean): void;

    /**
     * Возвращает запись к состоянию, в котором она была с момента последнего вызова acceptChanges:
     * <ul>
     *     <li>Отменяются изменения всех полей;
     *     <li>{@link state State} возвращается к состоянию, в котором он был сразу после вызова acceptChanges.</li>
     * </ul>
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван rejectChanges для родительского элемента (только для поля, на котором находился дочерний элемент: rejectChanges(['название_поля_с_дочерним_элементом']).
     * @param [cascade=false] Отменить изменения всех дочерних элементов рекурсивно. Если параметр задан, будут вызваны rejectChanges рекурсивно у всех дочерних элементов. Игнорируется для типов Flags и Enum.
     */
    rejectChanges(spread?: boolean, cascade?: boolean): void;

    /**
     * Возвращает признак, что поле с указанным именем было изменено.
     */
    isChanged(name?: string): boolean;
}
