import Track from 'Types/_entity/functor/Track';

describe('Types/_entity/functor/Track', () => {
    describe('::create()', () => {
        test('should return Track functor', () => {
            const functor = Track.create(() => {
                return undefined;
            });
            expect(Track.isFunctor(functor)).toBe(true);
        });

        test('should return a functor with given propertyName', () => {
            const functor = Track.create(() => {
                return undefined;
            }, 'foo');
            expect(functor.propertyName).toEqual('foo');
        });
    });

    describe('::isFunctor()', () => {
        test('should return true for Track functor', () => {
            const functor = Track.create(() => {
                return undefined;
            });
            expect(Track.isFunctor(functor)).toBe(true);
        });
    });
});
