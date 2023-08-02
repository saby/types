/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import ITable from './ITable';
import IRecord from './IRecord';
import { EntityMarker } from '../../_declarations';

/**
 * Интерфейс адаптера, осуществляющего операции с "сырыми" данными.
 * Назначение адаптера - предоставить общий интерфейс для работы различными форматами данных.
 * @interface Types/_entity/adapter/IAdapter
 * @public
 */
export default interface IAdapter {
    readonly '[Types/_entity/adapter/IAdapter]': EntityMarker;

    /**
     * Возвращает интерфейс доступа к данным в виде таблицы
     * @param {*} data Сырые данные
     * @return {Types/_entity/adapter/ITable}
     */
    forTable(data?: any): ITable;

    /**
     * Возвращает интерфейс доступа к данным в виде записи
     * @param {*} data Сырые данные
     * @param {*} [tableData] Сырые данные таблицы (передаются, когда data пустой)
     * @return {Types/_entity/adapter/IRecord}
     */
    forRecord(data?: any, tableData?: any): IRecord;

    /**
     * Возвращает название поля, которое является первичным ключом
     * @param {*} data Сырые данные
     * @return {String}
     */
    getKeyField(data: any): string;

    /**
     * Возвращает значение свойства
     * @param {*} data Сырые данные
     * @param {String} property Название свойства
     * @return {*}
     */
    getProperty(data: any, property: string): any;

    setProperty(data: any, property: string, value: any): void;
}
