import SbisBusinessLogic, { IRpcTransportOptions } from 'Types/_source/provider/SbisBusinessLogic';
import { ILogger } from 'Types/_util/logger';

class TransportMock {
    protected resolver: Promise<unknown> = Promise.resolve(null);

    constructor(options: IRpcTransportOptions) {
        TransportMock.lastOptions = options;
    }

    callMethod<T>(
        method: string,
        args: any,
        _recent?: boolean,
        _protocol?: number,
        cache?: unknown
    ): Promise<T> {
        TransportMock.lastMethod = method;
        TransportMock.lastArgs = args;
        TransportMock.lastCache = cache;
        return this.resolver as unknown as Promise<T>;
    }

    abort(): void {
        // Do nothing
    }

    static lastOptions: IRpcTransportOptions;
    static lastMethod: string;
    static lastArgs: any;
    static lastCache: unknown;
}

class DelayedMock extends TransportMock {
    protected resolver: Promise<unknown> = new Promise<unknown>((resolve) => {
        setTimeout(resolve, 50);
    });
}

class LoggerMock implements ILogger {
    lastType: string;
    lastTag: string;
    lastMessage: string | Error | undefined;

    log(tag: string, message?: string): void {
        this.lastType = 'log';
        this.lastTag = tag;
        this.lastMessage = message;
    }

    error(tag: string, message?: string | Error): void {
        this.lastType = 'error';
        this.lastTag = tag;
        this.lastMessage = message;
    }

    info(tag: string, message?: string): void {
        this.lastType = 'info';
        this.lastTag = tag;
        this.lastMessage = message;
    }

    stack(message: string, _offset?: number, _level?: string): void {
        this.lastType = 'stack';
        this.lastTag = '';
        this.lastMessage = message;
    }

    stackToCloud(message: string, _offset?: number, _level?: string): void {
        this.lastType = 'stackToCloud';
        this.lastTag = '';
        this.lastMessage = message;
    }
}

describe('Types/_source/provider/SbisBusinessLogic', () => {
    describe('.getEndpoint()', () => {
        test('should return endpoint', () => {
            const provider = new SbisBusinessLogic({
                endpoint: {
                    address: '/foo',
                    contract: 'bar',
                },
            });

            expect(provider.getEndpoint()).toEqual({
                address: '/foo',
                contract: 'bar',
            });
        });
    });

    describe('.call()', () => {
        let provider: SbisBusinessLogic;

        beforeEach(() => {
            provider = new SbisBusinessLogic({
                endpoint: {
                    contract: 'foo',
                },
                transport: TransportMock,
            });
        });

        test('should call a method from given object', () => {
            return provider.call('bar').then(() => {
                expect(TransportMock.lastMethod).toEqual('foo.bar');
            });
        });

        test('should transfer a valid arguments', () => {
            return provider.call('name', { bar: 'baz' }).then(() => {
                expect(TransportMock.lastArgs).toEqual({ bar: 'baz' });
            });
        });

        test('should transfer no arguments as empty object', () => {
            return provider.call('name').then(() => {
                expect(TransportMock.lastArgs).toEqual({});
            });
        });

        test('should override default object name', () => {
            return provider.call('boo.bar').then(() => {
                expect(TransportMock.lastMethod).toEqual('boo.bar');
            });
        });

        test('should pass cache argument', () => {
            const cacheParams = {
                maxAge: 123,
            };
            return provider.call('name', {}, cacheParams).then(() => {
                expect(TransportMock.lastCache).toEqual(cacheParams);
            });
        });

        test('should pass given timeout to the transport implementation', () => {
            const callTimeout = 12345;
            const bl = new SbisBusinessLogic({
                callTimeout,
                transport: TransportMock,
            });
            return bl.call('foo.bar').then(() => {
                expect(TransportMock.lastOptions.timeout).toEqual(callTimeout);
            });
        });

        test('should log an error on expired timeout', () => {
            const logger = new LoggerMock();
            const bl = new SbisBusinessLogic({
                callTimeout: -1,
                logger,
                transport: DelayedMock,
            });

            return bl.call('foo.bar').then(() => {
                expect(logger.lastType).toEqual('info');
                expect(logger.lastTag).toEqual('Types/_source/provider/SbisBusinessLogic');
                expect(logger.lastMessage).toEqual(
                    "Timeout of -1 ms had expired before the method 'foo.bar' at '' returned any results"
                );
            });
        });
    });
});
