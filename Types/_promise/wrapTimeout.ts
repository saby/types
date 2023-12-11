import { loadSync, loadAsync, isLoaded } from 'WasabyLoader/ModulesLoader';

const TRANSPORT_NAME = 'Browser/Transport';

function createTimeoutPromise(timeout, transport, callStack, reject) {
    const globalTimeout = transport.URL.getQueryParam('globalTimeoutForTests');

    return setTimeout(
        () => {
            reject(
                new transport.fetch.Errors.HTTP({
                    httpError: 504,
                    url: undefined,
                    message: 'Promise timeout',
                    details: callStack,
                })
            );
        },
        globalTimeout ? parseInt(globalTimeout, 10) : timeout
    );
}

function withTimeout(timeout) {
    let timeoutId;
    const callStack = String(new Error('withTimeout() through:').stack);

    return {
        promise: new Promise((resolve, reject) => {
            if (isLoaded(TRANSPORT_NAME)) {
                timeoutId = createTimeoutPromise(
                    timeout,
                    loadSync(TRANSPORT_NAME),
                    callStack,
                    reject
                );
            } else {
                loadAsync(TRANSPORT_NAME).then((transport) => {
                    timeoutId = createTimeoutPromise(timeout, transport, callStack, reject);
                });
            }
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
