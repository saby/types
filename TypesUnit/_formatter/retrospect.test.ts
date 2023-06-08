import { assert } from 'chai';
import { stub } from 'sinon';
import retrospect, { RetrospectType } from 'Types/_formatter/retrospect';
import { controller } from 'I18n/i18n';
import enUS from 'I18n/locales/en-US';

describe('Types/_formatter/retrospect', () => {
    controller.addLocale('en-US', enUS);
    let stubEnabled;
    let stubGetLang;

    before(() => {
        stubEnabled = stub(controller, 'isEnabled');
        stubGetLang = stub(controller, 'currentLocale');
        stubEnabled.get(() => {
            return true;
        });
        stubGetLang.get(() => {
            return 'en-US';
        });
    });

    after(() => {
        stubEnabled.restore();
        stubGetLang.restore();
        stubEnabled = undefined;
        stubGetLang = undefined;
    });

    it("should format today's date", () => {
        const today = new Date();
        assert.strictEqual(
            String(retrospect(today, RetrospectType.Date)),
            'Today'
        );
    });

    it("should format yesterday's date", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        assert.strictEqual(
            String(retrospect(yesterday, RetrospectType.Date)),
            'Yesterday'
        );
    });

    it('should format long time ago', () => {
        const deepPast = new Date(2000, 1, 2);
        assert.strictEqual(
            retrospect(deepPast, RetrospectType.Date),
            '02.02.00'
        );
    });
});
