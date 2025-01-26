/**
 * Inherits static class members
 */
function inheritStatic<T>(Base: T, Sub: Function): void {
    // Don't inherit from plain object
    if ((Base as unknown) === Object) {
        return;
    }

    Object.getOwnPropertyNames(Base).forEach((key) => {
        switch (key) {
            case 'arguments':
            case 'caller':
            case 'length':
            case 'name':
            case 'es5Constructor':
            case 'initMixin':
            case 'prototype':
                // Skip some valuable keys of type Function
                break;
            case 'toJSON':
                // Skip inheritance for toJSON() because it should be unique for ultimate class.
                // Otherwise WS.Core/ext/requirejs/extras/resourceLoadHandler won't work properly.
                break;
            default:
                if (!Sub.hasOwnProperty(key)) {
                    Object.defineProperty(
                        Sub,
                        key,
                        Object.getOwnPropertyDescriptor(Base, key) as PropertyDescriptor
                    );
                }
        }
    });
}

/**
 * Puts mixins into given class
 * @private
 */
export function applyMixins(Sub: Function, ...mixins: Function[]): void {
    // FIXME: to fix behaviour of Core/core-instance::instanceOfMixin()
    if (mixins.length && !Sub.prototype._mixins) {
        Sub.prototype._mixins = [];
    }

    const ownProperties: Record<string | symbol, unknown> = {};
    mixins.forEach((mixin: Function) => {
        const isClass = typeof mixin === 'function';
        const proto = isClass ? (mixin as any).prototype : mixin;

        if (isClass) {
            inheritStatic(mixin, Sub);
        }

        const inject = (name: string | symbol) => {
            if (!(name in ownProperties)) {
                ownProperties[name] = Sub.prototype.hasOwnProperty(name);
            }
            if (!ownProperties[name]) {
                Object.defineProperty(
                    Sub.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(proto, name) as PropertyDescriptor
                );
            }
        };

        Object.getOwnPropertyNames(proto).forEach(inject);
        if (Object.getOwnPropertySymbols) {
            Object.getOwnPropertySymbols(proto).forEach(inject);
        }
    });
}

/**
 * @private
 */
export type MixinConstructor1<M1> = new (...args: any[]) => M1;
type MixinConstructor2<M1, M2> = new (...args: any[]) => M1 & M2;
type MixinConstructor3<M1, M2, M3> = new (...args: any[]) => M1 & M2 & M3;
type MixinConstructor4<M1, M2, M3, M4> = new (...args: any[]) => M1 & M2 & M3 & M4;
type MixinConstructor5<M1, M2, M3, M4, M5> = new (...args: any[]) => M1 & M2 & M3 & M4 & M5;
type MixinConstructor6<M1, M2, M3, M4, M5, M6> = new (...args: any[]) => M1 &
    M2 &
    M3 &
    M4 &
    M5 &
    M6;
type MixinConstructor7<M1, M2, M3, M4, M5, M6, M7> = new (...args: any[]) => M1 &
    M2 &
    M3 &
    M4 &
    M5 &
    M6 &
    M7;
type MixinConstructor8<M1, M2, M3, M4, M5, M6, M7, M8> = new (...args: any[]) => M1 &
    M2 &
    M3 &
    M4 &
    M5 &
    M6 &
    M7 &
    M8;
type MixinConstructor9<M1, M2, M3, M4, M5, M6, M7, M8, M9> = new (...args: any[]) => M1 &
    M2 &
    M3 &
    M4 &
    M5 &
    M6 &
    M7 &
    M8 &
    M9;
type MixinConstructor10<M1, M2, M3, M4, M5, M6, M7, M8, M9, M10> = new (...args: any[]) => M1 &
    M2 &
    M3 &
    M4 &
    M5 &
    M6 &
    M7 &
    M8 &
    M9 &
    M10;

/**
 * @private
 */
export function mixin<M1>(...mixins: Function[]): MixinConstructor1<M1>;
export function mixin<M1, M2>(...mixins: Function[]): MixinConstructor2<M1, M2>;
export function mixin<M1, M2, M3>(...mixins: Function[]): MixinConstructor3<M1, M2, M3>;
export function mixin<M1, M2, M3, M4>(...mixins: Function[]): MixinConstructor4<M1, M2, M3, M4>;
export function mixin<M1, M2, M3, M4, M5>(
    ...mixins: Function[]
): MixinConstructor5<M1, M2, M3, M4, M5>;
export function mixin<M1, M2, M3, M4, M5, M6>(
    ...mixins: Function[]
): MixinConstructor6<M1, M2, M3, M4, M5, M6>;
export function mixin<M1, M2, M3, M4, M5, M6, M7>(
    ...mixins: Function[]
): MixinConstructor7<M1, M2, M3, M4, M5, M6, M7>;
export function mixin<M1, M2, M3, M4, M5, M6, M7, M8>(
    ...mixins: Function[]
): MixinConstructor8<M1, M2, M3, M4, M5, M6, M7, M8>;
export function mixin<M1, M2, M3, M4, M5, M6, M7, M8, M9>(
    ...mixins: Function[]
): MixinConstructor9<M1, M2, M3, M4, M5, M6, M7, M8, M9>;
export function mixin<M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>(
    ...mixins: Function[]
): MixinConstructor10<M1, M2, M3, M4, M5, M6, M7, M8, M9, M10>;

/**
 * Creates a subclass with given mixins
 * @private
 */
export function mixin(Base: Function, ...mixins: Function[]): Function {
    class Sub extends (Base as any) {
        // eslint-disable-next-line constructor-super
        constructor(...args: any[]) {
            if (Base !== Object) {
                // eslint-disable-next-line constructor-super
                super(...args);
            }
        }
    }

    inheritStatic(Base, Sub);
    applyMixins(Sub, ...mixins);

    return Sub;
}
