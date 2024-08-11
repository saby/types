import { relation } from 'Types/entity';
import { TData, nestedHierarchy, flatHierarchy } from './_tree/treeData';
import { assert, expect } from 'chai';
import { TreeItem } from 'Types/_entity/relation/_tree/TreeItem';

function getTree(): relation.Tree<TData> {
    return new relation.Tree<TData>({
        keyProperty: 'id',
        parentProperty: 'parentId',
        childrenProperty: 'children',
    });
}

const runs = [
    {
        it: 'nested hierarchy',
        data: nestedHierarchy,
    },
    {
        it: 'flat hierarchy',
        data: flatHierarchy,
    },
];

describe('Types/_entity/relation/Tree', () => {
    runs.forEach((run) => {
        describe(run.it, () => {
            let tree: relation.Tree<TData>;

            beforeEach(() => {
                tree = getTree();
                tree.parseTree(run.data);
            });

            afterEach(() => {
                // @ts-ignore
                tree = undefined;
            });

            it('should initialize tree instance', () => {
                expect(tree).to.be.instanceof(relation.Tree);
                assert.instanceOf(tree, relation.Tree);
                assert.strictEqual(tree.getKeyProperty(), 'id');
                assert.strictEqual(tree.getParentProperty(), 'parentId');
                assert.strictEqual(tree.getChildrenProperty(), 'children');
            });

            describe('.parseTree()', () => {
                it('should return full hierarchy tree', () => {
                    validateHierarchy(tree);
                });

                it('should generate correct root nodes', () => {
                    expect(tree._children.size).to.be.equal(2);
                });
            });

            describe('.addChild()', () => {
                it('should add children to root', () => {
                    tree.addChild(
                        {
                            name: 'Brandon Stark',
                        },
                        's4'
                    );

                    const s4 = tree.getChild('s4');
                    checkValue(s4, 'Brandon Stark');
                });

                it('should clear hierarchy data', () => {
                    tree.addChild(
                        {
                            name: 'Brandon Stark',
                            parentId: 'test',
                            children: [],
                            id: 's4',
                        },
                        's4'
                    );

                    const s4 = tree.getChild('s4');
                    assert.equal(Object.keys(s4.value).length, 1);
                });

                it('should throw if node exists by default', () => {
                    assert.throw(() => {
                        tree.addChild(
                            {
                                name: 'Brandon Stark',
                            },
                            's'
                        );
                    }, 'узел с таким названием уже существует');
                });

                it('should replace existing node if options is set', () => {
                    tree.addChild(
                        {
                            name: 'Brandon Stark',
                        },
                        't',
                        {
                            replace: true,
                        }
                    );

                    const t = tree.getChild('t');
                    checkValue(t, 'Brandon Stark');
                });
            });
            describe('.hasChild()', () => {
                it('should return true for existing child', () => {
                    // корневой узел
                    assert.isTrue(tree.hasChild('s'));
                    // вложенный узел
                    assert.isTrue(tree.getChild('s').hasChild('s_1'));
                });

                it('should return false for non-existing child', () => {
                    // корневой узел
                    assert.isFalse(tree.hasChild('non'));
                    // вложенный узел
                    assert.isFalse(tree.getChild('s').hasChild('non'));
                });

                it('should return true if there are any child nodes and an empty node name is passed', () => {
                    // корневой узел
                    assert.isTrue(tree.hasChild());
                });

                it('should return false if there are no child nodes and an empty name is passed', () => {
                    const someTree = getTree();
                    assert.isFalse(someTree.hasChild());
                });
            });

            describe('.findChild()', () => {
                it('should return root node by path', () => {
                    const node = tree.findChild(['s']);

                    expect(node?.name).to.be.equal('s');
                    checkValue(node, 'Rickard Stark');
                });

                it('should return deep node by path', () => {
                    const node = tree.findChild(['s', 's_1', 's_1_1']);

                    expect(node?.name).to.be.equal('s_1_1');
                    checkValue(node, 'Robb Stark');
                });
            });

            describe('.each()', () => {
                it('should iterate hierarchy in pre-order', () => {
                    const expectedOrder: string[] = [
                        's',
                        's_1',
                        's_1_1',
                        's_1_2',
                        's_1_3',
                        's_2',
                        's_3',
                        't',
                        't_1',
                        't_1_1',
                        't_1_2',
                        't_2',
                        't_3',
                    ];
                    const order: string[] = [];

                    tree.each((value, nodeName, node) => {
                        // первым аргументом пришло значение узла
                        assert.isObject(value);
                        assert.equal(value, node.value);

                        order.push(nodeName);
                    });

                    assert.deepEqual(order, expectedOrder);
                });
            });

            describe('.toArray()', () => {
                it('should export array hierarchy', () => {
                    const arrayResult = tree.toArray();
                    expect(arrayResult).to.deep.equal(flatHierarchy);
                });
            });

            describe('.toObject()', () => {
                it('should export object hierarchy', () => {
                    const arrayResult = tree.toObject();
                    expect(arrayResult).to.deep.equal(nestedHierarchy);
                });
            });

            describe('.getPath()', () => {
                it('should return path to the root from current node', () => {
                    const path = ['s', 's_1', 's_1_3'];

                    const currentNode = tree.findChild(path);

                    assert.deepEqual(currentNode?.getPath(), path);
                });

                it('should return path to the root excluding current node', () => {
                    const currentNode = tree.findChild(['t', 't_1', 't_1_2']);

                    assert.deepEqual(currentNode?.getPath(false), ['t', 't_1']);
                });

                it('should return correct path from root node', () => {
                    const currentNode = tree.getChild('s');

                    assert.deepEqual(currentNode?.getPath(), ['s']);
                });

                it('should return correct path from root node (excluding current)', () => {
                    const currentNode = tree.getChild('s');

                    assert.isEmpty(currentNode?.getPath(false));
                });
            });
        });
    });
});

