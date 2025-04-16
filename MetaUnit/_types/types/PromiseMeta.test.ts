import { FunctionMeta, PromiseMeta, Meta, MetaClass } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('PromiseMeta', () => {
        test('наследует `Meta`', () => {
            const result = new PromiseMeta({
                is: MetaClass.promise,
                result: new Meta({}),
            });
            expect(result).toBeInstanceOf(Meta);
        });

        describe('constructor()', () => {
            test('преобразует описание `result` в экземпляр класса `Meta`', () => {
                const result = new PromiseMeta({
                    is: MetaClass.promise,
                    result: { is: MetaClass.function },
                });
                expect(result.getResult()).toBeInstanceOf(FunctionMeta);
            });

            test('не создаёт новый экземпляр `result`, если это уже тип', () => {
                const result = new Meta({});
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    result,
                });
                expect(original.getResult()).toEqual(result);
            });

            test('игнорирует `defaultValue` в описании', () => {
                const result = new PromiseMeta({
                    is: MetaClass.promise,
                    result: new Meta({}),
                    defaultValue: Promise.resolve(undefined),
                });
                expect(result.getDefaultValue()).toBeUndefined();
            });
        });

        describe('toDescriptor()', () => {
            test('преобразует тип в мета-описание', () => {
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    id: 'toDescriptor4',
                    result: {},
                });
                const result = original.toDescriptor();
                expect(result.is).toEqual(MetaClass.promise);
                expect(result.id).toEqual('toDescriptor4');
                expect(result.result).toBeInstanceOf(Meta);
            });
        });

        describe('getDefaultValue()', () => {
            test('возвращает `undefined`', () => {
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    result: {},
                });
                (original as any)._defaultValue = 1;
                expect(original.getDefaultValue()).toBeUndefined();
            });
        });

        describe('defaultValue()', () => {
            test('игнорирует аргумент', () => {
                const original = new PromiseMeta({
                    is: MetaClass.promise,
                    result: {},
                });
                const result = original.defaultValue(1);
                expect(result).toEqual(original);
                expect(result.getDefaultValue()).toBeUndefined();
            });
        });
    });
});
