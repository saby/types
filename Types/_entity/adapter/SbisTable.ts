/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import ITable from './ITable';
import IMetaData from './IMetaData';
import SbisFormatMixin, {
    ITableFormat,
    IRecordFormat,
    markEntryAsDenormalized,
    denormalizeFormats,
} from './SbisFormatMixin';
import SbisRecord from './SbisRecord';
import ICloneable from '../ICloneable';
import DestroyableMixin from '../DestroyableMixin';
import { fieldsFactory } from '../format';
import { mixin } from '../../util';
import { merge } from '../../object';
import { EntityMarker } from '../../_declarations';
import Field from '../format/Field';

/**
 * Адаптер для таблицы данных в формате СБиС.
 * Работает с данными, представленными в виде объекта ({_entity: 'recordset', d: [], s: []}), где
 * <ul>
 *     <li>d - значения полей для каждой записи;</li>
 *     <li>s - описание полей записи.</li>
 * </ul>
 *
 * Создадим адаптер для таблицы:
 * <pre>
 *     var adapter = new SbisTable({
 *         _entity: 'recordset',
 *         d: [
 *             [1, 'Test 1'],
 *             [2, 'Test 2']
 *         ],
 *         s: [
 *             {n: 'id', t: 'Число целое'},
 *             {n: 'title', t: 'Строка'}
 *         ]
 *     });
 *     adapter.at(0);//{d: [1, 'Test 1'], s: [{n: 'id', t: 'Число целое'}, {n: 'title', t: 'Строка'}]}
 * </pre>
 * @class Types/_entity/adapter/SbisTable
 * @mixes Types/_entity/DestroyableMixin
 * @implements Types/_entity/adapter/ITable
 * @implements Types/_entity/adapter/IMetaData
 * @implements Types/_entity/ICloneable
 * @mixes Types/_entity/adapter/SbisFormatMixin
 * @public
 */
