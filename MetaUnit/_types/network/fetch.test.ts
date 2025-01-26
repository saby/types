import { fetch as metaFetch, fetchAll as metaFetchAll } from 'Meta/types';
import { expect } from 'chai';
import { createSandbox, SinonSandbox } from 'sinon';

// to mock
import * as deserializer from 'Meta/_types/marshalling/deserializer';
import { SbisService, DataSet, IProviderEndpoint } from 'Types/source';
import MetaResponse from 'Meta/_types/network/Response';

// test data typization
interface ITestMeta {
    name: string;
    data: {
        Id: string;
    };
    endpoint: IProviderEndpoint;
}
interface ITestMetaAll {
    name: string;
    data: {
        Ids: string[];
    };
    endpoint: IProviderEndpoint;
}
type TTestResponse = MetaResponse<ITestMeta>;
type TTestResponseAll = MetaResponse<ITestMetaAll>;

// Очень хотелось, чтобы тип аргументов был оригинальный, а тип результата - тестовый.
// Так вызов функции при проверке ts получается как у пользователей, и при этом не будет использования метатипов в юнит-тестировании fetch.
function convertFetchResultType(originalResult: MetaResponse[]): TTestResponse[] {
    return originalResult as unknown as TTestResponse[];
}
function convertFetchAllResultType(originalResult: MetaResponse): TTestResponseAll {
    return originalResult as unknown as TTestResponseAll;
}

describe('metaFetch', () => {
    let sandbox: SinonSandbox;
    let deserializeMock: Function;
    let serviceCallMock: Function;
    beforeEach(() => {
        sandbox = createSandbox();

        deserializeMock = (json: unknown) => json;
        sandbox.stub(deserializer, 'default').callsFake((json) => {
            return deserializeMock(json);
        });

        serviceCallMock = (rawData: ITestMeta) =>
            new DataSet({
                rawData,
            });
        sandbox
            .stub(SbisService.prototype, 'call')
            .callsFake(async function serviceCall(this: SbisService, name: string, data: object) {
                return serviceCallMock({
                    name,
                    data,
                    endpoint: this.getEndpoint(),
                });
            });
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('simple', async () => {
        const testId = 'test id';
        const fetchResult = await metaFetch({ ids: [testId] });
        const result = convertFetchResultType(fetchResult);
        expect(result[0].ok).equals(true);
        expect(result[0].meta().data.Id).equals(testId);
        expect(result[0].errorText).equals('');
    });

    it('with resource', async () => {
        const testId = 'test id';
        const testResource = 'test/resource';
        const fetchResult = await metaFetch(testResource, { ids: [testId] });
        const result = convertFetchResultType(fetchResult);
        expect(result[0].ok).equals(true);
        expect(result[0].meta().data.Id).equals(testId);
    });

    it('with endpoint', async () => {
        const testId = 'test id';
        const address = 'test/address';
        const contract = 'TestContract';
        const testEndpoint: IProviderEndpoint = {
            address,
            contract,
        };
        const fetchResult = await metaFetch({ ids: [testId], endpoint: testEndpoint });
        const result = convertFetchResultType(fetchResult);
        expect(result[0].ok).equals(true);
        expect(result[0].meta().data.Id).equals(testId);
        expect(result[0].meta().endpoint.address).equals(address);
        expect(result[0].meta().endpoint.contract).equals(contract);
    });

    it('deserialize error', async () => {
        const deserializerErrorText = 'deserialize error';
        deserializeMock = () => {
            throw new Error(deserializerErrorText);
        };
        sandbox.stub(console, 'error');

        const result = await metaFetch({ ids: ['test id'] });
        expect(result[0].ok).equals(false);
        expect(result[0].errorText).equals(deserializerErrorText);
    });

    it('service call error', async () => {
        const serviceCallErrorText = 'service call error';
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };

        const result = await metaFetch({ ids: ['test id'] });
        expect(result[0].ok).equals(false);
        expect(result[0].errorText).equals(serviceCallErrorText);
    });

    it('mix simple and error', async () => {
        const errorId = 'error id';
        const serviceCallErrorText = 'service call error';
        serviceCallMock = (rawData: ITestMeta) => {
            if (rawData.data.Id === errorId) {
                throw new Error(serviceCallErrorText);
            }
            return new DataSet({
                rawData,
            });
        };
        const testId = 'test id';
        const ids = [errorId, testId];
        const fetchResult = await metaFetch({ ids });
        const result = convertFetchResultType(fetchResult);

        expect(result.map((responce) => responce.ok)).deep.equals([false, true]);
        expect(result[0].errorText).equals(serviceCallErrorText);
        expect(result[1].meta().data.Id).equals(testId);
    });

    it('throw error wrong ids', async () => {
        const result = await metaFetch({ ids: 'bad' as unknown as string[] }).catch(
            (error: TypeError) => {
                return error.message;
            }
        );
        expect(result).equals('Передан некорректный массив id');
    });

    it('throw error resource and endpoint together', async () => {
        const result = await metaFetch('test/resource', {
            ids: ['any'],
            endpoint: {
                contract: 'TestContract',
                address: 'another-test/address',
            },
        }).catch((error: TypeError) => {
            return error.message;
        });
        expect(result).equals('Попытка задать путь до сервиса различными способами одновременно');
    });

    it('try get meta of error responce', async () => {
        const serviceCallErrorText = 'service call error';
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };
        const errorMock = sandbox.stub(console, 'error');

        const result = await metaFetch({ ids: ['test id'] });
        expect(result[0].meta()).equals(undefined);
        sandbox.assert.calledWithExactly(
            errorMock,
            'Попытка получить результат, которого нет. ' +
                'Необходимо вызывать response.meta() только если response.ok равен true.'
        );
    });
});

