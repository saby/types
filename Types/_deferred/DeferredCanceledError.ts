type V8Error = ErrorConstructor & {
    // https://v8.dev/docs/stack-trace-api#stack-trace-collection-for-custom-exceptions
    captureStackTrace?(error: Error, constructorOpt?: Function): void;
};

/**
 * Ошибка, возникающая когда выполнение Deferred отменяется.
 * @private
 */
export class DeferredCanceledError extends Error implements Error {
    readonly name: string = 'DeferredCanceledError';
    readonly canceled: boolean = true;
    readonly stack?: string;

    constructor(public message: string) {
        super(message);

        if (typeof (Error as V8Error).captureStackTrace === 'function') {
            (Error as V8Error).captureStackTrace(this, DeferredCanceledError);
        } else {
            try {
                throw new Error();
            } catch (e) {
                this.stack = e.stack;
            }
        }
    }
}
