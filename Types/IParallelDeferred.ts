/**
 * @module
 * @public
 */

import {Deferred} from './deferred';

/**
 * Опции для класса ParallelDeferred
 * @public
 */
export interface IParallelDeferredOptions {
    /**
     * Устанавливает признак, по которому готовность экземпляра класса ParallelDeferred наступит при первой ошибке в любой операции.
     * @remark
     * Операции, на результат работы которых производится проверка, добавляют к экземпляру класса ParallelDeferred с помощью метода {@link Types/ParallelDeferred#push}.
     * Если при установленной опции в очереди существуют "ленивые" операции, то ни одна из них запущена не будет.
     * Подробнее о типах операций и возникновении очереди вы можете прочитать в описании к классу {@link Types/ParallelDeferred}.
     * @see {@link Types/ParallelDeferred#push}
     */
    stopOnFirstError: boolean;
    /**
     * Устанавливает максимальное количество одновременно выполняющихся "ленивых" операций, переданных методом {@link Types/ParallelDeferred#push}.
     * Подробнее о типах операций и возникновении очереди вы можете прочитать в описании к классу {@link Types/ParallelDeferred}.
     * @see {@link Types/ParallelDeferred#push}
     */
    maxRunningCount: number;

    steps?: Record<string, deferredFunction>;
}

/**
 *
 */
export type deferredFunction = () => Deferred<unknown>;
