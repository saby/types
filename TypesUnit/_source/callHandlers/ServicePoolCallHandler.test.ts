import ServicePoolCallHandler from 'Types/_source/callHandler/ServicePoolCallHandler';
import { RPCRequestParam } from 'Types/_source/callHandler/RPCRequestParam';

describe('Types/source:ServicePoolCallHandler', () => {
    let handler: ServicePoolCallHandler;
    const checkResult = (url: string) => {
        expect(url).toContain('srv=1');
    };
    beforeEach(() => {
        handler = new ServicePoolCallHandler();
    });

    afterEach(() => {
        //@ts-ignore
        handler = undefined;
    });

    describe('.handle()', () => {
        test('should add service pool parameter to base url', () => {
            const params = {
                url: 'https://domain.com/page/reviews',
                method: 'POST',
                data: {},
                headers: {},
                timeout: 500,
                transport: {
                    _options: {
                        url: 'https://domain.com/page/reviews',
                    },
                    setUrl: checkResult,
                },
            } as RPCRequestParam;
            //@ts-ignore
            const setUrlSpy = jest.spyOn(params.transport, 'setUrl').mockClear();
            handler.handle(params);
            expect(setUrlSpy).toHaveBeenCalled();
        });

        test('should append service pool parameter to complex url', () => {
            const params = {
                url: 'https://domain.com/page/reviews?top=10&skip=10',
                method: 'POST',
                data: {},
                headers: {},
                timeout: 500,
                transport: {
                    _options: {
                        url: 'https://domain.com/page/reviews?top=10&skip=10',
                    },
                    setUrl: checkResult,
                },
            } as RPCRequestParam;
            //@ts-ignore
            const setUrlSpy = jest.spyOn(params.transport, 'setUrl').mockClear();

            handler.handle(params);
            expect(setUrlSpy).toHaveBeenCalled();
        });
    });
});
