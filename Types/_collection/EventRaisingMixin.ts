/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import enumerableComparator, { ISession } from './enumerableComparator';
import { ChangeAction } from './IObservable';
import IList from './IList';
import { ISerializable, EventRaisingMixin as EntityEventRaisingMixin } from '../entity';
import { EntityMarker } from 'Types/declarations';

export interface IChanges {
    newItems: any[];
    newItemsIndex: number;
    oldItems: any;
    oldItemsIndex: number;
}

/**
 * Миксин для реализации коллекции, в которой можно приостанавливать генерацию событий об изменениях с фиксацией состояния.
 * Работает совместно с {@link Types/_entity/EventRaisingMixin}.
 * @public
 */
class EventRaisingMixin {
    '[Types/_collection/EventRaisingMixin]': EntityMarker;

    protected _eventRaising: boolean;

    /**
     * Метод получения содержимого элемента коллекции (если такое поведение поддерживается)
     */
    protected _sessionItemContentsGetter: string;

    /**
     * Состояние коллекции до выключения генерации событий
     */
    protected _beforeRaiseOff: ISession | null;

    /**
     * Сообщение для режима блокировки изменений
     */
    protected _blockChangesMessage: string;

    // region EntityEventRaisingMixin

    constructor() {
        EventRaisingMixin.initMixin(this);
    }

    static initMixin(instance: any) {
        EntityEventRaisingMixin.initMixin(instance);
    }

    /**
     * Включает/выключает генерацию событий об изменении коллекции
     * @remark
     * При изменения коллекции будет сгенерировано событие onCollectionChange, после окончания изменения - onAfterCollectionChange.
     * @param enabled Включить или выключить генерацию событий
     * @param analyze Анализировать изменения (если включить, то при enabled = true будет произведен анализ всех изменений с момента enabled = false - сгенерируются события обо всех изменениях)
     * @example
     * Сгенерируем событие о перемещении элемента c позиции 1 на позицию 3:
     * <pre>
     *     import {ObservableList, IObservable} from 'Types/collection';
     *
     *     const list = new ObservableList({
     *         items: ['one', 'two', 'three', 'four', 'five']
     *     });
     *
     *     list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
     *         console.log(action === IObservable.ACTION_MOVE); // true
     *
     *         console.log(oldItems[0] === 'two'); // true
     *         console.log(oldItems[0] === item); // true
     *         console.log(oldItemsIndex === 1); // true
     *
     *         console.log(newItems[0] === 'two'); // true
     *         console.log(newItems[0] === item); // true
     *         console.log(newItemsIndex === 3); // true
     *     });
     *
     *     list.setEventRaising(false, true);
     *     const item = list.removeAt(1);
     *     list.add(item, 3);
     *     list.setEventRaising(true, true);
     * </pre>
     */
    setEventRaising(enabled: boolean, analyze?: boolean): void {
        EntityEventRaisingMixin.prototype.setEventRaising.call(this, enabled, analyze);
    }

    /**
     * Возвращает признак, включена ли генерация событий об изменении коллекции (проекции коллекции)
     */
    isEventRaising(): boolean {
        return EntityEventRaisingMixin.prototype.isEventRaising.call(this);
    }

    // endregion

    // region Protected methods

    /**
     * Запускает серию обновлений
     */
    protected _startUpdateSession(): ISession | null {
        if (!this._eventRaising) {
            return null;
        }
        return enumerableComparator.startSession(this as any, this._sessionItemContentsGetter);
    }

    /**
     * Завершает серию обновлений
     * @param session Серия обновлений
     * @param analyze Запустить анализ изменений
     */
    protected _finishUpdateSession(session: ISession, analyze?: boolean): void {
        if (!session) {
            return;
        }

        analyze = analyze === undefined ? true : analyze;

        enumerableComparator.finishSession(session, this as any, this._sessionItemContentsGetter);

        if (analyze) {
            this._analizeUpdateSession(session);
        }
    }

