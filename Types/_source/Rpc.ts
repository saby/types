import Remote, { ICacheParameters } from './Remote';
import DataSet from './DataSet';
import IRpc from './IRpc';
import { EntityMarker } from '../_declarations';
import { Deferred } from 'Types/deferred';

declare const wsErrorMonitor: {
    onError(event: unknown): void;
};

/**
 * Источник данных, работающий по технологии RPC.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @extends Types/_source/Remote
 * @implements Types/_source/IRpc
 * @public
 */
export default abstract class Rpc extends Remote implements IRpc {
    // region IRpc

    readonly '[Types/_source/IRpc]': EntityMarker = true;

    call(command: string, data?: object, cache?: ICacheParameters): Promise<DataSet> {
        // TODO: удалить после отладки по задаче https://online.sbis.ru/opendoc.html?guid=ae2d6a3d-f3cc-4c2b-b7fa-10063c25b944&client=3
        if (data && data['ИмяМетода'] === 'null.ListLite') {
            const message = 'Types/source:RPC: invalid value for "ИмяМетода"';
            try {
                throw new Error(message);
            } catch (error) {
                wsErrorMonitor.onError({
                    error,
                    message,
                    filename: '',
                    lineno: 0,
                    colno: 0,
                });
            }
        }

        const handlers = this._getHandlerChain();

        return this._callProvider<DataSet>(command, data, handlers, cache).addCallback(
            Deferred.skipLogExecutionTime((data) => {
                return this._loadAdditionalDependencies().addCallback(
                    Deferred.skipLogExecutionTime(() => {
                        return this._wrapToDataSet(data);
                    })
                );
            })
        );
    }

    // endregion
}

Object.assign(Rpc.prototype, {
    '[Types/_source/Rpc]': true,
    _moduleName: 'Types/source:Rpc',
});
