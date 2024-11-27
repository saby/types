import fromSql from 'Types/_formatter/dateFromSql';

describe('Types/_formatter/dateFromSql', () => {
    const localTZ = new Date().getTimezoneOffset();
    const localTZHours = Math.floor(localTZ / 60);
    const localTZMinutes = localTZ - 60 * localTZHours;

    test('should return midnight of current date by default', () => {
        const date = fromSql('');
        const now = new Date();

        expect(date.getDate()).toStrictEqual(now.getDate());
        expect(date.getMonth()).toStrictEqual(now.getMonth());
        expect(date.getFullYear()).toStrictEqual(now.getFullYear());
        expect(date.getHours()).toStrictEqual(0);
        expect(date.getMinutes()).toStrictEqual(0);
        expect(date.getSeconds()).toStrictEqual(0);
    });

    test('should parse date', () => {
        const date = fromSql('2010-11-12');

        expect(date.getDate()).toStrictEqual(12);
        expect(date.getMonth()).toStrictEqual(10);
        expect(date.getFullYear()).toStrictEqual(2010);
    });

    test('should parse time', () => {
        const date = fromSql('23:59:41');

        expect(date.getHours()).toStrictEqual(23);
        expect(date.getMinutes()).toStrictEqual(59);
        expect(date.getSeconds()).toStrictEqual(41);
    });

    test('should parse time with timezone', () => {
        const date = fromSql('12:00:00+00');

        expect(date.getHours()).toStrictEqual(12 - localTZHours);
        expect(date.getMinutes()).toStrictEqual(0 - localTZMinutes);
    });

    test('should parse time without timezone as is', () => {
        const date = fromSql('12:00:00');

        expect(date.getHours()).toStrictEqual(12);
        expect(date.getMinutes()).toStrictEqual(0);
    });

    test('should apply time to given timezone', () => {
        const tz = 1;
        const date = fromSql('12:00:00', tz * 60);

        expect(date.getHours()).toStrictEqual(12 - tz - localTZHours);
        expect(date.getMinutes()).toStrictEqual(0);
    });

    test('should parse datetime', () => {
        const date = fromSql('2010-11-12 23:59:41');
        expect(date.getDate()).toStrictEqual(12);
        expect(date.getMonth()).toStrictEqual(10);
        expect(date.getFullYear()).toStrictEqual(2010);
        expect(date.getHours()).toStrictEqual(23);
        expect(date.getMinutes()).toStrictEqual(59);
        expect(date.getSeconds()).toStrictEqual(41);
    });

    test('should return corret time when it day on summer-winter time change', () => {
        jest.spyOn(Date.prototype, 'getTimezoneOffset').mockImplementation(function (): number {
            //@ts-ignore
            return this > new Date('2019-03-12 1:00:00+3') ? 540 : 600;
        });

        expect(fromSql('2019-03-10 03:00:00+03').getHours()).toStrictEqual(14);
    });
});
