/**
 * @kaizenZone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import IEnumerable from './IEnumerable';
import { EnumeratorCallback } from './IEnumerable';
import IEnumerator from './IEnumerator';
import { IIndex } from './IEnum';
import ArrayEnumerator from './enumerator/Arraywise';
import Objectwise from './enumerator/Objectwise';
import {
    IEquatable,
    DestroyableMixin,
    OptionsToPropertyMixin,
    ObservableMixin,
    format,
} from '../entity';
import { mixin } from '../util';
import { EntityMarker } from 'Types/declarations';

type DictionaryValues<T> = T[] | Record<string, T>;

/**
 * Абстрактная сущность, в которой словарь представляет собой набор ключей и значений.
 * @public
 * @remark
 * Это абстрактный класс, и у него не может быть экземпляров.
 */
export default abstract class Dictionary<T>
    extends mixin<DestroyableMixin, OptionsToPropertyMixin, ObservableMixin>(
        DestroyableMixin,
        OptionsToPropertyMixin,
        ObservableMixin
    )
    implements IEnumerable<T>, IEquatable
{
    /**
     * Коллекция ключей и значений.
     */
    protected _$dictionary: DictionaryValues<T>;

    protected _$localeDictionary: DictionaryValues<T>;

    /**
     * Название конкретного типа, который использовался при сериализации. Должен быть переопределен.
     */
    protected _type: string;

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': EntityMarker;

    // endregion

    // region IEquatable

    readonly '[Types/_entity/IEquatable]': EntityMarker;

    constructor(options?: object) {
        super();
        OptionsToPropertyMixin.initMixin(this, options);
        ObservableMixin.initMixin(this, options);
        this._$dictionary = this._$dictionary || [];
    }

    destroy(): void {
        ObservableMixin.prototype.destroy.call(this);
        super.destroy();
    }

    getEnumerator(localize?: boolean): IEnumerator<T> {
        const dictionary =
            localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
        const enumerator =
            dictionary instanceof Array
                ? new ArrayEnumerator<T>(dictionary)
                : new Objectwise<T>(dictionary);

        enumerator.setFilter((_item: any, index: any): boolean => {
            return index !== 'null';
        });

        return enumerator;
    }

    each(callback: EnumeratorCallback<T>, context?: object, localize?: boolean): void {
        context = context || this;
        const enumerator = this.getEnumerator(localize);
        while (enumerator.moveNext()) {
            callback.call(context, enumerator.getCurrent() as T, enumerator.getCurrentIndex());
        }
    }

    isEqual(to: any): boolean {
        if (!(to instanceof Dictionary)) {
            return false;
        }

        const enumerator = this.getEnumerator();
        const toEnumerator = to.getEnumerator();
        let item;
        let hasItem;
        let toItem;
        let hasToItem;

        do {
            hasItem = enumerator.moveNext();
            hasToItem = toEnumerator.moveNext();
            item = hasItem ? enumerator.getCurrent() : undefined;
            toItem = hasToItem ? toEnumerator.getCurrent() : undefined;
            if (item !== toItem) {
                return false;
            }
            if (enumerator.getCurrentIndex() !== toEnumerator.getCurrentIndex()) {
                return false;
            }
        } while (hasItem || hasToItem);

        return true;
    }

    // endregion

    // region Public methods

    /**
     * Возвращает коллекцию ключей и значений.
     * @param localizeShould return localized version
     * @protected
     */

    /*
     * Returns collection of keys and values
     * @param [localize=false] Should return localized version
     * @protected
     */
    getDictionary(localize?: boolean): DictionaryValues<T> {
        const dictionary =
            localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary;
        return dictionary
            ? Array.isArray(dictionary)
                ? dictionary.slice()
                : { ...dictionary }
            : dictionary;
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает ключ значения в словаре.
     * @param name Значение для поиска.
     * @protected
     */

    /*
     * Returns key of the value in dictionary
     * @param name Value for lookup
     * @protected
     */
    protected _getIndex(name: T, localize?: boolean): IIndex | undefined {
        const enumerator = this.getEnumerator(localize);
        while (enumerator.moveNext()) {
            if (enumerator.getCurrent() === name) {
                return enumerator.getCurrentIndex();
            }
        }
        return undefined;
    }

    /**
     * Возвращает значение ключа в словаре.
     * @param index Ключ для поиска.
     * @protected
     */

    /*
     * Returns value of the key in dictionary
     * @param index Key for lookup
     * @protected
     */
    protected _getValue(index: IIndex, localize?: boolean): any {
        const typedDictionary = (
            localize && this._$localeDictionary ? this._$localeDictionary : this._$dictionary
        ) as Record<string, T>;
        const typedIndex = index as string;

        return typedDictionary[typedIndex];
    }

    /**
     * Извлекает словарь из формата поля.
     * @param format Формат поля.
     * @protected
     */

    /*
     * Extracts dictionary from the field format.
     * @param format Field format
     * @protected
     */
    protected _getDictionaryByFormat(
        format?: format.Field | format.UniversalField
    ): any[] | Record<string, any> {
        if (!format) {
            return [];
        }
        return (
            ((format as format.DictionaryField).getDictionary
                ? (format as format.DictionaryField).getDictionary()
                : (format as format.UniversalField).meta &&
                  ((format as format.UniversalField).meta as format.IUniversalFieldDictionaryMeta)
                      .dictionary) || []
        );
    }

    /**
     * Извлекает словарь из формата поля.
     * @param format Формат поля.
     * @protected
     */

    /*
     * Extracts dictionary from the field format.
     * @param format Field format
     * @protected
     */
    protected _getLocaleDictionaryByFormat(
        format?: format.Field | format.UniversalField
    ): any[] | Record<string, any> | undefined {
        if (!format) {
            return;
        }
        return (
            ((format as format.DictionaryField).getLocaleDictionary
                ? (format as format.DictionaryField).getLocaleDictionary()
                : (format as format.UniversalField).meta &&
                  ((format as format.UniversalField).meta as format.IUniversalFieldDictionaryMeta)
                      .localeDictionary) || undefined
        );
    }

    // endregion
}

Object.assign(Dictionary.prototype, {
    '[Types/_collection/Dictionary]': true,
    '[Types/_collection/IEnumerable]': true,
    '[Types/_entity/IEquatable]': true,
    _$dictionary: undefined,
    _$localeDictionary: undefined,
    _type: undefined,
});
