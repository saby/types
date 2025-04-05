import { relation } from 'Types/entity';
import { TData, nestedHierarchy, flatArrayHierarchy, flatObjectHierarchy } from './_tree/treeData';
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
        it: 'flat array hierarchy',
        data: flatArrayHierarchy,
    },
    {
        it: 'flat object hierarchy',
        data: flatObjectHierarchy,
    },
];

describe('Types/_entity/relation/Tree', () => {
    runs.forEach((run) => {
        describe(run.it, () => {
            let tree: relation.Tree<TData>;

            beforeEach(() => {
                tree = getTree();
                //@ts-ignore
                tree.parseTree(run.data);
            });

            test('should initialize tree instance', () => {
                expect(tree).toBeInstanceOf(relation.Tree);
                expect(tree).toBeInstanceOf(relation.Tree);
                expect(tree.getKeyProperty()).toBe('id');
                expect(tree.getParentProperty()).toBe('parentId');
                expect(tree.getChildrenProperty()).toBe('children');
            });

            describe('.parseTree()', () => {
                test('should return full hierarchy tree', () => {
                    validateHierarchy(tree);
                });

                test('should generate correct root nodes', () => {
                    //@ts-ignore
                    expect(tree._children.size).toEqual(2);
                });
            });

            describe('.addChild()', () => {
                test('should add children to root', () => {
                    tree.addChild(
                        {
                            name: 'Brandon Stark',
                        },
                        's4'
                    );

                    const s4 = tree.getChild('s4');
                    checkValue(s4, 'Brandon Stark');
                });

                test('should clear hierarchy data', () => {
                    tree.addChild(
                        {
                            name: 'Brandon Stark',
                            //@ts-ignore
                            parentId: 'test',
                            children: [],
                            id: 's4',
                        },
                        's4'
                    );

                    const s4 = tree.getChild('s4');
                    expect(Object.keys(s4.value).length).toEqual(1);
                });

                test('should throw if node exists by default', () => {
                    expect(() => {
                        tree.addChild(
                            {
                                name: 'Brandon Stark',
                            },
                            's'
                        );
                    }).toThrow();
                });

                test('should replace existing node if options is set', () => {
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
                test('should return true for existing child', () => {
                    // корневой узел
                    expect(tree.hasChild('s')).toBe(true);
                    // вложенный узел
                    expect(tree.getChild('s').hasChild('s_1')).toBe(true);
                });

                test('should return false for non-existing child', () => {
                    // корневой узел
                    expect(tree.hasChild('non')).toBe(false);
                    // вложенный узел
                    expect(tree.getChild('s').hasChild('non')).toBe(false);
                });

                test('should return true if there are any child nodes and an empty node name is passed', () => {
                    // корневой узел
                    expect(tree.hasChild()).toBe(true);
                });

                test('should return false if there are no child nodes and an empty name is passed', () => {
                    const someTree = getTree();
                    expect(someTree.hasChild()).toBe(false);
                });
            });

            describe('.findChild()', () => {
                test('should return root node by path', () => {
                    const node = tree.findChild(['s']);

                    expect(node?.name).toEqual('s');
                    checkValue(node, 'Rickard Stark');
                });

                test('should return deep node by path', () => {
                    const node = tree.findChild(['s', 's_1', 's_1_1']);

                    expect(node?.name).toEqual('s_1_1');
                    checkValue(node, 'Robb Stark');
                });
            });

            describe('.each()', () => {
                test('should iterate hierarchy in pre-order', () => {
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
                        expect(typeof value).toBe('object');
                        expect(value).toEqual(node.value);

                        order.push(nodeName);
                    });

                    expect(order).toEqual(expectedOrder);
                });
            });

            describe('.toArray()', () => {
                test('should export array hierarchy', () => {
                    const arrayResult = tree.toArray();
                    expect(arrayResult).toEqual(flatArrayHierarchy);
                });
            });

            describe('.toObject()', () => {
                test('should export object hierarchy', () => {
                    const arrayResult = tree.toObject();
                    expect(arrayResult).toEqual(nestedHierarchy);
                });
            });

            describe('.toFlatObject()', () => {
                test('should export flat object hierarchy', () => {
                    const arrayResult = tree.toFlatObject();
                    expect(arrayResult).toEqual(flatObjectHierarchy);
                });
            });

            describe('.getPath()', () => {
                test('should return path to the root from current node', () => {
                    const path = ['s', 's_1', 's_1_3'];

                    const currentNode = tree.findChild(path);

                    expect(currentNode?.getPath()).toEqual(path);
                });

                test('should return path to the root excluding current node', () => {
                    const currentNode = tree.findChild(['t', 't_1', 't_1_2']);

                    expect(currentNode?.getPath(false)).toEqual(['t', 't_1']);
                });

                test('should return correct path from root node', () => {
                    const currentNode = tree.getChild('s');

                    expect(currentNode?.getPath()).toEqual(['s']);
                });

                test('should return correct path from root node (excluding current)', () => {
                    const currentNode = tree.getChild('s');

                    expect(Object.keys(currentNode?.getPath(false))).toHaveLength(0);
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

    expect(value).toEqual(expectedValue);
}
