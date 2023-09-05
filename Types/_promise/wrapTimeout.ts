import { URL, fetch } from 'Browser/Transport';

function withTimeout(timeout) {
    let timeoutId;
    const callStack = String(new Error('withTimeout() through:').stack);
    const globalTimeout = URL.getQueryParam('globalTimeoutForTests');

    return {
        promise: new Promise((resolve, reject) => {
            timeoutId = setTimeout(
                () => {
                    reject(
                        new fetch.Errors.HTTP({
                            httpError: 504,
                            url: undefined,
                            message: 'Promise timeout',
                            details: callStack,
                        })
                    );
                },
                globalTimeout ? parseInt(globalTimeout, 10) : timeout
            );
        }),
        clear() {
            clearTimeout(timeoutId);
        },
    };
}

/**
 * Оборачивает промис в таймаут. Если промис не разрешится за указанное время, он будет отклонён.
 * @param promise {Promise} Промис, на который надо повесить таймаут.
 * @param timeout {Number} Время таймаута в миллисекундах.
 * @returns {Promise}
 */
export default function wrapTimeout(promise, timeout) {
    const awaiter = withTimeout(timeout);

    return Promise.race([promise, awaiter.promise]).finally(() => {
        awaiter.clear();
    });
}
