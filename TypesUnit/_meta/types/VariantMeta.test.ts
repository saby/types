/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import {
    VariantMeta,
    Meta,
    MetaClass,
    ObjectType,
    StringType,
} from 'Types/meta';


describe('Types/_meta/meta', () => {
    describe('UnionMeta', () => {
        it('наследует класс `Meta`', () => {
            const result = new VariantMeta();
            expect(result).instanceOf(Meta);
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
                const original = new VariantMeta({
                    is: MetaClass.variant,
                    id: 'toDescriptor',
                    fixedId: true,
                    invariant: 'type'
                }).of({
                    main: ObjectType.attributes({
                        type: StringType.defaultValue('main')
                    })
                });
                const result = original.toDescriptor();
                expect(result.is).equal(MetaClass.variant);
                expect(result.id).equal('toDescriptor');
                expect(Object.keys(result.types).length).equal(1);
                expect(result.types.main).instanceOf(Meta);
            });
        });

        describe('of()', () => {
            it('создаёт новый экземпляр класса `VariantMeta`', () => {
                const ImageType = ObjectType.attributes({
                    type: StringType.defaultValue('image'),
                    value: StringType,
                });
                const SbisDiskType = ObjectType.attributes({
                    type: StringType.defaultValue('sbisdisk'),
                    value: StringType,
                });
                const origin = new VariantMeta<{ type: string, value: string }>({
                    is: MetaClass.variant,
                    invariant: 'type'
                }).of({
                    image: ImageType,
                });

                const result = origin.of({
                    image: ImageType,
                    main: SbisDiskType,
                });

                expect(Object.keys(origin.getTypes()).length).equal(1);
                expect(origin.getTypes()).to.have.key('image');
                expect(origin.getTypes().image).is.eq(ImageType);
                expect(result).not.equal(origin);

                expect(Object.keys(result.getTypes()).length).equal(2);
                expect(result.getTypes()).to.have.property('image', ImageType);
                expect(result.getTypes()).to.have.property('main', SbisDiskType);
            });
        });
    });
});
