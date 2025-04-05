import OneToMany from 'Types/_entity/relation/OneToMany';
import Model from 'Types/_entity/Model';

describe('Types/_entity/relation/OneToMany', () => {
    //@ts-ignore
    const addChildren = (mediator, parent, children) => {
        for (let i = 0; i < children.length; i++) {
            mediator.addTo(parent, children[i], 'rel' + i);
        }
    };
    //@ts-ignore
    const removeChildren = (mediator, parent, children) => {
        for (let i = 0; i < children.length; i++) {
            mediator.removeFrom(parent, children[i]);
        }
    };
    const getParentAsSimple = () => {
        return 'parent';
    };
    const getChildrenAsSimple = () => {
        return ['child0', 'child1', 'child2'];
    };
    const getParentAsObject = () => {
        return { name: 'parent' };
    };
    const getChildrenAsObjects = () => {
        return [{ name: 'child0' }, { name: 'child1' }, { name: 'child2' }];
    };
    //@ts-ignore
    const checkParent = (mediator, parent, children) => {
        for (let i = 0; i < children.length; i++) {
            expect(mediator.getParent(children[i])).toBe(parent);
        }
    };
    //@ts-ignore
    const checkChildren = (mediator, parent, children, unrelated?) => {
        let i = 0;
        //@ts-ignore
        mediator.each(parent, (child, name) => {
            expect(child).toBe(children[i]);
            expect(name).toEqual(unrelated ? undefined : 'rel' + i);
            i++;
        });
        expect(i).toBe(children.length);
    };
    let mediator: OneToMany;

    beforeEach(() => {
        mediator = new OneToMany();
    });

    afterEach(() => {
        mediator.destroy();
    });

    describe('.addTo()', () => {
        test('should add a relation for primitives', () => {
            const parent = getParentAsSimple();
            const children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
            checkChildren(mediator, parent, children);
        });

        test('should add a relation for objects', () => {
            const parent = getParentAsObject();
            const children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
            checkChildren(mediator, parent, children);
        });

        test('should add same children for several parents', () => {
            const parent1 = 'parent1';
            const parent2 = 'parent2';
            const children = getChildrenAsSimple();

            addChildren(mediator, parent1, children);
            addChildren(mediator, parent2, children);
            checkParent(mediator, parent2, children);
            checkChildren(mediator, parent1, children, true);
            checkChildren(mediator, parent2, children);
        });
    });

    describe('.removeFrom()', () => {
        test('should remove a relation for primitives', () => {
            const parent = getParentAsSimple();
            const children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            removeChildren(mediator, parent, children);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
        });

        test('should remove a relation for objects', () => {
            const parent = getParentAsObject();
            const children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            removeChildren(mediator, parent, children);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
        });

        test('should remove same children for several parents', () => {
            const parent1 = 'parent1';
            const parent2 = 'parent2';
            const children = getChildrenAsSimple();

            addChildren(mediator, parent1, children);
            addChildren(mediator, parent2, children);

            removeChildren(mediator, parent1, children);
            checkParent(mediator, parent2, children);
            checkChildren(mediator, parent1, []);
            checkChildren(mediator, parent2, children);

            removeChildren(mediator, parent2, children);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent1, []);
            checkChildren(mediator, parent2, []);
        });
    });

    describe('.clear()', () => {
        test('should work for primitives', () => {
            const parent = getParentAsSimple();
            const children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            //@ts-ignore
            mediator.clear(parent);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
        });

        test('should work for objects', () => {
            const parent = getParentAsObject();
            const children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            mediator.clear(parent);
            checkParent(mediator, undefined, children);
            checkChildren(mediator, parent, []);
        });
    });

    describe('.each()', () => {
        test('should not call handler by default', () => {
            let called = false;
            //@ts-ignore
            mediator.each('a', () => {
                called = true;
            });
            expect(called).toBe(false);

            mediator.each({}, () => {
                called = true;
            });
            expect(called).toBe(false);
        });

        test('should return children for primitives', () => {
            const parent = getParentAsSimple();
            const children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            checkChildren(mediator, parent, children);
        });

        test('should return children for objects', () => {
            const parent = getParentAsObject();
            const children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            checkChildren(mediator, parent, children);
        });
    });

    describe('.getParent()', () => {
        test('should return undefined by default', () => {
            //@ts-ignore
            expect(mediator.getParent('a')).not.toBeDefined();
            expect(mediator.getParent({})).not.toBeDefined();
            expect(mediator.getParent(new Model())).not.toBeDefined();
        });

        test('should return parent for primitives', () => {
            const parent = getParentAsSimple();
            const children = getChildrenAsSimple();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
        });

        test('should return parent for objects', () => {
            const parent = getParentAsObject();
            const children = getChildrenAsObjects();

            addChildren(mediator, parent, children);
            checkParent(mediator, parent, children);
        });
    });
});
