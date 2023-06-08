import { EntityMarker } from '../_declarations';

/**
 * Интерфейс изменения версий объекта.
 * Позволяет быстро проверить изменилось ли что либо в объекте.
 * @interface Types/_entity/IVersionable
 * @public
 */
export default interface IVersionable {
    readonly '[Types/_entity/IVersionable]': EntityMarker;

    /**
     * Возвращает версию объекта.
     * Версия соответствует некому состоянию объекта и меняется при изменении как то значимых свойств объекта, например для рекорда это будет изменение значений полей.
     * @example
     * Проверим изменился ли рекорд:
     * <pre>
     *     import {Record} from 'Types/entity';
     *
     *     const record = new Record({
     *         rawData: {
     *             id: 1
     *         }
     *     });
     *     const method = (record: Record): void => {
     *         if (Math.round(Math.random() * 1000) % 2 === 0) {
     *             record.set('id', 2);
     *         }
     *     };
     *     const version = record.getVersion();
     *     method(record);
     *     if (version != record.getVersion()) {
     *         console.log('Changed!');
     *     }
     * </pre>
     */
    getVersion(): number;
}
