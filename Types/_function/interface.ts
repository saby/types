/**
 *
 */
export type InnerFunction = (...args: unknown[]) => unknown;

/**
 * @public
 */
export interface IDebounceStates {
    /**
     *
     */
    firstCalled: boolean;
    /**
     *
     */
    sequentialCall: boolean;
}
