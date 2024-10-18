import { assert } from 'chai';
import Guid from 'Types/_entity/applied/Guid';

describe('Types/_entity/applied/Guid', () => {
    describe('::isValid()', () => {
        it('should return false by string', () => {
            assert.isFalse(Guid.isValid('checked value'));
        });

        it('should return true by GUID', () => {
            assert.isTrue(Guid.isValid('86daddca-7e03-48c3-b0f5-63dd18979526'));
        });
    });
});
