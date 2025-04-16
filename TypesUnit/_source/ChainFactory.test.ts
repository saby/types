import {
    ICallHandler,
    RPCRequestParam,
    ChainFactory,
    RootCallChainItem,
    ServicePoolCallHandler,
} from 'Types/source';
import { List } from 'Types/collection';

class DummyCallHandler implements ICallHandler {
    moduleName: string = 'DummyCallHandler';
    handle(request: RPCRequestParam): RPCRequestParam {
        return request;
    }
}

describe('Types/_source/ChainFactory', () => {
    let servicePoolHandler: List<ICallHandler> = new List<ICallHandler>({
        items: [new ServicePoolCallHandler()],
    });

    let chainFactory = new ChainFactory(servicePoolHandler);

    const chainItemFields = ['_$next', '_$handler'];

    beforeEach(() => {
        chainFactory = new ChainFactory(servicePoolHandler);
        servicePoolHandler = new List<ICallHandler>({
            items: [new ServicePoolCallHandler()],
        });
    });

    describe('.constructor()', () => {
        describe('when chain is exists', () => {
            test('should create valid manager with version', () => {
                const manager = new ChainFactory(servicePoolHandler);
                expect(typeof manager.getChainVersion()).toBe('number');
            });

            test('should generate chain handler', () => {
                const manager = new ChainFactory(servicePoolHandler);
                const chain = manager.getChain();

                for (const fields of chainItemFields) {
                    //@ts-ignore
                    expect(chain[fields]).not.toBeUndefined();
                }
            });

            test('should take version of list', () => {
                servicePoolHandler.add(new DummyCallHandler());
                const listVersion = servicePoolHandler.getVersion();
                const manager = new ChainFactory(servicePoolHandler);

                expect(typeof manager.getChainVersion()).toBe('number');
                expect(manager.getChainVersion()).toBe(listVersion);
            });
        });

        describe("when chain doesn't exists", () => {
            test('should create manager with empty handler', () => {
                const manager = new ChainFactory();
                expect(manager.getChain()).toBeInstanceOf(RootCallChainItem);
            });
        });
    });

    describe('.getChain()', () => {
        describe('when chain is exists', () => {
            test('should return chain', () => {
                const chain = chainFactory.getChain();

                expect(chain).not.toBeNull();
                expect(typeof chain).toBe('object');

                for (const fields of chainItemFields) {
                    //@ts-ignore
                    expect(chain[fields]).not.toBeUndefined();
                }
            });

            test('should have next handler set', () => {
                const chain = chainFactory.getChain();

                expect(typeof chain.processRequest).toBe('function');
            });

            test('should return chain if list passed', () => {
                servicePoolHandler.add(new DummyCallHandler());
                const chain = chainFactory.getChain(servicePoolHandler);

                expect(chain).not.toBeNull();
                expect(typeof chain).toBe('object');
                for (const fields of chainItemFields) {
                    //@ts-ignore
                    expect(chain[fields]).not.toBeUndefined();
                }

                // root node now should be inner chain item
                const nextChain = chain.getNext();
                for (const fields of chainItemFields) {
                    //@ts-ignore
                    expect(nextChain[fields]).not.toBeUndefined();
                }
            });

            test('should throw if wrong type of object passed', () => {
                const wrongObject = {
                    foo: 'bar',
                } as unknown as List<ICallHandler>;
                expect(() => {
                    chainFactory.getChain(wrongObject);
                }).toThrow();
            });
        });
    });

    describe('.getChainVersion()', () => {
        describe('when chain is exists', () => {
            test('should return chain version', () => {
                expect(typeof chainFactory.getChainVersion()).toBe('number');
                expect(chainFactory.getChainVersion()).toEqual(0);
            });

            test('should NOT update chain version if list version not changed', () => {
                chainFactory.updateChain(servicePoolHandler);

                expect(typeof chainFactory.getChainVersion()).toBe('number');
                expect(chainFactory.getChainVersion()).toEqual(0);
            });

            test('should update chain version if list version changed', () => {
                servicePoolHandler.add(new DummyCallHandler());

                chainFactory.updateChain(servicePoolHandler);

                expect(typeof chainFactory.getChainVersion()).toBe('number');
                expect(chainFactory.getChainVersion()).toEqual(1);
            });

            test('should update chain version if different list with same version set', () => {
                const handlers = new List<ICallHandler>({
                    items: [new DummyCallHandler()],
                });

                chainFactory.updateChain(handlers);

                expect(typeof chainFactory.getChainVersion()).toBe('number');
                expect(chainFactory.getChainVersion()).toEqual(0);
            });
        });
    });
});
