import {
    TExternalTreeData,
    ITreeOptions,
    TExternalNestedTreeData,
    TExternalFlatTreeData,
} from './types';

type TTreeIteratorCallback = (value: any, path: string[]) => void;

function isFlatTree(treeData: TExternalTreeData): treeData is TExternalFlatTreeData {
    return Array.isArray(treeData);
}

function isNestedTree(treeData: TExternalTreeData): treeData is TExternalNestedTreeData {
    return typeof treeData === 'object';
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
        if (isFlatTree(treeData)) {
            return this._processFlatTree(treeData);
        }

        if (isNestedTree(treeData)) {
            return this._processNestedTree(treeData);
        }
    }

    protected _processFlatTree(treeData: TExternalFlatTreeData, path: string[] = []): void {
        const parentId = path.length ? path[path.length - 1] : undefined;
        const currentLevelNodes = treeData.filter((node) => node[this.parentProperty] === parentId);

        for (const node of currentLevelNodes) {
            const name = node[this.keyProperty] as string;
            const nodePath = [...path, name];

            this._entryCallback(this._getClearValue(node), nodePath);

            this._processFlatTree(treeData, nodePath);
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
