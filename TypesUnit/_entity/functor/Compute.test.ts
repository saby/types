import Abstract from 'Types/_entity/functor/Abstract';
import Compute from 'Types/_entity/functor/Compute';

describe('Types/_entity/functor/Compute', () => {
    describe('::create()', () => {
        test('should return Compute functor', () => {
            const functor = Compute.create(() => {
                return undefined;
            });
            expect(Compute.isFunctor(functor)).toBe(true);
        });

        test('should return a functor with given properties', () => {
            const functor = Compute.create(() => {
                return undefined;
            }, ['foo', 'bar']);
            expect(functor.properties).toEqual(['foo', 'bar']);
        });

        test('should throw TypeError on invalid arguments', () => {
            let instance;

            expect(() => {
                instance = Compute.create(() => {
                    return undefined;
                }, {} as any);
            }).toThrow();

            expect(instance).not.toBeDefined();
        });
    });

    describe('::isFunctor()', () => {
        test('should return true for Compute functor', () => {
            const functor = Compute.create(() => {
                return undefined;
            });
            expect(Compute.isFunctor(functor)).toBe(true);
        });

        test('should return false for not Compute functor', () => {
            const functor = Abstract.create(() => {
                return undefined;
            });
            expect(Compute.isFunctor(functor)).toBe(false);
        });
    });
});
