import DataSet from './DataSet';
import Query from './Query';
import DataMixin from './DataMixin';
import { Model } from '../entity';
import { mixin } from '../util';
import { EntityMarker } from 'Types/declarations';

/**
 * Миксин, совместно с DataMixin дающий возможность обобщить логику вызова CRUD.
 * @public
 */
export default abstract class DataCrudMixin extends mixin<DataMixin>(Object) {
    readonly '[Types/_source/DataCrudMixin]': EntityMarker = true;

    protected _prepareCreateResult(data: any): Model {
        return this._getModelInstance(data);
    }

    protected _prepareReadResult(data: any): Model {
        return this._getModelInstance(data);
    }

    protected _prepareUpdateResult(data: any, keys?: string[]): string[] | undefined {
        const keyProperty = this.getKeyProperty();
        const callback = (record: Model, key?: string) => {
            if (key && keyProperty && !record.get(keyProperty)) {
                record.set(keyProperty, key);
            }
            record.acceptChanges(false, true);
        };

        if (data && data['[Types/_collection/IList]']) {
            data.each((record: Model, i: number) => {
                callback(record, keys ? keys[i] : undefined);
            });
        } else {
            callback(data, keys as unknown as string);
        }
        return keys;
    }

    protected _prepareQueryResult<TData = DataSet>(data: any, _query?: Query): TData {
        return this._wrapToDataSet<TData>(data);
    }
}

Object.assign(DataCrudMixin.prototype, {
    '[Types/_source/DataCrudMixin]': true,
});
