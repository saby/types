import { mixin } from 'Types/util';
import { default as SerializableMixin } from '../../SerializableMixin';
import { default as OptionsToPropertyMixin } from '../../OptionsToPropertyMixin';
import { ITreeOptions } from './types';
import { ITreeItem } from './ITreeItem';

/**
 * Дерево
 */
export class TreeItem<TData extends object = any>
    extends mixin<OptionsToPropertyMixin, SerializableMixin>(
        OptionsToPropertyMixin,
        SerializableMixin
    )
    implements ITreeItem<TData>
{
    protected readonly _moduleName = 'Types/_entity/relation/_tree/TreeItem';

    /**
     * Название свойства, содержащего идентификатор узла.
     */
    protected _$keyProperty: string;

    /**
     * Название свойства, содержащего идентификатор родительского узла.
     */
    protected _$parentProperty: string;

    /**
     * Название свойства, содержащего декларируемый признак наличия детей.
     */
    protected _$childrenProperty: string;

    /**
     * Название узла
     * @private
     */
    private _name: string;
    /**
     * Значение узла
     * @private
     */
    private _value: TData;

    private _parent: TreeItem | null = null;

    private _children: Map<string, TreeItem> = new Map<string, TreeItem>();

    constructor(options?: ITreeOptions) {
        super(options);
        this._initTreeInstance();
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get parent(): TreeItem | null {
        return this._parent;
    }

    set parent(node: TreeItem | null) {
        this._parent = node;
    }

    get value(): TData {
        return this._value;
    }

    set value(val: TData) {
        this._value = this._getClearValue(val);
    }

    /**
     * Возвращает название свойства, содержащего идентификатор родительского узла.
     * @see {@link setParentProperty}
     */
    getParentProperty(): string {
        return this._$parentProperty;
    }

    /**
     * Возвращает название свойства, содержащего идентификатор узла.
     * @see {@link setKeyProperty}
     */
    getKeyProperty(): string {
        return this._$keyProperty;
    }

    /**
     * Возвращает название свойства, содержащего декларируемый признак наличия детей.
     * @see {@link setDeclaredChildrenProperty}
     */
    getChildrenProperty(): string {
        return this._$childrenProperty;
    }

    /**
     * Добавляет дочерний узел к текущему
     * @param value значение дочернего узла
     * @returns новый дочерний узел
     */
    addChild(name: string, value: TData): TreeItem<TData> {
        const node = TreeItem.buildTreeItem<TData>(
            value,
            name,
            this,
            this._getOptions() as ITreeOptions
        );
        this._children.set(name, node);
        return node;
    }

    /**
     * Возвращает дочерний узел
     * @param name название дочернего узла
     */
    getChild(name: string): TreeItem<TData> {
        return this._children.get(name) as TreeItem<TData>;
    }

    /**
     * Возвращает путь от текущего узла до корня дерева
     */
    getPath(includeSelf: boolean = true): string[] {
        let currentNode: TreeItem | null = this;

        const path: string[] = [];
        do {
            path.unshift(currentNode.name);
            currentNode = currentNode.parent;
        } while (currentNode);

        if (!includeSelf) {
            path.pop();
        }
        return path;
    }

    deleteChild(name: string): void {
        this._children.delete(name);
    }

    hasChild(name?: string): boolean {
        if (!name) {
            return this._children.size > 0;
        }
        return this._children.has(name);
    }

    /**
     * Проверяет является ли текущий узел корневым
     */
    isRoot(): boolean {
        return !this.parent;
    }

    protected _getClearValue(value: any): TData {
        const data = { ...value };

        delete data[this.getKeyProperty()];
        delete data[this.getParentProperty()];
        delete data[this.getChildrenProperty()];

        return data;
    }

    private _initTreeInstance(options?: ITreeOptions): void {
        OptionsToPropertyMixin.initMixin(this, options);
    }

    [Symbol.iterator]() {
        return this._children[Symbol.iterator]();
    }

    static buildTreeItem<TData extends object = any>(
        value: TData,
        name: string,
        parent: TreeItem | null,
        options: ITreeOptions
    ): TreeItem<TData> {
        const treeItem = new TreeItem<TData>(options);

        treeItem.value = value;
        treeItem.name = name;
        treeItem.parent = parent;

        return treeItem;
    }
}

Object.assign(TreeItem.prototype, {
    _moduleName: 'Types/_entity/relation/_tree/TreeItem',
    _$keyProperty: '',
    _$parentProperty: null,
    _$childrenProperty: null,
});
