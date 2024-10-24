/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Abstract from './Abstract';
import RecordSetTable from './RecordSetTable';
import RecordSetRecord from './RecordSetRecord';
import IDataHolder from './IDataHolder';
import Record from '../Record';
import { RecordSet as CollectionRecordSet } from '../../collection';
import { register } from '../../di';
import { object } from '../../util';
import { EntityMarker } from 'Types/declarations';

/**
 * Адаптер для рекордсета.
 * Работает с данными, представленными в виде рекорда/рекордсета.
 * Примеры можно посмотреть в модулях {@link Types/_entity/adapter/RecordSetRecord} и
 * {@link Types/_entity/adapter/RecordSetTable}.
 * @public
 */
export default class RecordSet<TData extends CollectionRecordSet = CollectionRecordSet>
    extends Abstract
    implements IDataHolder<TData>
{
    get dataReference(): TData {
        return this._dataReference;
    }

    set dataReference(value: TData) {
        this._dataReference = value;
    }
    protected _dataReference: TData;

    // region ['Types/_entity/adapter/IDataHolder']

    readonly '[Types/_entity/adapter/IDataHolder]': EntityMarker = true;
    readonly '[Types/_entity/adapter/RecordSet]': EntityMarker = true;

    /**
     * Возвращает интерфейс доступа к рекордсету в виде таблицы
     * @param data Рекордсет
     */
    forTable(data?: TData): RecordSetTable {
        return new RecordSetTable(data);
    }

    /**
     * Возвращает интерфейс доступа к record-у в виде записи
     * @param data Запись
     * @param tableData Таблица
     */
    forRecord(data?: Record, tableData?: TData): RecordSetRecord {
        return new RecordSetRecord(data, tableData || this.dataReference);
    }

    getProperty(data: object, property: string): any {
        return object.getPropertyValue(data, property);
    }

    setProperty(data: object, property: string, value: any): void {
        return object.setPropertyValue(data, property, value);
    }

    getKeyField(data: any): string | undefined {
        if (data && typeof data.getKeyProperty === 'function') {
            return data.getKeyProperty();
        }
        return undefined;
    }

    // endregion
}

Object.assign(RecordSet.prototype, {
    '[Types/_entity/adapter/RecordSet]': true,
    '[Types/_entity/adapter/IDataHolder]': true,
    _moduleName: 'Types/entity:adapter.RecordSet',
});

register('Types/entity:adapter.RecordSet', RecordSet, { instantiate: false });
// FIXME: deprecated
register('adapter.recordset', RecordSet, { instantiate: false });
