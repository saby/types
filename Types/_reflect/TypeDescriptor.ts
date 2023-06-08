import { getStateReceiver, setStore, getStore } from 'Application/Env';
import { IStore } from 'Application/Request';
import { ISerializableState } from 'Application/State';
import { merge as mergeObjects } from 'Types/object';
import { Set } from 'Types/shim';
import {
    IProperty,
    IPropertyArrayItem,
    ISourceArguments,
    IType,
    ITypeDescription,
    ITypeSource,
    TTypeId,
} from './IType';

/**
 * Объединяет 2 массива. Дублирующиеся элементы включаются в новый массив в единственном экземпляре.
 * @param array
 * @param parentArray
 */
function mergeArrays(array: unknown[] = [], parentArray: unknown[] = []): unknown[] {
    return Array.from(new Set([...array, ...parentArray]));
}

/**
 * Используется для объединения полей "type" у свойств.
 * Проверяет, что у объединяемых свойств установлены одинаковые типы.
 * @param type
 * @param parentType
 * @param key
 */
function mergePropType(type: string, parentType: string, key?: string): string {
    if (type !== parentType) {
        throw new Error(
            `Не соответствуют типы для свойства с именем ${key} в properties типа и родителя`
        );
    }

    return type;
}

/**
 * Функция объединяющая 2 объекта.
 * @param prop
 * @param parentProp
 * @param specificProps
 */
function merge(
    prop: object = {},
    parentProp: object = {},
    specificProps?: {
        [name: string]: (prop: unknown, parentProp: unknown, key?: string) => unknown;
    }
): unknown {
    for (const key in parentProp) {
        if (specificProps && specificProps[key]) {
            prop[key] = specificProps[key](prop[key], parentProp[key], key);
        } else if (Array.isArray(parentProp[key])) {
            prop[key] = mergeArrays(prop[key], parentProp[key]);
        } else if (typeof parentProp[key] === 'object') {
            prop[key] = mergeObjects(prop[key], parentProp[key]);
        } else if (!prop.hasOwnProperty(key)) {
            // Если свойства нет в типе, тогда берем его из родителя, иначе свойство не меняем
            prop[key] = parentProp[key];
        }
    }

    return prop;
}

function mergeSources(
    source: { [name: string]: ITypeSource } = {},
    parentSource: { [name: string]: ITypeSource } = {}
): { [name: string]: ITypeSource } {
    // TODO: нужно поддержать работу, если есть единственный source и все настройки лежат на корне
    for (const sourceName in parentSource) {
        // Если настройки нет в типе, тогда добавляем
        // Если настройка есть и reference совпадают, то мержим аргументы
        // Если настройка есть, но reference отличаются, то нужно оставить аргументы без изменений
        if (!source.hasOwnProperty(sourceName)) {
            source[sourceName] = parentSource[sourceName];
        } else if (
            source[sourceName].reference === parentSource[sourceName].reference ||
            !source[sourceName].reference
        ) {
            source[sourceName] = merge(source[sourceName], parentSource[sourceName]) as ITypeSource;
        }
    }

    return source;
}

/**
 * Объединяет типы данных. Используется для реализации наследования.
 * @param type
 * @param parentType
 */
function mergeTypes(
    type: IType | ITypeDescription,
    parentType: IType | ITypeDescription
): IType | ITypeDescription {
    const specificProps = {
        source: mergeSources,
        properties: mergeProperties,
    };
    type = merge(type, parentType, specificProps);

    return type;
}

/**
 * Объединяет описание свойств типа.
 * @param prop
 * @param parentProp
 */
function mergeProperties(
    prop: { [name: string]: IProperty<unknown> } = {},
    parentProp: { [name: string]: IProperty<unknown> } = {}
): { [name: string]: IProperty<unknown> } {
    const specificProps = {
        propertyDescription: mergeTypes,
        type: mergePropType,
    };
    for (const key in parentProp) {
        if (!prop[key]) {
            prop[key] = parentProp[key];
        } else {
            prop[key] = merge(prop[key], parentProp[key], specificProps) as IProperty<unknown>;
        }
    }

    return prop;
}

/**
 * Возвращает метаинформацию по типу.
 * @param type Описание типа.
 * @param name Имя метаинформации.
 */
function getTypeMetadata(type: ITypeDescription, name: string): unknown {
    const meta = ['title', 'description', 'icon', 'category', 'permissions', 'permissionMode'];
    if (meta.includes(name)) {
        return type[name];
    }
    return type.meta ? type.meta[name] : undefined;
}

export interface ITypes {
    [key: string]: IType;
}

