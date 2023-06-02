import { assert } from 'chai';
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
        it('should return true', () => {
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_JSONML));
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_WITH_CHILDREN));
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_WITH_ATTRS_JSONML));
            assert.isTrue(JSONML.isNode(SIMPLE_NODE_WITH_ATTRS_CHILDREN));
        });
        it('should return false', () => {
            assert.isFalse(JSONML.isNode(FEW_NODES));
            assert.isFalse(JSONML.isNode(TEXT_JSONML));
        });
    });

    describe('hasAttributes', () => {
        it('should return true', () => {
            assert.isTrue(JSONML.hasAttributes(SIMPLE_NODE_WITH_ATTRS_JSONML));
            assert.isTrue(
                JSONML.hasAttributes(SIMPLE_NODE_WITH_ATTRS_CHILDREN)
            );
        });
        it('should return false', () => {
            assert.isFalse(JSONML.hasAttributes(TEXT_JSONML));
            assert.isFalse(JSONML.hasAttributes(SIMPLE_NODE_WITH_CHILDREN));
            assert.isFalse(JSONML.hasAttributes(FEW_NODES));
        });
    });

    describe('getAttributes', () => {
        it('should returns correct value', () => {
            assert.deepEqual(
                attributes,
                JSONML.getAttributes(SIMPLE_NODE_WITH_ATTRS_CHILDREN)
            );
            assert.deepEqual(
                attributes,
                JSONML.getAttributes(SIMPLE_NODE_WITH_ATTRS_JSONML)
            );
            assert.isUndefined(JSONML.getAttributes(SIMPLE_NODE_WITH_CHILDREN));
            assert.isUndefined(JSONML.getAttributes(FEW_NODES));
        });
    });

    describe('hasChildNodes', () => {
        it('should return true', () => {
            assert.isTrue(JSONML.hasChildNodes(SIMPLE_NODE_WITH_CHILDREN));
            assert.isTrue(
                JSONML.hasChildNodes(SIMPLE_NODE_WITH_ATTRS_CHILDREN)
            );
        });
        it('should return false', () => {
            assert.isFalse(JSONML.hasChildNodes(TEXT_JSONML));
            assert.isFalse(JSONML.hasChildNodes(SIMPLE_NODE_WITH_ATTRS_JSONML));
            assert.isFalse(JSONML.hasChildNodes(FEW_NODES));
        });
    });

    describe('getChildren', () => {
        it('should return correct value', () => {
            assert.deepEqual(
                children,
                JSONML.getChildren(SIMPLE_NODE_WITH_CHILDREN)
            );
            assert.deepEqual(
                children,
                JSONML.getChildren(SIMPLE_NODE_WITH_ATTRS_CHILDREN)
            );
            assert.isUndefined(JSONML.getChildren(TEXT_JSONML));
            assert.deepEqual(FEW_NODES, JSONML.getChildren(FEW_NODES));
        });
    });

    describe('prepend', () => {
        it('should add node', () => {
            const parent = ['p', 'World'];
            const children = 'Hello';
            JSONML.prepend(parent, children);
            assert.deepEqual(parent, ['p', 'Hello', 'World']);
        });
        it('should add multiple nodes', () => {
            const parent = ['p', 'World'];
            const children = [['em', 'Hello'], 'Good'];
            JSONML.prepend(parent, ...children);
            assert.deepEqual(parent, ['p', ['em', 'Hello'], 'Good', 'World']);
        });
        it('should not break attributes', () => {
            const parent = ['p', { style: 'color: blue;' }, 'World'];
            const children = 'Hello';
            JSONML.prepend(parent, children);
            assert.deepEqual(parent, [
                'p',
                { style: 'color: blue;' },
                'Hello',
                'World',
            ]);
        });
        it("shouldn't touch text node", () => {
            const parent = 'text';
            const children = 'some';
            JSONML.prepend(parent, children);
            assert.equal(parent, 'text');
        });
    });
    describe('append', () => {
        it('should add node', () => {
            const parent = ['p', 'World'];
            const children = 'Hello';
            JSONML.append(parent, children);
            assert.deepEqual(parent, ['p', 'World', 'Hello']);
        });
        it('should add multiple nodes', () => {
            const parent = ['p', 'World'];
            const children = [['em', 'Hello'], 'Good'];
            JSONML.append(parent, ...children);
            assert.deepEqual(parent, ['p', 'World', ['em', 'Hello'], 'Good']);
        });
        it("shouldn't touch text node", () => {
            const parent = 'text';
            const children = 'some';
            JSONML.append(parent, children);
            assert.equal(parent, 'text');
        });
    });
    describe('setAttribute', () => {
        it('should change attribute', () => {
            const node = ['p', { style: 'color: blue;' }];
            const attribute = { name: 'title', value: 'hello world' };
            JSONML.setAttribute(node, attribute.name, attribute.value);
            assert.deepEqual(node, [
                'p',
                // @ts-ignore
                { style: 'color: blue;', title: 'hello world' },
            ]);
        });
        it('should create attributes', () => {
            const node = ['p'];
            const attribute = { name: 'title', value: 'hello world' };
            JSONML.setAttribute(node, attribute.name, attribute.value);
            assert.deepEqual(node, ['p', { title: 'hello world' }]);
        });
    });
    describe('getAttribute', () => {
        it('should return attribute', () => {
            const node = ['p', { style: 'color: blue;' }];
            assert.equal('color: blue;', JSONML.getAttribute(node, 'style'));
        });
        it('should return null if attribute is missing', () => {
            const node = ['p'];
            assert.isNull(JSONML.getAttribute(node, 'test'));
        });
    });
    describe('removeAttribute', () => {
        it('should remove attribute', () => {
            const node = ['p', { style: 'color: blue;' }];
            JSONML.removeAttribute(node, 'style');
            // @ts-ignore
            assert.deepEqual(node, ['p', {}]);
        });
    });
    describe('changeNodeName', () => {
        it('should change node name', () => {
            const node = ['p', 'hello world'];
            JSONML.changeNodeName(node, 'span');
            assert.deepEqual(node, ['span', 'hello world']);
        });
    });
    describe('removeChild', () => {
        it('should remove and return child', () => {
            const node = ['p', 'Hello', 'World'];
            assert.equal('Hello', JSONML.removeChild(node, 0));
        });
        it('should remove correctly on node with attributes', () => {
            const node = ['p', { style: 'color: blue;' }, 'Hello', 'World'];
            assert.equal('Hello', JSONML.removeChild(node, 0));
        });
    });
    describe('getNodeName', () => {
        it('should return name', () => {
            const node = ['p', 'Hello world'];
            assert.equal('p', JSONML.getNodeName(node));
        });
    });
    describe('replaceNode', () => {
        it('should replace node', () => {
            const node1 = ['p', { style: 'color: blue;' }, 'Hello world'];
            const node2 = ['span', { class: 'class' }, 'Bye world'];
            JSONML.replaceNode(node1, node2);
            // @ts-ignore
            assert.deepEqual(node1, node2);
        });
    });
    describe('removeChildNodes', () => {
        it('should remove child nodes on node with attributes', () => {
            const node = ['p', { style: 'color: blue;' }, 'Hello', 'World'];
            JSONML.removeChildNodes(node);
            assert.deepEqual(node, ['p', { style: 'color: blue;' }]);
        });
        it('should remove child nodes on node without attributes', () => {
            const node = ['p', 'Hello', 'World'];
            JSONML.removeChildNodes(node);
            assert.deepEqual(node, ['p']);
        });
    });
    describe('removeAttributes', () => {
        it('should remove attributes', () => {
            const node = ['p', { style: 'color: blue;', width: 50 }, 'Hello', 'World'];
            JSONML.removeAttributes(node);
            assert.deepEqual(node, ['p', 'Hello', 'World']);
        });
    });
});
