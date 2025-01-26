/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DestroyableMixin from '../DestroyableMixin';
import ITable from './ITable';
import IAdapter from './IAdapter';
import GenericFormatMixin from './GenericFormatMixin';
import { Field } from '../format';
import { create } from '../../di';
import { mixin } from '../../util';
import Record from '../Record';
import { RecordSet, format } from '../../collection';
import { EntityMarker, FormatNameMarker } from 'Types/declarations';

interface IRecordSetOptions {
    adapter?: string | IAdapter;
    keyProperty?: string;
}

/**
 * Адаптер для таблицы данных в формате рекордсета.
 * Работает с данными, представленными в виде экземпляра {@link Types/_collection/RecordSet}.
 *
 * Создадим адаптер для таблицы:
 * <pre>
 *     import {adapter} from 'Types/entity';
 *     import {RecordSet} from 'Types/collection';
 *
 *     const ibizasClubs = new RecordSet({
 *         rawData: [
 *             {id: 1, title: 'Amnesia Ibiza'},
 *             {id: 2, title: 'DC-10'},
 *             {id: 3, title: 'Pacha Ibiza'}
 *         ]
 *     });
 *     const clubsAdapter = new adapter.RecordSet(ibizasClubs);
 *     console.log(clubsAdapter.at(0).get('title')); //'Amnesia Ibiza'
 * </pre>
 * @public
 */
export default class RecordSetTable
    extends mixin<DestroyableMixin, GenericFormatMixin>(DestroyableMixin, GenericFormatMixin)
    implements ITable
{
    /**
     * Список
     */
    protected _data: RecordSet<object, Record>;

    // region ITable

    readonly '[Types/_entity/adapter/ITable]': EntityMarker;

    /**
     * Конструктор
     * @param data Таблица
     */
    constructor(data?: RecordSet) {
        if (data && !data['[Types/_collection/RecordSet]']) {
            throw new TypeError(
                'Argument "data" should be an instance of Types/collection:RecordSet'
            );
        }
        super(data);
        GenericFormatMixin.initMixin(this, data);
    }

    getFields(): string[] {
        const fields: string[] = [];
        if (this._isValidData()) {
            this._data.getFormat(true).each((field) => {
                fields.push(field.getName());
            });
        }
        return fields;
    }

    getCount(): number {
        return this._isValidData() ? this._data.getCount() : 0;
    }

    add(record: Record, at: number): void {
        this._buildData(record);
        this._data.add(record, at);
    }

    at(index: number): Record | undefined {
        return this._isValidData() ? this._data.at(index) : undefined;
    }

    remove(at: number): Record {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        return this._data.removeAt(at);
    }

    replace(record: Record, at: number): Record {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        return this._data.replace(record, at);
    }

    move(source: number, target: number): void {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        const rec = this._data.at(source);
        this._data.removeAt(source);
        this._data.add(rec, target);
    }

    merge(acceptor: number, donor: number, keyProperty: string): any {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        const acceptorRecord = this._data.at(acceptor);
        this._data.at(donor).each((name, value) => {
            if (name !== keyProperty) {
                acceptorRecord.set(name, value);
            }
        }, this);
        this._data.removeAt(donor);
    }

    copy(index: number): Record {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        const clone = this._data.at(index).clone();
        this.add(clone, 1 + index);
        return clone;
    }

    clear(): void {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        const count = this._data.getCount();
        for (let i = count - 1; i >= 0; i--) {
            this._data.removeAt(i);
        }
    }

    addField(format: Field, at?: number): void {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        this._data.addField(format, at);
    }

    removeField(name: string): void {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        this._data.removeField(name);
    }

    removeFieldAt(index: number): void {
        if (!this._isValidData()) {
            throw new TypeError('Passed data has invalid format');
        }

        this._data.removeFieldAt(index);
    }

    // endregion

    // region Protected methods

    protected _buildData(sample: Record): void {
        if (!this._data) {
            const config = {} as IRecordSetOptions;
            if (sample) {
                if (sample.getAdapter) {
                    config.adapter = sample.getAdapter();
                }
                if ((sample as any).getKeyProperty) {
                    config.keyProperty = (sample as any).getKeyProperty();
                }
            }
            this._data = create('Types/collection:RecordSet', config);
        }
    }

    protected _isValidData(): boolean {
        return this._data && this._data['[Types/_collection/RecordSet]'];
    }

    protected _getFieldsFormat(): format.Format {
        return this._data.getFormat(true);
    }

    // endregion
    getTypeName(): FormatNameMarker {
        return this._data.getTypeName();
    }

    setTypeName(_: string): void {
        throw new Error(
            `${this._moduleName}:: невозможно указать тип в адаптере-обертке. Укажите тип в исходной записи`
        );
    }
}

Object.assign(RecordSetTable.prototype, {
    '[Types/_entity/adapter/RecordSetTable]': true,
    '[Types/_entity/adapter/ITable]': true,
    _data: null,
});
