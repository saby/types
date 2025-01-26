import parse from 'Types/_parser/date';
import { controller } from 'I18n/i18n';

function resetLocale(): () => void {
    const stubConfig = jest.spyOn(controller, 'currentLocaleConfig', 'get').mockReturnValue({
        //@ts-ignore
        calendarEntities: {
            am: 'am',
            pm: 'pm',
        },
    });

    return () => {
        stubConfig.mockRestore();
    };
}

describe('Types/_parser/date', () => {
    let undo: ReturnType<typeof resetLocale>;

    beforeEach(() => {
        undo = resetLocale();
    });

    afterEach(() => {
        undo();
    });

    test('should return zero-like date from empty string', () => {
        const date = parse('', '');
        expect(date.getTime()).toEqual(0);
    });

    test('should parse one-digit year from Y', () => {
        const date = parse('1', 'Y');
        expect(date.getFullYear()).toEqual(2001);
    });

    test('should parse two-digit year from Y', () => {
        const date = parse('12', 'Y');
        expect(date.getFullYear()).toEqual(2012);
    });

    test('should parse year from YY', () => {
        const date = parse('19', 'YY');
        expect(date.getFullYear()).toEqual(2019);
    });

    test('should parse year from YYYY', () => {
        const date = parse('2019', 'YYYY');
        expect(date.getFullYear()).toEqual(2019);
    });

    test('should parse one-digit month from M', () => {
        const date = parse('1', 'M');
        expect(date.getMonth()).toEqual(0);
    });

    test('should parse two-digit month from M', () => {
        const date = parse('12', 'M');
        expect(date.getMonth()).toEqual(11);
    });

    test('should parse month from MM', () => {
        const date = parse('02', 'MM');
        expect(date.getMonth()).toEqual(1);
    });

    test('should parse one-digit date from D', () => {
        const date = parse('3', 'D');
        expect(date.getDate()).toEqual(3);
    });

    test('should parse two-digit date from D', () => {
        const date = parse('10', 'D');
        expect(date.getDate()).toEqual(10);
    });

    test('should parse date from DD', () => {
        const date = parse('03', 'DD');
        expect(date.getDate()).toEqual(3);
    });

    test('should parse one-digit hours from h', () => {
        const date = parse('1', 'h');
        expect(date.getHours()).toEqual(1);
    });

    test('should parse two-digit hours from h', () => {
        const date = parse('11', 'h');
        expect(date.getHours()).toEqual(11);
    });

    test('should parse hours from hh', () => {
        const date = parse('01', 'hh');
        expect(date.getHours()).toEqual(1);
    });

    test('should parse one-digit hours from H', () => {
        const date = parse('1', 'H');
        expect(date.getHours()).toEqual(1);
    });

    test('should parse two-digit hours from H', () => {
        const date = parse('11', 'H');
        expect(date.getHours()).toEqual(11);
    });

    test('should parse hours from HH', () => {
        const date = parse('02', 'HH');
        expect(date.getHours()).toEqual(2);
    });

    test('should parse AM value from hha', () => {
        const date = parse('01am', 'hha');
        expect(date.getHours()).toEqual(1);
    });

    test('should parse PM value from hha', () => {
        const date = parse('01pm', 'hha');
        expect(date.getHours()).toEqual(13);
    });

    test('should parse one-digit minutes from m', () => {
        const date = parse('1', 'm');
        expect(date.getMinutes()).toEqual(1);
    });

    test('should parse two-digit minutes from m', () => {
        const date = parse('22', 'm');
        expect(date.getMinutes()).toEqual(22);
    });

    test('should parse minutes from mm', () => {
        const date = parse('01', 'mm');
        expect(date.getMinutes()).toEqual(1);
    });

    test('should parse one-digit seconds from s', () => {
        const date = parse('1', 's');
        expect(date.getSeconds()).toEqual(1);
    });

    test('should parse two-digit seconds from s', () => {
        const date = parse('23', 's');
        expect(date.getSeconds()).toEqual(23);
    });

    test('should parse seconds from ss', () => {
        const date = parse('01', 'ss');
        expect(date.getSeconds()).toEqual(1);
    });

    test('should parse date from DD-MM', () => {
        const date = parse('01-03', 'DD-MM');
        expect(date.getDate()).toEqual(1);
        expect(date.getMonth()).toEqual(2);
    });

    test('should parse date from DD-MM-YY', () => {
        const date = parse('01-02-03', 'DD-MM-YY');
        expect(date.getDate()).toEqual(1);
        expect(date.getMonth()).toEqual(1);
        expect(date.getFullYear()).toEqual(2003);
    });

    test('should parse date from D-M-Y', () => {
        const date = parse('1-12-03', 'D-M-Y');
        expect(date.getDate()).toEqual(1);
        expect(date.getMonth()).toEqual(11);
        expect(date.getFullYear()).toEqual(2003);
    });

    test('should parse date from DD-MM-YYYY', () => {
        const date = parse('01-12-2003', 'DD-MM-YYYY');
        expect(date.getDate()).toEqual(1);
        expect(date.getMonth()).toEqual(11);
        expect(date.getFullYear()).toEqual(2003);
    });

    test('should parse date-time from D/M/YYYY H:mm:s', () => {
        const date = parse('1/2/2003 15:16:17', 'D/M/YYYY H:mm:s');
        expect(date.getDate()).toEqual(1);
        expect(date.getMonth()).toEqual(1);
        expect(date.getFullYear()).toEqual(2003);
        expect(date.getHours()).toEqual(15);
        expect(date.getMinutes()).toEqual(16);
        expect(date.getSeconds()).toEqual(17);
    });

    test('should parse date-time from D/M/YYYY for edge case leap years', () => {
        const date = parse('29/2/2024', 'D/M/YYYY');
        expect(date.getDate()).toEqual(29);
        expect(date.getMonth()).toEqual(1);
        expect(date.getFullYear()).toEqual(2024);
    });

    test('should parse date-time from YYYY/D/M for edge case leap years', () => {
        const date = parse('2024/29/2', 'YYYY/D/M');
        expect(date.getDate()).toEqual(29);
        expect(date.getMonth()).toEqual(1);
        expect(date.getFullYear()).toEqual(2024);
    });
});
