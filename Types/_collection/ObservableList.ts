/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnumerable from './IEnumerable';
import IObservable, { ChangeAction } from './IObservable';
import List, { IOptions as IListOptions } from './List';
import EventRaisingMixin from './EventRaisingMixin';
import { ISerializableSignature, ObservableMixin, relation, SerializableMixin } from '../entity';
import { register } from '../di';
import { applyMixins } from '../util';
import { EntityMarker } from 'Types/declarations';
import { Object as EventObject } from 'Env/Event';

const arraySlice = Array.prototype.slice;

/**
 * Список, в котором можно отслеживать изменения.
 * @remark
 * Подписка на событие об изменении элемента списка:
 * <pre>
 *     import {ObservableList, IObservable} from 'Types/collection';
 *
 *     const list = new ObservableList({
 *         items: [1, 2, 3]
 *     });
 *
 *     list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
 *         if (action == IObservable.ACTION_REMOVE) {
 *             console.log(oldItems); // [1]
 *             console.log(oldItemsIndex); // 0
 *         }
 *     });
 *
 *     list.removeAt(0);
 * </pre>
 * Подписка на событие об окончании изменения элемента списка:
 * <pre>
 *     import {ObservableList, IObservable} from 'Types/collection';
 *
 *     const list = new ObservableList({
 *         items: [1, 2, 3]
 *     });
 *
 *     list.subscribe('onAfterCollectionChange', (action, changedItems) => {
 *         if (action == IObservable.ACTION_REMOVE) {
 *             console.log(changedItems); // [1]
 *         }
 *     });
 *
 *     list.removeAt(0);
 * </pre>
 * @public
 */
class ObservableList<T> extends List<T> implements relation.IReceiver {
    /**
     * После изменения коллекции
     * @category Event
     * @param event Дескриптор события.
     * @param action Действие, приведшее к изменению.
     * @param newItems Новые элементы коллекции.
     * @param newItemsIndex Индекс, в котором появились новые элементы.
     * @param oldItems Удаленные элементы коллекции.
     * @param oldItemsIndex Индекс, в котором удалены элементы.
     * @example
     * <pre>
     *     import {ObservableList, IObservable} from 'Types/collection';
     *
     *     const list = new ObservableList({
     *         items: [1, 2, 3]
     *     });
     *
     *     list.subscribe('onCollectionChange', (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
     *         if (action == IObservable.ACTION_REMOVE){
     *             console.log(oldItems); // [1]
     *             console.log(oldItemsIndex); // 0
     *         }
     *     });
     *
     *     list.removeAt(0);
     * </pre>
     */
    onCollectionChange?: (
        event: EventObject,
        action: ChangeAction,
        newItems: T[],
        newItemsIndex: number,
        oldItems: T[],
        oldItemsIndex: number
    ) => void;

    /**
     * После изменения элемента коллекции
     * @category Event
     * @param event Дескриптор события.
     * @param item Измененный элемент коллекции.
     * @param index Индекс измененного элемента.
     * @param properties Изменившиеся свойства
     * @example
     * Отследим изменение свойства title:
     * <pre>
     *     import {ObservableList, IObservable} from 'Types/collection';
     *     import {Record} from 'Types/entity';
     *
     *     const records = [new Record(), new Record(), new Record()];
     *     const list = new ObservableList({
     *         items: records
     *     });
     *
     *     list.subscribe('onCollectionItemChange', (event, item, index, properties) => {
     *         console.log(item === records[2]); // true
     *         console.log(index); // 2
     *         console.log('title' in properties); // true
     *     });
     *
     *     records[2].set('title', 'test');
     * </pre>
     */
    onCollectionItemChange?: (
        event: EventObject,
        item: T,
        index: number,
        properties?: object
    ) => void;

    /**
     * После завершения изменения коллекции
     * @category Event
     * @param action Действие, приведшее к изменению.
     * @param changedPropertyItems Новые элементы коллекции.
     * @example
     * <pre>
     *     import {ObservableList, IObservable} from 'Types/collection';
     *
     *     const list = new ObservableList({
     *         items: [1, 2, 3]
     *     });
     *
     *     list.subscribe('onAfterCollectionChange', (action, changedPropertyItems) => {
     *         if (action == IObservable.ACTION_REMOVE){
     *             console.log(changedPropertyItems); // [1]
     *         }
     *     });
     *
     *     list.removeAt(0);
     * </pre>
     */
    onAfterCollectionChange?: (
        event: EventObject,
        action: ChangeAction,
        changedPropertyItems: T[]
    ) => void;

    /**
     * Количество измененных элементов, что важно для генерации одного события с действием ACTION_RESET вместо нескольких.
     */
    protected _resetChangesCount: number;

    /**
     * Элементы, измененные во время работы события, были выключены.
     */
    protected _silentChangedItems: Set<T> | undefined;

