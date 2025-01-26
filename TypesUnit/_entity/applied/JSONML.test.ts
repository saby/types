import JSONML from 'Types/_entity/applied/JSONML';

describe('Types/_entity/applied/JSONML', () => {
    const TEXT_JSONML = 'Hello world';
    const attributes = { class: 'someClass' };
    const children = ['Hello world'];

    const SIMPLE_NODE_JSONML = ['p'];
    const SIMPLE_NODE_WITH_ATTRS_JSONML = ['p', attributes];
    const SIMPLE_NODE_WITH_CHILDREN = ['p', ...children];
    const SIMPLE_NODE_WITH_ATTRS_CHILDREN = ['p', attributes, ...children];
    const FEW_NODES = [
        SIMPLE_NODE_JSONML,
        SIMPLE_NODE_WITH_ATTRS_CHILDREN,
        SIMPLE_NODE_WITH_ATTRS_JSONML,
        SIMPLE_NODE_WITH_CHILDREN,
    ];

    describe('isNode', () => {
        test('should return true', () => {
            expect(JSONML.isNode(SIMPLE_NODE_JSONML)).toBe(true);
            expect(JSONML.isNode(SIMPLE_NODE_WITH_CHILDREN)).toBe(true);
            expect(JSONML.isNode(SIMPLE_NODE_WITH_ATTRS_JSONML)).toBe(true);
            expect(JSONML.isNode(SIMPLE_NODE_WITH_ATTRS_CHILDREN)).toBe(true);
        });
        test('should return false', () => {
            expect(JSONML.isNode(FEW_NODES)).toBe(false);
            expect(JSONML.isNode(TEXT_JSONML)).toBe(false);
        });
    });

    describe('hasAttributes', () => {
        test('should return true', () => {
            expect(JSONML.hasAttributes(SIMPLE_NODE_WITH_ATTRS_JSONML)).toBe(true);
            expect(JSONML.hasAttributes(SIMPLE_NODE_WITH_ATTRS_CHILDREN)).toBe(true);
        });
        test('should return false', () => {
            expect(JSONML.hasAttributes(TEXT_JSONML)).toBe(false);
            expect(JSONML.hasAttributes(SIMPLE_NODE_WITH_CHILDREN)).toBe(false);
            expect(JSONML.hasAttributes(FEW_NODES)).toBe(false);
        });
    });

    describe('getAttributes', () => {
        test('should returns correct value', () => {
            expect(attributes).toEqual(JSONML.getAttributes(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
            expect(attributes).toEqual(JSONML.getAttributes(SIMPLE_NODE_WITH_ATTRS_JSONML));
            expect(JSONML.getAttributes(SIMPLE_NODE_WITH_CHILDREN)).not.toBeDefined();
            expect(JSONML.getAttributes(FEW_NODES)).not.toBeDefined();
        });
    });

    describe('hasChildNodes', () => {
        test('should return true', () => {
            expect(JSONML.hasChildNodes(SIMPLE_NODE_WITH_CHILDREN)).toBe(true);
            expect(JSONML.hasChildNodes(SIMPLE_NODE_WITH_ATTRS_CHILDREN)).toBe(true);
        });
        test('should return false', () => {
            expect(JSONML.hasChildNodes(TEXT_JSONML)).toBe(false);
            expect(JSONML.hasChildNodes(SIMPLE_NODE_WITH_ATTRS_JSONML)).toBe(false);
            expect(JSONML.hasChildNodes(FEW_NODES)).toBe(false);
        });
    });

    describe('getChildren', () => {
        test('should return correct value', () => {
            expect(children).toEqual(JSONML.getChildren(SIMPLE_NODE_WITH_CHILDREN));
            expect(children).toEqual(JSONML.getChildren(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
            expect(JSONML.getChildren(TEXT_JSONML)).not.toBeDefined();
            expect(FEW_NODES).toEqual(JSONML.getChildren(FEW_NODES));
        });
    });

    describe('prepend', () => {
        test('should add node', () => {
            const parent = ['p', 'World'];
            const children = 'Hello';
            JSONML.prepend(parent, children);
            expect(parent).toEqual(['p', 'Hello', 'World']);
        });
        test('should add multiple nodes', () => {
            const parent = ['p', 'World'];
            const children = [['em', 'Hello'], 'Good'];
            JSONML.prepend(parent, ...children);
            expect(parent).toEqual(['p', ['em', 'Hello'], 'Good', 'World']);
        });
        test('should not break attributes', () => {
            const parent = ['p', { style: 'color: blue;' }, 'World'];
            const children = 'Hello';
            JSONML.prepend(parent, children);
            expect(parent).toEqual(['p', { style: 'color: blue;' }, 'Hello', 'World']);
        });
        test("shouldn't touch text node", () => {
            const parent = 'text';
            const children = 'some';
            JSONML.prepend(parent, children);
            expect(parent).toEqual('text');
        });
    });
    describe('append', () => {
        test('should add node', () => {
            const parent = ['p', 'World'];
            const children = 'Hello';
            JSONML.append(parent, children);
            expect(parent).toEqual(['p', 'World', 'Hello']);
        });
        test('should add multiple nodes', () => {
            const parent = ['p', 'World'];
            const children = [['em', 'Hello'], 'Good'];
            JSONML.append(parent, ...children);
            expect(parent).toEqual(['p', 'World', ['em', 'Hello'], 'Good']);
        });
        test("shouldn't touch text node", () => {
            const parent = 'text';
            const children = 'some';
            JSONML.append(parent, children);
            expect(parent).toEqual('text');
        });
    });
    describe('setAttribute', () => {
        test('should change attribute', () => {
            const node = ['p', { style: 'color: blue;' }];
            const attribute = { name: 'title', value: 'hello world' };
            JSONML.setAttribute(node, attribute.name, attribute.value);
            expect(node).toEqual([
                'p',
                // @ts-ignore
                { style: 'color: blue;', title: 'hello world' },
            ]);
        });
        test('should create attributes', () => {
            const node = ['p'];
            const attribute = { name: 'title', value: 'hello world' };
            JSONML.setAttribute(node, attribute.name, attribute.value);
            expect(node).toEqual(['p', { title: 'hello world' }]);
        });
    });
    describe('getAttribute', () => {
        test('should return attribute', () => {
            const node = ['p', { style: 'color: blue;' }];
            expect('color: blue;').toEqual(JSONML.getAttribute(node, 'style'));
        });
        test('should return null if attribute is missing', () => {
            const node = ['p'];
            expect(JSONML.getAttribute(node, 'test')).toBeNull();
        });
    });
    describe('removeAttribute', () => {
        test('should remove attribute', () => {
            const node = ['p', { style: 'color: blue;' }];
            JSONML.removeAttribute(node, 'style');
            // @ts-ignore
            expect(node).toEqual(['p', {}]);
        });
    });
    describe('changeNodeName', () => {
        test('should change node name', () => {
            const node = ['p', 'hello world'];
            JSONML.changeNodeName(node, 'span');
            expect(node).toEqual(['span', 'hello world']);
        });
    });
    describe('removeChild', () => {
        test('should remove and return child', () => {
            const node = ['p', 'Hello', 'World'];
            expect('Hello').toEqual(JSONML.removeChild(node, 0));
        });
        test('should remove correctly on node with attributes', () => {
            const node = ['p', { style: 'color: blue;' }, 'Hello', 'World'];
            expect('Hello').toEqual(JSONML.removeChild(node, 0));
        });
    });
    describe('getNodeName', () => {
        test('should return name', () => {
            const node = ['p', 'Hello world'];
            expect('p').toEqual(JSONML.getNodeName(node));
        });
    });
    describe('replaceNode', () => {
        test('should replace node', () => {
            const node1 = ['p', { style: 'color: blue;' }, 'Hello world'];
            const node2 = ['span', { class: 'class' }, 'Bye world'];
            JSONML.replaceNode(node1, node2);
            // @ts-ignore
            expect(node1).toEqual(node2);
        });
    });
    describe('removeChildNodes', () => {
        test('should remove child nodes on node with attributes', () => {
            const node = ['p', { style: 'color: blue;' }, 'Hello', 'World'];
            JSONML.removeChildNodes(node);
            expect(node).toEqual(['p', { style: 'color: blue;' }]);
        });
        test('should remove child nodes on node without attributes', () => {
            const node = ['p', 'Hello', 'World'];
            JSONML.removeChildNodes(node);
            expect(node).toEqual(['p']);
        });
    });
    describe('removeAttributes', () => {
        test('should remove attributes', () => {
            const node = ['p', { style: 'color: blue;', width: 50 }, 'Hello', 'World'];
            JSONML.removeAttributes(node);
            expect(node).toEqual(['p', 'Hello', 'World']);
        });
    });
});
