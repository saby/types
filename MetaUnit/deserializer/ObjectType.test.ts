import { deserialize, ObjectMeta, Meta } from 'Meta/types';
import { buildServiceResponse, TServiceResponse } from 'MetaUnit/utils/buildServiceResponse';
import { objectDesc } from 'MetaUnit/sampleData/object.sample';

describe('Десериализация ObjectType', () => {
    let meta: ObjectMeta<any>;
    beforeAll(() => {
        // @ts-ignore нужно исправить тип функции deserialize
        const metas = deserialize<TServiceResponse>(
            buildServiceResponse(objectDesc),
            true
        ) as unknown as ObjectMeta<any>[];
        meta = metas[0];
    });

    it('Десериализовался инстанс класса ObjectType', () => {
        expect(meta).toBeInstanceOf(ObjectMeta);
    });

    it('Десериализовался идентификатор типа', () => {
        expect(meta.getId()).toEqual('TableInfo');
    });

    it('Десериализовалась иерархия наследования типа', () => {
        // TableInfo <- object
        expect(meta.getInherits()).toEqual(['object']);
    });

    it('Десериализовался редактор группы свойств', () => {
        expect(meta.getComplexEditors()).toBeInstanceOf(Array);
        expect(meta.getComplexEditors()).toEqual([
            {
                name: 'Controls-editors/editors:NameDescription',
                properties: ['Comments', 'Name'],
            },
        ]);
    });

    describe('Десериализация свойств объекта', () => {
        it('Есть все свойства', () => {
            expect(Object.keys(meta.getProperties())).toHaveLength(4);
            expect(Object.keys(meta.getProperties())).toEqual([
                'Name',
                'Deprecated',
                'CreationDate',
                'Author',
            ]);
        });

        it('Все свойства являются экземпляром класса Meta', () => {
            for (const elementMeta of Object.values(meta.getProperties())) {
                expect(elementMeta).toBeInstanceOf(Meta);
            }
        });

        it('Указано название у свойств', () => {
            const expectedIds = ['Имя', 'Устаревшая', 'Дата создания', 'Автор'];

            expect(Object.values(meta.getProperties()).map((meta) => meta.getTitle())).toEqual(
                expectedIds
            );
        });

        it('Указан идентификатор типа у свойств', () => {
            const expectedIds = [
                'string→TableInfo→Name',
                'boolean→TableInfo→Deprecated',
                'date→TableInfo→CreationDate',
                'Person',
            ];

            expect(Object.values(meta.getProperties()).map((meta) => meta.getId())).toEqual(
                expectedIds
            );
        });

        it('Указан идентификатор типа у свойств', () => {
            const expectedIds = [
                'string→TableInfo→Name',
                'boolean→TableInfo→Deprecated',
                'date→TableInfo→CreationDate',
                'Person',
            ];

            expect(Object.values(meta.getProperties()).map((meta) => meta.getId())).toEqual(
                expectedIds
            );
        });

        it('Указано описание у свойств', () => {
            const expectedIds = [
                'Название таблицы',
                'Устаревшая таблица',
                'Дата создания таблицы',
                'Автор, создавший таблицу',
            ];

            expect(
                Object.values(meta.getProperties()).map((meta) => meta.getDescription())
            ).toEqual(expectedIds);
        });

        it('Указана категория у свойств', () => {
            const props = meta.getProperties();

            expect(props.Name.getCategory()).toEqual('Базовые свойства');
            expect(props.Deprecated.getCategory()).toEqual('Базовые свойства');
            expect(props.CreationDate.getCategory()).toEqual('Базовые свойства');
            expect(props.Author.getCategory()).toEqual('Мета-информация');
        });

        it('Указано значение по умолчанию у свойств', () => {
            const props = meta.getProperties();

            expect(props.Name.getDefaultValue()).toEqual('Безымяная таблица');
            expect(props.Author.getDefaultValue()).toEqual({
                FirstName: 'Иван',
                LastName: 'Иванов',
            });
        });

        it('Указан редактор и опции редактора на свойстве примитивного типа', () => {
            const nameMeta = meta.getProperties().Name;

            expect(nameMeta?.getEditor().getName?.()).toEqual('Controls-Input/inputConnected:Text');
            //@ts-ignore
            expect(nameMeta?.getEditor().props).toEqual({ 'font-size': '14px' });
        });

        it('Указан редактор и опции редактора на свойстве сложного типа Person', () => {
            const authorMeta = meta.getProperties().Author;

            expect(authorMeta?.getEditor().getName?.()).toEqual(
                'Controls-Name/nameConnected:Editor'
            );
            //@ts-ignore
            expect(authorMeta?.getEditor().props).toEqual({ 'font-weight': 'bold' });
        });

        it('Указан редактор и опции редактора на внутреннем свойстве FirstName сложного типа Person', () => {
            // @ts-ignore
            const firstNameMeta = meta.getProperties().Author.getProperties().FirstName;

            expect(firstNameMeta?.getEditor().getName?.()).toEqual(
                'Controls-Input/textConnected:String'
            );
            //@ts-ignore
            expect(firstNameMeta?.getEditor().props).toEqual({ 'font-weight': 'bold' });
        });

        it('Указаны опции редактора на внутреннем свойстве LastName сложного типа Person', () => {
            // @ts-ignore
            const lastNameMeta = meta.getProperties().Author.getProperties().LastName;

            //@ts-ignore
            expect(lastNameMeta?.getEditor().props).toEqual({ 'font-weight': 'bold' });
        });

        it('Указан признак скрытости у свойств', () => {
            const expected = [false, true, false, false];

            expect(Object.values(meta.getProperties()).map((meta) => meta.isHidden())).toEqual(
                expected
            );
        });

        it('Указан признак обязательности у свойств', () => {
            const expected = [true, false, true, true];

            expect(Object.values(meta.getProperties()).map((meta) => meta.isRequired())).toEqual(
                expected
            );
        });

        it('Указан порядок у свойств', () => {
            const expected = [0, 10, 20, 30];

            expect(Object.values(meta.getProperties()).map((meta) => meta.getOrder())).toEqual(
                expected
            );
        });

        it('readonly свойство десериализовалось как disabled', () => {
            expect(meta.getProperties().CreationDate.isDisabled()).toEqual(true);
        });
    });
});
