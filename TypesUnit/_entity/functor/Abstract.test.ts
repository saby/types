import Abstract from 'Types/_entity/functor/Abstract';

describe('Types/_entity/functor/Abstract', () => {
    describe('.constructor()', () => {
        test('should return Abstract functor', () => {
            const functor = new Abstract(() => {
                return undefined;
            });
            expect(functor).toBeInstanceOf(Function);
            expect(Abstract.isFunctor(functor)).toBe(true);
        });
    });

    describe('::create()', () => {
        test('should return Abstract functor', () => {
            const functor = Abstract.create(() => {
                return undefined;
            });
            expect(functor).toBeInstanceOf(Function);
            expect(Abstract.isFunctor(functor)).toBe(true);
        });

        test('should return a callable functor', () => {
            const given = { a: undefined, b: undefined };
            const expectData = {
                a: 'foo',
                b: 'bar',
            };
            //@ts-ignore
            const functor = Abstract.create((a, b) => {
                given.a = a;
                given.b = b;
                return a + b;
            });

            const result = functor('foo', 'bar');
            expect(result).toEqual('foo' + 'bar');
            expect(given.a).toEqual(expectData.a);
            expect(given.b).toEqual(expectData.b);
        });

        test('should throw TypeError on invalid arguments', () => {
            let instance;

            expect(() => {
                instance = Abstract.create(undefined);
            }).toThrow();

            expect(() => {
                instance = Abstract.create([]);
            }).toThrow();

            expect(() => {
                instance = Abstract.create({});
            }).toThrow();

            expect(instance).not.toBeDefined();
        });
    });

    describe('::isFunctor()', () => {
        test('should return true for Abstract functor', () => {
            const functor = new Abstract(() => {
                return undefined;
            });
            expect(Abstract.isFunctor(functor)).toBe(true);
        });

        test('should return false for not a Functor', () => {
            expect(
                Abstract.isFunctor(() => {
                    return undefined;
                })
            ).toBe(false);
        });
    });
});
