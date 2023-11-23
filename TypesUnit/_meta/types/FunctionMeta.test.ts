import { expect } from 'chai';
import { FunctionMeta, Meta, MetaClass } from 'Types/meta';

describe('Types/_meta/meta', () => {
    describe('FunctionMeta', () => {
        it('наследует `Meta`', () => {
            const result = new FunctionMeta();
            expect(result).instanceOf(Meta);
        });

        describe('constructor()', () => {
            it('использует данные из описания', () => {
                const result = new FunctionMeta<(n: any) => void, void, any>({
                    is: MetaClass.function,
                    arguments: [{}],
                    result: {},
                });
                expect(result.getArguments()[0]).instanceOf(Meta);
                expect(result.getResult()).instanceOf(Meta);
            });

            it('игнорирует `defaultValue` из описания', () => {
                const result = new FunctionMeta({
                    is: MetaClass.function,
                    defaultValue: () => {
                        return null;
                    },
                });
                expect(result.getDefaultValue()).equal(undefined);
            });
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
                const arg = new Meta();
                const res = new Meta();
                const original = new FunctionMeta({
                    is: MetaClass.function,
                    id: 'toDescriptor5',
                    arguments: [arg],
                    result: res,
                });
                const result = original.toDescriptor();
                expect(result.is).equal(MetaClass.function);
                expect(result.id).equal('toDescriptor5');
                expect(result.arguments).deep.equal([arg]);
                expect(result.result).equal(res);
            });
        });

        describe('getDefaultValue()', () => {
            it('возвращает `undefined`', () => {
                const original = new FunctionMeta();
                (original as any)._defaultValue = 1;
                expect(original.getDefaultValue()).equal(undefined);
            });
        });

        describe('defaultValue()', () => {
            it('игнорирует аргумент', () => {
                const original = new FunctionMeta({ is: MetaClass.function });
                const result = original.defaultValue(1);
                expect(result).equal(original);
                expect(result.getDefaultValue()).equal(undefined);
            });
        });
    });
});
