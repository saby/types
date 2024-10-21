/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnumerable, { EnumeratorCallback } from './IEnumerable';
import IList from './IList';
import IObservable, { ChangeAction } from './IObservable';
import IIndexedCollection from './IIndexedCollection';
import Arraywise from './enumerator/Arraywise';
import Indexer from './Indexer';
import {
    CloneableMixin,
    DestroyableMixin,
    IEquatable,
    ISerializableState,
    ManyToManyMixin,
    OptionsToPropertyMixin,
    ReadWriteMixin,
    IReadWriteMixinOptions,
    relation,
    SerializableMixin,
    ISerializableSignature,
    VersionableMixin,
} from '../entity';
import { register } from '../di';
import { deprecateExtend, mixin, object } from '../util';
import { EntityMarker, IObjectKey } from 'Types/declarations';

/**
 *
 */
export interface IOptions<T> extends IReadWriteMixinOptions {
    /**
     *
     */
    items?: T[];
}

/**
 * Список - коллекция c доступом по индексу.
 * @remark
 * Основные возможности:
 * <ul>
 *     <li>последовательный перебор элементов коллекции - поддержка интерфейса
 *          {@link Types/_collection/IEnumerable};
 *     </li>
 *     <li>доступ к элементам коллекции по индексу - поддержка интерфейса
 *          {@link Types/_collection/IList};
 *     </li>
 *     <li>поиск элементов коллекции по значению свойства - поддержка интерфейса
 *          {@link Types/_collection/IIndexedCollection}.
 *     </li>
 * </ul>
 * Создадим список, в котором в качестве сырых данных используется plain JSON (адаптер для данных в таком формате используется по умолчанию):
 * <pre>
 *     import {List} from 'Types/collection';
 *
 *     const characters = new List({
 *         items: [{
 *             id: 1,
 *             firstName: 'Tom',
 *             lastName: 'Sawyer'
 *         }, {
 *             id: 2,
 *             firstName: 'Huckleberry',
 *             lastName: 'Finn'
 *         }]
 *     });
 *     console.log(characters.at(0).firstName); // 'Tom'
 *     console.log(characters.at(1).firstName); // 'Huckleberry'
 * </pre>
 * @public
 */
