/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 * @module
 * @public
 */
import DestroyableMixin from '../DestroyableMixin';
import { Map, Set } from '../../shim';

/**
 * Проверяет, что объект "живой" (не был уничтожен)
 */
function isAlive(item: any): boolean {
    return item instanceof Object && item['[Types/_entity/DestroyableMixin]']
        ? !item.destroyed
        : true;
}

/**
 * Посредник, реализующий отношения "один ко многим".
 * @private
 */
export default class OneToMany extends DestroyableMixin {
    /**
     * {Map<Object, Set<Object>>} Родитель -> [Ребенок, Ребенок, ...]
     */
    protected _parentToChild: Map<Object, Set<Object>>;

    /**
     * {Map<Object, Object>} Ребенок -> Родитель
     */
    _childToParent: Map<Object, Object>;

    /**
     * {Map<Object, String>} Ребенок -> название отношения
     */
    _childToRelation: Map<Object, string>;

    constructor() {
        super();
        this._parentToChild = new Map();
        this._childToParent = new Map();
        this._childToRelation = new Map();
    }

    destroy(): void {
        //@ts-ignore
        this._parentToChild = null;
        //@ts-ignore
        this._childToParent = null;
        //@ts-ignore
        this._childToRelation = null;
        super.destroy();
    }

    // region Public methods

    /**
     * Добавляет отношение "родитель - ребенок"
     * @param parent Родитель
     * @param child Ребенок
     * @param name Название отношений
     */
    addTo(parent: object, child: object, name: string): void {
        this._addForParent(parent, child);
        this._addForChild(child, parent, name);
    }

    /**
     * Удаляет отношение "родитель - ребенок"
     * @param parent Родитель
     * @param child Ребенок
     */
    removeFrom(parent: object, child: object): void {
        this._removeForParent(parent, child);
        this._removeForChild(child, parent);
    }

    /**
     * Очищает все отношения c детьми у указанного родителя
     * @param parent Родитель
     */
    clear(parent: object): void {
        if (this._parentToChild.has(parent)) {
            this._parentToChild.get(parent)?.forEach((child) => {
                this._removeForChild(child, parent);
            });
            this._parentToChild.delete(parent);
        }
    }

    /**
     * Возвращает всех детей для указанного родителя
     * @param parent Родитель
     * @param callback Функция обратного вызова для каждого ребенка
     */
    each(parent: object, callback: Function): void {
        if (this._parentToChild.has(parent)) {
            this._parentToChild.get(parent)?.forEach((child) => {
                if (isAlive(child)) {
                    callback.call(
                        this,
                        child,
                        this._childToParent.get(child) === parent
                            ? this._childToRelation.get(child)
                            : undefined
                    );
                }
            });
        }
    }

    /**
     * Возвращает родителя для указанного ребенка
     * @param child Ребенок
     */
    getParent(child: object): object | undefined {
        const parent = this._childToParent.get(child);
        return parent !== undefined && isAlive(parent) ? parent : undefined;
    }

    // endregion

    // region Protected methods

    /**
     * Добавляет ребенка в список родителя
     * @param parent Родитель
     * @param child Ребенок
     * @protected
     */
    _addForParent(parent: object, child: object): void {
        let children: Set<object> | undefined;
        if (this._parentToChild.has(parent)) {
            children = this._parentToChild.get(parent);
        } else {
            children = new Set();
            this._parentToChild.set(parent, children);
        }
        children?.add(child);
    }

    /**
     * Удаляет ребенка из списка родителя
     * @param parent Родитель
     * @param child Ребенок
     * @protected
     */
    _removeForParent(parent: object, child: object): void {
        if (this._parentToChild.has(parent)) {
            const children = this._parentToChild.get(parent);
            children?.delete(child);
            if (children?.size === 0) {
                this._parentToChild.delete(parent);
            }
        }
    }

    /**
     * Добавляет связь ребенка с родителем
     * @param child Ребенок
     * @param parent Родитель
     * @param name Название отношения
     * @protected
     */
    _addForChild(child: object, parent: object, name: string): void {
        this._childToParent.set(child, parent);
        this._childToRelation.set(child, name);
    }

    /**
     * Удаляет связь ребенка с родителем
     * @param child Ребенок
     * @param parent Родитель
     * @protected
     */
    _removeForChild(child: object, parent: object): void {
        if (this._childToParent.get(child) === parent) {
            this._childToParent.delete(child);
            this._childToRelation.delete(child);
        }
    }

    // endregion
}

Object.assign(OneToMany.prototype, {
    '[Types/_entity/relation/OneToMany]': true,
    _parentToChild: null,
    _childToParent: null,
    _childToRelation: null,
});
