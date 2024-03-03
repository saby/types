/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
/**
 * @module
 * @public
 */

/**
 * Типы стратегий для форматирования даты. Описание стратегий в {@link https://n.sbis.ru/article/384f11b8-53b8-49ab-a30c-54d756669220 спецификациях}.
 * @typedef {String} DateFormattingStrategyType
 * @variant Default Стратегия по умолчанию.
 * @variant Registry Стратегия для реестров, списков.
 * @variant OnlyDate Стратегия для реестров и списков, но для сегодняшнего дня отображается дата, а не время.
 */
export enum DateFormattingStrategyType {
    Default = 'Default',
    Registry = 'Registry',
    OnlyDate = 'OnlyDate',
}

/**
 * Конфигурация для форматера дат.
 * @typedef {Function} DateFormattingStrategy Принимает первым параметром дату события, вторым конфигурацию форматера даты.
 */
export type DateFormattingStrategy = (date: Date, config: IDateFormatConfig) => string;

/**
 * Конфигурация для форматера дат.
 * @typedef {Object} IDateFormatConfig
 * @property {String} [mask] Маска формата вывода. Если не задана, будет использована стратегия определения маски.
 * @property {String} [timeZoneOffset] Смещение часового пояса, в котором требуется вывести значения. По умолчанию используется локальный..
 * @property {Types/formatter/DateFormattingStrategyType.typedef|Types/formatter/DateFormattingStrategy.typedef} strategy Тип стратегия или функция реализующая стратегию для определения маски формата вывода даты.
 */
export interface IDateFormatConfig {
    mask?: string;
    timeZoneOffset?: number;
    strategy?: DateFormattingStrategyType | DateFormattingStrategy;
    currentDate?: Date;
    date?: Date;
}
