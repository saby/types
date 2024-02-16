import { expect } from 'chai';
import { ArrayMeta, FunctionMeta, Meta, MetaClass, PromiseMeta } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('ArrayMeta', () => {
        it('наследует класс `Meta`', () => {
            const result = new ArrayMeta({
                is: MetaClass.array,
                arrayOf: new Meta({}),
            });
            expect(result).instanceOf(Meta);
        });

        describe('constructor()', () => {
            it('преобразует описание `arrayOf` в экземпляр класса `Meta`', () => {
                const result = new ArrayMeta({
                    is: MetaClass.array,
                    arrayOf: { is: MetaClass.promise },
                });
                expect(result.getItemMeta()).instanceOf(PromiseMeta);
            });

            it('не создаёт новый экземпляр `arrayOf`, если это уже тип', () => {
                const arrayOf = new FunctionMeta();
                const result = new ArrayMeta({ is: MetaClass.array, arrayOf });
                expect(result.getItemMeta()).equal(arrayOf);
            });
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
                const original = new ArrayMeta({
                    is: MetaClass.array,
                    id: 'toDescriptor3',
                    arrayOf: {},
                });
                const result = original.toDescriptor();
                expect(result.is).equal(MetaClass.array);
                expect(result.id).equal('toDescriptor3');
                expect(result.arrayOf).instanceOf(Meta);
            });
        });

        describe('of()', () => {
            it('создаёт новый экземпляр класса `ArrayMeta`', () => {
                const arrayOf1 = new Meta();
                const arrayOf2 = new Meta();
                const origin = new ArrayMeta({
                    is: MetaClass.array,
                    arrayOf: arrayOf1,
                });
                const result = origin.of(arrayOf2);
                expect(origin.getItemMeta()).equal(arrayOf1);
                expect(result).not.equal(origin);
                expect(result.getItemMeta()).equal(arrayOf2);
            });
        });
    });
});
