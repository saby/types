import { expect } from 'chai';
import { ArrayMeta, FunctionMeta, Meta, MetaClass, ObjectMeta, PromiseMeta } from 'Types/meta';

describe('Types/_meta/meta', () => {
    describe('meta()', () => {
        it('возвращает экземпляр класса `Meta` по-умолчанию', () => {
            const result = Meta.meta();
            expect(result).instanceOf(Meta);
        });

        it('возвращает экземпляр класса `Meta`, если передано пустое описание', () => {
            const result = Meta.meta({});
            expect(result).instanceOf(Meta);
        });

        it('возвращает экземпляр класса `ArrayType`, если предано описание с `arrayOf`', () => {
            const result = Meta.meta({ is: MetaClass.array, arrayOf: Meta.meta() });
            expect(result).instanceOf(ArrayMeta);
        });

        it('возвращает экземпляр класса `PromiseMeta`, если предано описание с `result`', () => {
            const result = Meta.meta({ is: MetaClass.promise, result: Meta.meta() });
            expect(result).instanceOf(PromiseMeta);
        });

        it('возвращает экземпляр класса `ObjectType`, если предано описание с `attributes`', () => {
            const result = Meta.meta({ is: MetaClass.object, attributes: {} });
            expect(result).instanceOf(ObjectMeta);
        });

        it('возвращает экземпляр класса `FunctionType`, если предано описание с `function`', () => {
            const result = Meta.meta({ is: MetaClass.function });
            expect(result).instanceOf(FunctionMeta);
        });

        it('возвращает аргумент, если это экземпляр любого типа', () => {
            const item = Meta.meta();
            const result = Meta.meta(item);
            expect(result).equal(item);
        });

        it('возникает ошибка, если передано неверное описание типа', () => {
            expect(() => {
                return Meta.meta(1 as any);
            }).to.throws('Неверное мета-описание: 1');
            expect(() => {
                return Meta.meta([] as any);
            }).to.throws('Неверное мета-описание: []');
            expect(() => {
                return Meta.meta(null as any);
            }).to.throws('Неверное мета-описание: null');
            expect(() => {
                return Meta.meta(true as any);
            }).to.throws('Неверное мета-описание: true');
            expect(() => {
                return Meta.meta('Oops' as any);
            }).to.throws('Неверное мета-описание: "Oops"');
        });
    });
});
