import { jest } from '@jest/globals';

jest.mock('WasabyLoader/ModulesLoader', () => ({
    loadAsync: jest.fn((moduleName: string) => {
        if (moduleName === 'i18n!EventsWebinarWidgets-meta') {
            return Promise.resolve((key: string) => {
                const translations: Record<string, string> = {
                    Организаторы: 'Organizers',
                    'Компании, связанные с проведением вебинара/мероприятия':
                        'Companies associated with the webinar/event',
                    Встречи: 'Appointments',
                };
                return translations[key] || key;
            });
        }
        return Promise.resolve(null);
    }),
    isLoaded: jest.fn(() => true),
}));

import { Meta, WidgetMeta } from 'Meta/types';
import { MetaService } from 'Meta/_types/network/MetaService';
import { createMetaInfo } from 'Meta/_types/baseMeta';
import { logger } from 'Application/Env';

describe('MetaService.translateInfo', () => {
    test('корректно переводит title, description и category', async () => {
        const metaService = new MetaService({});
        const metaInfo = createMetaInfo({
            description: 'Компании, связанные с проведением вебинара/мероприятия',
            title: 'Организаторы',
            category: 'Встречи',
        });

        const mockMeta = new Meta({
            id: 'EventsWebinarWidgets/organizers:View',
            info: metaInfo,
        }) as WidgetMeta;

        const result = await metaService.translateInfo([mockMeta]);

        expect(result[0].getTitle()).toEqual('Organizers');
        expect(result[0].getDescription()).toEqual('Companies associated with the webinar/event');
        expect(result[0].getCategory()).toEqual('Appointments');
    });

    test('логирует предупреждение, если отсутствует модуль перевода', async () => {
        const metaService = new MetaService({});
        const metaInfo = createMetaInfo({
            description: 'Компании, связанные с проведением вебинара/мероприятия',
            title: 'Организаторы',
            category: 'Встречи',
        });
        const mockMeta = new Meta({
            id: 'NoModuleName/organizers:View',
            info: metaInfo,
        }) as WidgetMeta;
        jest.spyOn(logger, 'warn').mockImplementation(jest.fn());
        const result = await metaService.translateInfo([mockMeta]);
        expect(logger.warn).toHaveBeenCalledWith(
            'Отсутствует файл с переводом заголовка/описания виджета NoModuleName/organizers:View, перевод должен находиться в модуле NoModuleName'
        );
        expect(result[0].getTitle()).toEqual('Организаторы');
        expect(result[0].getDescription()).toEqual(
            'Компании, связанные с проведением вебинара/мероприятия'
        );
        expect(result[0].getCategory()).toEqual('Встречи');
    });
});
