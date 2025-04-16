import Ulid from 'Types/_entity/applied/Ulid';

describe('Types/_entity/applied/Guid', () => {
    describe('::isValid()', () => {
        test('should return false by string', () => {
            expect(Ulid.isValid('checked value')).toBe(false);
            expect(Ulid.isValid('01ARYZ6S42UIOLXECSPDYZHGWT')).toBe(false);
            expect(Ulid.isValid('01ARYZ6S42UIOLXECSPDYZHG')).toBe(false);
        });

        test('should return true by ULID', () => {
            expect(Ulid.isValid('01ARYZ6S42YQRKXECSPDYZHGWT')).toBe(true);
        });
    });

    describe('::create()', () => {
        test('should return true for created ULID by default date', () => {
            expect(Ulid.isValid(Ulid.create())).toBe(true);
        });

        test('should return true for created ULID by user date', () => {
            const date = new Date();

            expect(Ulid.isValid(Ulid.create(date.getTime()))).toBe(true);
        });
    });
});
