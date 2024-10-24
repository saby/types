/**
 * Варианты проверки прав доступа.
 * @public
 */
export enum RightMode {
    any = 0,
    anyNested = 1,
    all = 10,
    allNested = 11,
}

export function createRightMode(rightmode: number | undefined) {
    return rightmode || RightMode.any;
}
