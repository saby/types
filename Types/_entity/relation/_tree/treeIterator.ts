import {
    TExternalTreeData,
    ITreeOptions,
    TExternalNestedTreeData,
    TExternalFlatArrayTreeData,
    TExternalFlatObjectTreeData,
} from './types';

type TTreeIteratorCallback = (value: any, path: string[]) => void;

function isFlatArrayTree(treeData: TExternalTreeData): treeData is TExternalFlatArrayTreeData {
    return Array.isArray(treeData);
}

function isFlatObjectTree(
    treeData: TExternalTreeData,
    parentProperty: string
): treeData is TExternalFlatObjectTreeData {
    return (
        typeof treeData === 'object' &&
        Object.values(treeData).some(
            (value) =>
                value.hasOwnProperty(parentProperty) &&
                !!(value as Record<string, unknown>)[parentProperty]
        )
    );
}

function isNestedTree(
    treeData: TExternalTreeData,
    childrenProperty: string
): treeData is TExternalNestedTreeData {
    return (
        typeof treeData === 'object' &&
        Object.values(treeData).some(
            (value) =>
                value.hasOwnProperty(childrenProperty) &&
                !!(value as Record<string, unknown>)[childrenProperty]
        )
    );
}

class TreeDataIterator {
    constructor(
        protected readonly _treeOptions: ITreeOptions,
        protected readonly _entryCallback: TTreeIteratorCallback
    ) {}

    protected get childrenProperty(): string {
        return this._treeOptions.childrenProperty || 'children';
    }

    protected get parentProperty(): string {
        return this._treeOptions.parentProperty || 'parentId';
    }

    protected get keyProperty(): string {
        return this._treeOptions.keyProperty;
    }

    iterate(treeData: TExternalTreeData): void {
        if (isFlatArrayTree(treeData)) {
            return this._processFlatArrayTree(treeData);
        }

        if (isFlatObjectTree(treeData, this.parentProperty)) {
            return this._processFlatObjectTree(treeData);
        }

        if (isNestedTree(treeData, this.childrenProperty)) {
            return this._processNestedTree(treeData);
        }
    }

    protected _processFlatArrayTree(
        treeData: TExternalFlatArrayTreeData,
        path: string[] = []
    ): void {
        const parentId = path.length ? path[path.length - 1] : undefined;
        const currentLevelNodes = treeData.filter((node) => node[this.parentProperty] === parentId);

        for (const node of currentLevelNodes) {
            const name = node[this.keyProperty] as string;
            const nodePath = [...path, name];

            this._entryCallback(this._getClearValue(node), nodePath);

            this._processFlatArrayTree(treeData, nodePath);
        }
    }

    protected _processFlatObjectTree(
        treeData: TExternalFlatObjectTreeData,
        path: string[] = []
    ): void {
        const parentId = path.length ? path[path.length - 1] : undefined;
        const currentLevelNodeKeys = Object.keys(treeData).filter((key) => {
            const node = treeData[key];
            return node && node[this.parentProperty] === parentId;
        });

        for (const key of currentLevelNodeKeys) {
            const nodePath = [...path, key];

            this._entryCallback(this._getClearValue(treeData[key]), nodePath);

            this._processFlatObjectTree(treeData, nodePath);
        }
    }

    protected _processNestedTree(treeData: TExternalNestedTreeData, path: string[] = []): void {
        for (const [name, value] of Object.entries(treeData)) {
            const nodePath = [...path, name];
            this._entryCallback(this._getClearValue(value), nodePath);

            const children = (value as Record<string, unknown>)[
                this.childrenProperty
            ] as TExternalNestedTreeData;

            if (children && Object.keys(children).length) {
                this._processNestedTree(children, nodePath);
            }
        }
    }

    protected _getClearValue(value: any): object {
        const data = { ...value };

        delete data[this.keyProperty];
        delete data[this.childrenProperty];
        delete data[this.parentProperty];

        return data;
    }
}

export { TreeDataIterator, TTreeIteratorCallback };
