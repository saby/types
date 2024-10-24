/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import ManyToMany from './relation/ManyToMany';
import IReceiver from './relation/IReceiver';
import { EntityMarker } from 'Types/declarations';

/**
 *
 * @param value
 */
export function isManyToManyMixin(value: any): value is ManyToManyMixin {
    return value instanceof Object && value['[Types/_entity/ManyToManyMixin]'];
}
/**
 * Миксин, позволяющий сущности строить отношения "многие ко многим"
 * @public
 */
export default abstract class ManyToManyMixin {
    readonly '[Types/_entity/ManyToManyMixin]': EntityMarker = true;

    /**
     * Медиатор, отвечающий за связи между сущностями
     */
    _mediator: ManyToMany | null;

    // region Public methods

    // This method calls implicitly when mixing in a row with DestroyableMixin
    destroy(..._args: unknown[]): void {
        const mediator = this._getMediator();
        const slaves: Record<string, any>[] = [];

        mediator.hasMany(this, (slave) => {
            slaves.push(slave);
        });

        mediator.clear(this);

        let slave;
        for (let i = 0, count = slaves.length; i < count; i++) {
            slave = slaves[i];
            if (slave['[Types/_entity/DestroyableMixin]'] && !slave.destroyed) {
                slave.destroy();
            }
        }

        this._setMediator(null);
    }

    // endregion

    // region Protected methods

    /**
     * Добавляет отношение с другой сущностью
     * @param child Другая сущность
     * @param name Название отношения
     */
    protected _addChild(child: IReceiver | any, name?: string): void {
        if (child instanceof Object) {
            const mediator = this._getMediator();
            mediator.addRelationship(this, child, name);

            if (child['[Types/_entity/ManyToManyMixin]'] && !child._hasSameMediator(mediator)) {
                if (!child._hasMediator()) {
                    child._setMediator(this._createMediator());
                }
                child._getMediator().addRelationship(this, child, name);
            }
        }
    }

    /**
     * Удаляет отношение с другой сущностью
     * @param child Другая сущность
     */
    protected _removeChild(child: IReceiver | any): void {
        if (child instanceof Object) {
            const mediator = this._getMediator();
            mediator.removeRelationship(this, child);

            if (
                child['[Types/_entity/ManyToManyMixin]'] &&
                child._hasMediator() &&
                !child._hasSameMediator(mediator)
            ) {
                child._getMediator().removeRelationship(this, child);
            }
        }
    }

    /**
     * Уведомляет дочерние сущности об изменении родительской
     * @param data Данные об изменениях
     */
    protected _parentChanged(data: any): void {
        const which = {
            target: this,
            data,
            original: data,
        };
        this._getMediator().hasMany(this, (slave, name) => {
            if (slave['[Types/_entity/relation/IReceiver]']) {
                slave.relationChanged(which, [name]);
            }
        });
    }

    /**
     * Рекурсивно уведомляет родительские сущности об изменении дочерней
     * @param data Данные об изменениях
     */
    protected _childChanged(data?: any): void {
        const original = data;
        const notifyParent = (mediator: ManyToMany, child: ManyToManyMixin, route: string[]) => {
            mediator.belongsTo(child, (parent: IReceiver & ManyToManyMixin, name: string) => {
                const childRoute = route.slice();
                const which = {
                    target: child,
                    data,
                    original,
                };
                let parentWhich;

                childRoute.unshift(name);
                if (parent['[Types/_entity/relation/IReceiver]']) {
                    parentWhich = parent.relationChanged(which, childRoute);

                    // Replace data with parent's data
                    if (parentWhich !== undefined) {
                        data = parentWhich.data;
                    }
                }

                notifyParent(parent._getMediator(), parent, childRoute);
            });
        };

        notifyParent(this._getMediator(), this, []);
    }

    /**
     * Возвращает признак наличия посредника
     */
    protected _hasMediator(): boolean {
        return !!this._mediator;
    }

    /**
     * Возвращает признак наличия одинакового посредника
     */
    protected _hasSameMediator(mediator: ManyToMany): boolean {
        return this._mediator === mediator;
    }

    /**
     * Создает посредника для установления отношений с детьми
     */
    protected _createMediator(): ManyToMany {
        return new ManyToMany();
    }

    /**
     * Возвращает посредника для установления отношений с детьми
     */
    protected _getMediator(): ManyToMany {
        return this._mediator || (this._mediator = this._createMediator());
    }

    /**
     * Устанавливает посредника для установления отношений с детьми
     */
    protected _setMediator(mediator: ManyToMany | null): void {
        this._mediator = mediator;
    }

    // endregion
}

Object.assign(ManyToManyMixin.prototype, {
    '[Types/_entity/ManyToManyMixin]': true,
    _mediator: null,
});
