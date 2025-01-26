/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */
import Abstract from './Abstract';
import { IEnumerator } from '../collection';
import { EntityMarker } from 'Types/declarations';

/**
 * Цепочка по IEnumerable.
 * @public
 */
export default class Enumerable<T, U> extends Abstract<T, U> {
    constructor(source: any) {
        if (!source || !source['[Types/_collection/IEnumerable]']) {
            throw new TypeError('Source must implement Types/collection:IEnumerable');
        }
        super(source);
    }

    // region IEnumerable

    getEnumerator(): IEnumerator<T, U> {
        return this._source.getEnumerator();
    }

    each(callback: (item: T, index: U) => void, context?: object): void {
        return this._source.each(callback, context);
    }

    // endregion

    // region IObject

    toObject<S = Record<string, T>>(): S {
        if (this._source['[Types/_entity/IObject]']) {
            const result = {} as S;
            this.each((key, value) => {
                // @ts-ignore
                result[key] = value;
            });
            return result;
        }
        return super.toObject();
    }

    // endregion
    readonly '[Types/_chain/Enumerable]': EntityMarker = true;
}
