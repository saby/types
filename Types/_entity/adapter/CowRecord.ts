/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DestroyableMixin from '../DestroyableMixin';
import IRecord from './IRecord';
import IAdapter from './IAdapter';
import IDecorator from './IDecorator';
import ICloneable, { isCloneable } from '../ICloneable';
import { Field, UniversalField } from '../format';
import { object } from '../../util';
import { EntityMarker } from '../../_declarations';

/**
 * Адаптер записи таблицы для работы в режиме Copy-on-write.
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/IRecord
 * @implements Types/_entity/adapter/IDecorator
 * @private
 */
export default class CowRecord extends DestroyableMixin implements IRecord, IDecorator {
    /**
     * Оригинальный адаптер
     */
    protected _original: IAdapter;

    /**
     * Оригинальный адаптер записи
     */
    protected _originalRecord: IRecord | (IRecord & ICloneable);

    /**
     * Ф-я обратного вызова при событии записи
     */
    protected _writeCallback: Function;

    /**
     * Сырые данные были скопированы
     */
    protected _copied: boolean;

    // region IRecord

    readonly '[Types/_entity/adapter/IRecord]': EntityMarker;

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
        this._originalRecord = original.forRecord(data);
        if (writeCallback) {
            this._writeCallback = writeCallback;
        }
    }

    has(name: string): boolean {
        return this._originalRecord.has(name);
    }

    get(name: string): any {
        return this._originalRecord.get(name);
    }

    set(name: string, value: any): void {
        this._copy();
        return this._originalRecord.set(name, value);
    }

    clear(): void {
        this._copy();
        return this._originalRecord.clear();
    }

    getData(): any {
        return this._originalRecord.getData();
    }

    getFields(): string[] {
        return this._originalRecord.getFields();
    }

    getFormat(name: string): Field {
        return this._originalRecord.getFormat(name);
    }

    getSharedFormat(name: string): UniversalField {
        return this._originalRecord.getSharedFormat(name);
    }

    addField(format: Field, at?: number): void {
        this._copy();
        return this._originalRecord.addField(format, at);
    }

    removeField(name: string): void {
        this._copy();
        return this._originalRecord.removeField(name);
    }

    removeFieldAt(index: number): void {
        this._copy();
        return this._originalRecord.removeFieldAt(index);
    }

    getOriginal(): IRecord {
        return this._originalRecord;
    }

    // endregion

    // region Protected methods

    protected _copy(): void {
        if (!this._copied) {
            if (isCloneable(this._originalRecord)) {
                this._originalRecord = this._originalRecord.clone();
            } else {
                this._originalRecord = this._original.forRecord(
                    object.clonePlain(this._originalRecord.getData())
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

Object.assign(CowRecord.prototype, {
    '[Types/_entity/adapter/CowRecord]': true,
    '[Types/_entity/adapter/IRecord]': true,
    '[Types/_entity/adapter/IDecorator]': true,
    _original: null,
    _originalRecord: null,
    _writeCallback: null,
    _copied: false,
});
