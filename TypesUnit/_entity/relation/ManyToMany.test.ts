import ManyToMany, { ClearType } from 'Types/_entity/relation/ManyToMany';
import 'Types/_entity/Model';

describe('Types/_entity/relation/ManyToMany', () => {
    //@ts-ignore
    const addRelationship = (mediator, master, slaves) => {
        for (let i = 0; i < slaves.length; i++) {
            mediator.addRelationship(master, slaves[i], 'rel' + i);
        }
    };
    //@ts-ignore
    const removeRelationship = (mediator, master, slaves) => {
        for (let i = 0; i < slaves.length; i++) {
            mediator.removeRelationship(master, slaves[i]);
        }
    };
    const getMasterAsSimple = () => {
        return 'master';
    };
    const getSlavesAsSimple = () => {
        return ['slave0', 'slave1', 'slave2'];
    };
    const getMasterAsObject = () => {
        return { name: 'master' };
    };
    const getSlavesAsObjects = () => {
        return [{ name: 'slave0' }, { name: 'slave1' }, { name: 'slave2' }];
    };
    //@ts-ignore
    const checkMasters = (mediator, masters, slaves) => {
        for (let i = 0; i < slaves.length; i++) {
            let j = 0;
            // eslint-disable-next-line no-loop-func
            //@ts-ignore
            mediator.belongsTo(slaves[i], (thisMaster, name) => {
                expect(thisMaster).toBe(masters[j]);
                expect(name).toEqual('rel' + i);
                j++;
            });
        }
    };
    //@ts-ignore
    const checkSlaves = (mediator, master, slaves, relOffset? = 0) => {
        let i = 0;

        //@ts-ignore
        mediator.hasMany(master, (slave, name) => {
            expect(slave).toBe(slaves[i]);
            expect(name).toEqual('rel' + (i + relOffset));
            i++;
        });
        expect(i).toBe(slaves.length);
    };
    let mediator: ManyToMany;

    beforeEach(() => {
        mediator = new ManyToMany();
    });

    afterEach(() => {
        mediator.destroy();
    });

    describe('.addRelationship()', () => {
        test('should add a relation for primitives', () => {
            const master = getMasterAsSimple();
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            checkMasters(mediator, [master], slaves);
            checkSlaves(mediator, master, slaves);
        });

        test('should add a relation for objects', () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            checkMasters(mediator, [master], slaves);
            checkSlaves(mediator, master, slaves);
        });

        test('should add same slaves for several masters', () => {
            const master1 = 'master1';
            const master2 = 'master2';
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, master1, slaves);
            addRelationship(mediator, master2, slaves);

            checkMasters(mediator, [master1, master2], slaves);
            checkSlaves(mediator, master1, slaves);
            checkSlaves(mediator, master2, slaves);
        });
    });

    describe('.removeRelationship()', () => {
        test('should remove a relation for primitives', () => {
            const master = getMasterAsSimple();
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            removeRelationship(mediator, master, slaves);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master, []);
        });

        test('should remove a relation for objects', () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            removeRelationship(mediator, master, slaves);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master, []);
        });

        test('should remove same slaves for several masters', () => {
            const master1 = 'master1';
            const master2 = 'master2';
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, master1, slaves);
            addRelationship(mediator, master2, slaves);

            removeRelationship(mediator, master1, slaves);
            checkMasters(mediator, [master2], slaves);
            checkSlaves(mediator, master1, []);
            checkSlaves(mediator, master2, slaves);

            removeRelationship(mediator, master2, slaves);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master1, []);
            checkSlaves(mediator, master2, []);
        });
    });

    describe('.clear()', () => {
        test('should remove slaves', () => {
            const master = getMasterAsSimple();
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            //@ts-ignore
            mediator.clear(master);
            checkMasters(mediator, [], slaves);
            checkSlaves(mediator, master, []);
        });

        test('should remove masters', () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            for (let i = 0; i < slaves.length; i++) {
                mediator.clear(slaves[i]);
                checkMasters(mediator, [], slaves.slice(0, i));
                checkSlaves(mediator, master, slaves.slice(i + 1), i + 1);
            }
        });

        test("shouldn't remove masters", () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            for (let i = 0; i < slaves.length; i++) {
                mediator.clear(slaves[i], ClearType.Slaves);
                checkMasters(mediator, [master], slaves);
            }
        });

        test("shouldn't remove slaves", () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            for (let i = 0; i < slaves.length; i++) {
                mediator.clear(slaves[i], ClearType.Masters);
                checkSlaves(mediator, master, slaves.slice(i + 1), i + 1);
            }
        });
    });

    describe('.hasMany()', () => {
        test('should not call handler by default', () => {
            let called = false;
            //@ts-ignore
            mediator.hasMany('a', () => {
                called = true;
            });
            expect(called).toBe(false);

            mediator.hasMany({}, () => {
                called = true;
            });
            expect(called).toBe(false);
        });

        test('should return slaves for primitives', () => {
            const master = getMasterAsSimple();
            const slaves = getSlavesAsSimple();
            let i = 0;

            addRelationship(mediator, master, slaves);
            //@ts-ignore
            mediator.hasMany(master, function (slave, name) {
                expect(slave).toBe(slaves[i]);
                expect(name).toBe('rel' + i);
                i++;
            });
        });

        test('should return slaves for objects', () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();
            let i = 0;

            addRelationship(mediator, master, slaves);
            mediator.hasMany(master, function (slave, name) {
                expect(slave).toBe(slaves[i]);
                expect(name).toBe('rel' + i);
                i++;
            });
        });
    });

    describe('.belongsTo()', () => {
        test('should not call handler by default', () => {
            let called = false;
            //@ts-ignore
            mediator.belongsTo('a', () => {
                called = true;
            });
            expect(called).toBe(false);

            mediator.belongsTo({}, () => {
                called = true;
            });
            expect(called).toBe(false);
        });

        test('should return master for primitives', () => {
            const master = getMasterAsSimple();
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, master, slaves);
            for (let i = 0; i < slaves.length; i++) {
                // eslint-disable-next-line no-loop-func
                //@ts-ignore
                mediator.belongsTo(slaves[i], (thisMaster, name) => {
                    expect(thisMaster).toBe(master);
                    expect(name).toBe('rel' + i);
                });
            }
        });

        test('should return master for objects', () => {
            const master = getMasterAsObject();
            const slaves = getSlavesAsObjects();

            addRelationship(mediator, master, slaves);
            for (let i = 0; i < slaves.length; i++) {
                // eslint-disable-next-line no-loop-func
                //@ts-ignore
                mediator.belongsTo(slaves[i], (thisMaster, name) => {
                    expect(thisMaster).toBe(master);
                    expect(name).toBe('rel' + i);
                });
            }
        });

        test('should return all masters', () => {
            const masters = [getMasterAsSimple(), getMasterAsObject()];
            const slaves = getSlavesAsSimple();

            addRelationship(mediator, masters[0], slaves);
            addRelationship(mediator, masters[1], slaves);

            for (let i = 0; i < slaves.length; i++) {
                let j = 0;
                // eslint-disable-next-line no-loop-func
                //@ts-ignore
                mediator.belongsTo(slaves[i], (thisMaster, name) => {
                    expect(thisMaster).toBe(masters[j]);
                    expect(name).toBe('rel' + i);
                    j++;
                });
            }
        });
    });
});
