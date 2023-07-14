/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс сущности, взаимодействующей с посредником
 * @private
 * @private
 */
export default interface IReceiver {
    readonly '[Types/_entity/relation/IReceiver]': EntityMarker;

    /**
     * Принимает уведомление от посредника об изменении отношений
     * @param which Объект, уведомивший об изменении отношений
     * @param route Маршрут до объекта
     * @return Модификация объекта, уведомившего об изменении отношений
     */
    relationChanged(which: any, route: string[]): any;
}