    /**
     * Поля элементов коллекции, измененные во время работы события, которые были выключены.
     */
    protected _silentChangedPropertyItems: Record<number, object> | undefined;

    // endregion

    // region relation.IReceiver

    readonly '[Types/_entity/relation/IReceiver]': EntityMarker;

    constructor(options?: IListOptions<T>) {
        super(options);

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this.initObservableList();
    }

    protected initObservableList(): void {
        EventRaisingMixin.initMixin(this);

        this._publish('onCollectionChange', 'onCollectionItemChange', 'onAfterCollectionChange');
    }

    // region List

    /**
     *
     * @param items
     */
    assign(items: IEnumerable<T> | T[]): void {
        const oldItems = this._itemsSlice();
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        super.assign(items);
        this._eventRaising = eventsWasRaised;

        if (oldItems.length > 0 || this._$items.length > 0) {
            this._notifyCollectionChange(
                IObservable.ACTION_RESET,
                this._itemsSlice(),
                0,
                oldItems,
                0,
                'assign'
            );
            this._notifyAfterCollectionChange(IObservable.ACTION_RESET);
        }
    }

    /**
     *
     * @param items
     */
    append(items: IEnumerable<T> | T[]): void {
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        const count = this.getCount();
        super.append(items);
        this._eventRaising = eventsWasRaised;

        this._notifyCollectionChange(
            IObservable.ACTION_ADD,
            this._itemsSlice(count),
            count,
            [],
            0,
            'append'
        );
        this._notifyAfterCollectionChange(IObservable.ACTION_ADD);
    }

    /**
     *
     * @param items
     */
    prepend(items: IEnumerable<T> | T[]): void {
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        const length = this.getCount();
        super.prepend(items);
        this._eventRaising = eventsWasRaised;

        this._notifyCollectionChange(
            IObservable.ACTION_ADD,
            this._itemsSlice(0, this.getCount() - length),
            0,
            [],
            0,
            'prepend'
        );
        this._notifyAfterCollectionChange(IObservable.ACTION_ADD);
    }

    /**
     *
     */
    clear(): void {
        const oldItems = this._$items.slice();
        const eventsWasRaised = this._eventRaising;

        this._eventRaising = false;
        super.clear();
        this._eventRaising = eventsWasRaised;

        this._notifyCollectionChange(
            IObservable.ACTION_RESET,
            this._itemsSlice(),
            0,
            oldItems,
            0,
            'clear'
        );
        this._notifyAfterCollectionChange(IObservable.ACTION_RESET);
    }

    /**
     *
     * @param item
     * @param at
     */
    add(item: T, at?: number): void {
        super.add(item, at);
        const typedAt = (this._isValidIndex(at as number) ? at : this.getCount() - 1) as number;
        this._notifyCollectionChange(
            IObservable.ACTION_ADD,
            this._itemsSlice(typedAt, typedAt + 1),
            typedAt,
            [],
            0,
            'add'
        );
        this._notifyAfterCollectionChange(IObservable.ACTION_ADD);
    }

    /**
     *
     * @param index
     */
    removeAt(index: number): T {
        const item = super.removeAt(index);
        this._notifyCollectionChange(IObservable.ACTION_REMOVE, [], 0, [item], index, 'removeAt');
        this._notifyAfterCollectionChange(IObservable.ACTION_REMOVE);
        return item;
    }

    /**
     *
     * @param item
     * @param at
     */
    replace(item: T, at: number): void {
        const oldItem = this._$items[at];
        super.replace(item, at);

        // Replace with itself has no effect
        if (oldItem !== item) {
            this._notifyCollectionChange(
                IObservable.ACTION_REPLACE,
                this._itemsSlice(at, at + 1),
                at,
                [oldItem],
                at,
                'replace'
            );
            this._notifyAfterCollectionChange(IObservable.ACTION_REPLACE);
        }
    }

    /**
     *
     * @param from
     * @param to
     */
    move(from: number, to: number): void {
        const item = this._$items[from];
        super.move(from, to);

        if (from !== to) {
            this._notifyCollectionChange(IObservable.ACTION_MOVE, [item], to, [item], from, 'move');
            this._notifyAfterCollectionChange(IObservable.ACTION_MOVE);
        }
    }

    relationChanged(which: any, route: string[]): any {
        const target = which.target;
        const index = this.getIndex(target);
        const data: Record<number, unknown> = {};

        if (index > -1) {
            this._reindex(undefined, index, 1);
        }

        const name = route[0];
        if (name === undefined) {
            this._notifyItemChange(target, which.data || {});
        }

        data[index] = target;
        return {
            target,
            data,
        };
    }

    // endregion

    // region EventRaisingMixin

