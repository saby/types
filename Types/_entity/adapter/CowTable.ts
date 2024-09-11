/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import ICloneable, { isCloneable } from '../ICloneable';
import { Field, UniversalField } from '../format';
import { object } from '../../util';
import { EntityMarker } from '../../_declarations';

/**
 * Адаптер таблицы для работы в режиме Copy-on-write.
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/ITable
 * @implements Types/_entity/adapter/IDecorator
 * @private
 */
export default class CowTable extends DestroyableMixin implements ITable, IDecorator {
    /**
     * Оригинальный адаптер
     */
    protected _original: IAdapter;

    /**
     * Оригинальный адаптер таблицы
     */
    protected _originalTable: ITable | (ITable & ICloneable);

    /**
     * Ф-я обратного вызова при событии записи
     */
    protected _writeCallback: Function;

    /**
     * Сырые данные были скопированы
     */
    protected _copied: boolean;

    // region ITable

    readonly '[Types/_entity/adapter/ITable]': EntityMarker;

    // endregion

    // region IDecorator

    readonly '[Types/_entity/adapter/IDecorator]': EntityMarker;

    /**
     * Конструктор
     * @param data Сырые данные
     * @param original Оригинальный адаптер
     * @param [writeCallback] Ф-я обратного вызова при событии записи
     */
    constructor(data: any, original: IAdapter, writeCallback?: Function) {
        super();
        this._original = original;
        this._originalTable = original.forTable(data);
        if (writeCallback) {
            this._writeCallback = writeCallback;
        }
    }

    getFields(): string[] {
        return this._originalTable.getFields();
    }

    getCount(): number {
        return this._originalTable.getCount();
    }

    getData(): any {
        return this._originalTable.getData();
    }

    add(record: any, at?: number): void {
        this._copy();
        return this._originalTable.add(record, at);
    }

    at(index: number): any {
        return this._originalTable.at(index);
    }

    remove(at: number): void {
        this._copy();
        return this._originalTable.remove(at);
    }

    replace(record: any, at: number): void {
        this._copy();
        return this._originalTable.replace(record, at);
    }

    move(source: number, target: number): void {
        this._copy();
        return this._originalTable.move(source, target);
    }

    merge(acceptor: number, donor: number, keyProperty: string): any {
        this._copy();
        return this._originalTable.merge(acceptor, donor, keyProperty);
    }

    copy(index: number): any {
        this._copy();
        return this._originalTable.copy(index);
    }

    clear(): void {
        this._copy();
        return this._originalTable.clear();
    }

    getFormat(name: string): Field {
        return this._originalTable.getFormat(name);
    }

    getSharedFormat(name: string): UniversalField {
        return this._originalTable.getSharedFormat(name);
    }

    addField(format: Field, at?: number): void {
        this._copy();
        return this._originalTable.addField(format, at);
    }

    removeField(name: string): void {
        this._copy();
        return this._originalTable.removeField(name);
    }

    removeFieldAt(index: number): void {
        this._copy();
        return this._originalTable.removeFieldAt(index);
    }

    getOriginal(): ITable {
        return this._originalTable;
    }

    // endregion

    // region Protected methods

    protected _copy(): void {
        if (!this._copied) {
            if (isCloneable(this._originalTable)) {
                this._originalTable = this._originalTable.clone();
            } else {
                this._originalTable = this._original.forTable(
                    object.clonePlain(this._originalTable.getData())
                );
            }
            this._copied = true;

            if (this._writeCallback) {
                this._writeCallback();
                //@ts-ignore
                this._writeCallback = null;
            }
        }
    }

    // endregion
}

Object.assign(CowTable.prototype, {
    '[Types/_entity/adapter/CowTable]': true,
    '[Types/_entity/adapter/ITable]': true,
    '[Types/_entity/adapter/IDecorator]': true,
    _original: null,
    _originalTable: null,
    _writeCallback: null,
    _copied: false,
});
