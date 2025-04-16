import retrospect, { RetrospectType } from 'Types/_formatter/retrospect';
import { controller } from 'I18n/i18n';
import en from 'I18n/locales/en';

describe('Types/_formatter/retrospect', () => {
    controller.addLang('en', en);

    beforeEach(() => {
        jest.spyOn(controller, 'isEnabled', 'get').mockReturnValue(true);
        jest.spyOn(controller, 'currentLang', 'get').mockReturnValue('en');
    });

    test("should format today's date", () => {
        const today = new Date();

        expect(String(retrospect(today, RetrospectType.Date))).toStrictEqual('Today');
    });

    test("should format yesterday's date", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        expect(String(retrospect(yesterday, RetrospectType.Date))).toStrictEqual('Yesterday');
    });

    test('should format long time ago', () => {
        const deepPast = new Date(2000, 1, 2);

        expect(retrospect(deepPast, RetrospectType.Date)).toStrictEqual('02.02.00');
    });
});
