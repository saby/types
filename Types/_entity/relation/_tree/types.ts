/**
 * Интерфейс опций структуры "Дерево"
 */
export interface ITreeOptions {
    keyProperty: string;
    childrenProperty?: string;
    parentProperty?: string;
}

/**
 *
 */
export interface TTreeAddOptions {
    replace: boolean;
}

/**
 * Описание дерева в виде массива
 * @example
 * const treeData: TExternalFlatArrayTreeData = [
 *     { id: 's', name: 'Rickard Stark' },
 *     { id: 's_1', name: 'Eddard Stark', parentId: 's' },
 *     { id: 's_1_1', name: 'Robb Stark', parentId: 's_1' }
 * ]
 */
export type TExternalFlatArrayTreeData = Record<string, unknown>[];

/**
 * Описание дерева в виде плоского объекта
 * @example
 * const treeData: TExternalFlatObjectTreeData = {
 *     s: { name: 'Rickard Stark' },
 *     s_1: { name: 'Eddard Stark', parentId: 's' },
 *     s_1_1: { name: 'Robb Stark', parentId: 's_1' },
 *     s_1_2: { name: 'Sansa Stark', parentId: 's_1' },
 *     s_1_3: { name: 'Arya Stark', parentId: 's_1' }
 * }
 */
export type TExternalFlatObjectTreeData = Record<string, Record<string, string>>;

/**
 * Описание дерева в виде вложенных объектов
 * @example
 * const treeData: TExternalFlatObjectTreeData = {
 *     s: {
 *         name: 'Rickard Stark',
 *         children: {
 *             s_1: {
 *                 name: 'Eddard Stark',
 *                 children: {
 *                     s_1_1: {
 *                         name: 'Robb Stark',
 *                     },
 *                     s_1_2: {
 *                         name: 'Sansa Stark',
 *                     },
 *                     s_1_3: {
 *                         name: 'Arya Stark',
 *                     },
 *                 },
 *             },
 *         },
 *     },
 * }
 */
export type TExternalNestedTreeData = Record<string, object>;

/**
 * Описание дерева
 */
export type TExternalTreeData =
    | TExternalFlatArrayTreeData
    | TExternalFlatObjectTreeData
    | TExternalNestedTreeData;
