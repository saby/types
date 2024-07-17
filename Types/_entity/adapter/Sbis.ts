/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import Abstract from './Abstract';
import { ITableFormat, IRecordFormat, denormalizeFormats } from './SbisFormatMixin';
import SbisTable from './SbisTable';
import SbisRecord from './SbisRecord';
import FIELD_TYPE from './SbisFieldType';
import { register } from '../../di';
/**
 * Адаптер для данных в формате СБиС.
 * Работает с форматом данных, который использует БЛ СБИС.
 * Примеры можно посмотреть в модулях {@link Types/_entity/adapter/SbisRecord} и
 * {@link Types/_entity/adapter/SbisTable}.
 * @extends Types/_entity/adapter/Abstract
 * @public
 */
export default class Sbis extends Abstract {
    forTable(data?: ITableFormat): SbisTable {
        return new SbisTable(data, this._isUnserialized());
    }

    forRecord(data?: IRecordFormat, _?: unknown): SbisRecord {
        return new SbisRecord(data, this._isUnserialized());
    }

    getKeyField(data: ITableFormat): string | undefined {
        // TODO: primary key field index can be defined in this._data.k. and can be -1
        if (!data) {
            return undefined;
        }

        denormalizeFormats(data);

        const s = data.s;
        if (!s) {
            return undefined;
        }

        let index;
        for (let i = 0, l = s.length; i < l; i++) {
            if (s[i].n && s[i].n[0] === '@') {
                index = i;
                break;
            }
        }
        if (index === undefined && s.length) {
            index = 0;
        }

        return index === undefined ? undefined : s[index].n;
    }

    static get FIELD_TYPE(): object {
        return FIELD_TYPE;
    }
}

Object.assign(Sbis.prototype, {
    '[Types/_entity/adapter/Sbis]': true,
    _moduleName: 'Types/entity:adapter.Sbis',
});

register('Types/entity:adapter.Sbis', Sbis, { instantiate: false });
// Deprecated
register('adapter.sbis', Sbis);
