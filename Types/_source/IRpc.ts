import DataSet from './DataSet';
import { EntityMarker } from 'Types/declarations';
import { ICacheParameters } from './Remote';

/**
 * Интерфейс источника данных, поддерживающего {@link https://en.wikipedia.org/wiki/Remote_procedure_call RPC}.
 * @remark
 * Заставим тигра прыгнуть:
 * <pre>
 *     const dataSource = new RpcSource({
 *         endpoint: 'Tiger'
 *     });
 *     dataSource.call('jump', {height: '3 meters'}).then((result) => {
 *         console.log(result);
 *     }).catch(console.error);
 * </pre>
 * @public
 */
export default interface IRpc {
    readonly '[Types/_source/IRpc]': EntityMarker;

    /**
     *
     * Вызывает удаленный метод.
     * @param command Имя метода
     * @param data Аргументы метода
     * @param cache Параметры кэширования
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/source:DataSet}, в случае ошибки - Error.
     * @see {@link Types/source:DataSet}
     * @example
     * Раздаем подарки сотрудникам, у которых сегодня день рождения. Также посчитаем их количество:
     * <pre>
     *     const dataSource = new RpcSource({
     *         endpoint: 'Employee'
     *     });
     *     dataSource.call('giveAGift', {
     *         birthDate: new Date(),
     *         giftCode: 'a-ticket-to-the-bowling'
     *     }).then((dataSet) => {
     *         const todaysBirthdayTotal = dataSet.getAll().getCount();
     *     }).catch(console.error);
     * </pre>
     */
    call(command: string, data?: object, cache?: ICacheParameters): Promise<DataSet>;
}
