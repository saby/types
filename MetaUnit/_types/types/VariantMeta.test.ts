/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VariantMeta, Meta, MetaClass, ObjectType, StringType } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('VariantMeta', () => {
        test('наследует класс `Meta`', () => {
            const result = new VariantMeta();
            expect(result).toBeInstanceOf(Meta);
        });

        describe('toDescriptor()', () => {
            test('преобразует тип в мета-описание', () => {
                const original = new VariantMeta({
                    is: MetaClass.variant,
                    id: 'toDescriptor',
                    fixedId: true,
                    invariant: 'type',
                }).of({
                    main: ObjectType.properties({
                        type: StringType.defaultValue('main'),
                    }),
                });
                const result = original.toDescriptor();
                expect(result.is).toEqual(MetaClass.variant);
                expect(result.id).toEqual('toDescriptor');
                //@ts-ignore
                expect(Object.keys(result.types).length).toEqual(1);
                expect(result.types?.main).toBeInstanceOf(Meta);
            });
        });

        describe('of()', () => {
            test('создаёт новый экземпляр класса `VariantMeta`', () => {
                const ImageType = ObjectType.properties({
                    type: StringType.defaultValue('image'),
                    value: StringType,
                });
                const SbisDiskType = ObjectType.properties({
                    type: StringType.defaultValue('sbisdisk'),
                    value: StringType,
                });
                //@ts-ignore
                const origin = new VariantMeta<{ type: string; value: string }>({
                    is: MetaClass.variant,
                    invariant: 'type',
                }).of({
                    image: ImageType,
                });

                const result = origin.of({
                    image: ImageType,
                    main: SbisDiskType,
                });

                expect(Object.keys(origin.getTypes()).length).toEqual(1);
                expect(origin.getTypes()).toHaveProperty('image');
                expect(origin.getTypes().image).toEqual(ImageType);
                expect(result).not.toEqual(origin);

                expect(Object.keys(result.getTypes()).length).toEqual(2);
                expect(result.getTypes()).toHaveProperty('image', ImageType);
                expect(result.getTypes()).toHaveProperty('main', SbisDiskType);
            });
        });
    });
});
