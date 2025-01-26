import { assert } from 'chai';
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
        context('when chain is exists', () => {
            it('should create valid manager with version', () => {
                const manager = new ChainFactory(servicePoolHandler);
                assert.isNumber(manager.getChainVersion());
            });

            it('should generate chain handler', () => {
                const manager = new ChainFactory(servicePoolHandler);
                assert.containsAllKeys(manager.getChain(), chainItemFields);
            });

            it('should take version of list', () => {
                servicePoolHandler.add(new DummyCallHandler());
                const listVersion = servicePoolHandler.getVersion();
                const manager = new ChainFactory(servicePoolHandler);

                assert.isNumber(manager.getChainVersion());
                assert.strictEqual(manager.getChainVersion(), listVersion);
            });
        });

        context("when chain doesn't exists", () => {
            it('should create manager with empty handler', () => {
                const manager = new ChainFactory();
                assert.instanceOf(manager.getChain(), RootCallChainItem);
            });
        });
    });

    describe('.getChain()', () => {
        context('when chain is exists', () => {
            it('should return chain', () => {
                const chain = chainFactory.getChain();

                assert.isNotNull(chain);
                assert.isObject(chain);
                assert.containsAllKeys(chain, chainItemFields);
            });

            it('should have next handler set', () => {
                const chain = chainFactory.getChain();

                assert.isFunction(chain.processRequest);
            });

            it('should return chain if list passed', () => {
                servicePoolHandler.add(new DummyCallHandler());
                const chain = chainFactory.getChain(servicePoolHandler);

                assert.isNotNull(chain);
                assert.isObject(chain);
                assert.containsAllKeys(chain, chainItemFields);

                // root node now should be inner chain item
                assert.containsAllKeys(chain.getNext(), chainItemFields);
            });

            it('should throw if wrong type of object passed', () => {
                const wrongObject = {
                    foo: 'bar',
                } as unknown as List<ICallHandler>;
                assert.throws(() => {
                    chainFactory.getChain(wrongObject);
                }, TypeError);
            });
        });
    });

    describe('.getChainVersion()', () => {
        context('when chain is exists', () => {
            it('should return chain version', () => {
                assert.isNumber(chainFactory.getChainVersion());
                assert.equal(chainFactory.getChainVersion(), 0);
            });

            it('should NOT update chain version if list version not changed', () => {
                chainFactory.updateChain(servicePoolHandler);

                assert.isNumber(chainFactory.getChainVersion());
                assert.equal(chainFactory.getChainVersion(), 0);
            });

            it('should update chain version if list version changed', () => {
                servicePoolHandler.add(new DummyCallHandler());

                chainFactory.updateChain(servicePoolHandler);

                assert.isNumber(chainFactory.getChainVersion());
                assert.equal(chainFactory.getChainVersion(), 1);
            });

            it('should update chain version if different list with same version set', () => {
                const handlers = new List<ICallHandler>({
                    items: [new DummyCallHandler()],
                });

                chainFactory.updateChain(handlers);

                assert.isNumber(chainFactory.getChainVersion());
                assert.equal(chainFactory.getChainVersion(), 0);
            });
        });
    });
});
