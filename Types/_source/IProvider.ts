import { IAbstract } from './provider';
import { EntityMarker } from 'Types/declarations';

/**
 *
 * @public
 */
export interface IEndpoint {
    /**
     *
     */
    contract?: string;
    /**
     *
     */
    address?: string;
}

/**
 * Интерфейс источника данных, поддерживающего абстракцию взаимодействия через провайдера удаленного доступа.
 * @public
 */
export default interface IProvider {
    readonly '[Types/_source/IProvider]': EntityMarker;

    /**
     * Возвращает объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
     */
    getProvider(): IAbstract;

    /**
     * Возвращает конечную точку, обеспечивающую доступ клиента к функциональным возможностям провайдера удаленного доступа.
     * @example
     * Получим название контракта:
     * <pre>
     *     import {Rpc} from 'Types/source';
     *
     *     const dataSource = new Rpc({
     *         endpoint: {
     *             address: '/api/',
     *             contract: 'User'
     *         }
     *     });
     *
     *     dataSource.getEndpoint().contract; // 'User'
     * </pre>
     */
    getEndpoint(): IEndpoint;
}
