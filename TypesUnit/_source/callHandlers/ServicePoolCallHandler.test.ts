import { assert } from 'chai';
import { spy } from 'sinon';
import ServicePoolCallHandler from 'Types/_source/callHandler/ServicePoolCallHandler';
import { RPCRequestParam } from 'Types/_source/callHandler/RPCRequestParam';

describe('Types/source:ServicePoolCallHandler', () => {
    let handler: ServicePoolCallHandler;
    const checkResult = (url: string) => {
        assert.include(url, 'srv=1');
    };
    beforeEach(() => {
        handler = new ServicePoolCallHandler();
    });

    afterEach(() => {
        handler = undefined;
    });

    describe('.handle()', () => {
        it('should add service pool parameter to base url', () => {
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
            const setUrlSpy = spy(params.transport, 'setUrl');
            handler.handle(params);
            assert.isTrue(setUrlSpy.called);
        });

        it('should append service pool parameter to complex url', () => {
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
            const setUrlSpy = spy(params.transport, 'setUrl');

            handler.handle(params);
            assert.isTrue(setUrlSpy.called);
        });
    });
});
