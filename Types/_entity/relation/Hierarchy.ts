/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DestroyableMixin from '../DestroyableMixin';
import OptionsToPropertyMixin from '../OptionsToPropertyMixin';
import IObject from '../IObject';
import Record, { isRecord } from '../Record';
import { RecordSet } from '../../collection';
import { mixin, logger } from '../../util';

/**
 *
 */
export type NodeKey = string | number;

/**
 * Класс, предоставляющий возможность построить иерархические отношения.
 *
 * Организуем работу с иерархическим каталогом товаров:
 * <pre>
 *    //Создадим экземпляр иерархических отношений и рекордсет
 *    var hierarchy = new Hierarchy({
 *          keyProperty: 'id',
 *          parentProperty: 'parent',
 *          nodeProperty: 'parent@',
 *          declaredChildrenProperty: 'parent$'
 *       }),
 *       catalogue = new RecordSet({
 *          rawData: [
 *             {id: 1, parent: null, 'parent@': true, 'parent$': true, title: 'Computers'},
 *             {id: 2, parent: 1, 'parent@': true, 'parent$': false, title: 'Mac'},
 *             {id: 3, parent: 1, 'parent@': true, 'parent$': true, title: 'PC'},
 *             {id: 4, parent: null, 'parent@': true, 'parent$': true, title: 'Smartphones'},
 *             {id: 5, parent: 3, 'parent@': false, title: 'Home Station One'},
 *             {id: 6, parent: 3, 'parent@': false, title: 'Home Station Two'},
 *             {id: 7, parent: 4, 'parent@': false, title: 'Apple iPhone 7'},
 *             {id: 8, parent: 4, 'parent@': false, title: 'Samsung Galaxy Note 7'}
 *          ]
 *       });
 *
 *     //Проверим, является ли узлом запись 'Computers'
 *     hierarchy.isNode(catalogue.at(0));//true
 *
 *     //Проверим, является ли узлом запись 'Apple iPhone 7'
 *     hierarchy.isNode(catalogue.at(6));//false
 *
 *     //Получим все записи узла 'PC' (по значению ПК узла)
 *     hierarchy.getChildren(3, catalogue);//'Home Station One', 'Home Station Two'
 *
 *     //Получим все записи узла 'Smartphones' (по узлу)
 *     hierarchy.getChildren(catalogue.at(3), catalogue);//'Apple iPhone 7', 'Samsung Galaxy Note 7'
 *
 *     //Получим родительский узел для товара 'Home Station One' (по значению ПК товара)
 *     hierarchy.getParent(5, catalogue);//'PC'
 *
 *     //Получим родительский узел для узла 'Mac' (по узлу)
 *     hierarchy.getParent(catalogue.at(1), catalogue);//'Computers'
 *
 *     //Проверим, есть ли декларируемые потомки в узле 'Computers'
 *     hierarchy.hasDeclaredChildren(catalogue.at(0));//true
 *
 *     //Проверим, есть ли декларируемые потомки в узле 'Mac'
 *     hierarchy.hasDeclaredChildren(catalogue.at(1));//false
 * </pre>
 * @public
 */
