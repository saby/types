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
     * @example
     * import { DateFormattingStrategyType, date as format } from 'Types/formatter';
     *
     * const eventDate = new Date(2023, 3, 25, 11, 0, 0);
     * const config = {
     *     currentDate: new Date(2023, 3, 4, 12, 0, 0),
     *     strategy: DateFormattingStrategyType.Registry,
     * };
     *
     * format(eventDate, config); // 25 Apr
     */
    Registry = 'Registry',
    /**
     * Стратегия для реестров и списков, но для сегодняшнего дня отображается дата, а не время.
     * @example
     * import { DateFormattingStrategyType, date as format } from 'Types/formatter';
     *
     * const eventDate = new Date(2022, 7, 5, 11, 0, 0);
     * const config = {
     *     currentDate: new Date(2023, 3, 4, 12, 0, 0),
     *     strategy: DateFormattingStrategyType.OnlyDate,
     * };
     *
     * format(eventDate, config); // 5 Aug
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
     * Подробнее про маски формата вывода читайте в описании форматтера {@link Types/formatter:date даты}
     */
    mask?: string;
    /**
     * Смещение часового пояса, в котором требуется вывести значения. По умолчанию используется локальный.
     */
    timeZoneOffset?: number;
    /**
     * Тип стратегия или функция реализующая стратегию для определения маски формата вывода даты.
     * @example
     * Форматирование даты по стратегии для реестров, списков:
     * <pre>
     * import { DateFormattingStrategyType, date as format } from 'Types/formatter';
     *
     * const eventDate = new Date(2023, 3, 25, 11, 0, 0);
     * const config = {
     *     currentDate: new Date(2023, 3, 4, 12, 0, 0),
     *     strategy: DateFormattingStrategyType.Registry,
     * };
     *
     * format(eventDate, config); // 25 Apr
     * </pre>
     * Форматирование даты по стратегии для реестров, списков с отображенем "Сегодня":
     * <pre>
     * import { DateFormattingStrategyType, date as format } from 'Types/formatter';
     *
     * const eventDate = new Date(2022, 7, 5, 11, 0, 0);
     * const config = {
     *     currentDate: new Date(2022, 7, 5, 12, 0, 0),,
     *     strategy: DateFormattingStrategyType.OnlyDate,
     * };
     *
     * format(eventDate, config); // 11:00
     * </pre>
     */
    strategy?: DateFormattingStrategyType | DateFormattingStrategy;
    /**
     * Дата, которую принимаем за "Сегодня" при форматировании даты по стратегии {@Types/formatter:DateFormattingStrategyType "Реестров"}
     */
    currentDate?: Date;
    /**
     * Дата, которую необходимо отформатировать.
     */
    date?: Date;
}