export default class List<T>
    extends mixin<
        DestroyableMixin,
        OptionsToPropertyMixin,
        SerializableMixin,
        CloneableMixin,
        ManyToManyMixin,
        ReadWriteMixin,
        VersionableMixin
    >(
        DestroyableMixin,
        OptionsToPropertyMixin,
        SerializableMixin,
        CloneableMixin,
        ManyToManyMixin,
        ReadWriteMixin,
        VersionableMixin
    )
    implements IEnumerable<T, number>, IList<T>, IIndexedCollection, IEquatable
{
    readonly '[Types/_collection/List]': EntityMarker = true;

    /**
     * Элементы списка
     */
    protected _$items: T[];

    /**
     * Индексатор элементов.
     */
    protected _indexer: Indexer<T[]> | null;

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': EntityMarker;

    forEach: (callback: EnumeratorCallback<T, number>, context?: object) => void;

    // endregion

    // region IList

    readonly '[Types/_collection/IList]': EntityMarker;

    // endregion

    // region IIndexedCollection

    readonly '[Types/_collection/IIndexedCollection]': EntityMarker;

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker;

    /**
     *
     * @param options
     */
    constructor(options?: IOptions<T>) {
        List.checkOptions(options);

        super();

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es 2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this.initList(options);
    }

    protected initList(options?: IOptions<T>) {
        OptionsToPropertyMixin.initMixin(this, options);
        ReadWriteMixin.initMixin(this, options);

        this._$items = this._$items || [];
        for (let i = 0, count = this._$items.length; i < count; i++) {
            this._addChild(this._$items[i]);
        }
    }

    destroy(): void {
        // @ts-ignore
        this._$items = null;
        // @ts-ignore
        this._indexer = null;

        ReadWriteMixin.prototype.destroy.call(this);
        super.destroy();
    }

    /**
     * Возвращает энумератор для перебора элементов списка.
     * Пример использования можно посмотреть в модуле {@link Types/_collection/IEnumerable}.
     */
    getEnumerator(): Arraywise<T> {
        return new Arraywise(this._$items);
    }

    /**
     * Перебирает элементы списка.
     * @param callback Функция обратного вызова, аргументами будут переданы формат {@link Types/entity:format.Field поля} и ее позиция.
     * @param [context] Контекст вызова callback
     * @example
     * Пробежимся по всем полям формата:
     * <pre>
     *     import {format as fields} from 'Types/entity';
     *     import {format} from 'Types/collection';
     *
     *     const format = new format.Format({
     *         items: [
     *             new fields.IntegerField({name: 'id'}),
     *             new fields.StringField({name: 'login'}),
     *             new fields.StringField({name: 'email'})
     *         ]
     *     });
     *
     *     format.each((format, index) => {
     *         console.log(format.getName());
     *     });
     *     // output: 'id', 'login', 'email'
     * </pre>
     */
    each(callback: EnumeratorCallback<T, number>, context?: object): void {
        // It's faster than use getEnumerator()
        for (let i = 0, count = this.getCount(); i < count; i++) {
            //@ts-ignore
            callback.call(context || this, this.at(i), i, this);
        }
    }

    assign(items: IEnumerable<T> | T[]): void {
        for (let i = 0, count = this._$items.length; i < count; i++) {
            this._removeChild(this._$items[i]);
        }
        this._$items.length = 0;

        items = this._splice(items || [], 0, IObservable.ACTION_RESET);

        for (let i = 0, count = items.length; i < count; i++) {
            this._addChild(items[i]);
        }
        this._childChanged(items);
    }

    append(items: IEnumerable<T> | T[]): void {
        items = this._splice(items, this.getCount(), IObservable.ACTION_ADD);

        for (let i = 0, count = items.length; i < count; i++) {
            this._addChild(items[i]);
        }
        this._childChanged(items);
    }

    prepend(items: IEnumerable<T> | T[]): void {
        items = this._splice(items, 0, IObservable.ACTION_ADD);

        for (let i = 0, count = items.length; i < count; i++) {
            this._addChild(items[i]);
        }
        this._childChanged(items);
    }

    clear(): void {
        this._$items.length = 0;
        this._reindex();
        this._getMediator().clear(this, relation.ManyToManyClearType.Slaves);
        this._childChanged();
        this._nextVersion();
    }

    add(item: T, at?: number): void {
        if (at === undefined) {
            at = this._$items.length;
            this._$items.push(item);
        } else {
            at = at || 0;
            if (at !== 0 && !this._isValidIndex(at, true)) {
                throw new Error('Index is out of bounds');
            }
            this._$items.splice(at, 0, item);
        }

        this._addChild(item);
        this._childChanged(item);
        this._nextVersion();
        this._reindex(IObservable.ACTION_ADD, at, 1);
    }

    at(index: number): T {
        return this._$items[index];
    }

    remove(item: T): boolean {
        const index = this.getIndex(item);
        if (index !== -1) {
            this.removeAt(index);
            this._childChanged(item);
            return true;
        }
        return false;
    }

    removeAt(index: number): T {
        if (!this._isValidIndex(index)) {
            throw new Error('Index is out of bounds');
        }
        this._removeChild(this._$items[index]);
        const deleted = this._$items.splice(index, 1);
        this._reindex(IObservable.ACTION_REMOVE, index, 1);
        this._childChanged(index);
        this._nextVersion();
        return deleted[0];
    }

    replace(item: T, at: number): void {
        if (!this._isValidIndex(at)) {
            throw new Error('Index is out of bounds');
        }

        const oldItem = this._$items[at];

        // Replace with itself has no effect
        if (oldItem === item) {
            return;
        }

        this._removeChild(oldItem);
        this._$items[at] = item;
        this._addChild(item);
        this._reindex(IObservable.ACTION_REPLACE, at, 1);
        this._childChanged(item);
        this._nextVersion();
    }

    move(from: number, to: number): void {
        if (!this._isValidIndex(from)) {
            throw new Error(`${this._moduleName}::move: Argument "from" is out of bounds`);
        }
        if (!this._isValidIndex(to)) {
            throw new Error(`${this._moduleName}::move: Argument "to" is out of bounds`);
        }
        if (from === to) {
            return;
        }

        const items = this._$items.splice(from, 1);
        this._$items.splice(to, 0, items[0]);

        if (from < to) {
            this._reindex(IObservable.ACTION_REPLACE, from, 1 + to - from);
        } else {
            this._reindex(IObservable.ACTION_REPLACE, to, 1 + from - to);
        }
        this._childChanged(items[0]);
        this._nextVersion();
    }

    getCount(): number {
        return this._$items.length;
    }

    getIndex(item: T): number {
        return this._$items.indexOf(item);
    }

    getIndexByValue(property: IObjectKey, value: any): number {
        return this._getIndexer().getIndexByValue(property, value);
    }

    getIndicesByValue(property: IObjectKey, value: any): number[] {
        return this._getIndexer().getIndicesByValue(property, value);
    }

    isEqual(to: any): boolean {
        if (to === this) {
            return true;
        }
        if (!to || !(to instanceof List)) {
            return false;
        }

        if (this.getCount() !== to.getCount()) {
            return false;
        }
        for (let i = 0, count = this.getCount(); i < count; i++) {
            if (this.at(i) !== to.at(i)) {
                return false;
            }
        }
        return true;
    }

    _getSerializableState(state: ISerializableState<IOptions<T>>): ISerializableState<IOptions<T>> {
        return SerializableMixin.prototype._getSerializableState.call(this, state);
    }

    _setSerializableState(state: ISerializableState<IOptions<T>>): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function (this: List<T>): void {
            fromSerializableMixin.call(this);
            this._clearIndexer();
        };
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает индексатор коллекции
     */
    protected _getIndexer(): Indexer<T[]> {
        return (
            this._indexer ||
            (this._indexer = new Indexer<T[]>(
                this._$items,
                (items) => {
                    return items.length;
                },
                (items, at) => {
                    return items[at];
                },
                (item, property) => {
                    return object.getPropertyValue(item, property);
                }
            ))
        );
    }

    /**
     * Очищает индексатор коллекции
     */
    protected _clearIndexer(): void {
        this._indexer = null;
    }

    /**
     * Проверяет корректность индекса
     * @param index Индекс
     * @param addMode Режим добавления
     */
    protected _isValidIndex(index: number, addMode?: boolean): boolean {
        let max = this.getCount();
        if (addMode) {
            max++;
        }
        return index >= 0 && index < max;
    }

    /**
     * Переиндексирует список
     * @param action Действие, приведшее к изменению.
     * @param start С какой позиции переиндексировать
     * @param count Число переиндексируемых элементов
     */
    protected _reindex(action?: ChangeAction, start: number = 0, count: number = 0): void {
        if (!this._indexer) {
            return;
        }

        const indexer = this._getIndexer();
        switch (action) {
            case IObservable.ACTION_ADD:
                indexer.shiftIndex(start, this.getCount() - start, count);
                indexer.updateIndex(start, count);
                break;
            case IObservable.ACTION_REMOVE:
                indexer.removeFromIndex(start, count);
                indexer.shiftIndex(start + count, this.getCount() - start, -count);
                break;
            case IObservable.ACTION_REPLACE:
                indexer.removeFromIndex(start, count);
                indexer.updateIndex(start, count);
                break;
            case IObservable.ACTION_RESET:
                indexer.resetIndex();
                break;
            default:
                if (count > 0) {
                    indexer.removeFromIndex(start, count);
                    indexer.updateIndex(start, count);
                } else {
                    indexer.resetIndex();
                }
        }
    }

    /**
     * Вызывает метод splice.
     * @param items Коллекция с элементами для замены
     * @param start Индекс в массиве, с которого начинать добавление.
     * @param action Действие, приведшее к изменению.
     */
    protected _splice(items: IEnumerable<T> | T[], start: number, action: ChangeAction): T[] {
        items = this._itemsToArray(items);
        this._$items.splice(start, 0, ...items);
        this._reindex(action, start, items.length);
        this._nextVersion();
        return items;
    }

    /**
     * Приводит переденные элементы к массиву.
     * @protected
     */
    protected _itemsToArray(items: IEnumerable<T> | T[]): T[] {
        if (items instanceof Array) {
            return items;
        } else if (items && items['[Types/_collection/IEnumerable]']) {
            const result: T[] = [];
            items.each((item) => {
                result.push(item);
            });
            return result;
        } else {
            throw new TypeError(
                'Argument "items" must be an instance of Array or implement Types/collection:IEnumerable.'
            );
        }
    }

    // endregion

    // region SerializableMixin

    static fromJSON<T = SerializableMixin, K = any>(data: ISerializableSignature<K>): T {
        //@ts-ignore
        return SerializableMixin.fromJSON.call(this, data);
    }

    // endregion

    // region Deprecated

    static extend(mixinsList: any, classExtender: any): Function {
        return deprecateExtend(this, classExtender, mixinsList, 'Types/_collection/List');
    }

    static checkOptions<T>(options?: IOptions<T>) {
        if (options && 'items' in options && !(options.items instanceof Array)) {
            throw new TypeError('Option "items" should be an instance of Array');
        }
    }

    static es5Constructor<T>(options?: IOptions<T>) {
        List.checkOptions(options);

        List.prototype.initList.call(this, options);
    }

    // endregion
}

/**
 *
 */
export type ListConstructor<T> = new () => List<T>;

Object.assign(List.prototype, {
    '[Types/_collection/List]': true,
    '[Types/_collection/IEnumerable]': true,
    '[Types/_collection/IIndexedCollection]': true,
    '[Types/_collection/IList]': true,
    '[Types/_entity/IEquatable]': true,
    _moduleName: 'Types/collection:List',
    _$items: null,
    _indexer: null,
});

// Aliases
List.prototype.forEach = List.prototype.each;

register('Types/collection:List', List, { instantiate: false });
