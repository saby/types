import { mixin } from 'Types/util';
import { default as SerializableMixin } from '../SerializableMixin';
import { default as OptionsToPropertyMixin } from '../OptionsToPropertyMixin';
import { ITreeOptions, TExternalTreeData, TTreeAddOptions } from './_tree/types';
import { ITree } from './_tree/ITree';
import { ITreeItem } from './_tree/ITreeItem';
import { TreeItem } from './_tree/TreeItem';
import { TreeDataIterator, TTreeIteratorCallback } from './_tree/treeIterator';

/**
 *
 */
export type TIteratorCallback<TData extends object = any> = (
    value: TData,
    nodeName: string,
    node: ITreeItem<TData>
) => void;

/**
 * Класс, предоставляющий возможность построить иерархические отношения в виде дерева.
 * Поддерживает работу с данными в виде массива (элемент ссылается на родителя по идентификатору), так и с данными в виде
 * вложенного объекта (у элемента есть поле с дочерниими элементами)
 * @public
 */
export class Tree<TData extends object = any>
    extends mixin<OptionsToPropertyMixin, SerializableMixin>(
        OptionsToPropertyMixin,
        SerializableMixin
    )
    implements ITree<TData>
{
    protected readonly _moduleName = 'Types/entity.relation#Tree';
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

    protected _children: Map<string, TreeItem> = new Map<string, TreeItem>();

    constructor(options?: ITreeOptions) {
        super(options);
        this._initTreeInstance(options);
    }

    /**
     * Возвращает название свойства, содержащего идентификатор родительского узла.
     */
    getParentProperty(): string {
        return this._$parentProperty;
    }

    /**
     * Возвращает название свойства, содержащего идентификатор узла.
     */
    getKeyProperty(): string {
        return this._$keyProperty;
    }

    /**
     * Возвращает название свойства, содержащего декларируемый признак наличия детей.
     */
    getChildrenProperty(): string {
        return this._$childrenProperty;
    }

    /**
     * Добавляет узел в корень дерева
     * @param value Значение узла
     * @param name Название узла
     * @param options Опции узла
     */
    addChild(value: TData, name: string, options?: TTreeAddOptions): ITreeItem<TData> {
        const node = TreeItem.buildTreeItem(value, name, null, this._getOptions() as ITreeOptions);

        if (this.hasChild(name) && !options?.replace) {
            throw new Error(`${this._moduleName}:: узел с таким названием уже существует`);
        }

        this._children.set(name, node);

        return node;
    }

    /**
     * Возвращает корневой узел по имени
     * @param name
     */
    getChild(name: string): TreeItem<TData> {
        return this._children.get(name) as TreeItem<TData>;
    }

    /**
     * Возвращает признак наличия дочернего узла
     * @remark если не передано название узла, возвращает в целом признак наличия дочерних узлов.
     * @param name имя узла
     */
    hasChild(name?: string): boolean {
        if (!name) {
            return this._children.size > 0;
        }
        return this._children.has(name);
    }

    /**
     * Находит узел по пути в глубину иерархии
     * @param path путь до узла
     */
    findChild(path: string[]): TreeItem<TData> | null {
        const [firstPathItem] = path;
        let result: TreeItem | null = this.getChild(firstPathItem);

        for (let i = 1; i < path.length; i++) {
            if (result === undefined || result === null) {
                return null;
            }

            const name = path[i];

            result = result.getChild(name);
        }

        return result;
    }

    /**
     * Разбирает входные данные в иерархическую структуру
     * @param treeData
     */
    parseTree(treeData: TExternalTreeData): Tree<TData> {
        const iterator = new TreeDataIterator(
            this._getOptions() as ITreeOptions,
            this._iteratorCallback
        );

        iterator.iterate(treeData as TExternalTreeData);
        return this;
    }

    /**
     * Пробегает по узлам дерева "сверху вниз"
     * @param callback
     */
    each(callback: TIteratorCallback): void {
        const processNode = (node: ITreeItem<TData>, nodeName: string) => {
            callback(node.value, nodeName, node);
            if (node.hasChild()) {
                for (const [childName, child] of node) {
                    processNode(child, childName);
                }
            }
        };
        for (const [elementName, element] of this) {
            processNode(element, elementName);
        }
    }

    /**
     * Экспортирует иерархию в виде массива
     * @returns Массив узлов узлов дерева.
     */
    toArray(): TData[] {
        const result: TData[] = [];

        const iterateNodeChild = (node: ITreeItem | Tree) => {
            for (const [name, chNode] of node) {
                const nodeData = {
                    [this.getKeyProperty()]: name,
                    ...chNode.value,
                };

                if (chNode.parent) {
                    nodeData[this.getParentProperty()] = chNode.parent.name;
                }

                result.push(nodeData);

                if (chNode.hasChild()) {
                    iterateNodeChild(chNode);
                }
            }
        };

        iterateNodeChild(this);

        return result;
    }

    /**
     * Экспортирует иерархию в виде вложенного объекта
     * @returns Структура дерева в виде объекта.
     */
    toObject(): TData {
        const result: Record<string, TData> = {};

        const iterateNodeChild = (node: ITreeItem | Tree, parentData: Record<string, TData>) => {
            for (const [name, chNode] of node) {
                const nodeData = {
                    ...chNode.value,
                };

                if (chNode.hasChild()) {
                    const children = {};
                    iterateNodeChild(chNode, children);
                    nodeData[this.getChildrenProperty()] = children;
                }

                parentData[name] = nodeData;
            }
        };

        iterateNodeChild(this, result);

        return result as TData;
    }

    protected _initTreeInstance(options?: ITreeOptions): void {
        OptionsToPropertyMixin.initMixin(this, options);
    }

    protected _iteratorCallback: TTreeIteratorCallback = (value: TData, path: string[]) => {
        const isRootNode = path.length === 1;
        if (isRootNode) {
            const [name] = path;
            this.addChild(value, name);
            return;
        }

        const pathClone = [...path];
        const lastNode = pathClone.pop();

        const node = this.findChild(pathClone);

        if (node && lastNode) {
            node.addChild(lastNode, value);
        }
    };

    [Symbol.iterator]() {
        return this._children[Symbol.iterator]();
    }
}

Object.assign(Tree.prototype, {
    _moduleName: 'Types/entity.relation:Tree',
    _$keyProperty: '',
    _$parentProperty: null,
    _$childrenProperty: null,
});
