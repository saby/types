import { ObjectType, StringType, NumberType, DateType } from 'Meta/types';
import { findTypeInSerialized } from 'MetaUnit/utils/findTypeInSerialized';
import { TMetaJsonNewSingle } from 'Meta/_types/marshalling/format';

const meta = ObjectType.id('CarType')
    .title('Автомобиль')
    .description('Описание объекта автомобиля')
    .category('Транспортное средство')
    .properties({
        brand: StringType.title('Марка').defaultValue('Toyota'),
        model: StringType.title('Модель').defaultValue('Corolla'),
        year: NumberType.title('Год выпуска'),
        date: DateType.id('CarType_date').title('Год выпуска').defaultValue(new Date()).disable(),
        owner: ObjectType.properties({
            firstName: StringType.title('Имя')
                .defaultValue('Иван')
                .editor('Module/UserName:Editor', { fontSize: '14px' }),
            lastName: StringType.title('Фамилия')
                .defaultValue('Иванов')
                .editorProps({ fontSize: '16px' }),
        }),
    })
    .feature('some_test_feature');

describe('Сериализация ObjectType', () => {
    const serialized = meta.saveMeta(true) as TMetaJsonNewSingle[];

    it('Сериализуется базовое описание объекта', () => {
        const carType = findTypeInSerialized(serialized, 'CarType');

        expect(carType).toBeDefined();

        expect(carType?.metatype).toEqual('object');
        expect(carType?.id).toEqual('CarType');
        expect(carType?.metaattributes?.title).toEqual('Автомобиль');
        expect(carType?.metaattributes?.description).toEqual('Описание объекта автомобиля');
        expect(carType?.metaattributes?.category).toEqual('Транспортное средство');
        expect(carType?.metaattributes?.required).toEqual(true);
    });

    it('Сериализуются свойства объекта', () => {
        const carType = findTypeInSerialized(serialized, 'CarType');

        carType?.properties.forEach((property) => {
            const propType = findTypeInSerialized(serialized, property.type);

            // @ts-ignore
            const expectMeta = meta.getProperties()[property.name];

            expect(propType).toBeDefined();

            expect(propType?.metaattributes?.title).toEqual(expectMeta.getTitle());
            expect(propType?.metaattributes?.description).toEqual(expectMeta.getDescription());
            expect(propType?.metaattributes?.category).toEqual(expectMeta.getCategory());
            expect(propType?.metaattributes?.required).toEqual(expectMeta.isRequired());
        });
    });

    it('Для свойства date атрибут disabled сериализуется как readonly', () => {
        const dateType = findTypeInSerialized(serialized, 'CarType_date');

        expect(dateType?.metaattributes?.readonly).toEqual(true);
    });

    it('Сериализуются свойства вложенного сложного типа на свойстве owner', () => {
        const ownerMeta = meta.getProperties().owner;
        const ownerType = findTypeInSerialized(serialized, ownerMeta.getId());

        ownerType?.properties.forEach((property) => {
            const propType = findTypeInSerialized(serialized, property.type);

            // @ts-ignore
            const expectMeta = ownerMeta.getProperties()[property.name];

            expect(propType).toBeDefined();

            expect(propType?.metaattributes?.title).toEqual(expectMeta.getTitle());
            expect(propType?.metaattributes?.description).toEqual(expectMeta.getDescription());
            expect(propType?.metaattributes?.category).toEqual(expectMeta.getCategory());
            expect(propType?.metaattributes?.required).toEqual(expectMeta.isRequired());
            expect(JSON.parse(propType?.metaattributes?.defaultValue as string)).toEqual(
                expectMeta.getDefaultValue()
            );
        });
    });

    it('Сериализуются описание свойства сложного типа', () => {
        const carType = findTypeInSerialized(serialized, 'CarType');

        carType?.properties.forEach((property) => {
            const propType = findTypeInSerialized(serialized, property.type);

            // @ts-ignore
            const expectMeta = meta.getProperties()[property.name];

            expect(propType).toBeDefined();

            expect(propType?.metaattributes?.title).toEqual(expectMeta.getTitle());
            expect(propType?.metaattributes?.description).toEqual(expectMeta.getDescription());
            expect(propType?.metaattributes?.category).toEqual(expectMeta.getCategory());
            expect(propType?.metaattributes?.required).toEqual(expectMeta.isRequired());
        });
    });
});
