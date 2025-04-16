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
        rs.destroy();
    });

    describe('.getKeyProperty()', () => {
        test('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            expect(hierarchy.getKeyProperty()).toBe('');
        });

        test('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                keyProperty: 'test',
            });
            expect(hierarchy.getKeyProperty()).toBe('test');
        });
    });

    describe('.setKeyProperty()', () => {
        test('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setKeyProperty('test');
            expect(hierarchy.getKeyProperty()).toBe('test');
        });
    });

    describe('.getParentProperty()', () => {
        test('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            expect(hierarchy.getParentProperty()).toBe('');
        });

        test('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                parentProperty: 'test',
            });
            expect(hierarchy.getParentProperty()).toBe('test');
        });
    });

    describe('.setParentProperty()', () => {
        test('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setParentProperty('test');
            expect(hierarchy.getParentProperty()).toBe('test');
        });
    });

    describe('.getNodeProperty()', () => {
        test('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            expect(hierarchy.getNodeProperty()).toBe('');
        });

        test('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                nodeProperty: 'test',
            });
            expect(hierarchy.getNodeProperty()).toBe('test');
        });
    });

    describe('.setNodeProperty()', () => {
        test('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setNodeProperty('test');
            expect(hierarchy.getNodeProperty()).toBe('test');
        });
    });

    describe('.getDeclaredChildrenProperty()', () => {
        test('should return an empty string by default', () => {
            hierarchy = new relation.Hierarchy();
            expect(hierarchy.getDeclaredChildrenProperty()).toBe('');
        });

        test('should return the value passed to the constructor', () => {
            hierarchy = new relation.Hierarchy({
                declaredChildrenProperty: 'test',
            });
            expect(hierarchy.getDeclaredChildrenProperty()).toBe('test');
        });
    });

    describe('.setDeclaredChildrenProperty()', () => {
        test('should set the new value', () => {
            hierarchy = new relation.Hierarchy();
            hierarchy.setDeclaredChildrenProperty('test');
            expect(hierarchy.getDeclaredChildrenProperty()).toBe('test');
        });
    });

    describe('.isNode()', () => {
        test('should return the field value', () => {
            rs.each((record, i) => {
                //@ts-ignore
                expect(hierarchy.isNode(record)).toBe(data[i].node);
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

        test('should work with the record', () => {
            const expectData = getExpectChildren();

            rs.each((record) => {
                const children = hierarchy.getChildren(record, rs);
                //@ts-ignore
                const expectChildren = expectData[record.getKey()];

                expect(children.length).toBe(expectChildren.length);

                for (let j = 0; j < children.length; j++) {
                    expect((children[j] as any).getKey()).toBe(expectChildren[j]);
                }
            });
        });

        test('should work with the value', () => {
            const expectData = getExpectChildren();

            rs.each((record) => {
                const children = hierarchy.getChildren(record, rs);
                //@ts-ignore
                const expectChildren = expectData[record.getKey()];

                expect(children.length).toBe(expectChildren.length);

                for (let j = 0; j < children.length; j++) {
                    expect((children[j] as any).getKey()).toBe(expectChildren[j]);
                }
            });
        });

        test('should work with not existent value', () => {
            const children = hierarchy.getChildren('some' as any, rs);
            expect(children.length).toBe(0);
        });

        test('should return all records in root if parent property is not defined', () => {
            hierarchy = new relation.Hierarchy({
                keyProperty: 'id',
            });
            //@ts-ignore
            const check = (children) => {
                expect(children.length).toBe(rs.getCount());
                for (let i = 0; i < children.length; i++) {
                    expect(children[i]).toBe(rs.at(i));
                }
            };

            //@ts-ignore
            check(hierarchy.getChildren(null, rs));
            //@ts-ignore
            check(hierarchy.getChildren(undefined, rs));
        });

        test('should return records with undefined value of parentProperty if root is null', () => {
            data = [{ id: 1 }, { id: 2, parent: 1 }, { id: 3 }, { id: 4, parent: 1 }];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });
            hierarchy = new relation.Hierarchy({
                keyProperty: 'id',
                parentProperty: 'parent',
            });
            const expectData = [1, 3];
            //@ts-ignore
            const check = (children) => {
                expect(children.length).toBe(expectData.length);
                for (let i = 0; i < children.length; i++) {
                    expect(children[i].getKey()).toBe(expectData[i]);
                }
            };

            //@ts-ignore
            check(hierarchy.getChildren(null, rs));
        });
    });

    describe('.hasDeclaredChildren()', () => {
        test('should return the field value', () => {
            rs.each((record, i) => {
                //@ts-ignore
                expect(hierarchy.hasDeclaredChildren(record)).toBe(data[i].hasChildren);
            });
        });
    });

    describe('.hasParent()', () => {
        test('should work with the record', () => {
            rs.each((record, i) => {
                const parent = hierarchy.hasParent(record, rs);
                //@ts-ignore
                expect(parent).toBe(!!data[i].parent);
            });
        });

        test('should work with the value', () => {
            rs.each((record, i) => {
                //@ts-ignore
                const parent = hierarchy.hasParent(record.getKey(), rs);
                //@ts-ignore
                expect(parent).toBe(!!data[i].parent);
            });
        });

        test('should return false for rootKey node', () => {
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

            expect(hierarchy.hasParent(0 as any, rs)).toBe(false);
        });
    });

    describe('.getParent()', () => {
        test('should work with the record', () => {
            rs.each((record, i) => {
                const parent = hierarchy.getParent(record, rs);
                if (parent === null) {
                    //@ts-ignore
                    expect(parent).toBe(data[i].parent);
                } else {
                    //@ts-ignore
                    expect((parent as any).getKey()).toBe(data[i].parent);
                }
            });
        });

        test('should work with the value', () => {
            rs.each((record, i) => {
                //@ts-ignore
                const parent = hierarchy.getParent(record.getKey(), rs);
                if (parent === null) {
                    //@ts-ignore
                    expect(parent).toBe(data[i].parent);
                } else {
                    //@ts-ignore
                    expect((parent as any).getKey()).toBe(data[i].parent);
                }
            });
        });

        test('should work with link to 0', () => {
            data = [
                { id: 0, parent: null, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(1 as any, rs)).toBe(rs.at(0));
        });

        test('should work with link to null', () => {
            data = [{ id: 0, parent: null, title: 'foo' }];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should work with link to undefined', () => {
            data = [{ id: 0, title: 'foo' }];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should return root if parent property is empty', () => {
            data = [
                { id: 0, parent: null, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should return root if parent property is non exist', () => {
            data = [
                { id: 0, parent: 2, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should throw an Error with not existent value', () => {
            expect(() => {
                hierarchy.getParent('some' as any, rs);
            }).toThrow();
        });

        test('should return root if root and parent key specified', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 0, parent: 4, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should return root if parent key specified', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 0, parent: null, title: 'foo' },
                { id: 1, parent: 0, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should return null if node key equals rootKey', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 1, parent: 0, title: 'foo' },
                { id: 2, parent: 1, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(0 as any, rs)).toBeNull();
        });

        test('should return null if node is root without rootKey', () => {
            hierarchy = getRootKeyHierarchy();
            data = [
                { id: 1, parent: 0, title: 'foo' },
                { id: 2, parent: 1, title: 'bar' },
            ];
            rs = new RecordSet({
                rawData: data,
                keyProperty: 'id',
            });

            expect(hierarchy.getParent(1 as any, rs)).toBeNull();
        });

        test('should return null if node is root with rootKey', () => {
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
            //@ts-ignore
            expect(parent?.get('id')).toEqual(data[0].id);
        });
    });

    describe('hierarchy validation', () => {
        describe('.isValid()', () => {
            test('should validate without rootKey', () => {
                data = [
                    { id: 0, parent: 2, title: 'foo' },
                    { id: 1, parent: 0, title: 'bar' },
                ];
                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                expect(hierarchy.isValid(rs)).toBe(true);
            });

            test('should validate with only one root node', () => {
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

                expect(hierarchy.isValid(rs)).toBe(true);
            });

            test("shouldn't validate with two root nodes", () => {
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

                expect(hierarchy.isValid(rs)).toBe(false);
            });

            test("shouldn't validate with two null root nodes", () => {
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

                expect(hierarchyTest.isValid(rs)).toBe(false);
            });

            test("shouldn't validate with one null root node and detached node", () => {
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

                expect(hierarchy.isValid(rs)).toBe(false);
            });

            test("shouldn't validate with one root node and detached node", () => {
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

                expect(hierarchy.isValid(rs)).toBe(false);
            });

            test("shouldn't validate rs without rootKey", () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 2, parent: 1, title: 'foo' },
                    { id: 4, parent: 3, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                expect(hierarchy.isValid(rs)).toBe(false);
            });
        });

        describe('.validate()', () => {
            test('should not validate without rootKey', () => {
                data = [
                    { id: 0, parent: 2, title: 'foo' },
                    { id: 1, parent: 0, title: 'bar' },
                ];
                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                expect(() => {
                    return hierarchy.validate(rs);
                }).toThrow();
            });

            test('should validate with only one root node', () => {
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

                expect(() => {
                    return hierarchy.validate(rs);
                }).not.toThrow();
            });

            test("shouldn't validate with two root nodes", () => {
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

                expect(() => {
                    return hierarchy.validate(rs);
                }).toThrow();
            });

            test("shouldn't validate with two null root nodes", () => {
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

                expect(() => {
                    return hierarchyTest.validate(rs);
                }).toThrow();
            });

            test("shouldn't validate with one null root node and detached node", () => {
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

                expect(() => {
                    return hierarchy.validate(rs);
                }).toThrow();
            });

            test("shouldn't validate with one root node and detached node", () => {
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

                expect(() => {
                    return hierarchy.validate(rs);
                }).toThrow();
            });

            test('should validate rs without rootKey', () => {
                hierarchy = getRootKeyHierarchy();
                data = [
                    { id: 1, parent: 0, title: 'foo' },
                    { id: 2, parent: 1, title: 'foo' },
                ];

                rs = new RecordSet({
                    rawData: data,
                    keyProperty: 'id',
                });

                expect(() => {
                    return hierarchy.validate(rs);
                }).not.toThrow();
            });
        });
    });
});
