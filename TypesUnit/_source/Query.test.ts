import Query, {
    andExpression,
    Join,
    Order,
    orExpression,
    playExpression,
    WhereExpression,
} from 'Types/_source/Query';
import Record from 'Types/_entity/Record';
import { IHashMap } from 'Types/_declarations';

interface IAtoG {
    a?: number;
    b?: number;
    c?: number;
    d?: number;
    e?: number;
    f?: number;
    g?: number;
}

describe('Types/_source/Query', () => {
    let query: Query;

    beforeEach(() => {
        query = new Query();
    });

    describe('.select()', () => {
        test('should set select from array', () => {
            const fields = ['id', 'name'];
            query.select(fields);
            expect(query.getSelect()).toEqual({ id: 'id', name: 'name' });
        });

        test('should set select from string', () => {
            const fields = ['id', 'name'];
            query.select(fields.join(','));
            expect(query.getSelect()).toEqual({ id: 'id', name: 'name' });
        });

        test('should throw an error fields is a invalid', () => {
            const fields: any = 12;
            expect(() => {
                query.select(fields);
            }).toThrow();
        });
    });

    describe('.clear()', () => {
        test('should clear query', () => {
            query.clear();
            expect(query.getSelect()).toEqual({});
        });
    });

    describe('.clone()', () => {
        test('should clone query', () => {
            expect(query).toEqual(query.clone());
        });

        test('should clone Record in meta', () => {
            const rec = new Record();
            rec.set('foo', 'bar');
            query.meta(rec);

            const clone = query.clone();
            expect(clone.getMeta()).toBeInstanceOf(Record);
            expect(clone.getMeta<Record>()).not.toEqual(rec);
            expect(clone.getMeta<Record>().isEqual(rec)).toBe(true);
        });
    });

    describe('.getAs()', () => {
        test('should return as', () => {
            query.from('product', 'item');
            expect(query.getAs()).toEqual('item');
        });
    });

    describe('.orderBy()', () => {
        test('should set order from string', () => {
            query.orderBy('customerId', true);

            expect(
                query.getOrderBy().map((item) => {
                    return [item.getSelector(), item.getOrder()];
                })
            ).toEqual([['customerId', true]]);
        });

        test('should set order from Object', () => {
            query.orderBy({ customerId: true, date: false });

            expect(
                query.getOrderBy().map((item) => {
                    return [item.getSelector(), item.getOrder()];
                })
            ).toEqual([
                ['customerId', true],
                ['date', false],
            ]);
        });

        test('should set order from Array', () => {
            query.orderBy([{ customerId: true }, { date: false }]);

            expect(
                query.getOrderBy().map((item) => {
                    return [item.getSelector(), item.getOrder()];
                })
            ).toEqual([
                ['customerId', true],
                ['date', false],
            ]);
        });

        test('should set nullPolicy as false', () => {
            query.orderBy('customerId', true, false);

            expect(
                query.getOrderBy().map((item) => {
                    return item.getNullPolicy();
                })
            ).toEqual([false]);
        });

        test('should set nullPolicy as true', () => {
            query.orderBy('customerId', true, true);

            expect(
                query.getOrderBy().map((item) => {
                    return item.getNullPolicy();
                })
            ).toEqual([true]);
        });

        test('should set nullPolicy from array', () => {
            query.orderBy([
                ['id', true, true],
                ['customerId', true, false],
            ]);

            expect(
                query.getOrderBy().map((item) => {
                    return [item.getSelector(), item.getOrder(), item.getNullPolicy()];
                })
            ).toEqual([
                ['id', true, true],
                ['customerId', true, false],
            ]);
        });
    });

    describe('.groupBy()', () => {
        test('should set group by from array', () => {
            const groupBy = ['date', 'customerId'];
            query.groupBy(groupBy);
            expect(query.getGroupBy()).toEqual(groupBy);
        });

        test('should set group by from string', () => {
            const groupBy = 'customerId';
            query.groupBy(groupBy);
            expect(query.getGroupBy()).toEqual([groupBy]);
        });

        test('should set group by from object', () => {
            const groupBy: any = { customerId: true };
            expect(() => {
                query.groupBy(groupBy);
            }).toThrow();
        });
    });

    describe('.where()', () => {
        test('should set expression as object', () => {
            const where: object = { id: 10 };
            query.where(where);
            expect(query.getWhere()).toBe(where);
        });

        test('should set expression as predicate', () => {
            const where = () => {
                return undefined;
            };
            query.where(where);
            expect(query.getWhere()).toBe(where);
        });

        test('should throw an error', () => {
            const where: any = 'where';
            expect(() => {
                query.where(where);
            }).toThrow();
        });
    });

    describe('.join()', () => {
        test('should set join', () => {
            query.join(
                'Customers',
                { id: 'customerId' },
                {
                    customerName: 'name',
                    customerEmail: 'email',
                }
            );
            expect(query.getJoin().length).toEqual(1);
        });
    });

    describe('.union()', () => {
        test('should set union queries', () => {
            const unionQueries = [new Query(), new Query()];
            query.union(...unionQueries);
            expect(query.getUnion()).toEqual(unionQueries);
        });

        test('should throw TypeError if there is no Query instance', () => {
            const unionQueries = [new Query(), {} as Query];

            expect(() => {
                query.union(...unionQueries);
            }).toThrow(TypeError);
        });
    });
});

