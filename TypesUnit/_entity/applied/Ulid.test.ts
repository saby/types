import { assert } from 'chai';
import Ulid from 'Types/_entity/applied/Ulid';

describe('Types/_entity/applied/Guid', () => {
    describe('::isValid()', () => {
        it('should return false by string', () => {
            assert.isFalse(Ulid.isValid('checked value'));
            assert.isFalse(Ulid.isValid('01ARYZ6S42UIOLXECSPDYZHGWT'));
            assert.isFalse(Ulid.isValid('01ARYZ6S42UIOLXECSPDYZHG'));
        });

        it('should return true by ULID', () => {
            assert.isTrue(Ulid.isValid('01ARYZ6S42YQRKXECSPDYZHGWT'));
        });
    });

    describe('::create()', () => {
        it('should return true for created ULID by default date', () => {
            assert.isTrue(Ulid.isValid(Ulid.create()));
        });

        it('should return true for created ULID by user date', () => {
            const date = new Date();

            assert.isTrue(Ulid.isValid(Ulid.create(date.getTime())));
        });
    });
});
