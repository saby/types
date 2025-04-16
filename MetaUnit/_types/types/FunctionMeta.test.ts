import {
    FunctionMeta,
    ObjectType,
    FunctionType,
    RemoteProcedureType,
    StringType,
    Meta,
    MetaClass,
} from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('FunctionMeta', () => {
        test('наследует `Meta`', () => {
            const result = new FunctionMeta();
            expect(result).toBeInstanceOf(Meta);
        });

        describe('constructor()', () => {
            test('использует данные из описания', () => {
                const result = new FunctionMeta<(n: any) => void, void, any>({
                    is: MetaClass.function,
                    arguments: [{}],
                    result: {},
                });
                expect(result.getArguments()?.[0]).toBeInstanceOf(Meta);
                expect(result.getResult()).toBeInstanceOf(Meta);
            });

            test('игнорирует `defaultValue` из описания', () => {
                const result = new FunctionMeta({
                    is: MetaClass.function,
                    defaultValue: () => {
                        return null;
                    },
                });
                expect(result.getDefaultValue()).toBeUndefined();
            });
        });

        describe('toDescriptor()', () => {
            test('преобразует тип в мета-описание', () => {
                const arg = new Meta();
                const res = new Meta();
                const original = new FunctionMeta({
                    is: MetaClass.function,
                    id: 'toDescriptor5',
                    arguments: [arg],
                    result: res,
                });
                const result = original.toDescriptor();
                expect(result.is).toEqual(MetaClass.function);
                expect(result.id).toEqual('toDescriptor5');
                expect(result.arguments).toEqual([arg]);
                expect(result.result).toEqual(res);
            });
        });

        describe('getDefaultValue()', () => {
            test('возвращает `undefined`', () => {
                const original = new FunctionMeta();
                (original as any)._defaultValue = 1;
                expect(original.getDefaultValue()).toBeUndefined();
            });
        });

        describe('defaultValue()', () => {
            test('игнорирует аргумент', () => {
                const original = new FunctionMeta({ is: MetaClass.function });
                const result = original.defaultValue(1);
                expect(result).toEqual(original);
                expect(result.getDefaultValue()).toBeUndefined();
            });
        });

        describe('получение origin для аргументов ', () => {
            test('FunctionMeta не получает origin для аргументов', () => {
                const fnType = FunctionType.id('FunctionExample').arguments(
                    StringType.id('caption').title('Текст')
                );

                const original = ObjectType.id('ObjectExample')
                    .properties({
                        a: fnType,
                    })
                    .editor('pathToEditor');
                //@ts-ignore
                const result = original.properties().a.getArguments()[0].getOrigin();
                expect(result).toBeUndefined();
            });

            test('RemoteProcedureMeta получает origin для аргументов, если редактор задан на родителе', () => {
                const rpcType = RemoteProcedureType.id('RemoteProcedureTypeExample').arguments(
                    StringType.id('caption').title('Текст')
                );

                const original = ObjectType.id('ObjectExample')
                    .properties({
                        a: rpcType,
                    })
                    .editor('pathToEditor');
                //@ts-ignore
                const result = original.properties().a.getArguments()[0].getOrigin().meta;
                expect(result).toEqual(original);
            });
            test('RemoteProcedureMeta получает origin для аргументов, если редактор задан на типе', () => {
                const rpcType = RemoteProcedureType.id('RemoteProcedureTypeExample')
                    .arguments(StringType.id('caption').title('Текст'))
                    .editor('pathToEditor');
                const result = rpcType.getArguments()?.[0].getOrigin()?.meta;
                expect(result).toEqual(rpcType);
            });
        });
    });
});
