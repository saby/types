/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
/**
 * Позволяет игнорировать вызовы функции до тех пор, пока пока они не перестанут повторяться в течение указанного периода.
 * Также есть возможность отменить вызов функции после окончания задержки.
 * @module
 * @public
 */

type InnerFunction = (...args: any[]) => any;

const MIN_DELAY = 5;

interface IStates {
    firstCalled: boolean;
    sequentialCall: boolean;
}

interface ICancellable<T extends InnerFunction> {
    run: (...args: Parameters<T>) => void;
    cancel(): void;
}

/**
 * Позволяет игнорировать вызовы функции до тех пор, пока пока они не перестанут повторяться в течение указанного периода.
 * Также есть возможность отменить вызов функции после окончания задержки.
 * @remark
 * Алгоритм работы:
 * <ol>
 *     <li>При каждом вызове функции её выполнение откладывается на время, заданное параметром delay. Если за это время происходит повторный вызов функции, то предыдущий вызов отменяется, а новый откладывается на время delay. И так далее по аналогии.</li>
 *     <li>Если параметр first=true, то первый вызов функции в каждой серии будет выполнен в любом случае.</li>
 * </ol>
 *
 * См. также функцию {@link Types/_function/throttle throttle}, которая позволяет ограничивать частоту вызовов функции.
 *
 * <h2>Пример использования</h2>
 * Будем рассчитывать итоги по корзине покупателя не при каждом добавлении товара, а только один раз:
 * <pre>
 *     import {debounceCancellable} from 'Types/function';
 *     import {Server} from 'Browser/Event';
 *
 *     const serverChannel = Server.serverChannel('channel', {
 *         isChanneled: true,
 *         scopes: [Server.serverChannel.SCOPE.CLIENT]
 *     });
 *
 *     const updateRecord = (record) => {
 *         // Обновление записи
 *     }
 *
 *     const updateRecordDebounced = debounceCancellable(updateRecord, 200);
 *
 *     const messageHandler = (record) => {
 *         const eventName = record.get('eventName');
 *         if (eventName === 'updateData') {
 *             // Выполнить обновление записи через 200 мл, если не придёт еще одно событие
 *             updateRecordDebounced.run(record);
 *         }
 *         if (eventName === 'updateDataForce') {
 *             // Отмена выполнения последней пришедшей функции, если она была
 *             updateRecordDebounced.cancel();
 *             // Выполнить обновление записи без задержки
 *             updateRecord(record);
 *         }
 *     }
 *
 *     serverChannel.subscribe('onMessage', messageHandler);
 * </pre>
 *
 * @param {T | Function} original Функция, вызов которой нужно игнорировать
 * @param {number} delay Период задержки в мс
 * @param {boolean} first Выполнить первый вызов без задержки
 * @returns {ICancellable<T>} объект с результирующей функцией и отмена выполнения после задержки
 * @public
 */
export default function debounceCancellable<T extends InnerFunction>(
    original: T | Function,
    delay: number,
    first?: boolean,
    // seriesStates was added for unit-test only.
    // This makes it possible to change the function call series state.
    seriesStates?: IStates
): ICancellable<T> {
    let timer;

    // Function call series state.
    // firstCalled - was the first function call without delay.
    // sequentialCall - was a repeat function call in a series.
    const states = seriesStates || {
        firstCalled: false,
        sequentialCall: false,
    };

    const clearTimer = () => {
        if (timer) {
            states.sequentialCall = true;
            clearTimeout(timer);
        }
    };

    return {
        run: (...args: Parameters<T>): void => {
            // Do the first call immediately if needed
            if (!states.firstCalled && first && !timer && delay > MIN_DELAY) {
                states.firstCalled = true;
                original.apply(this, args);
            }

            // Clear timeout if timer is still awaiting
            clearTimer();

            // Setup a new timer in which call the original function
            timer = setTimeout(() => {
                timer = null;

                if (states.sequentialCall || !states.firstCalled) {
                    original.apply(this, args);
                }

                states.sequentialCall = false;
                states.firstCalled = false;
            }, delay);
        },
        cancel: clearTimer
    };
}
