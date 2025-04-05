import Guid from 'Types/_entity/applied/Guid';

describe('Types/_entity/applied/Guid', () => {
    describe('::isValid()', () => {
        test('should return false by string', () => {
            expect(Guid.isValid('checked value')).toBe(false);
        });

        test('should return true by GUID', () => {
            expect(Guid.isValid('86daddca-7e03-48c3-b0f5-63dd18979526')).toBe(true);
        });
    });
});
