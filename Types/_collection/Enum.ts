/**
 * @kaizen_zone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnum, { IIndex } from './IEnum';
import Dictionary from './Dictionary';
// TODO: remove record import
import {
    IProducible,
    ManyToManyMixin,
    SerializableMixin,
    CloneableMixin,
    format,
    Record,
} from '../entity';
import { register } from '../di';
import { mixin } from '../util';
import { EntityMarker } from '../_declarations';
import { IStateful } from '../entity';

interface IProduceOptions {
    format?: format.Field | format.UniversalField;
}

/**
 * Возможные состояния записи
 */
type State = 'Changed' | 'Unchanged';

interface IStatesHash {
    [key: string]: State;
}

const STATES: IStatesHash = {
    CHANGED: 'Changed',
    UNCHANGED: 'Unchanged',
};

/**
 * Перечисляемый тип. Это перечисляемая коллекция ключей и значений, один из которых может быть выбран или нет.
 * @class Types/_collection/Enum
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IEnum
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 */

/*
 * Enumerable type. It's an enumerable collection of keys and values and one of them can be selected or not.
 * @class Types/_collection/Enum
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IEnum
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 * @author Буранов А.Р.
 */

export default class Enum<T>
    extends mixin<Dictionary<any>, ManyToManyMixin, SerializableMixin, CloneableMixin>(
        Dictionary,
        ManyToManyMixin,
        SerializableMixin,
        CloneableMixin
    )
    implements IEnum<T>, IProducible, IStateful
{
    /**
     * @cfg Ключ выбранного элемента.
     * @name Types/_collection/Enum#index
     */

    /*
     * @cfg Key of the selected item
     * @name Types/_collection/Enum#index
     */
    protected _$index: IIndex;

    /**
     * @cfg Ключ выбранного элемента после последнего вызова acceptChanges.
     * @name Types/_collection/Enum#index
     */

    /*
     * @cfg Key of the selected item after last acceptChanges call
     * @name Types/_collection/Enum#index
     */
    protected _$acceptedIndex: IIndex;

    protected _$state: State;

    protected _childChanged: (data: any) => void;

    // region IEnum

    readonly '[Types/_collection/IEnum]': EntityMarker;
    // endregion

    // region IProducible

    readonly '[Types/_entity/IProducible]': EntityMarker;

    // endregion

    // region ObservableMixin

    protected _publish: (...events: string[]) => void;
    protected _notify: (event: string, ...args: any[]) => void;

    // endregion

    // region IStatefull
    readonly '[Types/_entity/IStateful]': EntityMarker;

    constructor(options?: object) {
        super(options);
        this._publish('onChange');
        this._checkIndex();
        this._$acceptedIndex = this._$index;
        this._$state = STATES.UNCHANGED;
    }

    destroy(): void {
        ManyToManyMixin.prototype.destroy.call(this);
        super.destroy();
    }

    get(): IIndex {
        return this._$index;
    }

    set(index: IIndex): void {
        const value = this._$dictionary[index];
        const defined = value !== undefined;
        const changed = this._valueChanged(index);

        if (index === null || defined) {
            this._setValue(index);
        } else {
            throw new ReferenceError(
                `${this._moduleName}::set(): the index "${index}" is out of range`
            );
        }

        if (changed) {
            this._notifyChange(this._$index, this.getAsValue());
        }
    }

    getAsValue(localize?: boolean): T {
        return this._getValue(this._$index, localize);
    }

    setByValue(value: T, localize?: boolean): void {
        const index = this._getIndex(value, localize);
        const changed = this._valueChanged(index);

        if (value === null) {
            this._$index = value as null;
        } else if (index === undefined) {
            throw new ReferenceError(
                `${this._moduleName}::setByValue(): the value "${value}" doesn't found in dictionary`
            );
        } else {
            this._setValue(index);
        }

        if (changed) {
            this._notifyChange(index, value);
        }
    }

    // endregion

    // region IEquatable

    isEqual(to: object): boolean {
        if (!(to instanceof Enum)) {
            return false;
        }

        if (!Dictionary.prototype.isEqual.call(this, to)) {
            return false;
        }

        return this.get() === to.get();
    }

    // endregion

    // region Public methods

    valueOf(): IIndex {
        return this.get();
    }

    toString(): string {
        const value = this.getAsValue();
        return value === undefined || value === null ? '' : String(value);
    }

    // endregion

    // region Protected methods

    /**
     * Преобразует ключ в численный тип.
     * @protected
     */

    /*
     * Converts key to the Number type
     * @protected
     */
    protected _checkIndex(): void {
        if (this._$index === null) {
            return;
        }
        this._$index = parseInt(String(this._$index), 10);
    }

    /**
     * Запускает событие изменения.
     * @param index Ключ выбранного элемента.
     * @param value Значение выбранного элемента.
     * @protected
     */

    /*
     * Triggers a change event
     * @param index Key of selected item
     * @param value Value of selected item
     * @protected
     */
    protected _notifyChange(index: IIndex, value: T): void {
        const data = {};
        data[index] = value;
        this._childChanged(data);
        this._notify('onChange', index, value);
    }

    /**
     * Подтверждает изменения состояния записи с момента предыдущего вызова acceptChanges():
     * <ul>
     *     <li>Сбрасывает признак изменения для перечисления;
     *     <li>Меняет {@link state} следующим образом: Changed становится Unchanged;
     * </ul>
     * Вызывается автоматически при вызове метода acceptChanges у родительского Record.
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван acceptChanges для родительского элемента (только для поля, на котором находился дочерний элемент: acceptChanges(['название_поля_с_дочерним_элементом'])).
     */
    acceptChanges(spread?: false) {
        this.setState(STATES.UNCHANGED);
        this._$acceptedIndex = this._$index;

        if (spread) {
            this._childChanged(Record.prototype.acceptChanges);
        }
    }
    /**
     * Возвращает запись к состоянию, в котором она была с момента последнего вызова acceptChanges:
     * <ul>
     *     <li>Отменяются изменения всех флагов;
     *     <li>{@link state State} возвращается к состоянию, в котором он был сразу после вызова acceptChanges.</li>
     * </ul>
     * Вызывается автоматически при вызове метода rejectChanges у родительского Record.
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван rejectChanges для родительского элемента (только для поля, на котором находился дочерний элемент: rejectChanges(['название_поля_с_дочерним_элементом']).
     */
    rejectChanges(spread?: boolean) {
        this.setState(STATES.UNCHANGED);
        this._$index = this._$acceptedIndex;

        if (spread) {
            this._childChanged(Record.prototype.rejectChanges);
        }
    }
    setState(state: State) {
        this._$state = state;
    }

    getState(): State {
        return this._$state;
    }

    isChanged(): boolean {
        return this._$state !== STATES.UNCHANGED;
    }

    getOriginal(): IIndex {
        if (this._$acceptedIndex) {
            return this._$acceptedIndex;
        }

        return this._$index;
    }

    getOriginalAsValue(localize?: boolean): T {
        const index = this._$acceptedIndex ? this._$acceptedIndex : this._$index;

        return this._getValue(index, localize);
    }

    // endregion

    // state management
    _setValue(index: IIndex): void {
        switch (this.getState()) {
            case STATES.UNCHANGED: {
                this._$acceptedIndex = this._$index;
                this._$index = index;
                this.setState(STATES.CHANGED);
                break;
            }
            case STATES.CHANGED: {
                if (this._$index === index) {
                    return;
                }

                if (this._$acceptedIndex === index) {
                    this.rejectChanges(true);
                } else {
                    this._$index = index;
                }

                break;
            }
        }
        this._checkIndex();
    }

    _valueChanged(index: IIndex): boolean {
        return index !== this._$index;
    }

    static produceInstance<T>(data?: any, options?: IProduceOptions): Enum<T> {
        return new this({
            dictionary: this.prototype._getDictionaryByFormat(options && options.format),
            localeDictionary: this.prototype._getLocaleDictionaryByFormat(
                options && options.format
            ),
            index: data,
        });
    }
    // endregion
}

Object.assign(Enum.prototype, {
    '[Types/_collection/Enum]': true,
    '[Types/_collection/IEnum]': true,
    '[Types/_entity/IProducible]': true,
    '[Types/_entity/IStateful]': true,
    _moduleName: 'Types/collection:Enum',
    _$index: null,
    _type: 'enum',
});

register('Types/collection:Enum', Enum, { instantiate: false });