    /**
     * Анализирует серию обновлений, генерирует события об изменениях
     * @param session Серия обновлений
     */
    protected _analizeUpdateSession(session: ISession): void {
        if (!session) {
            return;
        }

        enumerableComparator.analizeSession(
            session,
            this as any,
            (action: ChangeAction, changes: IChanges) => {
                this._notifyCollectionChange(
                    action,
                    changes.newItems,
                    changes.newItemsIndex,
                    changes.oldItems,
                    changes.oldItemsIndex,
                    'analizeSession'
                );
            }
        );
    }

    /**
     * Генерирует событие об изменении коллекции
     * @param action Действие, приведшее к изменению
     * @param newItems Новые элементы исходной коллекции
     * @param newItemsIndex Индекс коллекции, в котором появились новые элементы
     * @param oldItems Удаленные элементы коллекции
     * @param oldItemsIndex Индекс коллекции, в котором удалены элементы
     * @param reason Доп. информация о причине изменения
     * @param changedPropertyItems Изменившиеся поля элементов коллекции (если коллекция содержит сложные объекты)
     */
    protected _notifyCollectionChange(
        action: ChangeAction,
        newItems: IChanges['newItems'],
        newItemsIndex: IChanges['newItemsIndex'],
        oldItems: IChanges['oldItems'],
        oldItemsIndex: IChanges['oldItemsIndex'],
        reason?: string,
        changedPropertyItems?: object
    ): void {
        if (!this._isNeedNotifyCollectionChange()) {
            return;
        }

        // Block from recursive changes in some cases
        if (this._blockChangesMessage) {
            throw new Error(this._blockChangesMessage);
        }
        if (action === ChangeAction.ACTION_RESET) {
            this._blockChangesMessage = `The instance of '${
                (this as unknown as ISerializable)._moduleName
            }' is blocked from changes because reset action is in progress.`;
        }

        this._notify(
            'onCollectionChange',
            action,
            newItems,
            newItemsIndex,
            oldItems,
            oldItemsIndex,
            reason,
            changedPropertyItems
        );

        this._blockChangesMessage = '';
    }

    /**
     * Разбивает элементы списка на пачки в порядке их следования в списке.
     * @param list Список, в котором содержатся элементы.
     * @param items Элементы в произвольном порядке.
     * @param callback Функция обратного вызова для каждой пачки
     */
    protected _extractPacksByList(list: IList<any>, items: any[], callback: Function): void {
        const send = (pack: any[], index: number) => {
            callback(pack.slice(), index);
            pack.length = 0;
        };
        const sortedItems = [];
        let item;
        let index;
        for (let i = 0; i < items.length; i++) {
            item = items[i];
            index = list.getIndex(item);
            sortedItems[index] = item;
        }

        const pack = [];
        let packIndex = 0;
        const maxIndex = sortedItems.length - 1;
        for (let index = 0; index <= maxIndex; index++) {
            item = sortedItems[index];

            if (!item) {
                if (pack.length) {
                    send(pack, packIndex);
                }
                continue;
            }

            if (!pack.length) {
                packIndex = index;
            }
            pack.push(item);
        }

        if (pack.length) {
            send(pack, packIndex);
        }
    }

    /**
     * Возвращает признак, что нужно генерировать события об изменениях коллекции
     */
    protected _isNeedNotifyCollectionChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onCollectionChange');
    }

    // endregion
}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-empty-interface
interface EventRaisingMixin extends EntityEventRaisingMixin {}

export default EventRaisingMixin;

/**
 * Hook to fulfill changes analysis.
 * Executes in context of instance.
 */
function onEventRaisingChange(this: EventRaisingMixin, enabled: boolean, analyze?: boolean): void {
    if (!analyze) {
        return;
    }

    if (enabled && this._beforeRaiseOff) {
        this._eventRaising = enabled;
        this._finishUpdateSession(this._beforeRaiseOff);
        this._beforeRaiseOff = null;
    } else {
        this._beforeRaiseOff = this._startUpdateSession();
    }
}

Object.assign(EventRaisingMixin.prototype, {
    '[Types/_entity/EventRaisingMixin]': true,
    _eventRaising: true,

    '[Types/_collection/EventRaisingMixin]': true,
    _eventRaisingTrigger: onEventRaisingChange,
    _sessionItemContentsGetter: '',
    _beforeRaiseOff: null,
    _blockChangesMessage: '',
});
