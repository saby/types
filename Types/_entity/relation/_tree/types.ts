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
 *
 */
export type TExternalFlatTreeData = Record<string, unknown>[];
/**
 *
 */
export type TExternalNestedTreeData = Record<string, object>;
/**
 * Внешнее описание дерева
 */
export type TExternalTreeData = TExternalFlatTreeData | TExternalNestedTreeData;
