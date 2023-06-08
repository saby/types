import { ICacheParameters } from '../Remote';
import { EntityMarker } from '../../_declarations';
import { ICallChainItem } from '../chainFactory/CallChainItem';

/**
 * Интерфейс абстрактного провайдера
 * @interface Types/_source/provider/IAbstract
 * @public
 */
export default interface IAbstract {
    readonly '[Types/_source/provider/IAbstract]': EntityMarker;

    /**
     * @param name Имя сервиса
     * @param args Аргументы вызова
     * @param handlers Обработчики сообщений
     * @param cache Флаги управления кэшем
     * @return Асинхронный результат операции
     */
    call<T>(
        name: string,
        args: string[] | Object,
        cache?: ICacheParameters,
        httpMethod?: string,
        callHandlers?: ICallChainItem
    ): Promise<T>;
}