export default class Hierarchy extends mixin<DestroyableMixin, OptionsToPropertyMixin>(
    DestroyableMixin,
    OptionsToPropertyMixin
) {
    protected _moduleName: string;

    /**
     * Название свойства, содержащего идентификатор узла.
     * @see {@link getKeyProperty}
     * @see {@link setKeyProperty}
     */
    protected _$keyProperty: string;

    /**
     * Название свойства, содержащего идентификатор родительского узла.
     * @see {@link getKeyProperty}
     * @see {@link setKeyProperty}
     */
    protected _$parentProperty: string;

    /**
     * Название свойства, содержащего признак узла.
     * @see {@link getKeyProperty}
     * @see {@link setKeyProperty}
     */
    protected _$nodeProperty: string;

    /**
     * Название свойства, содержащего декларируемый признак наличия детей.
     * @see {@link getKeyProperty}
     * @see {@link setKeyProperty}
     */
    protected _$declaredChildrenProperty: string;

    /**
     * Ключ произвольного корня иерархии.
     * @see {@link getRootKey}
     * @see {@link setRootKey}
     */
    protected _$rootKey: NodeKey;

    constructor(options?: object) {
        super(options);
        OptionsToPropertyMixin.initMixin(this, options);

        // Support deprecated  option 'idProperty'
        if (!this._$keyProperty && options && (options as any).idProperty) {
            this._$keyProperty = (options as any).idProperty;
        }
    }

    // region Public methods

    /**
     * Возвращает название свойства, содержащего идентификатор узла.
     * @see {@link setKeyProperty}
     */
    getKeyProperty(): string {
        return this._$keyProperty;
    }

    /**
     * Устанавливает название свойства, содержащего идентификатор узла.
     * @param keyProperty
     * @see {@link getKeyProperty}
     */
    setKeyProperty(keyProperty: string): void {
        this._$keyProperty = keyProperty;
    }

    /**
     * Возвращает название свойства, содержащего идентификатор родительского узла.
     * @see {@link setParentProperty}
     */
    getParentProperty(): string {
        return this._$parentProperty;
    }

    /**
     * Устанавливает название свойства, содержащего идентификатор родительского узла.
     * @param parentProperty
     * @see {@link getParentProperty}
     */
    setParentProperty(parentProperty: string): void {
        this._$parentProperty = parentProperty;
    }

    /**
     * Возвращает название свойства, содержащего признак узла.
     * @see {@link setNodeProperty}
     */
    getNodeProperty(): string {
        return this._$nodeProperty;
    }

    /**
     * Устанавливает название свойства, содержащего признак узла.
     * @param nodeProperty
     * @see {@link getNodeProperty}
     */
    setNodeProperty(nodeProperty: string): void {
        this._$nodeProperty = nodeProperty;
    }

    /**
     * Возвращает название свойства, содержащего декларируемый признак наличия детей.
     * @see {@link setDeclaredChildrenProperty}
     */
    getDeclaredChildrenProperty(): string {
        return this._$declaredChildrenProperty;
    }

    /**
     * Устанавливает название свойства, содержащего декларируемый признак наличия детей.
     * @param declaredChildrenProperty
     * @see {@link getDeclaredChildrenProperty}
     */
    setDeclaredChildrenProperty(declaredChildrenProperty: string): void {
        this._$declaredChildrenProperty = declaredChildrenProperty;
    }

    /**
     * Возвращает заданный ключ корня иерархии
     */
    getRootKey(): NodeKey {
        return this._$rootKey;
    }

    /**
     * Устанавливает произвольное значение ключа корня
     * @param rootKey ключ корня
     */
    setRootKey(rootKey: NodeKey): void {
        this._$rootKey = rootKey;
    }

    /**
     * Проверяет, является ли запись узлом.
     * Возвращаемые значения:
     * <ul>
     *    <li><em>true</em>: запись является узлом</li>
     *    <li><em>false</em>: запись скрытым листом</li>
     *    <li><em>null</em>: запись является листом</li>
     * </ul>
     * @param record
     */
    isNode(record: IObject): boolean {
        return record.get(this._$nodeProperty);
    }

    /**
     * Возвращает признак валидности иерархии узлов относительно заданного ключа корня
     * @remark
     * Проверка возможна только в случае, когда задан rootKey.
     *
     * Условия прохождения проверки на валидность иерархии:
     * <ul>
     *     <li>в рекордсете есть узел с ключем равным rootKey</li>
     *     <li>в иерархии нет узлов с одинаковыми ключами</li>
     *     <li>в иерархии один корень, начинающаяся с узла с ключем rootKey</li>
     *     <li>нет узлов, не прикрепленных к иерархии</li>
     * </ul>
     * @param rs узлы иерархии
     * @returns признак валидности
     * @see {@link setRootKey}
     * @see {@link getRootKey}
     */
    isValid(rs: RecordSet): boolean {
        if (this._$rootKey === null || this._$rootKey === undefined) {
            logger.error(
                `${this._moduleName}: hierarchy has not specified rootKey. Validation skipped`
            );
            return true;
        }

        const handler = (msg: string) => {
            logger.error(`${this._moduleName}: ${msg}`);
        };

        return this._validate(rs, handler);
    }

    /**
     * Проверяет иерархию на валидность.
     * В случае обнаружения проблем выбрасывает исключение.
     * @remark
     * Проверка возможна только в случае, когда задан rootKey.
     *
     * Условия прохождения проверки на валидность иерархии:
     * <ul>
     *     <li>задан ключ корня в опции rootKey</li>
     *     <li>в рекордсете есть узел с ключем равным rootKey</li>
     *     <li>в иерархии нет узлов с одинаковыми ключами</li>
     *     <li>в иерархии один корень, начинающаяся с узла с ключем rootKey</li>
     *     <li>нет узлов, не прикрепленных к иерархии</li>
     * </ul>
     * @param rs узлы иерархии
     * @see {@link setRootKey}
     * @see {@link getRootKey}
     */
    validate(rs: RecordSet): void {
        const handler = (msg: string) => {
            throw new Error(`${this._moduleName}: ${msg}`);
        };

        this._validate(rs, handler);
    }

    _validate(rs: RecordSet, errorCallback: Function): boolean {
        const rootKey = this._$rootKey;

        if (rootKey === null || rootKey === undefined) {
            errorCallback('rootKey is not valid');
            return false;
        }

        const keyProperty = this._$keyProperty || rs.getKeyProperty();

        const keys = new Set<NodeKey>();
        rs.each((item) => {
            const itemKey = item.get(keyProperty);
            if (keys.has(itemKey)) {
                errorCallback(`recordset has duplicate nodes with key ${itemKey}`);
                return false;
            }

            keys.add(itemKey);
        });
        keys.delete(rootKey);

        this._traverseHierarchy(rootKey, rs, keys);

        if (keys.size !== 0) {
            errorCallback(
                `hierarchy has more than one root. Only one root allowed with rootKey ${rootKey}`
            );
            return false;
        }

        return true;
    }

    _traverseHierarchy(key: NodeKey, rs: RecordSet, keys: Set<NodeKey>): void {
        const children = this.getChildren(key, rs);
        children.forEach((item) => {
            const keyProperty = this._$keyProperty || rs.getKeyProperty();
            const nodeKey = item.get(keyProperty);
            keys.delete(nodeKey);
            this._traverseHierarchy(nodeKey, rs, keys);
        });
    }

    /**
     * Возвращает список детей для указанного родителя.
     * @param parent Родительский узел или его идентификатор
     * @param rs Рекордсет
     */
    getChildren(parent: IObject | NodeKey, rs: RecordSet): IObject[] {
        if (!this._$parentProperty) {
            return parent === null || parent === undefined
                ? (() => {
                      const result: IObject[] = [];
                      rs.each((item) => {
                          result.push(item);
                      });
                      return result;
                  })()
                : [];
        }

        const parentId = this._asField(parent as any, this._$keyProperty);
        let indices = rs.getIndicesByValue(this._$parentProperty, parentId);
        const children: IObject[] = [];

        // If nothing found by that property value, return all if null(root) requested
        if (indices.length === 0 && parentId === null) {
            indices = rs.getIndicesByValue(this._$parentProperty, undefined);
        }

        for (let i = 0; i < indices.length; i++) {
            const model = rs.at(indices[i]);
            if (model) {
                children.push(model);
            }
        }

        return children;
    }

    /**
     *
     * Возвращает признак наличия декларируемых детей.
     * @param record
     */
    hasDeclaredChildren(record: IObject): boolean {
        return record.get(this._$declaredChildrenProperty);
    }

    /**
     * Возвращает признак наличия родителя для указанного дочернего узла.
     * @param child Дочерний узел или его идентификатор
     * @param rs Рекордсет
     */
    hasParent(child: IObject, rs: RecordSet): boolean {
        child = this._asRecord(child, rs);
        const parentId = child.get(this._$parentProperty);
        const keyProperty = this._$keyProperty || rs.getKeyProperty();

        if (this._validRootKey() && child.get(keyProperty) === this.getRootKey()) {
            return false;
        }

        const index = rs.getIndexByValue(keyProperty, parentId);

        return index > -1;
    }

    /**
     * Возвращает родителя для указанного дочернего узла.
     * Если записи с указанным идентификатором нет - кидает исключение.
     * Если узел является корневым, возвращает null.
     * @param child Дочерний узел или его идентификатор
     * @param rs Рекордсет
     */
    getParent(child: IObject, rs: RecordSet): IObject | null {
        if (this._validRootKey() && this.getRootKey() === (child as any as NodeKey)) {
            return null;
        }
        child = this._asRecord(child, rs);
        const nodeId = child.get(this._$keyProperty);

        if (this._validRootKey() && this.getRootKey() === nodeId) {
            return null;
        }

        if (this.hasParent(child, rs)) {
            const parentId = child.get(this._$parentProperty);

            return this._asRecord(parentId, rs);
        }

        return null;
    }

    // endregion Public methods

    // region Protected methods

    /**
     * Возвращает инстанс записи
     * @param value Запись или ее ПК
     * @param rs Рекордсет
     */
    _asRecord(value: IObject | Record, rs: RecordSet): IObject {
        if (value && isRecord(value)) {
            return value;
        }

        const keyProperty = this._$keyProperty || rs.getKeyProperty();
        const index = rs.getIndexByValue(keyProperty, value);

        if (index === -1) {
            throw new ReferenceError(
                `${this._moduleName}: record with id "${value}" does not found in the recordset`
            );
        }

        return rs.at(index) as IObject;
    }

    /**
     * Возвращает значение поля записи
     * @param value Запись или значение ее поля
     * @param field Имя поля
     */
    _asField(value: IObject | Record, field: string): any {
        if (!(value && isRecord(value))) {
            return value;
        }

        return value.get(field);
    }

    _validRootKey(): boolean {
        const rootKey = this._$rootKey;
        return rootKey !== null && rootKey !== undefined;
    }

    // endregion Protected methods
}

Object.assign(Hierarchy.prototype, {
    '[Types/_entity/relation/Hierarchy]': true,
    _$keyProperty: '',
    _$parentProperty: '',
    _$nodeProperty: '',
    _$declaredChildrenProperty: '',
    _$rootKey: null,
    getIdProperty: Hierarchy.prototype.getKeyProperty,
    setIdProperty: Hierarchy.prototype.setKeyProperty,
});
