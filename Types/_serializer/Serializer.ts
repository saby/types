// eslint-disable-next-line
// @ts-ignore
import * as SerializerJS from './SerializerJS';

// Временный способ как-то типизировать Сериализатор, не переводя его на ts.
class SerializerTypecast {
    serialize: (this: unknown, key: string, value: unknown) => unknown;
    deserialize: (this: unknown, key: string, value: unknown) => unknown;

    constructor(storage?: Record<string, unknown>, isServerSide?: boolean) {}

    static parseDeclaration?: (name: string) => {
        name: string;
        path: string[];
    };
    static pushDeserializePattern(pattern: {
        patternRegExp: RegExp;
        action(result: string): unknown;
    }): void {}
}

export type Serializer = SerializerTypecast;
export const Serializer = SerializerJS as typeof SerializerTypecast;
