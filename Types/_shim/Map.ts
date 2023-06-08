import { SetPolyfill } from './Set';

/**
 * Ограниченная эмуляция стандартного встроенного объекта «Map», если он не поддерживается.
 * Перейдите по ссылке {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map}, чтобы узнать подробности.
 * @public
 */

/*
 * Limited emulation of standard built-in object "Map" if it's not supported.
 * Follow {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map} for details.
 * @author Буранов А.Р.
 */
export class MapPolyfill<K, V> {
    protected _hash: object;
    protected _objects: V[];
    protected _objectPrefix: string;

    size: number;

    constructor() {
        this.clear();
    }

    clear(): void {
        this._hash = {};
        this._objects = [];
    }

    delete(key: K): boolean {
        let surrogate;
        if (this._isObject(key)) {
            surrogate = this._addObject(key);
            if (!surrogate) {
                return false;
            }
        } else {
            surrogate = key;
        }
        const hashedKey = SetPolyfill._getHashedKey(surrogate);
        const result = hashedKey in this._hash;
        delete this._hash[hashedKey];

        return result;
    }

    entries(): any[] {
        throw new Error('Method is not supported');
    }

    forEach(callbackFn: Function, thisArg?: object): void {
        // FIXME: now not in insertion order
        const hash = this._hash;
        for (const key in hash) {
            if (hash.hasOwnProperty(key)) {
                const value = hash[key];
                let ukey: any = MapPolyfill._getUnhashedKey(key);
                if (this._isObjectKey(ukey)) {
                    ukey = this._getObject(ukey);
                }
                callbackFn.call(thisArg, value, ukey, this);
            }
        }
    }

    get(key: K): V {
        let surrogate;
        if (this._isObject(key)) {
            surrogate = this._getObjectKey(key);
            if (!surrogate) {
                return;
            }
        } else {
            surrogate = key;
        }
        return this._hash[SetPolyfill._getHashedKey(surrogate)];
    }

    has(key: K): boolean {
        let surrogate;
        if (this._isObject(key)) {
            surrogate = this._getObjectKey(key);
            if (!surrogate) {
                return false;
            }
        } else {
            surrogate = key;
        }
        surrogate = SetPolyfill._getHashedKey(surrogate);

        return this._hash.hasOwnProperty(surrogate);
    }

    keys(): any[] {
        throw new Error('Method is not supported');
    }

    set(key: K, value: V): this {
        let surrogate;
        if (this._isObject(key)) {
            surrogate = this._addObject(key);
        } else {
            surrogate = key;
        }
        this._hash[SetPolyfill._getHashedKey(surrogate)] = value;

        return this;
    }

    toString(): string {
        return '[object Map]';
    }

    _isObject(value: any): boolean {
        return SetPolyfill.prototype._isObject.call(this, value);
    }

    _addObject(value: Object): string {
        return SetPolyfill.prototype._addObject.call(this, value);
    }

    _deleteObject(value: Object): string | undefined {
        return SetPolyfill.prototype._deleteObject.call(this, value);
    }

    _getObjectKey(value: Object): string | undefined {
        return SetPolyfill.prototype._getObjectKey.call(this, value);
    }

    _isObjectKey(key: any): boolean {
        return String(key).substr(0, this._objectPrefix.length) === this._objectPrefix;
    }

    _getObject(key: string): V {
        const index = parseInt(key.substr(this._objectPrefix.length), 10);
        return this._objects[index];
    }

    static _getUnhashedKey(key: string): string {
        const strKey = String(key);
        const unhashedKey = strKey.slice(strKey.indexOf('@') + 1);
        return unhashedKey === 'null' ? null : unhashedKey;
    }
}

Object.assign(MapPolyfill.prototype, {
    _hash: null,
    _objectPrefix: SetPolyfill.prototype._objectPrefix,
    _objects: null,
});

Object.defineProperty(MapPolyfill.prototype, 'size', {
    get(): number {
        return Object.keys(this._hash).length;
    },
    enumerable: true,
    configurable: false,
});

// Use native implementation if supported
// @ts-ignore
const MapImplementation: MapConstructor = typeof Map === 'undefined' ? MapPolyfill : Map;
export default MapImplementation;