export default class SbisTable
    extends mixin<DestroyableMixin, SbisFormatMixin>(DestroyableMixin, SbisFormatMixin)
    implements ITable, IMetaData, ICloneable
{
    get type(): string {
        return 'recordset';
    }

    // region ITable

    readonly '[Types/_entity/adapter/ITable]': EntityMarker;

    // endregion

    // region IMetaData

    readonly '[Types/_entity/adapter/IMetaData]': EntityMarker;

    // endregion

    // region ICloneable

    readonly '[Types/_entity/ICloneable]': EntityMarker;

    // endregion

    // region SbisFormatMixin

    protected _data: ITableFormat;

    getData: () => ITableFormat;

    /**
     * Конструктор
     * @param data Сырые данные
     */
    constructor(data?: ITableFormat, injected?: boolean) {
        super(data);
        SbisFormatMixin.initMixin(this, data);
    }

    getCount(): number {
        return this._isValidData() ? this._data.d.length : 0;
    }

    add(record: IRecordFormat, at: number): void {
        this._touchData();
        record = this._normalizeData(record, SbisRecord.prototype.type);

        denormalizeFormats(record);

        if (this._data.d.length === 0 && record.s) {
            this._data.s = record.s;
        }

        this._checkFormat(record, '::add()');
        record.s = this._data.s;

        if (at === undefined) {
            this._data.d.push(record.d);
        } else {
            this._checkRowIndex(at, true);
            this._data.d.splice(at, 0, record.d);
        }
    }

    at(index: number): ITableFormat {
        const data = this._data;
        if (!this._isValidData() || !data.d[index]) {
            return undefined;
        }

        const item = {
            d: data.d[index],
            s: data.s,
        };

        // Mark data as denormalized
        markEntryAsDenormalized(item);

        return item;
    }

    remove(at: number): void {
        this._touchData();
        this._checkRowIndex(at);

        this._data.d.splice(at, 1);
    }

    replace(record: IRecordFormat, at: number): void {
        this._touchData();
        this._checkRowIndex(at);
        if (!this._data.s.length && record.s.length) {
            this._data.s = record.s;
        }

        denormalizeFormats(record);

        record.s = this._data.s;
        this._checkFormat(record, '::replace()');

        this._data.d[at] = record.d;
    }

    move(source: number, target: number): void {
        this._touchData();
        if (target === source) {
            return;
        }
        const removed = this._data.d.splice(source, 1);
        if (target === -1) {
            this._data.d.unshift(removed.shift());
        } else {
            this._data.d.splice(target, 0, removed.shift());
        }
    }

    merge(acceptor: number, donor: number): void {
        this._touchData();
        this._checkRowIndex(acceptor);
        this._checkRowIndex(donor);
        merge(this._data.d[acceptor], this._data.d[donor]);
        this.remove(donor);
    }

    copy(index: number): any[] {
        this._touchData();
        this._checkRowIndex(index);
        const source = this._data.d[index];
        const clone = merge([], source);
        this._data.d.splice(1 + index, 0, clone);
        return clone;
    }

    getMetaDataDescriptor(): any {
        const result = [];
        const data = this.getData();

        if (!(data instanceof Object)) {
            return result;
        }

        if (data.hasOwnProperty('r')) {
            result.push(
                fieldsFactory({
                    name: 'results',
                    type: 'record',
                })
            );
        }

        if (data.hasOwnProperty('p')) {
            result.push(
                fieldsFactory({
                    name: 'path',
                    type: 'recordset',
                })
            );
        }

        if (data.hasOwnProperty('n')) {
            let type = 'integer';
            switch (typeof data.n) {
                case 'boolean':
                    type = 'boolean';
                    break;
                case 'object':
                    // data.n can be null so leave it as integer in that case
                    if (data.n) {
                        type = 'object';

                        // Support for complex BL types such as RecordSet
                        const subType = (data.n as ITableFormat)._type;
                        if (subType) {
                            type = subType;
                        }
                    }
                    break;
            }

            result.push(
                fieldsFactory({
                    name: 'total',
                    type,
                })
            );

            result.push(
                fieldsFactory({
                    name: 'more',
                    type,
                })
            );
        }

        if (data.hasOwnProperty('m')) {
            const meta = new SbisRecord(data.m);
            meta.getFields().forEach((name) => {
                result.push(meta.getFormat(name));
            });
        }

        return result;
    }

    /**
     * Возвращает список полей метаданных, которые есть либо в сырых данных, либо во внешнем meta
     * @param meta Внешние метаданные
     * @returns Список полей
     */
    getMetaFieldEnumerator(meta: any): Field[] {
        const data = this.getData();

        if (!(data instanceof Object)) {
            return [];
        }

        const metaFields: Field[] = [];

        if ('r' in data || 'results' in meta) {
            metaFields.push(
                fieldsFactory({
                    name: 'results',
                    type: 'record',
                })
            );
        }

        if ('p' in data || 'path' in meta) {
            metaFields.push(
                fieldsFactory({
                    name: 'path',
                    type: 'recordset',
                })
            );
        }

        if ('n' in data || 'total' in meta || 'more' in meta) {
            let totalFieldType = 'integer';
            if ('n' in data) {
                totalFieldType = this._getValueType(data.n);
            } else if ('total' in meta) {
                totalFieldType = this._getValueType(meta.total);
            } else if ('more' in meta) {
                totalFieldType = this._getValueType(meta.more);
            }

            metaFields.push(
                fieldsFactory({
                    name: 'total',
                    type: totalFieldType,
                })
            );
            metaFields.push(
                fieldsFactory({
                    name: 'more',
                    type: totalFieldType,
                })
            );
        }

        if (data.hasOwnProperty('m')) {
            const meta = new SbisRecord(data.m);
            meta.getFields().forEach((name) => {
                metaFields.push(meta.getFormat(name));
            });
        }

        return metaFields;
    }

    _getValueType(value: unknown): string {
        let type = 'integer';
        switch (typeof value) {
            case 'boolean':
                type = 'boolean';
                break;
            case 'object':
                // data.n can be null so leave it as integer in that case
                if (value) {
                    type = 'object';

                    // Support for complex BL types such as RecordSet
                    const subType = (value as ITableFormat)._type;
                    if (subType) {
                        type = subType;
                    }
                }
                break;
        }
        return type;
    }

    getMetaData(name: string): any {
        const alias = this._getMetaDataAlias(name);
        const data = this.getData();

        if (alias) {
            return data && data instanceof Object ? data[alias] : undefined;
        }

        const meta = new SbisRecord(data.m);
        return meta.get(name);
    }

    setMetaData(name: string, value: any): void {
        const alias = this._getMetaDataAlias(name);
        const data = this.getData();

        if (alias) {
            if (data && data instanceof Object) {
                data[alias] = value;
            }
            return;
        }

        const meta = new SbisRecord(data.m);
        meta.set(name, value);
    }

    protected _getMetaDataAlias(name: string): string {
        switch (name) {
            case 'results':
                return 'r';
            case 'path':
                return 'p';
            case 'more':
            case 'total':
                return 'n';
        }
    }

    clone<T = this>(shallow?: boolean): T {
        return new SbisTable(shallow ? this.getData() : this._cloneData()) as unknown as T;
    }

    protected _buildD(at: number, value: any): void {
        this._data.d.forEach((item) => {
            item.splice(at, 0, value);
        });
    }

    protected _removeD(at: number): void {
        this._data.d.forEach((item) => {
            item.splice(at, 1);
        });
    }

    // endregion

    // region Protected methods

    protected _checkRowIndex(index: number, addMode?: boolean): void {
        const max = this._data.d.length + (addMode ? 0 : -1);
        if (!(index >= 0 && index <= max)) {
            throw new RangeError(`${this._moduleName}: row index ${index} is out of bounds.`);
        }
    }

    // endregion
}

Object.assign(SbisTable.prototype, {
    '[Types/_entity/adapter/SbisTable]': true,
    '[Types/_entity/adapter/ITable]': true,
    '[Types/_entity/adapter/IMetaData]': true,
    '[Types/_entity/ICloneable]': true,
});
