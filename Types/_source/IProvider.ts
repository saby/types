import { IAbstract } from './provider';
import { EntityMarker } from '../_declarations';

export interface IEndpoint {
    contract?: string;
    address?: string;
}

/**
 * Интерфейс источника данных, поддерживающего абстракцию взаимодействия через провайдера удаленного доступа.
 * @interface Types/_source/IProvider
 * @public
 */
export default interface IProvider {
    readonly '[Types/_source/IProvider]': EntityMarker;

    /**
     * @typedef {Object} Endpoint
     * @property {String} [address] Адрес - указывает место расположения сервиса, к которому будет осуществлено подключение
     * @property {String} contract Контракт - определяет доступные операции
     */

    /**
     * @event Перед вызовом метода удаленного сервиса через провайдер
     * @name Types/_source/IProvider#onBeforeProviderCall
     * @remark
     * Если задана функция обратного вызова {@link Types/_source/Remote#beforeProviderCallCallback beforeProviderCallCallback}, событие отключается.
     * @param {Env/Event.Object} eventObject Дескриптор события.
     * @param {String} name Имя метода
     * @param {Object} [args] Аргументы метода (передаются по ссылке, можно модифицировать, но при этом следует учитывать, что изменяется оригинальный объект)
     * @example
     * Добавляем в фильтр выборки поле 'active' со значением true:
     * <pre>
     *     import {SbisService} from 'Types/source';
     *
     *     const dataSource = new SbisService({endpoint: 'Pickles'});
     *     dataSource.subscribe('onBeforeProviderCall', (eventObject, name, args) => {
     *         args = {...args};
     *         switch (name) {
     *             case 'getList':
     *                 //Select only active users
     *                 args.filter = args.filter || {};
     *                 args.filter.active = true;
     *                 break;
     *         }
     *         eventObject.setResult(args);
     *     });
     *
     *     dataSource.call('getList', {filter: {registered: true}});
     * </pre>
     */

    /**
     * Возвращает объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
     * @return {Types/_source/Provider/IAbstract}
     * @see provider
     */
    getProvider(): IAbstract;

    /**
     * Возвращает конечную точку, обеспечивающую доступ клиента к функциональным возможностям провайдера удаленного доступа.
     * @return {Endpoint}
     * @see endpoint
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
