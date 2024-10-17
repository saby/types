/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DestroyableMixin from '../DestroyableMixin';
import { Map, Set } from '../../shim';
import { EntityMarker } from 'Types/declarations';

/**
 * The kind of clear
 */
export enum ClearType {
    /**
     *
     */
    All,
    /**
     *
     */
    Masters,
    /**
     *
     */
    Slaves,
}

/**
 * Check instance doesn't destroyed.
 */
function isAlive(entity: any): boolean {
    return entity instanceof Object && entity['[Types/_entity/DestroyableMixin]']
        ? !entity.destroyed
        : true;
}

export function isManyToMany(value: any): value is ManyToMany {
    return value instanceof Object && value['[Types/_entity/relation/ManyToMany]'];
}

/**
 * Посредник, который обеспечивает модель отношений «many-to-many».
 * @private
 */
export default class ManyToMany extends DestroyableMixin {
    static readonly '[Types/_entity/relation/ManyToMany]': EntityMarker = true;
    /**
     * master -> [slave, slave, ...]
     */
    _hasMany: Map<object, Set<object>>;

    /**
     * master -> [name, name, ...]
     */
    _hasManyName: Map<object, Map<object, string>>;

    /**
     * slave -> [master, master, ...]
     */
    _belongsTo: Map<object, Set<object>>;

    /**
     * slave -> [name, name, ...]
     */
    _belongsToName: Map<object, Map<object, string>>;

    constructor() {
        super();
        this._hasMany = new Map();
        this._hasManyName = new Map();
        this._belongsTo = new Map();
        this._belongsToName = new Map();
    }

    destroy(): void {
        //@ts-ignore
        this._hasMany = null;
        //@ts-ignore
        this._hasManyName = null;
        //@ts-ignore
        this._belongsTo = null;
        //@ts-ignore
        this._belongsToName = null;
        super.destroy();
    }

    // region Public methods

    /**
     * Добавляет отношения между двумя объектами.
     * @param master Главный объект.
     * @param slave Подчиненный объект.
     * @param name Наименование отношений.
     */
    addRelationship(master: object, slave: object, name?: string): void {
        this._addHasMany(master, slave, name);
        this._addBelongsTo(slave, master, name);
    }

    /**
     * Удаляет отношения между двумя объектами.
     * @param master Главный объект.
     * @param slave Подчиненный объект.
     */
    removeRelationship(master: object, slave: object): void {
        this._removeHasMany(master, slave);
        this._removeBelongsTo(slave, master);
    }

    /**
     * Удаляет все отношения для данного объекта.
     * @param entity Объект.
     * @param which Вид отношений.
     */
    clear(entity: object, which: ClearType = ClearType.All): void {
        if ((which === ClearType.All || which === ClearType.Slaves) && this._hasMany.has(entity)) {
            this._hasMany.get(entity)?.forEach((slave) => {
                this._removeBelongsTo(slave, entity);
            });
            this._hasMany.delete(entity);
            this._hasManyName.delete(entity);
        }

        if (
            (which === ClearType.All || which === ClearType.Masters) &&
            this._belongsTo.has(entity)
        ) {
            this._belongsTo.get(entity)?.forEach((master) => {
                this._removeHasMany(master, entity);
            });
            this._belongsTo.delete(entity);
            this._belongsToName.delete(entity);
        }
    }

    /**
     * Возвращает все подчиненные объекты для главного.
     * @param master Главный объект.
     * @param callback Обратный вызов для передачи каждого подчиненного объекта.
     */
    hasMany(master: object, callback: (slave: Record<string, any>, name?: string) => void): void {
        if (this._hasMany.has(master)) {
            const names = this._hasManyName.get(master);
            this._hasMany.get(master)?.forEach((slave) => {
                if (isAlive(slave)) {
                    callback.call(this, slave, names?.get(slave));
                }
            });
        }
    }

    /**
     * Возвращает все главные объекты для подчиненного.
     * @param master Подчиненный объект.
     * @param callback Обратный вызов для передачи каждого главного объекта.
     */
    belongsTo(slave: object, callback: Function): void {
        if (this._belongsTo.has(slave)) {
            const names = this._belongsToName.get(slave);
            this._belongsTo.get(slave)?.forEach((master) => {
                if (isAlive(master)) {
                    callback.call(this, master, names?.get(master));
                }
            });
        }
    }

    // endregion Public methods

    // region Protected methods

    /**
     * Добавляет отношения с типом "hasMany".
     * @param master Главный объект.
     * @param slave Подчиненный объект.
     * @param name Наименование отношений.
     */
    protected _addHasMany(master: object, slave: object, name?: string): void {
        let slaves: Set<object> | undefined;
        let names: Map<Object, string> | undefined;
        if (this._hasMany.has(master)) {
            slaves = this._hasMany.get(master);
            names = this._hasManyName.get(master);
        } else {
            slaves = new Set();
            names = new Map();
            this._hasMany.set(master, slaves);
            this._hasManyName.set(master, names);
        }
        slaves?.add(slave);
        if (name) {
            names?.set(slave, name);
        }
    }

    /**
     * Удаляет отношения типа "hasMany".
     * @param master Главный объект.
     * @param slave Подчиненный объект.
     */
    protected _removeHasMany(master: object, slave: object): void {
        if (this._hasMany.has(master)) {
            const slaves = this._hasMany.get(master);
            slaves?.delete(slave);
            this._hasManyName.get(master)?.delete(slave);

            if (slaves?.size === 0) {
                this._hasMany.delete(master);
                this._hasManyName.delete(master);
            }
        }
    }

    /**
     * Добавляет отношения типа "belongsTo".
     * @param master Главный объект.
     * @param slave Подчиненный объект.
     * @param name Наименование отношений.
     */
    protected _addBelongsTo(slave: object, master: object, name?: string): void {
        let masters: Set<object> | undefined;
        let names: Map<object, string> | undefined;
        if (this._belongsTo.has(slave)) {
            masters = this._belongsTo.get(slave);
            names = this._belongsToName.get(slave);
        } else {
            masters = new Set();
            names = new Map();
            this._belongsTo.set(slave, masters);
            this._belongsToName.set(slave, names);
        }
        masters?.add(master);
        if (name) {
            names?.set(master, name);
        }
    }

    /**
     * Удаляет отношения типа "belongsTo".
     * @param master Главный объект.
     * @param slave Подчиненный объект.
     */
    protected _removeBelongsTo(slave: object, master: object): void {
        if (this._belongsTo.has(slave)) {
            const masters = this._belongsTo.get(slave);
            masters?.delete(master);
            this._belongsToName.get(slave)?.delete(master);

            if (masters?.size === 0) {
                this._belongsTo.delete(slave);
                this._belongsToName.delete(slave);
            }
        }
    }

    // endregion Protected methods
}
