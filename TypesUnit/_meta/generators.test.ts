import { expect } from 'chai';
import {
    ArrayMeta,
    FunctionMeta,
    Meta,
    meta,
    MetaClass,
    ObjectMeta,
    PromiseMeta,
} from 'Types/_meta/meta';

describe('Types/_meta/meta', () => {
    describe('meta()', () => {
        it('возвращает экземпляр класса `Meta` по-умолчанию', () => {
            const result = meta();
            expect(result).instanceOf(Meta);
        });

        it('возвращает экземпляр класса `Meta`, если передано пустое описание', () => {
            const result = meta({});
            expect(result).instanceOf(Meta);
        });

        it('возвращает экземпляр класса `ArrayType`, если предано описание с `arrayOf`', () => {
            const result = meta({ is: MetaClass.array, arrayOf: meta() });
            expect(result).instanceOf(ArrayMeta);
        });

        it('возвращает экземпляр класса `PromiseMeta`, если предано описание с `result`', () => {
            const result = meta({ is: MetaClass.promise, result: meta() });
            expect(result).instanceOf(PromiseMeta);
        });

        it('возвращает экземпляр класса `ObjectType`, если предано описание с `attributes`', () => {
            const result = meta({ is: MetaClass.object, attributes: {} });
            expect(result).instanceOf(ObjectMeta);
        });

        it('возвращает экземпляр класса `FunctionType`, если предано описание с `function`', () => {
            const result = meta({ is: MetaClass.function });
            expect(result).instanceOf(FunctionMeta);
        });

        it('возвращает аргумент, если это экземпляр любого типа', () => {
            const item = meta();
            const result = meta(item);
            expect(result).equal(item);
        });

        it('возникает ошибка, если передано неверное описание типа', () => {
            expect(() => {
                return meta(1 as any);
            }).to.throws('Неверное мета-описание: 1');
            expect(() => {
                return meta([] as any);
            }).to.throws('Неверное мета-описание: []');
            expect(() => {
                return meta(null as any);
            }).to.throws('Неверное мета-описание: null');
            expect(() => {
                return meta(true as any);
            }).to.throws('Неверное мета-описание: true');
            expect(() => {
                return meta('Oops' as any);
            }).to.throws('Неверное мета-описание: "Oops"');
        });
    });
});
