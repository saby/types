/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import ITable from './ITable';
import IRecord from './IRecord';
import { EntityMarker } from 'Types/declarations';

/**
 * Интерфейс адаптера, осуществляющего операции с "сырыми" данными.
 * Назначение адаптера - предоставить общий интерфейс для работы различными форматами данных.
 * @public
 */
export default interface IAdapter {
    readonly '[Types/_entity/adapter/IAdapter]': EntityMarker;
    readonly '[Types/_entity/adapter/IDataHolder]'?: EntityMarker;

    /**
     * Возвращает интерфейс доступа к данным в виде таблицы
     * @param data Сырые данные
     */
    forTable(data?: any): ITable;

    /**
     * Возвращает интерфейс доступа к данным в виде записи
     * @param data Сырые данные
     * @param tableData Сырые данные таблицы (передаются, когда data пустой)
     */
    forRecord(data?: any, tableData?: any): IRecord;

    /**
     * Возвращает название поля, которое является первичным ключом
     * @param data Сырые данные
     */
    getKeyField(data: any): string | undefined;

    /**
     * Возвращает значение свойства
     * @param data Сырые данные
     * @param property Название свойства
     */
    getProperty(data: any, property: string): any;

    setProperty(data: any, property: string, value: any): void;
}