    /**
     *
     * @param enabled
     * @param analyze
     */
    setEventRaising(enabled: boolean, analyze?: boolean): void {
        EventRaisingMixin.prototype.setEventRaising.call(this, enabled, analyze);
        let action = null;
        // Если стрелять событиями до синхронизации то проекция не всегда сможет найти стрельнувший item или найдет
        // не тот
        if (enabled && analyze && this._silentChangedItems) {
            if (
                this._silentChangedItems.size >=
                Math.min(this._resetChangesCount, this._$items.length)
            ) {
                // Если изменилось критическое число элементов, то генерируем reset
                this._notifyCollectionChange(
                    IObservable.ACTION_RESET,
                    this._itemsSlice(),
                    0,
                    [],
                    0,
                    'setEventRaising',
                    this._silentChangedPropertyItems
                );
                action = IObservable.ACTION_RESET;
            } else {
                const silentChangedItemsArray: T[] = [];
                this._silentChangedItems.forEach((item) => {
                    return silentChangedItemsArray.push(item);
                });

                // Собираем изменившиеся элементы в пачки
                this._extractPacksByList(
                    this,
                    silentChangedItemsArray,
                    (pack: any[], index: number) => {
                        this._notifyCollectionChange(
                            IObservable.ACTION_CHANGE,
                            pack,
                            index,
                            pack,
                            index,
                            'setEventRaising',
                            this._silentChangedPropertyItems
                        );
                    }
                );
                action = IObservable.ACTION_CHANGE;
            }
        }
        this._notifyAfterCollectionChange(action, this._silentChangedPropertyItems);
        delete this._silentChangedItems;
        delete this._silentChangedPropertyItems;
    }

    // endregion

    // region Protected methods

    /**
     * Генерирует событие об изменении элемента
     * @param item Элемент
     * @param properties Изменившиеся свойства
     */
    protected _notifyItemChange(item: T, properties: object): void {
        if (this._isNeedNotifyCollectionItemChange()) {
            const index = this.getIndex(item);
            this._notify('onCollectionItemChange', this._$items[index], index, properties);
        }

        if (
            (this.hasEventHandlers('onCollectionItemChange') ||
                this.hasEventHandlers('onCollectionChange') ||
                this.hasEventHandlers('onAfterCollectionChange')) &&
            !this._eventRaising
        ) {
            if (!this._silentChangedItems) {
                this._silentChangedItems = new Set();
            }

            if (!this._silentChangedPropertyItems) {
                this._silentChangedPropertyItems = {};
            }

            this._silentChangedItems.add(item);
            const index = this.getIndex(item);
            if (!this._silentChangedPropertyItems[index]) {
                this._silentChangedPropertyItems[index] = properties;
            } else {
                Object.assign(this._silentChangedPropertyItems[index], properties);
            }
        }
    }

    /**
     * Извлекает элементы, входящие в указанный отрезок
     * @param _begin Индекс, по которому начинать извлечение.
     * @param _end Индекс, по которому заканчивать извлечение.
     */
    protected _itemsSlice(_begin?: number, _end?: number): T[] {
        return arraySlice.apply(this._$items, [_begin, _end]);
    }

    /**
     * Возвращает признак, что нужно генерировать события об изменениях элементов коллекции
     */
    protected _isNeedNotifyCollectionItemChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onCollectionItemChange');
    }

    /**
     * Возвращает признак, что нужно генерировать события об окончании изменений коллекции
     */
    protected _isNeedNotifyAfterCollectionChange(): boolean {
        return this._eventRaising && this.hasEventHandlers('onAfterCollectionChange');
    }

    /**
     * Генерирует событие об окончании изменений коллекции
     */
    protected _notifyAfterCollectionChange(
        action: ChangeAction | undefined | null,
        changedPropertyItems?: object
    ): void {
        if (!this._isNeedNotifyAfterCollectionChange()) {
            return;
        }
        this._notify('onAfterCollectionChange', action, changedPropertyItems);
    }

    // endregion

    // region SerializableMixin

    static fromJSON<T = SerializableMixin, K = any>(data: ISerializableSignature<K>): T {
        //@ts-ignore
        return List.fromJSON.call(this, data);
    }

    static es5Constructor<T>(options?: IListOptions<T>) {
        List.es5Constructor.call(this, options);

        ObservableList.prototype.initObservableList.call(this);
    }

    // endregion
}

applyMixins(ObservableList, ObservableMixin, IObservable, EventRaisingMixin);

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ObservableList<T> extends List<T>, ObservableMixin, EventRaisingMixin {}

Object.assign(ObservableList.prototype, {
    '[Types/_collection/ObservableList]': true,
    '[Types/_entity/relation/IReceiver]': true,
    _moduleName: 'Types/collection:ObservableList',
    _resetChangesCount: 100,
});

export default ObservableList;

register('Types/collection:ObservableList', ObservableList, {
    instantiate: false,
});
