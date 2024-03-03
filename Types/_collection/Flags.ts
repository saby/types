/**
 * @kaizen_zone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IFlags, { IValue } from './IFlags';
import Dictionary from './Dictionary';
// TODO: remove import of record
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

function prepareValue(value: any): IValue {
    return value === null || value === undefined ? null : !!value;
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
 * Тип "Флаг". Это перечисляемая коллекция ключей и значений, каждый из которых может быть выбран или нет.
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IFlags
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 */

/*
 * Flags type. It's an enumerable collection of keys and values and every one of them can be selected or not.
 * @class Types/_collection/Flags
 * @extends Types/_collection/Dictionary
 * @implements Types/_collection/IFlags
 * @implements Types/_entity/IProducible
 * @mixes Types/_entity/ManyToManyMixin
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/CloneableMixin
 * @public
 * @author Буранов А.Р.
 */
export default class Flags<T>
    extends mixin<Dictionary<any>, ManyToManyMixin, SerializableMixin, CloneableMixin>(
        Dictionary,
        ManyToManyMixin,
        SerializableMixin,
        CloneableMixin
    )
    implements IFlags<T>, IProducible, IStateful
{
    /**
     * @cfg Выбор состояния флагов по их показателям.
     * @name Types/_collection/Flags#values
     */

    /*
     * @cfg Selection state of the flags by their indices
     * @name Types/_collection/Flags#values
     */
    protected _$values: IValue[];

    protected _$state: State;

    /**
     * Свойство, хранящее измененные флаги
     */
    protected $changedFields = {};

    // region IFlags

    readonly '[Types/_collection/IFlags]': EntityMarker;

    // endregion

    // region IProducible

    readonly '[Types/_entity/IProducible]': EntityMarker;

    // endregion

    // region ObservableMixin

    protected _publish: (...events: string[]) => void;
    protected _notify: (event: string, ...args: any[]) => void;

    // endregion

    // region ManyToManyMixin

    protected _childChanged: (data: any) => void;

    // endregion

    // region IStatefull
    readonly '[Types/_entity/IStateful]': EntityMarker;

    constructor(options?: object) {
        super(options);
        this._publish('onChange');
        this._$values = this._$values || [];
    }

    destroy(): void {
        ManyToManyMixin.prototype.destroy.call(this);
        super.destroy();
    }

    get(name: T, localize?: boolean): IValue {
        const ordinalIndex = this._getOrdinalIndex(name, localize);
        if (ordinalIndex !== undefined) {
            return prepareValue(this._$values[ordinalIndex]);
        }
        return undefined;
    }

    set(name: T, value: IValue, localize?: boolean): void {
        const ordinalIndex = this._getOrdinalIndex(name, localize);
        if (ordinalIndex === undefined) {
            throw new ReferenceError(
                `${this._moduleName}::set(): the value "${name}" doesn't found in dictionary`
            );
        }

        value = prepareValue(value);
        if (this._$values[ordinalIndex] === value) {
            return;
        }
        this._setValue(ordinalIndex, value);

        const index = this._getIndex(name, localize);
        this._notifyChange(name, index, value);
    }

    getByIndex(index: number): IValue {
        const name = this._getValue(index);
        const ordinalIndex = this._getOrdinalIndex(name);

        return this._$values[ordinalIndex];
    }

    setByIndex(index: number, value: IValue): void {
        const name = this._getValue(index);
        if (name === undefined) {
            throw new ReferenceError(
                `${this._moduleName}::setByIndex(): the index ${index} doesn't found in dictionary`
            );
        }

        const ordinalIndex = this._getOrdinalIndex(name);
        value = prepareValue(value);
        if (this._$values[ordinalIndex] === value) {
            return;
        }
        this._setValue(ordinalIndex, value);

        this._notifyChange(name, index, value);
    }

    fromArray(source: IValue[]): void {
        const enumerator = this.getEnumerator();
        let ordinalIndex = 0;
        const selection = [];
        while (enumerator.moveNext()) {
            const value = source[ordinalIndex] === undefined ? null : source[ordinalIndex];
            this._setValue(ordinalIndex, value);
            const dictionaryIndex = enumerator.getCurrentIndex();
            selection[dictionaryIndex] = value;
            ordinalIndex++;
        }
        this._notifyChanges(selection);
    }

    setFalseAll(): void {
        this._setAll(false);
    }

    setTrueAll(): void {
        this._setAll(true);
    }

    setNullAll(): void {
        this._setAll(null);
    }

    // endregion

    // region IEquatable

    isEqual(to: any): boolean {
        if (!(to instanceof Flags)) {
            return false;
        }

        if (!Dictionary.prototype.isEqual.call(this, to)) {
            return false;
        }

        const enumerator = this.getEnumerator();
        let key;
        while (enumerator.moveNext()) {
            key = enumerator.getCurrent();
            if (this.get(key) !== to.get(key)) {
                return false;
            }
        }

        return true;
    }

    // endregion

    // region Public methods

    toString(): string {
        return (
            '[' +
            this._$values
                .map((value) => {
                    return value === null ? 'null' : value;
                })
                .join(',') +
            ']'
        );
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает порядковый номер флага.
     * @param name Имя флага.
     * @param [localize=false] Локализованное имя флага.
     * @protected
     */

    /*
     * Returns an ordinal index of the flag.
     * @param name Name of the flag
     * @param [localize=false] Is the localized flag name
     * @protected
     */
    protected _getOrdinalIndex(name: T, localize?: boolean): number {
        const enumerator = this.getEnumerator(localize);
        let index = 0;
        while (enumerator.moveNext()) {
            if (enumerator.getCurrent() === name) {
                return index;
            }
            index++;
        }
        return undefined;
    }

    protected _setAll(value: IValue): void {
        const dictionary = this._$dictionary;
        const values = this._$values;
        const enumerator = this.getEnumerator();
        let ordinalIndex = 0;
        while (enumerator.moveNext()) {
            if (values[ordinalIndex] !== value) {
                this._setValue(ordinalIndex, value);
                const dictionaryIndex = enumerator.getCurrentIndex();
                this._notifyChange(dictionary[dictionaryIndex], dictionaryIndex, value);
            }
            ordinalIndex++;
        }
    }

    /**
     * Запускает событие изменения.
     * @param name Имя флага.
     * @param index Индекс флага.
     * @param value Новое значение выбранного флага.
     * @protected
     */

    /*
     * Triggers a change event
     * @param name Name of the flag
     * @param index Index of the flag
     * @param value New value of selection of the flag
     * @protected
     */
    protected _notifyChange(name: T, index: number | string, value: IValue): void {
        const data = {};
        data[String(name)] = value;
        this._childChanged(data);
        if (!this._hasChangedField()) {
            this.rejectChanges(true);
            return;
        }
        this._notify('onChange', name, index, value);
    }

    /**
     * Запускает событие массового изменения.
     * @param values Выбранные значения.
     * @protected
     */

    /*
     * Triggers a mass change event
     * @param values Selection
     * @protected
     */
    protected _notifyChanges(values: IValue[]): void {
        this._childChanged(values);
        if (!this._hasChangedField()) {
            this.rejectChanges(true);
            return;
        }
        this._notify('onChange', values);
    }

    /**
     * Подтверждает изменения состояния записи с момента предыдущего вызова acceptChanges():
     * <ul>
     *     <li>Сбрасывает признак изменения для всех измененных флагов;
     *     <li>Меняет {@link state} следующим образом: Changed становится Unchanged;
     * </ul>
     * Вызывается автоматически при вызове метода acceptChanges у родительского Record.
     * @param [spread=false] Распространять изменения по иерархии родителей. Если параметр задан, будет вызван acceptChanges для родительского элемента (только для поля, на котором находился дочерний элемент: acceptChanges(['название_поля_с_дочерним_элементом'])).
     */
    acceptChanges(spread?: boolean): void {
        this.setState(STATES.UNCHANGED);
        this._clearChangedFields();
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
    rejectChanges(spread?: boolean): void {
        Object.entries(this.$changedFields).forEach(([key, value]) => {
            this._$values[key] = value;
        });

        this._clearChangedFields();

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
        return this._hasChangedField();
    }

    getOriginal(name: T, localize?: boolean): IValue {
        const ordinalIndex = this._getOrdinalIndex(name, localize);
        if (ordinalIndex !== undefined) {
            if (this.$changedFields.hasOwnProperty(ordinalIndex)) {
                return this.$changedFields[ordinalIndex];
            }
            return prepareValue(this._$values[ordinalIndex]);
        }
        return undefined;
    }

    getOriginalByIndex(index: number): IValue {
        const name = this._getValue(index);
        const ordinalIndex = this._getOrdinalIndex(name);

        if (this.$changedFields.hasOwnProperty(index)) {
            return this.$changedFields[index];
        }

        return this._$values[ordinalIndex];
    }

    // endregion

    // state management
    protected _setValue(index: number, value: IValue): void {
        this._setChangedField(index, value);
        this._$values[index] = value;
    }

    protected _setChangedField(index: number, value: IValue): void {
        const oldValue = this._$values[index];
        if (this.$changedFields.hasOwnProperty(index) && this.$changedFields[index] === value) {
            this._unsetChangedField(index);
            return;
        }

        if (!this.$changedFields.hasOwnProperty(index)) {
            this.$changedFields[index] = oldValue;

            if (this._$state === STATES.UNCHANGED) {
                this.setState(STATES.CHANGED);
            }
        }
    }

    protected _unsetChangedField(index: number): void {
        delete this.$changedFields[index];
    }

    protected _clearChangedFields(): void {
        this.$changedFields = {};
        this.setState(STATES.UNCHANGED);
    }

    protected _hasChangedField(): boolean {
        const changedFields = this.$changedFields;

        if (!changedFields) {
            return false;
        }

        return Object.keys(changedFields).length > 0;
    }

    static produceInstance<T>(data?: any, options?: IProduceOptions): Flags<T> {
        return new this({
            dictionary: this.prototype._getDictionaryByFormat(options && options.format),
            localeDictionary: this.prototype._getLocaleDictionaryByFormat(
                options && options.format
            ),
            values: data,
        });
    }

    // endregion
}

Object.assign(Flags.prototype, {
    '[Types/_collection/Flags]': true,
    '[Types/_collection/IFlags]': true,
    '[Types/_entity/IProducible]': true,
    '[Types/_entity/IStateful]': true,
    _moduleName: 'Types/collection:Flags',
    _$values: undefined,
    _type: 'flags',
});

register('Types/collection:Flags', Flags, { instantiate: false });
