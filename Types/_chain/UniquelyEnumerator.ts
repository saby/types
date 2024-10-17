/**
 * @kaizenZone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 * @module
 * @public
 */
import { IEnumerator } from '../collection';
import Abstract from './Abstract';
import { EntityMarker } from 'Types/declarations';
import { EnumeratorIndex } from './types';
type ExtractFunc = (item: any, index: string | number) => string | number;

/**
 * Энумератор уникальных элементов
 * @private
 */
export default class UniquelyEnumerator<T> implements IEnumerator<T> {
    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;
    private previous: Abstract<T>;
    private idExtractor: ExtractFunc;
    private enumerator: IEnumerator<T>;
    private objectsHash: any[];
    private keysHash: Record<EnumeratorIndex, boolean>;

    /**
     * Конструктор энумератора уникальных элементов.
     * @param previous Предыдущее звено.
     * @param idExtractor Возвращает уникальный идентификатор элемента.
     */
    constructor(previous: Abstract<T>, idExtractor: ExtractFunc) {
        this.previous = previous;
        this.idExtractor = idExtractor;
        this.reset();
    }

    getCurrent(): any {
        return this.enumerator.getCurrent();
    }

    getCurrentIndex(): any {
        return this.enumerator.getCurrentIndex();
    }

    moveNext(): boolean {
        const hasNext = this.enumerator.moveNext();
        let current: string | number | undefined;

        if (hasNext) {
            // @ts-ignore
            current = this.enumerator.getCurrent();
            if (this.idExtractor) {
                current = this.idExtractor(current, this.enumerator.getCurrentIndex());
            }
            if ((current as any) instanceof Object) {
                if (this.objectsHash.indexOf(current) > -1) {
                    return this.moveNext();
                }
                this.objectsHash.push(current);
            } else if (current) {
                if (current in this.keysHash) {
                    return this.moveNext();
                }
                this.keysHash[current] = true;
            }
        }

        return hasNext;
    }

    reset(): void {
        this.enumerator = this.previous.getEnumerator();
        this.keysHash = {};
        this.objectsHash = [];
    }
}

Object.assign(UniquelyEnumerator.prototype, {
    previous: null,
    enumerator: null,
    idExtractor: null,
    keysHash: null,
    objectsHash: null,
});
