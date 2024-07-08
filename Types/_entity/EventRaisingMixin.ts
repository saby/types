/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import ObservableMixin from './ObservableMixin';
import { EntityMarker } from '../_declarations';

/**
 * Миксин для реализации сущности, в которой можно приостанавливать генерацию событий об изменениях с фиксацией состояния.
 * Работает совместно с {@link Types/_entity/ObservableMixin}.
 * @public
 */
class EventRaisingMixin {
    '[Types/_entity/EventRaisingMixin]': EntityMarker;

    /**
     * @event После изменения режима генерации событий
     * @name Types/_entity/EventRaisingMixin#onEventRaisingChange
     * @param {Boolean} enabled Включена или выключена генерация событий
     * @param {Boolean} analyze Включен или выключен анализ изменений
     */

    /**
     * Генерация событий включена
     */
    protected _eventRaising: boolean;

    /**
     * Hooks to implement additional behavior when event rasing occurred
     */
    protected _eventRaisingTrigger: (enabled: boolean, analyze?: boolean) => void;

    constructor() {
        EventRaisingMixin.initMixin(this);
    }

    static initMixin(instance: any) {
        instance._publish('onEventRaisingChange');
    }

    // region Public methods

    /**
     * Включает/выключает генерацию событий об изменении коллекции
     * @remark
     * При изменения коллекции будет сгенерировано событие onCollectionChange, после окончания изменения - onAfterCollectionChange.
     * @param enabled Включить или выключить генерацию событий
     * @param [analyze=false] Анализировать изменения (если включить, то при enabled = true будет произведен анализ всех изменений с момента enabled = false - сгенерируются события обо всех изменениях)
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
     *    list.subscribe('onAfterCollectionChange', (action, changedItems) => {
     *         console.log(action === IObservable.ACTION_MOVE); // true
     *         console.log(changedItems[0] === 'two'); // true
     *     });
     *
     *     list.setEventRaising(false, true);
     *     const item = list.removeAt(1);
     *     list.add(item, 3);
     *     list.setEventRaising(true, true);
     * </pre>
     */
    setEventRaising(enabled: boolean, analyze?: boolean): void {
        enabled = !!enabled;
        analyze = !!analyze;
        const isEqual = this._eventRaising === enabled;

        if (analyze && isEqual) {
            throw new Error(
                `The events raising is already ${
                    enabled ? 'enabled' : 'disabled'
                } with analyze=true`
            );
        }

        if (this._eventRaisingTrigger) {
            this._eventRaisingTrigger.call(this, enabled, analyze);
        }

        this._eventRaising = enabled;

        if (!isEqual) {
            this._notify('onEventRaisingChange', enabled, analyze);
        }
    }

    /**
     * Возвращает признак, включена ли генерация событий об изменении коллекции (проекции коллекции)
     */
    isEventRaising(): boolean {
        return this._eventRaising;
    }

    // endregion
}

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-empty-interface
interface EventRaisingMixin extends ObservableMixin {}

export default EventRaisingMixin;

Object.assign(EventRaisingMixin.prototype, {
    '[Types/_entity/EventRaisingMixin]': true,
    _eventRaising: true,
});
