/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */

/**
 * Типы стратегий для форматирования даты. Описание стратегий в {@link https://n.sbis.ru/article/384f11b8-53b8-49ab-a30c-54d756669220 спецификациях}.
 */
export enum DateFormattingStrategyType {
    /**
     * Стратегия по умолчанию.
     */
    Default = 'Default',
    /**
     * Стратегия для реестров, списков.
     */
    Registry = 'Registry',
    /**
     * Стратегия для реестров и списков, но для сегодняшнего дня отображается дата, а не время.
     */
    OnlyDate = 'OnlyDate',
}

/**
 * Конфигурация для форматера дат.
 */
export type DateFormattingStrategy = (date: Date, config: IDateFormatConfig) => string;

/**
 * Конфигурация для форматера дат.
 * @public
 */
export interface IDateFormatConfig {
    /**
     * Маска формата вывода. Если не задана, будет использована стратегия определения маски.
     */
    mask?: string;
    /**
     * Смещение часового пояса, в котором требуется вывести значения. По умолчанию используется локальный.
     */
    timeZoneOffset?: number;
    /**
     * Тип стратегия или функция реализующая стратегию для определения маски формата вывода даты.
     */
    strategy?: DateFormattingStrategyType | DateFormattingStrategy;
    /**
     * Нынешняя дата.
     */
    currentDate?: Date;
    /**
     * Дата события.
     */
    date?: Date;
}
