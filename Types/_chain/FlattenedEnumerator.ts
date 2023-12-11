/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
import FlattenedMover from './FlattenedMover';
import { IEnumerator } from '../collection';
import Abstract from './Abstract';
import { EntityMarker } from '../_declarations';

/**
 * Разворачивающий энумератор
 * @private
 */
export default class FlattenedEnumerator<T> implements IEnumerator<T> {
    readonly '[Types/_collection/IEnumerator]': EntityMarker = true;
    private previous: Abstract<T>;
    private mover: FlattenedMover;
    private index: number;

    /**
     * Конструктор разворачивающего энумератора.
     * @param previous Предыдущее звено.
     */
    constructor(previous: Abstract<T>) {
        this.previous = previous;
        this.reset();
    }

    getCurrent(): any {
        return this.mover ? this.mover.getCurrent() : undefined;
    }

    getCurrentIndex(): any {
        return this.index;
    }

    moveNext(): boolean {
        this.mover = this.mover || (this.mover = new FlattenedMover(this.previous.getEnumerator()));
        const hasNext = this.mover.moveNext();
        if (hasNext) {
            this.index++;
        }
        return hasNext;
    }

    reset(): void {
        this.mover = null;
        this.index = -1;
    }
}

Object.assign(FlattenedEnumerator.prototype, {
    previous: null,
    mover: null,
    index: null,
});
