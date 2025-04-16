import { ArrayMeta, FunctionMeta, Meta, MetaClass, ObjectMeta, PromiseMeta } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('meta()', () => {
        test('возвращает экземпляр класса `Meta` по-умолчанию', () => {
            const result = Meta.meta();
            expect(result).toBeInstanceOf(Meta);
        });

        test('возвращает экземпляр класса `Meta`, если передано пустое описание', () => {
            const result = Meta.meta({});
            expect(result).toBeInstanceOf(Meta);
        });

        test('возвращает экземпляр класса `ArrayType`, если предано описание с `arrayOf`', () => {
            const result = Meta.meta({ is: MetaClass.array, arrayOf: Meta.meta() });
            expect(result).toBeInstanceOf(ArrayMeta);
        });

        test('возвращает экземпляр класса `PromiseMeta`, если предано описание с `result`', () => {
            const result = Meta.meta({ is: MetaClass.promise, result: Meta.meta() });
            expect(result).toBeInstanceOf(PromiseMeta);
        });

        test('возвращает экземпляр класса `ObjectType`, если предано описание с `properties`', () => {
            const result = Meta.meta({ is: MetaClass.object, attributes: {} });
            expect(result).toBeInstanceOf(ObjectMeta);
        });

        test('возвращает экземпляр класса `FunctionType`, если предано описание с `function`', () => {
            const result = Meta.meta({ is: MetaClass.function });
            expect(result).toBeInstanceOf(FunctionMeta);
        });

        test('возвращает аргумент, если это экземпляр любого типа', () => {
            const item = Meta.meta();
            const result = Meta.meta(item);
            expect(result).toEqual(item);
        });

        test('возникает ошибка, если передано неверное описание типа', () => {
            expect(() => {
                return Meta.meta(1 as any);
            }).toThrow('Неверное мета-описание: 1');
            expect(() => {
                return Meta.meta([] as any);
            }).toThrow('Неверное мета-описание: []');
            expect(() => {
                return Meta.meta(null as any);
            }).toThrow('Неверное мета-описание: null');
            expect(() => {
                return Meta.meta(true as any);
            }).toThrow('Неверное мета-описание: true');
            expect(() => {
                return Meta.meta('Oops' as any);
            }).toThrow('Неверное мета-описание: "Oops"');
        });
    });
});
