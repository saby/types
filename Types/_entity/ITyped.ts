/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { EntityMarker, FormatNameMarker } from 'Types/declarations';

/**
 * Интерфейс работы с типом записи
 * @private
 */
export interface ITyped {
    readonly '[Types/_entity/ITyped]': EntityMarker;

    /**
     * Возвращает название типа записи/записей
     * @return {Types/declaration:FormatNameMarker} Название типа
     * @example
     * Получим название типа из ответа БЛ:
     * <pre>
     *     const record = await employeeSource.read({id: 1});
     *     record.getTypeName(); // 'Employee'
     * </pre>
     * @remark Метод БЛ должен поддерживать протокол RPC версии 7 и возвращать информацию о типе записи.
     * Во всех остальных случаях вернётся тип 'record', 'recordset
     */
    getTypeName(): FormatNameMarker;

    /**
     * Возвращает признак, что у записи есть строго заданный тип
     * @example
     * Получим признак, что у записи есть строго заданный тип:
     * <pre>
     *     const record = await employeeSource.read({id: 1});
     *     record.isTyped(); // true
     * </pre>
     * @remark Метод БЛ должен поддерживать протокол RPC версии 7 и возвращать информацию о типе записи.
     * Во всех остальных случаях вернется false,
     */
    isTyped(): boolean;
}
