/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import IVersionable from './IVersionable';
import ManyToMany from './relation/ManyToMany';
import { EntityMarker } from 'Types/declarations';

/**
 * @public
 */
export type VersionCallback = (version: number) => void;

function isManyToMany(value: any): value is ManyToMany {
    return value instanceof Object && value['[Types/_entity/ManyToManyMixin]'];
}

/**
 * Интерфейс опций конструктора VersionableMixin
 * @public
 */
export interface IOptions {
    /**
     * Обработчик изменения версии.
     */
    versionCallback?: VersionCallback;
}

/**
 * Миксин, позволяющий получать и изменять номер версии объекта.
 * @remark
 * Для активации опции {@link versionCallback} требуется подмешать {@link Types/_entity/OptionsToPropertyMixin}.
 * @public
 */
export default abstract class VersionableMixin implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': EntityMarker;

    // Номер версии объекта
    protected _version: number;

    // Номер зафиксированной версии
    protected _lockedVersion: number | undefined;

    // Возвращает признак, что версия объекта зафиксирована (не будет меняться до момента снятия фиксации)
    get versionLocked(): boolean {
        return this._lockedVersion !== undefined;
    }

    /**
     * Обработчик изменения версии
     */
    protected _$versionCallback: VersionCallback;

    // region ManyToManyMixin

    protected _getMediator: () => ManyToMany;

    // endregion

    // region IVersionable

    readonly '[Types/_entity/IVersionable]': EntityMarker;

    getVersion(): number {
        return this._version;
    }

    // endregion

    // Фиксирует версию объекта
    lockVersion(): void {
        if (this._lockedVersion !== undefined) {
            throw new Error("Can't lock version because it's already locked");
        }
        this._lockedVersion = this._version;
    }

    // Снимает фиксацию версии объекта
    unlockVersion(silent: boolean = false): void {
        if (this._lockedVersion === undefined) {
            throw new Error("Can't unlock version because it's not locked yet");
        }
        if (!silent) {
            this._version = this._lockedVersion;
        }
        this._lockedVersion = undefined;
    }

    protected _nextVersion(): void {
        if (this._lockedVersion !== undefined) {
            this._lockedVersion++;
            return;
        }

        this._version++;
        if (this._$versionCallback) {
            this._$versionCallback(this._version);
        }

        if (isManyToMany(this)) {
            this._getMediator().belongsTo(this, (parent: any) => {
                if (parent && parent['[Types/_entity/IVersionable]']) {
                    parent._nextVersion();
                }
            });
        }
    }

    // endregion
}

Object.assign(VersionableMixin.prototype, {
    '[Types/_entity/VersionableMixin]': true,
    '[Types/_entity/IVersionable]': true,
    _version: 0,
    _lockedVersion: undefined,
    _$versionCallback: null,
});

// Deprecated implementation
for (const name of Object.getOwnPropertyNames(VersionableMixin.prototype)) {
    if (name !== 'constructor') {
        //@ts-ignore
        VersionableMixin[name] = VersionableMixin.prototype[name];
    }
}