describe('metaFetchAll', () => {
    let sandbox: SinonSandbox;
    let deserializeMock: Function;
    let serviceCallMock: Function;
    beforeEach(() => {
        sandbox = createSandbox();

        deserializeMock = (json: unknown) => json;
        sandbox.stub(deserializer, 'default').callsFake((json) => {
            return deserializeMock(json);
        });

        serviceCallMock = (rawData: ITestMetaAll) =>
            new DataSet({
                rawData,
            });
        sandbox
            .stub(SbisService.prototype, 'call')
            .callsFake(async function serviceCall(this: SbisService, name: string, data: object) {
                return serviceCallMock({
                    name,
                    data,
                    endpoint: this.getEndpoint(),
                });
            });
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('simple', async () => {
        const testIds = ['test id', 'test id 1'];
        const fetchResult = await metaFetchAll({ ids: testIds });
        const result = convertFetchAllResultType(fetchResult);
        expect(result.ok).equals(true);
        expect(result.meta().data.Ids).equals(testIds);
        expect(result.errorText).equals('');
    });

    it('with resource', async () => {
        const testIds = ['test id', 'test id 1'];
        const testResource = 'test/resource';
        const fetchResult = await metaFetchAll(testResource, {
            ids: testIds,
        });
        const result = convertFetchAllResultType(fetchResult);
        expect(result.ok).equals(true);
        expect(result.meta().data.Ids).equals(testIds);
    });

    it('with endpoint', async () => {
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
        expect(result.ok).equals(true);
        expect(result.meta().data.Ids).equals(testIds);
        expect(result.meta().endpoint.address).equals(address);
        expect(result.meta().endpoint.contract).equals(contract);
    });

    it('deserialize error', async () => {
        const deserializerErrorText = 'deserialize error';
        const testIds = ['test id', 'test id 1'];
        deserializeMock = () => {
            throw new Error(deserializerErrorText);
        };
        sandbox.stub(console, 'error');

        const result = await metaFetchAll({ ids: testIds });
        expect(result.ok).equals(false);
        expect(result.errorText).equals(deserializerErrorText);
    });

    it('service call error', async () => {
        const serviceCallErrorText = 'service call error';
        const testIds = ['test id', 'test id 1'];
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };

        const result = await metaFetchAll({ ids: testIds });
        expect(result.ok).equals(false);
        expect(result.errorText).equals(serviceCallErrorText);
    });

    it('throw error wrong ids', async () => {
        const result = await metaFetchAll({ ids: 'bad' as unknown as string[] }).catch(
            (error: TypeError) => {
                return error.message;
            }
        );
        expect(result).equals('Передан некорректный массив id');
    });

    it('throw error resource and endpoint together', async () => {
        const result = await metaFetchAll('test/resource', {
            ids: ['any'],
            endpoint: {
                contract: 'TestContract',
                address: 'another-test/address',
            },
        }).catch((error: TypeError) => {
            return error.message;
        });
        expect(result).equals('Попытка задать путь до сервиса различными способами одновременно');
    });

    it('try get meta of error response', async () => {
        const testIds = ['test id', 'test id 1'];
        const serviceCallErrorText = 'service call error';
        serviceCallMock = () => {
            throw new Error(serviceCallErrorText);
        };
        const errorMock = sandbox.stub(console, 'error');

        const result = await metaFetchAll({ ids: testIds });
        expect(result.meta()).equals(undefined);
        sandbox.assert.calledWithExactly(
            errorMock,
            'Попытка получить результат, которого нет. ' +
                'Необходимо вызывать response.meta() только если response.ok равен true.'
        );
    });
});
