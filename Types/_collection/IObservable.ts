/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 * @module
 * @public
 */
import { EntityMarker } from 'Types/declarations';
import { Object as EventObject } from 'Env/Event';

/**
 *
 */
export enum ChangeAction {
    /**
     * Добавлены элементы
     */
    ACTION_ADD = 'a',
    /**
     * Удалены элементы
     */
    ACTION_REMOVE = 'rm',
    /**
     * Изменены элементы
     */
    ACTION_CHANGE = 'ch',
    /**
     * Заменены элементы
     */
    ACTION_REPLACE = 'rp',
    /**
     * Перемещены элементы
     */
    ACTION_MOVE = 'm',
    /**
     * Значительное изменение
     */
    ACTION_RESET = 'rs',
}

export type CollectionChangeHandler<T> = (
    event: EventObject,
    action: ChangeAction,
    newItems: T[],
    newItemsIndex: number,
    oldItems: T[],
    oldItemsIndex: number
) => void;

/**
 * Интерфейс привязки к коллекции.
 * Позволяет узнавать об изменения, происходящих с элементами коллекции.
 * @public
 */
export default abstract class IObservable {
    '[Types/_collection/IObservable]': EntityMarker;

    /**
     * Изменение коллекции: добавлены элементы
     */
    static readonly ACTION_ADD: ChangeAction = ChangeAction.ACTION_ADD;

    /**
     * Изменение коллекции: удалены элементы
     */
    static readonly ACTION_REMOVE: ChangeAction = ChangeAction.ACTION_REMOVE;

    /**
     * Изменение коллекции: изменены элементы
     */
    static readonly ACTION_CHANGE: ChangeAction = ChangeAction.ACTION_CHANGE;

    /**
     * Изменение коллекции: заменены элементы
     */
    static readonly ACTION_REPLACE: ChangeAction = ChangeAction.ACTION_REPLACE;

    /**
     * Изменение коллекции: перемещены элементы
     */
    static readonly ACTION_MOVE: ChangeAction = ChangeAction.ACTION_MOVE;

    /**
     * Изменение коллекции: значительное изменение
     */
    static readonly ACTION_RESET: ChangeAction = ChangeAction.ACTION_RESET;
}

Object.assign(IObservable.prototype, {
    '[Types/_collection/IObservable]': true,
});
