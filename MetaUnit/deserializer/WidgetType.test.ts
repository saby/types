import { deserialize, Meta, WidgetMeta, RightMode } from 'Meta/types';
import { buildServiceResponse, TServiceResponse } from 'MetaUnit/utils/buildServiceResponse';
import { widgetDesc } from 'MetaUnit/sampleData/widget.sample';

describe('Десериализация WidgetType', () => {
    let meta: WidgetMeta<any>;
    beforeAll(() => {
        // @ts-ignore нужно исправить тип функции deserialize
        const metas = deserialize<TServiceResponse>(
            buildServiceResponse(widgetDesc),
            true
        ) as unknown as WidgetMeta<any>[];
        meta = metas[0];
    });

    it('Десериализовался инстанс класса WidgetMeta', () => {
        expect(meta).toBeInstanceOf(WidgetMeta);
    });

    it('Десериализовался идентификатор типа', () => {
        expect(meta.getId()).toEqual('TextInput');
    });

    it('Десериализовалась иерархия наследования типа', () => {
        // TextInput <- object
        expect(meta.getInherits()).toEqual(['widget']);
    });

    it('Десериализовалась фича виджета', () => {
        expect(meta.getFeature()).toEqual('some_test_feature');
    });

    it('Десериализовались права доступа виджета', () => {
        expect(meta.getAccess().rights).toEqual(['c4427c3a-4e92-4344-bb18-1a4e4ece0555']);
        expect(meta.getAccess().mode).toEqual(RightMode.all);
    });

    it('Десериализовалась ключевые слова виджета', () => {
        expect(meta.getKeywords()).toEqual(['поле', 'ввод', 'число']);
    });

    it('Десериализовался родитель виджета', () => {
        expect(meta.getParent()).toEqual('InputParent');
    });

    describe('Десериализация свойств виджета', () => {
        it('Есть все свойства', () => {
            expect(Object.keys(meta.getProperties())).toHaveLength(2);
            expect(Object.keys(meta.getProperties())).toEqual(['value', 'label']);
        });

        it('Все свойства являются экземпляром класса Meta', () => {
            for (const elementMeta of Object.values(meta.getProperties())) {
                expect(elementMeta).toBeInstanceOf(Meta);
            }
        });

        it('Указано название у свойств', () => {
            const expectedIds = ['Значение', 'Метка'];

            expect(Object.values(meta.getProperties()).map((meta) => meta.getTitle())).toEqual(
                expectedIds
            );
        });

        it('Указан идентификатор типа у свойств', () => {
            const expectedIds = ['string', 'string'];

            expect(Object.values(meta.getProperties()).map((meta) => meta.getId())).toEqual(
                expectedIds
            );
        });
    });
});
