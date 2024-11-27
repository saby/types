/**
 * Библиотека, которая обеспечивает доступ к источникам данных.
 * @library
 * @public
 * @module
 */

export { default as Base, IOptions as IBaseSourceOptions } from './_source/Base';
export { default as BindingMixin, IBinding, IOptions as IBindingMixinOptions } from './_source/BindingMixin';
export { IOptions as IMixinOptions, IOptionsOption as IMixinOptionsOption} from './_source/OptionsMixin';
export { default as EndpointMixin, IOptions as IEndpointMixinOptions } from './_source/EndpointMixin';
export { default as DataMixin, IOptions as IDataMixinOptions } from './_source/DataMixin';
import { default as DataSet, IOptions as IDataSetOptions } from './_source/DataSet';
export { DataSet, IDataSetOptions };
export { default as HierarchicalMemory, IOptions as IHierarchicalMemoryOptions } from './_source/HierarchicalMemory';
export { default as ICrud, EntityKey as CrudEntityKey } from './_source/ICrud';
export { default as ICrudPlus } from './_source/ICrudPlus';
export { default as IData } from './_source/IData';
export { default as IDecorator } from './_source/IDecorator';
export { default as IProvider, IEndpoint as IProviderEndpoint } from './_source/IProvider';
export { default as IRpc } from './_source/IRpc';
export { default as Local, LOCAL_MOVE_POSITION, MemoryFilterFunction, IOptions as ILocalOptions } from './_source/Local';
import { default as Memory, IOptions as IMemoryOptions } from './_source/Memory';
export {Memory, IMemoryOptions}
export {
    default as PrefetchProxy,
    IData as IPrefetchProxyData,
    IDone as IPrefetchProxyDone,
    IValidators as IPrefetchProxyValidators,
    ITarget as IPrefetchProxyTarget
} from './_source/PrefetchProxy';
import * as provider from './_source/provider';
export { provider };
export {
    PartialExpression as QueryPartialExpression,
    andExpression as queryAndExpression,
    AndExpression as QueryAndExpression,
    default as Query,
    ExpandMode as QueryExpandMode,
    Join as QueryJoin,
    IJoinOptions as IQueryJoinOptions,
    IMeta as IQueryMeta,
    NavigationType as QueryNavigationType,
    Order as QueryOrder,
    IOrderOptions as IQueryOrderOptions,
    OrderSelector as QueryOrderSelector,
    orExpression as queryOrExpression,
    OrExpression as QueryOrExpression,
    SelectExpression as QuerySelectExpression,
    WhereExpression as QueryWhereExpression,
    FilterExpression as QueryFilterExpression,
    FilterFunction as QueryFilterFunction,
    AtomAppearCallback as QueryAtomAppearCallback,
    GroupBeginCallback as QueryGroupBeginCallback,
    GroupEndCallback as QueryGroupEndCallback,
} from './_source/Query';
export {
    default as Remote,
    IProviderOptions,
    ICacheParameters,
    NavigationTypes,
    IOptionsOption as IRemoteOptionsOption,
    IOptions as IRemoteOptions,
    IPassing as IRemotePassing,
    IExtendedPromise,
} from './_source/Remote';
export { default as Rpc } from './_source/Rpc';
import {
    default as SbisService,
    getQueryArguments as sbisServiceGetQueryArguments,
    IOptions as ISbisServiceOptions,
    IOptionsOption as ISbisServiceOptionsOption,
    IQueryResult as ISbisServiceQueryResult,
    IEndpoint as ISbisServiceEndpoint,
    IBinding as ISbisServiceBinding,
    AdditionalParams as SbisServiceAdditionalParams
} from './_source/SbisService';
export { default as Restful, IOptions as IRestfulOptions } from './_source/Restful';
export { SbisService };
export {
    sbisServiceGetQueryArguments,
    ISbisServiceOptions,
    ISbisServiceOptionsOption,
    ISbisServiceQueryResult,
    ISbisServiceEndpoint,
    ISbisServiceBinding,
    SbisServiceAdditionalParams,
};

export { ICallHandler } from './_source/callHandler/ICallHandler';
export { RPCRequestParam, ITransport } from './_source/callHandler/RPCRequestParam';
export {
    ICallChainItem,
    CallChainItem,
    RootCallChainItem,
} from './_source/chainFactory/CallChainItem';
export { ChainFactory } from './_source/chainFactory/CallChainFactory';

import { default as ServicePoolCallHandler } from './_source/callHandler/ServicePoolCallHandler';
import { default as TimeoutCallHandler } from './_source/callHandler/TimeoutCallHandler';
export { ServicePoolCallHandler, TimeoutCallHandler };
export { default as jsonize } from './_source/jsonize';

import { register } from './di';

register('Types/source:DataSet', DataSet, { instantiate: false });
register('Types/source:provider.SbisBusinessLogic', provider.SbisBusinessLogic, {
    instantiate: false,
});
register('Types/source:Memory', Memory, { instantiate: false });
register('Types/source:SbisService', SbisService, { instantiate: false });
