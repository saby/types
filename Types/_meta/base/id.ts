import { MurmurHash3 } from './iMurmurHash';
import { GENERATOR_ID_RANDOM_DELIMITER } from '../marshalling/format';

const hasher = new MurmurHash3();

function getHash(value: unknown): string {
    if (typeof value === 'undefined') {
        return '';
    }
    if (typeof value === 'boolean') {
        return '' + value;
    }
    const result = hasher.hash(JSON.stringify(value)).result();
    hasher.reset();
    return String(result);
}

function mapHash(entry: [string, unknown]): string {
    return entry[0] + getHash(entry[1]);
}

export function genId(currentId: string, update?: object): string {
    if (!update) {
        return currentId;
    }
    return (
        currentId +
        GENERATOR_ID_RANDOM_DELIMITER +
        Object.entries(update).map(mapHash).join(GENERATOR_ID_RANDOM_DELIMITER)
    );
}
