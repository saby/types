import { ArrayMeta, FunctionMeta, Meta, MetaClass, PromiseMeta } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('ArrayMeta', () => {
        test('наследует класс `Meta`', () => {
            const result = new ArrayMeta({
                is: MetaClass.array,
                arrayOf: new Meta({}),
            });
            expect(result).toBeInstanceOf(Meta);
        });

        describe('constructor()', () => {
            test('преобразует описание `arrayOf` в экземпляр класса `Meta`', () => {
                const result = new ArrayMeta({
                    is: MetaClass.array,
                    arrayOf: { is: MetaClass.promise },
                });
                expect(result.getItemMeta()).toBeInstanceOf(PromiseMeta);
            });

            test('не создаёт новый экземпляр `arrayOf`, если это уже тип', () => {
                const arrayOf = new FunctionMeta();
                const result = new ArrayMeta({ is: MetaClass.array, arrayOf });
                expect(result.getItemMeta()).toEqual(arrayOf);
            });
        });

        describe('toDescriptor()', () => {
            test('преобразует тип в мета-описание', () => {
                const original = new ArrayMeta({
                    is: MetaClass.array,
                    id: 'toDescriptor3',
                    arrayOf: {},
                });
                const result = original.toDescriptor();
                expect(result.is).toEqual(MetaClass.array);
                expect(result.id).toEqual('toDescriptor3');
                expect(result.arrayOf).toBeInstanceOf(Meta);
            });
        });

        describe('of()', () => {
            test('создаёт новый экземпляр класса `ArrayMeta`', () => {
                const arrayOf1 = new Meta();
                const arrayOf2 = new Meta();
                const origin = new ArrayMeta({
                    is: MetaClass.array,
                    arrayOf: arrayOf1,
                });
                const result = origin.of(arrayOf2);
                expect(origin.getItemMeta()).toEqual(arrayOf1);
                expect(result).not.toEqual(origin);
                expect(result.getItemMeta()).toEqual(arrayOf2);
            });
        });
    });
});