describe('Types/_source/Query.Join', () => {
    let select: IHashMap<string>;
    let on: IHashMap<string>;
    let as: string;
    let resource: string;
    let inner: boolean;
    let join: Join;

    beforeEach(() => {
        select = { id: 'id', name: 'name' };
        on = { id: 'productId' };
        as = 'prod';
        resource = 'product';
        inner = true;
        join = new Join({
            resource,
            as,
            on,
            select,
            inner,
        });
    });

    describe('.getResource()', () => {
        test('should return resource', () => {
            expect(join.getResource()).toEqual(resource);
        });
    });

    describe('.getAs()', () => {
        test('should return as', () => {
            expect(join.getAs()).toEqual(as);
        });
    });
    describe('.getOn()', () => {
        test('should return on', () => {
            expect(join.getOn()).toEqual(on);
        });
    });

    describe('.getSelect()', () => {
        test('should return select', () => {
            expect(join.getSelect()).toEqual(select);
        });
    });

    describe('.isInner', () => {
        test('should return inner', () => {
            expect(join.isInner()).toEqual(inner);
        });
    });
});

describe('Types/_source/Query.Order', () => {
    describe('.getSelector()', () => {
        test('should return empty string by default', () => {
            const order = new Order();
            expect(order.getSelector()).toBe('');
        });

        test('should return value passed to the constructor', () => {
            const order = new Order({
                selector: 'test',
            });
            expect(order.getSelector()).toEqual('test');
        });
    });

    describe('.getOrder()', () => {
        test('should return false by default', () => {
            const order = new Order();
            expect(order.getOrder()).toBe(false);
        });

        test('should return boolean value passed to the constructor', () => {
            const order = new Order({
                selector: 'foo',
                order: false,
            });
            expect(order.getOrder()).toBe(false);
        });

        test('should return false from string "ASC" passed to the constructor', () => {
            const orderA = new Order({
                selector: 'foo',
                order: 'ASC',
            });
            expect(orderA.getOrder()).toBe(false);

            const orderB = new Order({
                selector: 'foo',
                order: 'asc',
            });
            expect(orderB.getOrder()).toBe(false);

            const orderC = new Order({
                selector: 'foo',
                order: 'Asc',
            });
            expect(orderC.getOrder()).toBe(false);
        });

        test('should return true from string "DESC" passed to the constructor', () => {
            const orderA = new Order({
                selector: 'foo',
                order: 'DESC',
            });
            expect(orderA.getOrder()).toBe(true);

            const orderB = new Order({
                selector: 'foo',
                order: 'desc',
            });
            expect(orderB.getOrder()).toBe(true);

            const orderC = new Order({
                selector: 'foo',
                order: 'Desc',
            });
            expect(orderC.getOrder()).toBe(true);
        });
    });

    describe('.getNullPolicy()', () => {
        test('should return false by default', () => {
            const order = new Order();
            expect(order.getNullPolicy()).toBe(true);
        });

        test('should return value opposite to "order" option', () => {
            const orderAsc = new Order({
                selector: 'foo',
                order: false,
            });
            expect(orderAsc.getNullPolicy()).toBe(true);

            const orderDesc = new Order({
                selector: 'foo',
                order: true,
            });
            expect(orderDesc.getNullPolicy()).toBe(false);
        });

        test('should return value passed to the constructor', () => {
            const orderWithTrue = new Order({
                selector: 'foo',
                nullPolicy: true,
            });
            expect(orderWithTrue.getNullPolicy()).toBe(true);

            const orderWithFalse = new Order({
                selector: 'foo',
                nullPolicy: false,
            });
            expect(orderWithFalse.getNullPolicy()).toBe(false);

            const orderWithOption = new Order({
                selector: 'foo',
                nullPolicy: true,
                order: true,
            });
            expect(orderWithOption.getNullPolicy()).toBe(true);
        });
    });
});

