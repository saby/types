import { fetch as metaFetch, fetchAll as metaFetchAll } from 'Meta/types';

// to mock
import * as deserializer from 'Meta/_types/marshalling/deserializer';
import { SbisService, DataSet, IProviderEndpoint } from 'Types/source';
import { MetaResponse } from 'Meta/_types/network/MetaResponse';

interface ITestMetaAll {
    name: string;
    data: {
        Ids: string[];
    };
    endpoint: IProviderEndpoint;
}
type TTestResponseAll = MetaResponse<ITestMetaAll>;

// Очень хотелось, чтобы тип аргументов был оригинальный, а тип результата - тестовый.
// Так вызов функции при проверке ts получается как у пользователей, и при этом не будет использования метатипов в юнит-тестировании fetch.
function convertFetchResultType(originalResult: MetaResponse[]): TTestResponseAll[] {
    return originalResult as unknown as TTestResponseAll[];
}
function convertFetchAllResultType(originalResult: MetaResponse): TTestResponseAll {
    return originalResult as unknown as TTestResponseAll;
}

describe('metaFetch', () => {
    let deserializeMock: Function;
    let serviceCallMock: Function;
    beforeEach(() => {
        deserializeMock = (json: unknown) => json;
        jest.spyOn(deserializer, 'default')
            .mockClear()
            .mockImplementation((json) => {
                return deserializeMock(json);
            });

        serviceCallMock = (rawData: ITestMetaAll) =>
            new DataSet({
                rawData,
            });
        jest.spyOn(SbisService.prototype, 'call')
            .mockClear()
            //@ts-ignore
            .mockImplementation(async function serviceCall(
                this: SbisService,
                name: string,
                data: object
            ) {
                return serviceCallMock({
                    name,
                    data,
                    endpoint: this.getEndpoint(),
                });
            });
    });

    test.skip('simple', async () => {
        const testId = 'test id';
        serviceCallMock = () => {
            return new DataSet({
                rawData: [
                    {
                        TypeName: testId,
                    },
                ],
            });
        };
        const fetchResult = await metaFetch({ ids: [testId] });
        const result = convertFetchResultType(fetchResult);
        expect(result[0].ok).toEqual(true);
        //@ts-ignore
        expect(result[0].meta().data.Id).toEqual(testId);
        expect(result[0].errorText).toEqual('');
    });

    test.skip('with endpoint', async () => {
        const testId = 'test id';
        const address = 'test/address';
        const contract = 'TestContract';
        const testEndpoint: IProviderEndpoint = {
            address,
            contract,
        };
        const fetchResult = await metaFetch({ ids: [testId], endpoint: testEndpoint });
        const result = convertFetchResultType(fetchResult);
        expect(result[0].ok).toEqual(true);
        // @ts-ignore
        expect(result[0].meta().data.Id).toEqual(testId);
        expect(result[0].meta().endpoint.address).toEqual(address);
        expect(result[0].meta().endpoint.contract).toEqual(contract);
    });

    test('deserialize error', async () => {
        const deserializerErrorText = 'deserialize error';
        deserializeMock = () => {
            throw new Error(deserializerErrorText);
        };
        jest.spyOn(console, 'error').mockClear().mockImplementation();

        const result = await metaFetch({ ids: ['test id'] });
        expect(result[0].ok).toEqual(false);
        expect(result[0].errorText).toEqual(deserializerErrorText);
    });

    test('service call error', async () => {
        const serviceCallErrorText = 'service call error';
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };

        const result = await metaFetch({ ids: ['test id'] });
        expect(result[0].ok).toEqual(false);
        expect(result[0].errorText).toEqual(serviceCallErrorText);
    });

    test('throw error wrong ids', async () => {
        expect(() => {
            return metaFetch({ ids: 'bad' as unknown as string[] });
        }).toThrow('Передан некорректный массив options.ids');
    });

    test('throw error if resource provided', async () => {
        expect(() => {
            // @ts-ignore
            return metaFetch('test/resource');
        }).toThrow('Неподдерживаемый тип аргумента options. Используйте IMetaFetchOptions');
    });

    test('try get meta of error responce', async () => {
        const serviceCallErrorText = 'service call error';
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };
        const errorMock = jest.spyOn(console, 'error').mockClear().mockImplementation();

        const result = await metaFetch({ ids: ['test id'] });
        expect(result[0].meta()).toEqual(undefined);
        expect(errorMock).toHaveBeenCalledWith(
            'Попытка получить результат, которого нет. ' +
                'Необходимо вызывать response.meta() только если response.ok равен true.'
        );
    });
});