function validateHierarchy(tree: relation.Tree): void {
    /**
     * Ветка 's'
     */
    const s = tree.getChild('s');
    checkValue(s, 'Rickard Stark');

    // s -> s_1
    const s1 = s.getChild('s_1');
    checkValue(s1, 'Eddard Stark');

    // s -> s_1 -> s_1_1
    const s11 = s1.getChild('s_1_1');
    checkValue(s11, 'Robb Stark');

    // s -> s_1 -> s_1_2
    const s12 = s1.getChild('s_1_2');
    checkValue(s12, 'Sansa Stark');

    // s -> s_1 -> s_1_3
    const s13 = s1.getChild('s_1_3');
    checkValue(s13, 'Arya Stark');

    // s -> s_2
    const s2 = s.getChild('s_2');
    checkValue(s2, 'Benjen Stark');

    // s -> s_3
    const s3 = s.getChild('s_3');
    checkValue(s3, 'Lyanna Stark');

    /**
     * Ветка 't'
     */
    const t = tree.getChild('t');
    checkValue(t, 'Aerys II Targaryen');

    // t -> t_1
    const t1 = t.getChild('t_1');
    checkValue(t1, 'Rhaegar Targaryen');

    // st -> st_1 -> t_1_1
    const t11 = t1.getChild('t_1_1');
    checkValue(t11, 'Rhaenys Targaryen');

    // t -> t_1 -> t_1_2
    const t12 = t1.getChild('t_1_2');
    checkValue(t12, 'Aegon Targaryen');

    // t -> t_2
    const t2 = t.getChild('t_2');
    checkValue(t2, 'Viserys Targaryen');

    // t -> t_3
    const t3 = t.getChild('t_3');
    checkValue(t3, 'Daenerys Targaryen');
}

function checkValue(treeNode: TreeItem | null, expectedValue: string): void {
    const value = treeNode?.value?.name;

    expect(value).to.be.equal(expectedValue);
}
