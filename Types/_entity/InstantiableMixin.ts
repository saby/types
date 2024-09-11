/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import IInstantiable from './IInstantiable';
import { EntityMarkerCompat as EntityMarker } from '../_declarations';

const MAX_VALUE = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
const IS_SERVER_SIDE = typeof window === 'undefined';

let counter = 0;

/**
 * Миксин, позволяющий генерировать уникальный (в рамках миксина) идентификатор для каждого экземпляра класса.
 * @implements Types/_entity/IInstantiable
 * @public
 */
export default class InstantiableMixin implements IInstantiable {
    '[Types/_entity/InstantiableMixin]': EntityMarker;

    /**
     * Префикс значений идентификатора
     */
    protected _instancePrefix: string;

    /**
     * Уникальный идентификатор
     */
    protected _instanceId: string;

    // region IInstantiable

    readonly '[Types/_entity/IInstantiable]': EntityMarker;

    getInstanceId(): string {
        if (counter >= MAX_VALUE) {
            counter = 0;
        }
        return (
            this._instanceId ||
            (this._instanceId =
                (IS_SERVER_SIDE ? 'server-' : 'client-') + this._instancePrefix + counter++)
        );
    }

    // endregion
}

Object.assign(InstantiableMixin.prototype, {
    '[Types/_entity/InstantiableMixin]': true,
    '[Types/_entity/IInstantiable]': true,
    _instancePrefix: 'id-',
    _instanceId: '',
});

// Deprecated implementation
// @ts-ignore
InstantiableMixin.prototype.getHash = InstantiableMixin.prototype.getInstanceId;
for (const name of Object.getOwnPropertyNames(InstantiableMixin.prototype)) {
    if (name !== 'constructor') {
        InstantiableMixin[name] = InstantiableMixin.prototype[name];
    }
}