interface ITypeStore {
    add: (metadata: IType) => void;
    get: (typeId: TTypeId) => IType;
    has: (typeId: TTypeId) => boolean;
}

class TypeStore implements ITypeStore {
    private _types: ITypes = {};

    add(metadata: IType): void {
        this._types[metadata.typeId] = metadata;
    }

    get(typeId: TTypeId): IType {
        return this._types[typeId];
    }

    has(typeId: TTypeId): boolean {
        return typeId in this._types;
    }
}

/**
 * Позволяет получить данные о типе в едином формате по идентификатору типа.
 * @public
 */
export class TypeDescriptor {
    protected _rawTypes: ITypeStore = new TypeStore();
    protected _cache: ITypeStore = new TypeStore();

    /**
     * Добавляет информацию о типе.
     */
    addType(metadata: IType): void {
        if (this.hasType(metadata.typeId)) {
            throw new Error(`Тип с идентификатором ${metadata.typeId} уже существует`);
        }
        this._rawTypes.add(metadata);
    }

    /**
     * Возвращает логическое значение, показывающее, существует ли тип с указанным идентификатором в провайдере типов.
     * @param {TTypeId} typeId Идентификатор типа.
     */
    hasType(typeId: TTypeId): boolean {
        return this._rawTypes.has(typeId);
    }

    /**
     * Возвращает информацию о типе по идентификатору типа.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     */
    protected _getType(typeId: TTypeId): IType {
        let type = this._cache.get(typeId);

        if (!type) {
            type = this._calculateType(typeId);
            this._cache.add(type);
        }

        return type;
    }

    /**
     * Возвращает путь до конструктора или функции, который создает объект этого типа.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     * @param mode Режим отображения.
     */
    getSource(typeId: TTypeId, mode: string): string {
        const source = this._getType(typeId).source;
        return source && source[mode]?.reference;
    }

    /**
     * Возвращает аргументы для конструктора или функции, переданные в reference.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     * @param mode Режим отображения.
     */
    getSourceArguments(typeId: TTypeId, mode: string): ISourceArguments {
        const source = this._getType(typeId).source;
        return source && source[mode]?.arguments;
    }

    /**
     * Возвращает путь до js метода, который вернет конфигурацию для загрузки данных.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     * @param mode Режим отображения.
     * @deprecated Данная настройка является временной, и будет удалена.
     */
    getSourceConfigGetter(typeId: TTypeId, mode: string): string {
        const source = this._getType(typeId).source;
        return source && source[mode]?.sourceConfigGetter;
    }

    /**
     * Возвращает набор свойств.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     */
    getProperties(typeId: TTypeId): { [name: string]: IProperty<unknown> } {
        return this._getType(typeId).properties;
    }

    /**
     * Возвращает набор свойств в виде отсортированного массива.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     */
    getPropertiesArray(typeId: TTypeId): IPropertyArrayItem<unknown>[] {
        const properties = this.getProperties(typeId);
        const propertiesArray = [];

        // eslint-disable-next-line guard-for-in
        for (const key in properties) {
            propertiesArray.push({ name: key, ...properties[key] });
        }

        propertiesArray.sort((a, b) => {
            return a.order > b.order ? 1 : -1;
        });

        return propertiesArray;
    }

    /**
     * Возвращает массив зон доступа.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     */
    getPermissions(typeId: TTypeId): string[] {
        return this._getType(typeId).permissions;
    }

    /**
     * Возвращает режим работы с зонами доступа.
     * @param {TTypeId} typeId Идентификатор типа, информацию о котором нужно получить.
     */
    getPermissionsMode(typeId: TTypeId): number {
        return this._getType(typeId).permissionMode;
    }

    /**
     * Возвращает метаинформацию для типа.
     * @param typeId Идентификатор типа.
     * @param name Имя мета данных.
     */
    getMetadata(typeId: TTypeId, name: string): unknown {
        const type = this._getType(typeId);
        return getTypeMetadata(type, name);
    }

    /**
     * Возвращает тип свойства.
     * @param typeId Идентификатор типа, тип свойства которого надо получить.
     * @param propertyName Имя свойства.
     */
    getPropertyType(typeId: TTypeId, propertyName: string): string {
        return this.getProperties(typeId)[propertyName].type;
    }

    /**
     * Возвращает метаданные свойства.
     * @param typeId Идентификатор типа, тип свойства которого надо получить.
     * @param propertyName Имя свойства.
     * @param metadataName Имя мета данных.
     */
    getPropertyMetadata(typeId: TTypeId, propertyName: string, metadataName: string): unknown {
        const property = this.getProperties(typeId)[propertyName];
        if (metadataName === 'defaultValue') {
            return property?.defaultValue;
        }

        return getTypeMetadata(property.propertyDescription, metadataName);
    }

