import { expect } from 'chai';
import { FunctionMeta, PromiseMeta, Meta, MetaClass } from 'Types/_meta/meta';

describe('Types/_meta/meta', () => {
    describe('PromiseMeta', () => {
        it('наследует `Meta`', () => {
            const result = new PromiseMeta({
                is: MetaClass.promise,
                result: new Meta({}),
            });
            expect(result).instanceOf(Meta);
        });

        describe('constructor()', () => {
            it('преобразует описание `result` в экземпляр класса `Meta`', () => {
                const result = new PromiseMeta({
                    is: MetaClass.promise,
                    result: { is: MetaClass.function },
                });
                expect(result.getResult()).instanceOf(FunctionMeta);
            });

            it('не создаёт новый экземпляр `result`, если это уже тип', () => {
                const result = new Meta({});
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    result,
                });
                expect(original.getResult()).equal(result);
            });

            it('игнорирует `defaultValue` в описании', () => {
                const result = new PromiseMeta({
                    is: MetaClass.promise,
                    result: new Meta({}),
                    defaultValue: Promise.resolve(undefined),
                });
                expect(result.getDefaultValue()).equal(undefined);
            });
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    id: 'toDescriptor4',
                    result: {},
                });
                const result = original.toDescriptor();
                expect(result.is).equal(MetaClass.promise);
                expect(result.id).equal('toDescriptor4');
                expect(result.result).instanceOf(Meta);
            });
        });

        describe('getDefaultValue()', () => {
            it('возвращает `undefined`', () => {
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    result: {},
                });
                (original as any)._defaultValue = 1;
                expect(original.getDefaultValue()).equal(undefined);
            });
        });

        describe('defaultValue()', () => {
            it('игнорирует аргумент', () => {
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    result: {},
                });
                const result = original.defaultValue(1);
                expect(result).equal(original);
                expect(result.getDefaultValue()).equal(undefined);
            });
        });
    });
});
