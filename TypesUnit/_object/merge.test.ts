import merge from 'Types/_object/merge';

describe('Types/_object/merge', () => {
    test('should retrun ext object if origin is undefined', () => {
        const ext = {
            b: 1,
        };

        expect(merge(undefined, ext)).toEqual({ b: 1 });
    });

    test('should merge two objects', () => {
        const origin = {
            a: 1,
        };
        const ext = {
            b: 1,
        };

        expect(merge(origin, ext)).toEqual({ a: 1, b: 1 });
    });

    test('should replace value in the same fields', () => {
        const origin = {
            a: 1,
        };
        const ext = {
            a: 2,
        };

        merge(origin, ext);

        expect(origin.a).toEqual(2);
    });

    test('should merge two objects recursive', () => {
        const origin = {
            a: {
                b: 1,
                c: 2,
            },
        };
        const ext = {
            a: {
                c: 3,
            },
        };

        merge(origin, ext);

        expect(origin).toEqual({ a: { b: 1, c: 3 } });
    });

    test('should replace primitive with object', () => {
        const origin: any = {
            a: 1,
        };

        const ext = {
            a: {
                b: 2,
            },
        };

        merge(origin, ext);

        expect(origin).toEqual({ a: { b: 2 } });
    });

    test('should merge arrays', () => {
        const origin = ['one', 'two'];
        const ext = ['uno'];

        merge(origin, ext);

        expect(origin).toEqual(['uno', 'two']);
    });

    test('should merge array in object', () => {
        const origin = { foo: [1, 2, 3, 4] };
        const ext = { foo: [5, 4] };

        merge(origin, ext);

        expect(origin).toEqual({ foo: [5, 4, 3, 4] });
    });

    test('should merge Dates', () => {
        const soThen = new Date(0);
        const soNow = new Date(1);

        const origin: object = {
            then: soThen,
            now: new Date(2),
        };
        const ext: object = { now: soNow };

        const result = merge({}, origin, ext);

        expect(result).toEqual({
            then: soThen,
            now: soNow,
        });
    });

    test('should prevent endless recursiion', () => {
        const repeat = {
            a: {
                b: null,
            },
        };
        //@ts-ignore
        repeat.a.b = repeat;

        const result = merge(
            {
                a: {
                    b: {
                        a: {},
                    },
                },
            },
            repeat
        );

        //@ts-ignore
        expect(result.a.b.a).toBe(repeat.a);
    });

    test('should return merge if source is class from Core/Core-extend', () => {
        const classExt = function Gopa() {};
        const constructor = function () {};

        constructor.prototype = Object.prototype;
        //@ts-ignore
        classExt.prototype = new constructor();
        //@ts-ignore
        const obj = new classExt();
        obj.opa = 1;

        const result = merge({}, obj);

        expect(result.opa).toBe(1);
    });
});
