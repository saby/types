import PrimaryKey from 'Types/_entity/applied/PrimaryKey';

describe('Types/_entity/applied/PrimaryKey', () => {
    describe('.valueOf()', () => {
        test('should return original value', () => {
            const value = 123;
            const pk = new PrimaryKey(value);
            expect(pk.valueOf()).toBe(value);
            expect((pk as unknown as number) + 0).toBe(value);
        });
    });

    describe('.toJSON()', () => {
        test('should return original value', () => {
            const value = 123;
            const pk = new PrimaryKey(value);
            expect(pk.toJSON()).toBe(value);
            expect(JSON.stringify(pk)).toBe(String(value));
        });
    });
});