describe('metaFetchAll', () => {
    let deserializeMock: Function;
    let serviceCallMock: Function;
    beforeEach(() => {
        deserializeMock = (json: unknown) => json;
        jest.spyOn(deserializer, 'default')
            .mockClear()
            .mockImplementation((json) => {
                return deserializeMock(json);
            });

        serviceCallMock = (rawData: ITestMetaAll) =>
            new DataSet({
                rawData,
            });
        jest.spyOn(SbisService.prototype, 'call')
            .mockClear()
            //@ts-ignore
            .mockImplementation(async function serviceCall(
                this: SbisService,
                name: string,
                data: object
            ) {
                return serviceCallMock({
                    name,
                    data,
                    endpoint: this.getEndpoint(),
                });
            });
    });

    test.skip('simple', async () => {
        const testIds = ['test id', 'test id 1'];
        const fetchResult = await metaFetchAll({ ids: testIds });
        const result = convertFetchAllResultType(fetchResult);
        expect(result.ok).toEqual(true);
        expect(result.meta().data.Ids).toEqual(testIds);
        expect(result.errorText).toEqual('');
    });

    test.skip('with endpoint', async () => {
        const testIds = ['test id', 'test id 1'];
        const address = 'test/address';
        const contract = 'TestContract';
        const testEndpoint: IProviderEndpoint = {
            address,
            contract,
        };
        const fetchResult = await metaFetchAll({
            ids: testIds,
            endpoint: testEndpoint,
        });
        const result = convertFetchAllResultType(fetchResult);
        expect(result.ok).toEqual(true);
        expect(result.meta().data.Ids).toEqual(testIds);
        expect(result.meta().endpoint.address).toEqual(address);
        expect(result.meta().endpoint.contract).toEqual(contract);
    });

    test('deserialize error', async () => {
        const deserializerErrorText = 'deserialize error';
        const testIds = ['test id', 'test id 1'];
        deserializeMock = () => {
            throw new Error(deserializerErrorText);
        };
        jest.spyOn(console, 'error').mockClear().mockImplementation();

        const result = await metaFetchAll({ ids: testIds });
        expect(result.ok).toEqual(false);
        expect(result.errorText).toEqual(deserializerErrorText);
    });

    test('service call error', async () => {
        const serviceCallErrorText = 'service call error';
        const testIds = ['test id', 'test id 1'];
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };

        const result = await metaFetchAll({ ids: testIds });
        expect(result.ok).toEqual(false);
        expect(result.errorText).toEqual(serviceCallErrorText);
    });

    test('throw error wrong ids', async () => {
        expect(() => {
            return metaFetchAll({ ids: 'bad' as unknown as string[] });
        }).toThrow('Передан некорректный массив options.ids');
    });

    test('try get meta of error response', async () => {
        const testIds = ['test id', 'test id 1'];
        const serviceCallErrorText = 'service call error';
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };
        const errorMock = jest.spyOn(console, 'error').mockClear().mockImplementation();

        const result = await metaFetchAll({ ids: testIds });
        expect(result.meta()).toEqual(undefined);
        expect(errorMock).toHaveBeenCalledWith(
            'Попытка получить результат, которого нет. ' +
                'Необходимо вызывать response.meta() только если response.ok равен true.'
        );
    });
});
