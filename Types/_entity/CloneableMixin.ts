/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import ICloneable from './ICloneable';
import { getJsonReplacerWithStorage, getJsonReviverWithStorage } from '../formatter';
import { protect } from '../util';
import { EntityMarker } from '../_declarations';

const $clone = protect('clone');

/**
 * Миксин, позволяющий клонировать объекты.
 * @remark
 * Для корректной работы требуется подмешать {@link Types/_entity/SerializableMixin}.
 * @mixin Types/_entity/CloneableMixin
 * @implements Types/_entity/ICloneable
 * @public
 */
export default class CloneableMixin implements ICloneable {
    // region Types/_entity/ICloneable

    '[Types/_entity/ICloneable]': EntityMarker;

    clone<T = this>(shallow?: boolean): T {
        let clone;

        if (shallow) {
            const proto = Object.getPrototypeOf(this);
            const Module = proto.constructor;
            const data = (this as any).toJSON();

            data.state = this._unlinkCollection(data.state);
            if (data.state.$options) {
                data.state.$options = this._unlinkCollection(data.state.$options);
            }

            clone = Module.fromJSON(data);
        } else {
            const functionsStorage: Map<number, Function> = new Map();
            const replacer = getJsonReplacerWithStorage(functionsStorage);
            const reviver = getJsonReviverWithStorage(undefined, functionsStorage);
            clone = JSON.parse(JSON.stringify(this, replacer), reviver);
        }
        clone[$clone] = true;

        // TODO: this should be do instances mixes InstantiableMixin
        delete clone._instanceId;

        return clone;
    }

    // endregion

    // region Protected methods

    protected _unlinkCollection(collection: any): void {
        let result;

        if (collection instanceof Array) {
            result = [];
            for (let i = 0; i < collection.length; i++) {
                result[i] = this._unlinkObject(collection[i]);
            }
            return result;
        }
        if (collection instanceof Object) {
            result = {};
            for (const key in collection) {
                if (collection.hasOwnProperty(key)) {
                    result[key] = this._unlinkObject(collection[key]);
                }
            }
            return result;
        }

        return collection;
    }

    protected _unlinkObject(object: any): any {
        if (object instanceof Array) {
            return object.slice();
        }
        return object;
    }

    // endregion
}

Object.assign(CloneableMixin.prototype, {
    '[Types/_entity/CloneableMixin]': true,
    '[Types/_entity/ICloneable]': true,
});