describe('Types/_source/Query.playExpression()', () => {
    function playToStack<T>(expr: WhereExpression<T>): (string | object)[] {
        const stack: (string | (string | unknown)[])[] = [];
        playExpression(
            expr,
            (key, value) => {
                return stack.push([key, value]);
            },
            (type) => {
                return stack.push('>' + type);
            },
            (type) => {
                return stack.push('<' + type);
            }
        );
        return stack;
    }

    test('should play an object as and-expression', () => {
        const stack = playToStack({ a: 1, b: 2 });
        expect(stack).toEqual(['>and', ['a', 1], ['b', 2], '<and']);
    });

    test('should play an array within an object as or-expression', () => {
        const stack = playToStack({
            a: 1,
            b: [2, 3],
            c: 4,
        });

        expect(stack).toEqual([
            '>and',
            ['a', 1],
            '>or',
            ['b', 2],
            ['b', 3],
            '<or',
            ['c', 4],
            '<and',
        ]);
    });

    test('should play and-expression', () => {
        const stack = playToStack(andExpression({ a: 1, b: 2 }, { c: 3 }, { d: 4 }));

        expect(stack).toEqual(['>and', ['a', 1], ['b', 2], ['c', 3], ['d', 4], '<and']);
    });

    test('should play or-expression', () => {
        const stack = playToStack(orExpression({ a: 1 }, { b: 2 }, { c: 3 }));

        expect(stack).toEqual(['>or', ['a', 1], ['b', 2], ['c', 3], '<or']);
    });

    test('should play and-expression within or-expression', () => {
        const stack = playToStack(orExpression({ a: 1 }, { b: 2, c: 3 }, { d: 4 }));

        expect(stack).toEqual([
            '>or',
            ['a', 1],
            '>and',
            ['b', 2],
            ['c', 3],
            '<and',
            ['d', 4],
            '<or',
        ]);
    });

    test('should play mixture of expressions', () => {
        const stack = playToStack(
            andExpression<IAtoG>({ a: 1, b: 2 }, orExpression({ c: 3, d: 4 }, { e: 5, f: 6 }), {
                g: 7,
            })
        );

        expect(stack).toEqual([
            '>and',
            ['a', 1],
            ['b', 2],
            '>or',
            '>and',
            ['c', 3],
            ['d', 4],
            '<and',
            '>and',
            ['e', 5],
            ['f', 6],
            '<and',
            '<or',
            ['g', 7],
            '<and',
        ]);
    });
});
