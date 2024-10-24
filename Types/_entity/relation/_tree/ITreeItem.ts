/**
 * Интерфейс узла дерева
 */
export interface ITreeItem<TData extends object = any> {
    /**
     * Название узла
     */
    name: string;

    /**
     * Значение узла
     */
    value: TData;

    /**
     * Родитель узла
     */
    parent: ITreeItem | null;

    /**
     * Добавляет дочерний узело к текущему
     * @param value значение дочернего узла
     * @returns новый дочерний узел
     */
    addChild(name: string, value: TData): ITreeItem<TData>;

    /**
     * Возвращает дочерний узел
     * @param name название дочернего узла
     */
    getChild(name: string): ITreeItem<TData>;

    /**
     * Удаляет дочерний узел
     * @param name название дочернего узла
     */
    deleteChild(name: string): void;

    /**
     * Возвращает признак наличия дочернего узла
     * @param name название дочернего узла
     */
    hasChild(name?: string): boolean;

    /**
     * Возвращает путь от текущего узла до корня дерева
     * @param includeSelf включить в путь текущий узел
     */
    getPath(includeSelf: boolean): string[];

    [Symbol.iterator](): IterableIterator<[string, ITreeItem]>;
}
