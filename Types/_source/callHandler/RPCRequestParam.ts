/**
 * Параметры запроса, приходящего в обработчик {@link Types/source:SbisService#callHandlers}
 */
export type RPCRequestParam = {
    /**
     *
     */
    url: string;
    /**
     *
     */
    method: string;
    /**
     *
     */
    headers: Record<string, unknown>;
    /**
     *
     */
    data: string;
    /**
     *
     */
    timeout?: number;
    /**
     *
     */
    transport?: ITransport;
};

/**
 *
 */
export type ITransport = {
    _options: {
        url: string;
        method: 'GET' | 'POST';
        dataType: string;
    };
    /**
     * Устанавливает url, по которому отправляются запросы
     */
    setUrl?: (url: string) => void;
};
