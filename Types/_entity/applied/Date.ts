/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DateTime, { $withoutTimeZone, ISerializableState } from './DateTime';
import SerializableMixin from '../SerializableMixin';
import { date as formatDate } from '../../formatter';
import { date as parseDate } from '../../parser';
import { register } from '../../di';
import { EntityMarker } from 'Types/declarations';

const ISO_PREFIX = 'ISO:';
const ISO_FORMAT = 'YYYY-MM-DD';

/**
 *
 * @param value
 */
export function isEntityDate(value: any): value is DateTime {
    return value && value['[Types/_entity/applied/Date]'];
}

/**
 * Тип даты.
 * @public
 */
export default class TheDate extends DateTime {
    readonly '[Types/_entity/applied/Date]': EntityMarker;

    protected get _proto(): object {
        return TheDate.prototype;
    }

    constructor(value?: number | string | Date);
    // @ts-ignore
    constructor(year: number, month: number, date?: number);
    constructor(...args: (number | string | Date)[]) {
        const instance = super(...args) as unknown as TheDate;
        instance.setHours(0);
        instance.setMinutes(0);
        instance.setSeconds(0);
        instance.setMilliseconds(0);

        if (instance[$withoutTimeZone] === true) {
            delete instance[$withoutTimeZone];
        }

        return instance;
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        state.$options = ISO_PREFIX + formatDate(this as Date, ISO_FORMAT);

        return state;
    }

    _setSerializableState(state: ISerializableState): Function {
        const dateStr = String(state && state.$options);
        if (dateStr.startsWith(ISO_PREFIX)) {
            state.$options = parseDate(dateStr.substr(ISO_PREFIX.length), ISO_FORMAT);
        }

        return SerializableMixin.prototype._setSerializableState(state);
    }

    // endregion
}

Object.assign(TheDate.prototype, {
    '[Types/_entity/applied/Date]': true,
    _moduleName: 'Types/entity:Date',
});

register('Types/entity:Date', TheDate, { instantiate: false });