    private _calculateType(typeId: TTypeId): IType {
        const rawType = this._rawTypes.get(typeId);

        if (!rawType) {
            throw new Error(`Тип с идентификатором ${typeId} отсутствует`);
        }

        let type = { ...rawType };

        if (type.extends?.length) {
            for (const parentId of type.extends) {
                if (!this.hasType(parentId)) {
                    throw new Error(
                        `Для типа ${typeId} отсутствует родительский тип с идентификатором ${parentId}`
                    );
                }
                const parentType = this._getType(parentId);
                type = mergeTypes(type, parentType) as IType;
            }
        }

        return type;
    }
}

const STORE_KEY: string = 'TypeDescriptorRawTypes';
const CACHE_STORE_KEY: string = 'TypeDescriptorTypesCache';
const STORE_REGISTERED_KEY: string = 'TypeDescriptorRegistered';

function getTDStore(key: string): IStore<Record<string, IType>> {
    if (!getStore(key)) {
        getStateReceiver().register(key, this);
        setStore(key, {} as IStore<Record<string, IType>>);
    }
    return getStore(key);
}

class SingletonTypeStore implements ITypeStore {
    private readonly _key: string;

    constructor(key: string) {
        this._key = key;
    }

    add(metadata: IType): void {
        getTDStore(this._key).set(metadata.typeId, metadata);
    }

    get(typeId: TTypeId): IType {
        return getTDStore(this._key).get(typeId);
    }

    has(typeId: TTypeId): boolean {
        const store = getTDStore(this._key);
        // Не корректно работает метод getKeys
        // https://online.sbis.ru/opendoc.html?guid=09a2644a-0c09-476c-98a1-1f2105a6d758
        // return getTDStore().getKeys().indexOf(typeId) !== -1;
        return typeId in store.toObject().__data;
    }
}

/**
 * Реализация TypeDescriptor в виде синглтона с сохранением состояния для восстановления на клиенте.
 */
// Удалить @ts-ignore после удаления _types.
// https://online.sbis.ru/opendoc.html?guid=b70fc929-7012-4634-866d-404857b9c669
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class TypeDescriptorSingleton extends TypeDescriptor implements ISerializableState {
    protected _rawTypes: ITypeStore = new SingletonTypeStore(STORE_KEY);
    protected _cache: ITypeStore = new SingletonTypeStore(CACHE_STORE_KEY);

    addType(metadata: IType): void {
        this._initStateReceiver();
        super.addType(metadata);
    }

    hasType(typeId: TTypeId): boolean {
        this._initStateReceiver();
        return super.hasType(typeId);
    }

    protected _getType(typeId: TTypeId): IType {
        this._initStateReceiver();
        return super._getType(typeId);
    }

    getState(): ITypes {
        const state = {};
        const store = getTDStore(STORE_KEY);
        // Не корректно работает метод getKeys
        // https://online.sbis.ru/opendoc.html?guid=09a2644a-0c09-476c-98a1-1f2105a6d758
        // for (const key of store.getKeys()) {
        for (const key of Object.keys(store.toObject().__data)) {
            state[key] = store.get(key);
        }
        return state;
    }

    setState(data: ITypes): void {
        const store = getTDStore(STORE_KEY);
        for (const [key, type] of Object.entries(data)) {
            store.set(key, type);
        }
    }

    private _initStateReceiver(): void {
        const store: IStore<Record<string, boolean>> = getStore(STORE_REGISTERED_KEY);
        if (!store.get('Registered')) {
            this._registered = true;
            store.set('Registered', true);
            getStateReceiver().register(STORE_KEY, this);
        }
    }

    destroy(): void {
        getStateReceiver().unregister(STORE_KEY);
    }

    // Удалить после того как будут убраны множественные перезаписи типов.
    // https://online.sbis.ru/opendoc.html?guid=b70fc929-7012-4634-866d-404857b9c669
    private _registered: boolean = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private set _types(value: ITypes) {
        if (this._registered) {
            let store = getTDStore(STORE_KEY);
            for (const key of Object.keys(store.toObject().__data)) {
                store.remove(key);
            }
            store = getTDStore(CACHE_STORE_KEY);
            for (const key of Object.keys(store.toObject().__data)) {
                store.remove(key);
            }
        }
    }
}

export const typeDescriptor = new TypeDescriptorSingleton();
