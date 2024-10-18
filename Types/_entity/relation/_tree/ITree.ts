import { TTreeAddOptions, TExternalTreeData } from 'Types/_entity/relation/_tree/types';
import { ITreeItem } from 'Types/_entity/relation/_tree/ITreeItem';
import { TreeItem } from 'Types/_entity/relation/_tree/TreeItem';

/**
 * Структура "Дерево"
 */
interface ITree<TData extends object = any> {
    parseTree(value: TExternalTreeData): ITree<TData>;

    /**
     * Добавляет узел в корень дерева
     * @param value Значение узла
     * @param name Название узла
     * @param options {TTreeAddOptions} Опции узла
     */
    addChild(value: TData, name: string, options?: TTreeAddOptions): ITreeItem<TData>;

    /**
     * Возвращает корневой узел по имени
     * @param name
     */
    getChild(name: string): TreeItem<TData>;

    /**
     * Возвращает признак наличия дочернего узла
     * @remark если не передано название узла, возвращает в целом признак наличия дочерних узлов.
     * @param name имя узла
     */
    hasChild(name?: string): boolean;

    /**
     * Находит узел по пути в глубину иерархии
     * @param path путь до узла
     */
    findChild(path: string[]): TreeItem<TData> | null;

    /**
     * Экспортирует иерархию в виде массива
     * @returns Массив узлов узлов дерева.
     */
    toArray(): TData[];

    /**
     * Экспортирует иерархию в виде вложенного объекта
     * @returns Структура дерева в виде объекта.
     */
    toObject(): TData;
}

type ITraverseCallback<TData extends Record<string, unknown>> = (node: TData) => void;

export { ITree, ITraverseCallback };
