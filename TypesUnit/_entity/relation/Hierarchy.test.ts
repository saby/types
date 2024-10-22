import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { relation } from 'Types/entity';

function getRootKeyHierarchy(): relation.Hierarchy {
    return new relation.Hierarchy({
        rootKey: 0,
        keyProperty: 'id',
        parentProperty: 'parent',
        nodeProperty: 'node',
        declaredChildrenProperty: 'hasChildren',
    });
}

describe('Types/_entity/relation/Hierarchy', () => {
    let data: unknown;
    let rs: RecordSet;
    let hierarchy: relation.Hierarchy;

    beforeEach(() => {
        data = [
            {
                id: 1,
                parent: null,
                title: 'node1',
                node: true,
                hasChildren: true,
            },
            {
                id: 2,
                parent: null,
                title: 'node2',
                node: true,
                hasChildren: true,
            },
            {
                id: 3,
                parent: 1,
                title: 'node11',
                node: true,
                hasChildren: false,
            },
            {
                id: 4,
                parent: 1,
                title: 'leaf12',
                node: false,
                hasChildren: false,
            },
            {
                id: 5,
                parent: 2,
                title: 'node21',
                node: true,
                hasChildren: false,
            },
            {
                id: 6,
                parent: 2,
                title: 'leaf22',
                node: false,
                hasChildren: false,
            },
        ];

        rs = new RecordSet({
            rawData: data,
            keyProperty: 'id',
        });

        hierarchy = new relation.Hierarchy({
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'node',
            declaredChildrenProperty: 'hasChildren',
        });
    });

    afterEach(() => {
        hierarchy.destroy();
        hierarchy = undefined;

        rs.destroy();
        rs = undefined;

        data = undefined;
    });

    describe('.getKeyProperty()', () => {
        it('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            assert.strictEqual(hierarchy.getKeyProperty(), '');
        });

        it('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                keyProperty: 'test',
            });
            assert.strictEqual(hierarchy.getKeyProperty(), 'test');
        });
    });

    describe('.setKeyProperty()', () => {
        it('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setKeyProperty('test');
            assert.strictEqual(hierarchy.getKeyProperty(), 'test');
        });
    });

    describe('.getParentProperty()', () => {
        it('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            assert.strictEqual(hierarchy.getParentProperty(), '');
        });

        it('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                parentProperty: 'test',
            });
            assert.strictEqual(hierarchy.getParentProperty(), 'test');
        });
    });

    describe('.setParentProperty()', () => {
        it('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setParentProperty('test');
            assert.strictEqual(hierarchy.getParentProperty(), 'test');
        });
    });

    describe('.getNodeProperty()', () => {
        it('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            assert.strictEqual(hierarchy.getNodeProperty(), '');
        });

        it('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                nodeProperty: 'test',
            });
            assert.strictEqual(hierarchy.getNodeProperty(), 'test');
        });
    });

    describe('.setNodeProperty()', () => {
        it('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setNodeProperty('test');
            assert.strictEqual(hierarchy.getNodeProperty(), 'test');
        });
    });

    describe('.getDeclaredChildrenProperty()', () => {
        it('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            assert.strictEqual(hierarchy.getDeclaredChildrenProperty(), '');
        });

        it('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                declaredChildrenProperty: 'test',
            });
            assert.strictEqual(hierarchy.getDeclaredChildrenProperty(), 'test');
        });
    });

    describe('.setDeclaredChildrenProperty()', () => {
        it('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setDeclaredChildrenProperty('test');
            assert.strictEqual(hierarchy.getDeclaredChildrenProperty(), 'test');
        });
    });

    describe('.isNode()', () => {
        it('should return the field value', () => {
            rs.each((record, i) => {
                assert.strictEqual(hierarchy.isNode(record), data[i].node);
            });
        });
    });

    describe('.getChildren()', () => {
        const getExpectChildren = () => {
            return {
                // eslint-disable-next-line no-magic-numbers
                1: [3, 4],
                // eslint-disable-next-line no-magic-numbers
                2: [5, 6],
                3: [],
                4: [],
                5: [],
                6: [],
            };
        };

        it('should work with the record', () => {
            const expect = getExpectChildren();

            rs.each((record) => {
                const children = hierarchy.getChildren(record, rs);
                const expectChildren = expect[record.getKey()];

                assert.strictEqual(children.length, expectChildren.length);

                for (let j = 0; j < children.length; j++) {
                    assert.strictEqual((children[j] as any).getKey(), expectChildren[j]);
                }
            });
        });

        it('should work with the value', () => {
            const expect = getExpectChildren();

            rs.each((record) => {
                const children = hierarchy.getChildren(record, rs);
                const expectChildren = expect[record.getKey()];

                assert.strictEqual(children.length, expectChildren.length);

                for (let j = 0; j < children.length; j++) {
                    assert.strictEqual((children[j] as any).getKey(), expectChildren[j]);
                }
            });
        });

        it('should work with not existent value', () => {
            const children = hierarchy.getChildren('some' as any, rs);
            assert.strictEqual(children.length, 0);
        });

        it('should return all records in root if parent property is not defined', () => {
            hierarchy = new relation.Hierarchy({
                keyProperty: 'id',
            });
            const check = (children) => {
                assert.strictEqual(children.length, rs.getCount());
                for (let i = 0; i < children.length; i++) {
                    assert.strictEqual(children[i], rs.at(i));
                }
            };

            check(hierarchy.getChildren(null, rs));
            check(hierarchy.getChildren(undefined, rs));
        });

        it('should return records with undefined value of parentProperty if root is null', () => {
            data = [{ id: 1 }, { id: 2, parent: 1 }, { id: 3 }, { id: 4, parent: 1 }];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });
            hierarchy = new relation.Hierarchy({
                keyProperty: 'id',
                parentProperty: 'parent',
            });
            const expect = [1, 3];
            const check = (children) => {
                assert.strictEqual(children.length, expect.length);
                for (let i = 0; i < children.length; i++) {
                    assert.strictEqual(children[i].getKey(), expect[i]);
                }
            };

            check(hierarchy.getChildren(null, rs));
        });
    });

    describe('.hasDeclaredChildren()', () => {
        it('should return the field value', () => {
            rs.each((record, i) => {
                assert.strictEqual(hierarchy.hasDeclaredChildren(record), data[i].hasChildren);
            });
        });
    });

    describe('.hasParent()', () => {
        it('should work with the record', () => {
            rs.each((record, i) => {
                const parent = hierarchy.hasParent(record, rs);
                assert.strictEqual(parent, !!data[i].parent);
            });
        });

        it('should work with the value', () => {
            rs.each((record, i) => {
                const parent = hierarchy.hasParent(record.getKey(), rs);
                assert.strictEqual(parent, !!data[i].parent);
            });
        });

        it('should return false for rootKey node', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 2, parent: null, title: 'test' },
                { id: 0, parent: 2, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isFalse(hierarchy.hasParent(0 as any, rs));
        });
    });

    describe('.getParent()', () => {
        it('should work with the record', () => {
            rs.each((record, i) => {
                const parent = hierarchy.getParent(record, rs);
                if (parent === null) {
                    assert.strictEqual(parent, data[i].parent);
                } else {
                    assert.strictEqual((parent as any).getKey(), data[i].parent);
                }
            });
        });

        it('should work with the value', () => {
            rs.each((record, i) => {
                const parent = hierarchy.getParent(record.getKey(), rs);
                if (parent === null) {
                    assert.strictEqual(parent, data[i].parent);
                } else {
                    assert.strictEqual((parent as any).getKey(), data[i].parent);
                }
            });
        });

        it('should work with link to 0', () => {
            data = [
                { id: 0, parent: null, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.strictEqual(hierarchy.getParent(1 as any, rs), rs.at(0));
        });

        it('should work with link to null', () => {
            data = [{ id: 0, parent: null, title: 'foo' }];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should work with link to undefined', () => {
            data = [{ id: 0, title: 'foo' }];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should return root if parent property is empty', () => {
            data = [
                { id: 0, parent: null, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should return root if parent property is non exist', () => {
            data = [
                { id: 0, parent: 2, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should throw an Error with not existent value', () => {
            assert.throws(() => {
                hierarchy.getParent('some' as any, rs);
            });
        });

        it('should return root if root and parent key specified', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 0, parent: 4, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should return root if parent key specified', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 0, parent: null, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should return null if node key equals rootKey', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 1, parent: 0, title: 'foo' },
                { id: 2, parent: 1, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(0 as any, rs));
        });

        it('should return null if node is root without rootKey', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 1, parent: 0, title: 'foo' },
                { id: 2, parent: 1, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            assert.isNull(hierarchy.getParent(1 as any, rs));
        });

        it('should return null if node is root with rootKey', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 0, parent: null, title: 'test' },
                { id: 1, parent: 0, title: 'foo' },
                { id: 2, parent: 1, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            const parent = hierarchy.getParent(1 as any, rs);
            assert.equal(parent.get('id'), data[0].id);
        });
    });

    context('hierarchy validation', () => {
        describe('.isValid()', () => {
            it('should validate without rootKey', () => {
                data = [
                    { id: 0, parent: 2, title: 'foo' },
                    { id: 1, parent: 0, title: 'bar' },
                ];
                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isTrue(hierarchy.isValid(rs));
            });

            it('should validate with only one root node', () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 0, parent: null, title: 'bar' },
                    { id: 1, parent: 0, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 3, parent: 2, title: 'test' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isTrue(hierarchy.isValid(rs));
            });

            it("shouldn't validate with two root nodes", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 0, parent: null, title: 'bar' },
                    { id: 1, parent: 0, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 3, parent: 6, title: 'test' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isFalse(hierarchy.isValid(rs));
            });

            it("shouldn't validate with two null root nodes", () => {
                const hierarchyTest = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: null, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 3, parent: null, title: 'foo' },
                    { id: 4, parent: 3, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isFalse(hierarchyTest.isValid(rs));
            });

            it("shouldn't validate with one null root node and detached node", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: null, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 4, parent: 99, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isFalse(hierarchy.isValid(rs));
            });

            it("shouldn't validate with one root node and detached node", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: 99, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 4, parent: 3, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isFalse(hierarchy.isValid(rs));
            });

            it("shouldn't validate rs without rootKey", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 4, parent: 3, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.isFalse(hierarchy.isValid(rs));
            });
        });

        describe('.validate()', () => {
            it('should not validate without rootKey', () => {
                data = [
                    { id: 0, parent: 2, title: 'foo' },
                    { id: 1, parent: 0, title: 'bar' },
                ];
                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.throws(() => {
                    return hierarchy.validate(rs);
                });
            });

            it('should validate with only one root node', () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 0, parent: null, title: 'bar' },
                    { id: 1, parent: 0, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 3, parent: 2, title: 'test' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.doesNotThrow(() => {
                    return hierarchy.validate(rs);
                });
            });

            it("shouldn't validate with two root nodes", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 0, parent: null, title: 'bar' },
                    { id: 1, parent: 0, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 3, parent: 6, title: 'test' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.throws(() => {
                    return hierarchy.validate(rs);
                });
            });

            it("shouldn't validate with two null root nodes", () => {
                const hierarchyTest = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: null, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 3, parent: null, title: 'foo' },
                    { id: 4, parent: 3, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.throws(() => {
                    return hierarchyTest.validate(rs);
                });
            });

            it("shouldn't validate with one null root node and detached node", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: null, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 4, parent: 99, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.throws(() => {
                    return hierarchy.validate(rs);
                });
            });

            it("shouldn't validate with one root node and detached node", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: 99, title: 'bar' },
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 4, parent: 3, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.throws(() => {
                    return hierarchy.validate(rs);
                });
            });

            it('should validate rs without rootKey', () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: 0, title: 'foo' },
                    { id: 2, parent: 1, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                assert.doesNotThrow(() => {
                    return hierarchy.validate(rs);
                });
            });
        });
    });
});
