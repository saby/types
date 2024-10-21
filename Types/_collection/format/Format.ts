/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import { IEquatable } from '../../entity';
import { format } from '../../entity';
import List, { IOptions as IListOptions } from '../List';
import { EntityMarker } from 'Types/declarations';

/**
 *
 * @param value
 */
export function isFormat(value: any): value is Format {
    return !!value['[Types/_collection/format/Format]'];
}

/**
 * Формат полей: список полей записи.
 * @example
 * Создадим запись с внедренным экземпляром формата:
 * <pre>
 *     import {format as fields, Record} from 'Types/entity';
 *     import {format} from 'Types/collection';
 *
 *     const format = new format.Format({
 *         items: [
 *             new fields.IntegerField({name: 'id'}),
 *             new fields.StringField({name: 'login'}),
 *             new fields.StringField({name: 'email'})
 *         ]
 *     });
 *
 *     const record = new Record({
 *         format: format,
 *         rawData: [
 *             {id: 1, login: 'user1', email: 'test@example.com'}
 *         ]
 *     })
 * </pre>
 *
 * Создадим набор записей с внедренным экземпляром формата:
 * <pre>
 *     // My/Format/user.ts
 *     import {format as fields} from 'Types/entity';
 *     import {format} from 'Types/collection';
 *
 *     const format = new format.Format();
 *
 *     format.add(new fields.IntegerField({name: 'id'}));
 *     format.add(new fields.StringField({name: 'login'}));
 *     format.add(new fields.StringField({name: 'email'}));
 *
 *     export default format;
 *
 *     // My/Models/Users.ts
 *     import userFormat from 'My/Format/user';
 *     import {RecordSet} from 'Types/collection';
 *     const users = new RecordSet({
 *         format: userFormat
 *     });
 * </pre>
 * @public
 */
export default class Format<T = format.Field> extends List<T> implements IEquatable {
    protected _$items: any[];

    protected _moduleName: string;

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker;

    /**
     *
     * @param options
     */
    constructor(options?: IListOptions<T>) {
        super(options);
        for (let i = 0, len = this._$items.length; i < len; i++) {
            this._checkItem(this._$items[i]);
            this._checkName(this._$items[i], i);
        }
    }

    // region List

    add(item: T, at?: number): void {
        this._checkItem(item);
        this._checkName(item);
        super.add(item, at);
    }

    remove(item: T): boolean {
        this._checkItem(item);
        return super.remove(item);
    }

    replace(item: T, at: number): void {
        this._checkItem(item);
        this._checkName(item, at);
        super.replace(item, at);
    }

    assign(items: T[]): void {
        items = this._itemsToArray(items);
        for (let i = 0, len = items.length; i < len; i++) {
            this._checkItem(items[i]);
        }

        super.assign(items);

        for (let i = 0, len = this._$items.length; i < len; i++) {
            this._checkName(this._$items[i], i);
        }
    }

    append(items: T[]): void {
        items = this._itemsToArray(items);
        for (let i = 0, len = items.length; i < len; i++) {
            this._checkItem(items[i]);
            this._checkName(items[i]);
        }
        super.append(items);
    }

    prepend(items: T[]): void {
        items = this._itemsToArray(items);
        for (let i = 0, len = items.length; i < len; i++) {
            this._checkItem(items[i]);
            this._checkName(items[i]);
        }
        super.prepend(items);
    }

    getCount(): number {
        return super.getCount();
    }

    at(i: number): T {
        return super.at(i);
    }

    getIndexByValue(name: string, value: any): number {
        return super.getIndexByValue(name, value);
    }

    removeAt(index: any): T {
        return super.removeAt(index);
    }

    isEqual(format: Format<T>): boolean {
        if (format === this) {
            return true;
        }
        if (!format) {
            return false;
        }
        if (!(format instanceof Format)) {
            return false;
        }
        if (this.getCount() !== format.getCount()) {
            return false;
        }
        for (let i = 0, count = this.getCount(); i < count; i++) {
            // @ts-ignore
            if (!this.at(i).isEqual(format.at(i))) {
                return false;
            }
        }
        return true;
    }

    // endregion

    // region Public methods

    /**
     * Удаляет поле из формата по имени.
     * Если поля с таким именем нет, генерирует исключение.
     * @param name Имя поля
     */
    removeField(name: string): void {
        const index = this.getIndexByValue('name', name);
        if (index === -1) {
            throw new ReferenceError(
                `${this._moduleName}::removeField(): field "${name}" doesn't found`
            );
        }
        this.removeAt(index);
    }

    /**
     * Возвращает индекс поля по его имени.
     * Если поля с таким именем нет, возвращает -1.
     * @param name Имя поля
     */
    getFieldIndex(name: string): number {
        return this.getIndexByValue('name', name);
    }

    /**
     * Возвращает имя поля по его индексу.
     * Если индекс выходит за допустимый диапазон, генерирует исключение.
     * @param at Имя поля
     */
    getFieldName(at: number): string {
        // @ts-ignore
        return this.at(at).getName();
    }

    // endregion

    // region Protected methods

    /**
     * Проверяет, что переданный элемент - формат поля
     */
    protected _checkItem(item: T): void {
        if (!item || !(item instanceof format.Field)) {
            throw new TypeError('Item should be an instance of "Types/entity:format.Field"');
        }
    }

    /**
     * Проверяет, что формат поля не дублирует уже существующее имя поля
     */
    protected _checkName(item: any, at?: number): void {
        const exists = this.getFieldIndex(item.getName());
        if (exists > -1 && exists !== at) {
            throw new ReferenceError(
                `${this._moduleName}: field with name "${item.getName()}" already exists`
            );
        }
    }

    protected _itemsToArray(items: any): T[] {
        return super._itemsToArray(items);
    }

    // endregion
}

Object.assign(Format.prototype, {
    '[Types/_collection/format/Format]': true,
    '[Types/_entity/IEquatable]': true,
    _moduleName: 'Types/collection:format.Format',
});
