// eslint-disable-next-line
// @ts-ignore
import * as SerializerJS from './SerializerJS';

// Временный способ как-то типизировать Сериализатор, не переводя его на ts.
class SerializerTypecast {
    serialize: (this: unknown, key: string, value: unknown) => unknown;
    serializeStrict: (this: unknown, key: string, value: unknown) => unknown;
    deserialize: (this: unknown, key: string, value: unknown) => unknown;

    constructor(_storage?: Record<string, unknown>, _isServerSide?: boolean) {}

    static parseDeclaration?: (name: string) => {
        name: string;
        path: string[];
    };
    static pushDeserializePattern(_pattern: {
        patternRegExp: RegExp;
        action(result: string): unknown;
    }): void {}
    static setMetaHandler(_deserialize: (json: unknown) => unknown, _metaClass: object): void {}
    static setIgnorePatternName(_ignoreName: string): void {}
    static deleteIgnorePatternName(_ignoreName: string): void {}
}

export type Serializer = SerializerTypecast;
export const Serializer = SerializerJS as typeof SerializerTypecast;
