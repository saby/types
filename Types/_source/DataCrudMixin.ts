import DataSet from './DataSet';
import Query from './Query';
import DataMixin from './DataMixin';
import { Model } from '../entity';
import { mixin } from '../util';
import { EntityMarker } from '../_declarations';

/**
 * Миксин, совместно с DataMixin дающий возможность обобщить логику вызова CRUD.
 * @mixin Types/_source/DataCrudMixin
 * @public
 */
export default abstract class DataCrudMixin extends mixin<DataMixin>(Object) {
    readonly '[Types/_source/DataCrudMixin]': EntityMarker;

    protected _prepareCreateResult(data: any): Model {
        return this._getModelInstance(data);
    }

    protected _prepareReadResult(data: any): Model {
        return this._getModelInstance(data);
    }

    protected _prepareUpdateResult(data: any, keys: string[]): string[] {
        const keyProperty = (this as DataMixin).getKeyProperty();
        const callback = (record, key) => {
            if (key && keyProperty && !record.get(keyProperty)) {
                record.set(keyProperty, key);
            }
            record.acceptChanges(false, true);
        };

        if (data && data['[Types/_collection/IList]']) {
            data.each((record, i) => {
                callback(record, keys ? keys[i] : undefined);
            });
        } else {
            callback(data, keys);
        }
        return keys;
    }

    protected _prepareQueryResult<TData = DataSet>(data: any, query?: Query): TData {
        return this._wrapToDataSet<TData>(data);
    }
}

Object.assign(DataCrudMixin.prototype, {
    '[Types/_source/DataCrudMixin]': true,
});
