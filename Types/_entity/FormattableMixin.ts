// eslint-disable-next-line
/* eslint-disable deprecated-anywhere */
/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import {
    Field,
    fieldsFactory,
    UniversalField,
    IFieldDeclaration,
    FormatDeclaration,
} from './format';
import { Cow as CowAdapter, IAdapter, ITable, IRecord, IDecorator, IMetaData } from './adapter';
import ISerializable from './ISerializable';
import { IState as IDefaultSerializableState } from './SerializableMixin';
import { resolve, create, isRegistered } from '../di';
import { format } from '../collection';
import { object, logger } from '../util';
import { EntityMarker } from 'Types/declarations';

const defaultAdapter = 'Types/entity:adapter.Json';

/**
 *
 */
export type FormatDescriptor = format.Format | FormatDeclaration;
/**
 *
 */
export type AdapterDescriptor = IAdapter | string;
/**
 *
 */
export type GenericAdapter = ITable | IRecord | IDecorator | IMetaData;

function isDecorator(value: any): value is IDecorator {
    return !!value['[Types/_entity/adapter/IDecorator]'];
}

/**
 * Интерфейс опций конструктора FormattableMixin
 * @public
 */
export interface IOptions {
    /**
     * Адаптер, обеспечивающий доступ к необработанным данным определенного формата.
     */
    adapter?: AdapterDescriptor;
    /**
     * Данные в необработанном формате, которые могут быть распознаны через определенный адаптер.
     */
    rawData?: any;
    /**
     * Формат полей.
     */
    format?: FormatDescriptor | format.Format;
    /**
     * Работа с необработанными данными в режиме Copy-On-Write.
     */
    cow?: boolean;

    /**
     * Название типа записи (название формата)
     */
    typeName?: string;
}

/**
 *
 */
export interface ISerializableState<T = IOptions> extends IDefaultSerializableState<T> {
    /**
     *
     */
    $options?: T;
}

/**
 * Создает формат путем объединения неполного формата с форматом, полученным из необработанных данных.
 * @param partialFormat Неполный формат.
 * @param rawDataFormat Формат, полученный из необработанных данных.
 */
function buildFormatFromObject(
    partialFormat: Record<string, unknown>,
    rawDataFormat: format.Format
): format.Format {
    let field;
    let fieldIndex;
    for (const name in partialFormat) {
        if (!partialFormat.hasOwnProperty(name)) {
            continue;
        }

        field = partialFormat[name];
        if (typeof field !== 'object') {
            field = { type: field };
        }
        if (!(field instanceof Field)) {
            field = fieldsFactory(field as IFieldDeclaration);
        }
        field.setName(name);

        fieldIndex = rawDataFormat.getFieldIndex(name);
        if (fieldIndex === -1) {
            rawDataFormat.add(field);
        } else {
            rawDataFormat.replace(field, fieldIndex);
        }
    }

    return rawDataFormat;
}

/**
 * Строит формат по необработанным данным.
 */
function buildFormatByRawData(this: FormattableMixin): format.Format {
    const format = create<format.Format>('Types/collection:format.Format');
    const adapter = this._getRawDataAdapter() as ITable;
    const fields = this._getRawDataFields();
    const count = fields.length;

    for (let i = 0; i < count; i++) {
        format.add(adapter.getFormat(fields[i]));
    }

    return format;
}

export function isFormat(value: any) {
    return !!value['[Types/_collection/format/Format]'];
}

interface IDeprecated {
    /**
     * Старомодные параметры.
     * @deprecated
     */
    _options: any;
}

/**
 * Миксин обеспечивает возможность определения формата полей и доступа к данным через специальный уровень абстракции, называемый адаптером.
 * @public
 */
export default abstract class FormattableMixin {
    '[Types/_entity/FormattableMixin]': EntityMarker = true;

    /**
     * Данные в необработанном формате, которые могут быть распознаны через определенный адаптер.
     * @see {@link getRawData}
     * @remark
     * Данные должны быть в определенном формате, который поддерживается соответствующим адаптером ({@link Types/entity:adapter.IAdapter}).
     * Данные должны содержать только примитивные значения, массивы и простые объекты для совместного использования, копирования и сериализации.
     * @example
     * Создадим запись сотрудника:
     * <pre>
     *    import {Record} from 'Types/entity';
     *    const employee = new Record({
     *       rawData: {
     *          id: 1,
     *          firstName: 'John',
     *          lastName: 'Smith'
     *       }
     *    });
     *
     *    console.log(employee.get('id')); // 1
     *    console.log(employee.get('firstName')); // John
     *    console.log(employee.get('lastName')); // Smith
     * </pre>
     * Создадим набор записей с персонажами фильма:
     * <pre>
     *    import {RecordSet} from 'Types/collection';
     *    const characters = new RecordSet({
     *       rawData: [{
     *          id: 1,
     *          firstName: 'John',
     *          lastName: 'Connor',
     *          part: 'Savior'
     *       }, {
     *          id: 2,
     *          firstName: 'Sarah',
     *          lastName: 'Connor',
     *          part: 'Mother'
     *       }, {
     *          id: 3,
     *          firstName: '-',
     *          lastName: 'T-800',
     *          part: 'A human-like robot from the future'
     *       }]
     *    });
     *
     *    console.log(characters.at(0).get('firstName'));// John
     *    console.log(characters.at(0).get('lastName'));// Connor
     *    console.log(characters.at(1).get('firstName'));// Sarah
     *    console.log(characters.at(1).get('lastName'));// Connor
     * </pre>
     */
    protected _$rawData: any;

    /**
     * Работа с необработанными данными в режиме Copy-On-Write.
     */
    protected _$cow: boolean;

    /**
     * Адаптер, обеспечивающий доступ к необработанным данным определенного формата. По умолчанию поддерживаются необработанные данные в формате {@link Types/entity:adapter.Json}.
     * @see {@link getAdapter}
     * @see {@link Types/di}
     * @remark
     * Адаптер должен быть определен для работы с форматом необработанных данных.
     * @example
     * Создадим запись с адаптером для формата данных сервера приложений СБИС:
     * <pre>
     *    import {Record, adapter} from 'Types/entity';
     *    const user = new Record({
     *       adapter: new adapter.Sbis(),
     *       format: [
     *          {name: 'login', type: 'string'},
     *          {name: 'email', type: 'string'}
     *       ]
     *    });
     *    user.set({
     *       login: 'root',
     *       email: 'root@server.name'
     *    });
     * </pre>
     */
    protected _$adapter: IAdapter | IDecorator | string;

    /**
     * Формат полей. Это может быть либо полный формат (в этом случае он должен быть определен как массив или экземпляр класса {@link Types/_collection/format/Format Format}), либо как частичный формат (в этом случае он должен быть определен как простой объект).
     * @see {@link getFormat}
     * @remark
     * Формат, переданный через данную опцию, считается явно заданным форматом.
     * Имеются следующие правила {@link getFormat построения конечного формата} в зависимости от типа значения, переданного в данную опцию:
     * <ul>
     *     <li>формат будет построен из необработанных данных, если опцию не удалось определить;</li>
     *     <li>если опция определяет полную версию формата, тогда он будет взят за основу;</li>
     *     <li>если опция определяет частичную версию формата, тогда конечный формат будет построен из необработанных данных с добавлением данного частичного формата согласно следующим правилам:
     *         <ul>
     *             <li>если поле с полученным именем существует в формате необработанных данных, тогда его объявление в неполном формате заменит соответствующее объявление в формате необработанных данных;</li>
     *             <li>в противном случае объявление будет добавлено в конец формата необработанных данных.</li>
     *         </ul>
     *     </li>
     * </ul>
     * @example
     * Создадим запись с декларативным форматом:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const user = new Record({
     *         format: [{
     *             name: 'id',
     *             type: 'integer'
     *         }, {
     *             name: 'login',
     *             type: 'string'
     *         }, {
     *             name: 'amount',
     *             type: 'money',
     *             precision: 4
     *         }]
     *     });
     * </pre>
     * Создадим набор записей с внедренным экземпляром формата:
     * <pre>
     *     // My/Format/user.ts
     *     import {format as fields} from 'Types/entity';
     *     import {format} from 'Types/collection';
     *     const format = new format.Format();
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
     * Создадим запись с неполным декларативным форматом:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const user = new Record({
     *         rawData: {
     *             id: 256,
     *             login: 'dr.strange',
     *             amount: 15739.45
     *         },
     *         format: {
     *             id: 'integer',
     *             amount: {type: 'money', precision: 4}
     *         }]
     *     });
     * </pre>
     * Создадим запись с неполным форматом, которая содержит экземпляр поля:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const amountField = new entity.format.MoneyField({precision: 4}),
     *     const user = new Record({
     *         format: {
     *             amount: amountField
     *         }]
     *     });
     * </pre>
     * Создадим запись с неполным форматом, который содержит встроенные типы:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const user = new entity.Record({
     *         format: {
     *             id: Number,
     *             lastLogin: Date
     *         }
     *     });
     * </pre>
     * Добавим набор записей с пользовательской моделью в одно из полей записи:
     * <pre>
     *     //MyApplication/Models/ActivityModel.ts
     *     import {Model} from 'Types/entity';
     *     export default class ActivityModel extends Model{
     *         //...
     *     }
     *
     *     //MyApplication/Models/ActivityRecordSet.ts
     *     import ActivityModel from './ActivityModel';
     *     import {RecordSet} from 'Types/collection';
     *     export default class ActivityRecordSet extends RecordSet {
     *         _$model: ActivityModel
     *     }
     *
     *     //MyApplication/Controllers/ActivityController.ts
     *     import ActivityRecordSet from '../Models/ActivityRecordSet';
     *     import {Record} from 'Types/entity';
     *     const user = new Record({
     *         format: {
     *             activity: ActivityRecordSet
     *         }
     *     });
     * </pre>
     * Создадим запись корзины покупок, которая использует формат данных сервера приложения СБИС:
     * <pre>
     *     import {Record, adapter} from 'Types/entity';
     *     import {RecordSet} from 'Types/collection';
     *
     *     const order = new Record({
     *         adapter: new adapter.Sbis(),
     *         format: [{
     *             name: 'id',
     *             type: 'integer',
     *             defaultValue: 0
     *         }, {
     *             name: 'items',
     *             type: 'recordset'
     *         }]
     *     });
     *
     *     const orderItems = new RecordSet({
     *         adapter: new adapter.Sbis(),
     *         format: [{
     *             name: 'goods_id',
     *             type: 'integer',
     *             defaultValue: 0
     *         }, {
     *             name: 'price',
     *             type: 'real',
     *             defaultValue: 0
     *         }, {
     *             name: 'count',
     *             type: 'integer',
     *             defaultValue: 0
     *         }]
     *     });
     *
     *     order.set('items', orderItems);
     * </pre>
     */
    protected _$format: FormatDescriptor | null;

    protected _$typeName: string;

    /**
     * Окончательно построенный формат.
     */
    protected _format: format.Format;

    /**
     * Копия _format, которая используется для кэширования в getFormat()
     */
    protected _formatClone: format.Format | null;

    /**
     * Значение _$format не связано с исходным значением.
     */
    protected _formatUnlinked: boolean;

    /**
     * Экземпляр адаптера для работы с необработанными данными.
     */
    protected _rawDataAdapter: GenericAdapter | null;

    /**
     * Список имен полей, взятых из адаптера необработанных данных.
     */
    protected _rawDataFields: string[] | null;

    constructor() {
        FormattableMixin.initMixin(this);
    }

    static initMixin(instance: any) {
        // FIXME: get rid of _options
        if (
            !instance._$format &&
            (instance as unknown as IDeprecated)._options &&
            (instance as unknown as IDeprecated)._options.format
        ) {
            instance._$format = (instance as unknown as IDeprecated)._options.format;
        }
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        if (state.$options) {
            state.$options.rawData = this._getRawData();
        }
        return state;
    }

    _setSerializableState(_state: ISerializableState): Function {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return function (): void {};
    }

    // endregion

    // region Public methods

    /**
     * Возвращает необработанные данные (клонирует, если есть объект).
     * @example
     * Пример:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const data = {id: 1, title: 'Article 1'};
     *     const article = new Record({
     *         rawData: data
     *     });
     *
     *     console.log(article.getRawData()); // {id: 1, title: 'Article 1'}
     *     console.log(article.getRawData() === data); // false
     *     console.log(JSON.stringify(article.getRawData()) === JSON.stringify(data)); // true
     * </pre>
     */
    getRawData(shared?: boolean): any {
        return shared
            ? this._getRawData()
            : object.clonePlain(this._getRawData(), { keepUndefined: false });
    }

    /**
     * Устанавливает необработанные данные.
     * @param data Необработанные данные.
     * @see {@link getRawData}
     * @example
     * Пример:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record();
     *     article.setRawData({id: 1, title: 'Article 1'});
     *     console.log(article.get('title'));// Article 1
     * </pre>
     */
    setRawData(data: any): void {
        this._resetRawDataAdapter(data);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Возвращает адаптер для обработки необработанных данных.
     * @example
     * Пример:
     * <pre>
     *     import {Record, adapter} from 'Types/entity';
     *     const article = new Record();
     *     console.log(article.getAdapter() instanceof adapter.Json); // true
     * </pre>
     */
    getAdapter(): IAdapter {
        let adapter = this._getAdapter();
        if (isDecorator(adapter)) {
            adapter = adapter.getOriginal() as IAdapter;
        }
        return adapter as IAdapter;
    }

    /**
     * Возвращает признак того, что формат был задан явно (передан через опцию format конструктора).
     * @see {@link createDeclaredFormat}
     */
    hasDeclaredFormat(): boolean {
        return !!this._$format;
    }

    /**
     * Обнуляет явно заданный формат.
     */
    resetDeclaredFormat(): void {
        this._$format = this._formatClone = null;
    }

    /**
     * Создает новый формат из полей текущего построенного и выставляет его как явно заданный формат.
     */
    createDeclaredFormat(): void {
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Возвращает формат поля в режиме "только для чтения".
     * @example
     * Получим формат, построенный по декларативному описанию:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         format: [
     *             {name: 'id', type: 'integer'},
     *             {name: 'title', type: 'string'}
     *         ]
     *     });
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     * Получим формат, построенный на необработанных данных:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'What About Livingstone'
     *         }
     *     });
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     * Создадим явно заданный формат, на основе формата, построенного на необработанных данных:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const article = new Record({
     *         rawData: {
     *             id: 1,
     *             title: 'What About Livingstone'
     *         }
     *     });
     *     article.hasDeclaredFormat();// false
     *     article.createDeclaredFormat();
     *     article.hasDeclaredFormat();// true
     *
     *     const format = article.getFormat();
     *
     *     console.log(format.at(0).getName());// 'id'
     *     console.log(format.at(1).getName());// 'title'
     * </pre>
     */
    getFormat(shared?: boolean): format.Format {
        if (shared) {
            return this._getFormat(true);
        }
        if (!this._formatClone) {
            this._formatClone = this._getFormat(true).clone(true);
        }
        return this._formatClone as format.Format;
    }

    /**
     * Добавляет поле в формат.
     * @remark
     * Если поле с указанным именем уже существует, выдает исключение.
     * Если формат задан не явно, то добавление поля приведет к вычислению и установке явного формата.
     * @param format Формат поля.
     * @param at Положение поля. Если опущено или определено как -1, то будет добавлено в конец.
     * @see {@link removeField}
     * @example
     * Добавим поле как декларацию:
     * <pre>
     *     import {Record} from 'Types/entity';
     *     const record = new Record();
     *     record.addField({name: 'login', type: 'string'});
     *     record.addField({name: 'amount', type: 'money', precision: 3});
     * </pre>
     * Добавим поле как экземпляр:
     * <pre>
     *     import {RecordSet} from 'Types/collection';
     *     import {format} from 'Types/entity';
     *     const recordset = new RecordSet();
     *     recordset.addField(new format.StringField({name: 'login'}));
     *     recordset.addField(new format.MoneyField({name: 'amount', precision: 3}));
     * </pre>
     */
    addField(format: Field, at?: number): void {
        format = this._buildField(format);
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();

        (this._getRawDataAdapter() as ITable).addField(format, at);
        this._$format.add(format, at);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Удаляет поле из формата по его имени.
     * @remark
     * Если поле с указанным именем не существует, выдает исключение.
     * @param name Имя поля.
     * @see {@link addField}
     * @see {@link removeFieldAt}
     * @example
     * <pre>
     *     import {Record} from 'Types/entity';
     *     // create record somehow
     *     record.removeField('login');
     * </pre>
     */
    removeField(name: string): void {
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();

        (this._getRawDataAdapter() as ITable).removeField(name);
        this._$format.removeField(name);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    /**
     * Удаляет поле из формата по его позиции.
     * @param at Позиция поля.
     * @see {@link addField}
     * @see {@link removeField}
     * @example
     * <pre>
     *     import {Record} from 'Types/entity';
     *     // create record somehow
     *     record.removeFieldAt(0);
     * </pre>
     */
    removeFieldAt(at: number): void {
        this._$format = this._getFormat(true);
        this._unlinkFormatOption();

        (this._getRawDataAdapter() as ITable).removeFieldAt(at);
        this._$format.removeAt(at);
        this._resetRawDataFields();
        this._clearFormatClone();
    }

    // endregion

    // region Protected methods

    /**
     * Возвращает необработанные данные из адаптера.
     */
    protected _getRawData(): any {
        const shouldUseAdapter = this._rawDataAdapter || this.hasDeclaredFormat();
        return shouldUseAdapter
            ? (this._getRawDataAdapter() as IRecord | ITable).getData()
            : this._getRawDataFromOption();
    }

    /**
     * Возвращает исходные данные, введенные через параметр.
     */
    protected _getRawDataFromOption(): any {
        return typeof this._$rawData === 'function' ? this._$rawData() : this._$rawData;
    }

    /**
     * Возвращает адаптер по умолчанию, как это и должно быть.
     * @deprecated Метод _getDefaultAdapter() устарел. Вместо этого используйте опцию 'adapter'.
     */
    protected _getDefaultAdapter(): string {
        return defaultAdapter;
    }

    /**
     * Возвращает общий экземпляр адаптера.
     */
    protected _getAdapter(): IAdapter | IDecorator {
        if (
            this._$adapter === defaultAdapter &&
            FormattableMixin.prototype._getDefaultAdapter !== this._getDefaultAdapter
        ) {
            this._$adapter = this._getDefaultAdapter();
        }

        if (this._$adapter && !(this._$adapter instanceof Object)) {
            this._$adapter = create<IAdapter>(this._$adapter);
        }

        if (this._$cow && !isDecorator(this._$adapter)) {
            this._$adapter = new CowAdapter(this._$adapter as IAdapter);
        }

        return this._$adapter as IAdapter;
    }

    /**
     * Возвращает экземпляр адаптера для определенного типа данных.
     */
    protected _getRawDataAdapter(): GenericAdapter {
        if (!this._rawDataAdapter) {
            this._rawDataAdapter = this._createRawDataAdapter();
            this._initRawDataAdapter(this._rawDataAdapter);
        }

        return this._rawDataAdapter;
    }

    /**
     * Создает экземпляр адаптера для определенного типа данных (таблица, запись, декоратор или метаданные).
     */
    protected _createRawDataAdapter(): GenericAdapter {
        throw new Error('Method must be implemented');
    }

    /**
     * Инициализирует экземпляр адаптера.
     */
    protected _initRawDataAdapter(adapter: GenericAdapter): void {
        // Sync raw data fields with declared format if necessary
        if (this.hasDeclaredFormat()) {
            // Unwrap decorated adapter
            if (isDecorator(adapter)) {
                adapter = (adapter as IDecorator).getOriginal() as ITable | IRecord;
            }

            // TODO: cope with the problem of data normalization
            if ((adapter as any)._touchData) {
                (adapter as any)._touchData();
            }

            // Add fields from format which don't exists in raw data
            const fields = (adapter as IRecord & ITable).getFields();
            this._getFormat().each((fieldFormat) => {
                try {
                    if (fields.indexOf(fieldFormat.getName()) === -1) {
                        (adapter as ITable | IRecord).addField(fieldFormat);
                    }
                } catch (err) {
                    if (err instanceof Error) {
                        logger.info(
                            `${
                                (this as unknown as ISerializable)._moduleName
                            }::constructor(): can't add raw data field (${err.message})`
                        );
                    }
                }
            });
        }

        if (this._$typeName) {
            (adapter as ITable | IRecord)?.setTypeName(this._$typeName);
        }
    }

    /**
     * Сбрасывает экземпляр адаптера для определенного типа данных.
     * @param data Необработанные данные.
     */
    protected _resetRawDataAdapter(data?: any): void {
        if (data === undefined) {
            if (this._rawDataAdapter && typeof this._$rawData !== 'function') {
                // Save possible rawData changes
                this._$rawData = (this._rawDataAdapter as ITable | IRecord).getData();
            }
        } else {
            this._$rawData = data;
        }

        this._rawDataAdapter = null;
    }

    /**
     * Проверяет совместимость адаптеров.
     * @param foreign Внешний адаптер, который следует проверить.
     */
    protected _checkAdapterCompatibility(foreign: IAdapter | IDecorator): void {
        let internal = this._getAdapter();

        if (isDecorator(foreign)) {
            foreign = (foreign as IDecorator).getOriginal() as IAdapter;
        }
        if (isDecorator(internal)) {
            internal = (internal as IDecorator).getOriginal() as IAdapter;
        }

        const internalProto = Object.getPrototypeOf(internal);
        if (!internalProto.isPrototypeOf(foreign)) {
            throw new TypeError(
                `The foreign adapter "${
                    (foreign as any)._moduleName
                }" is incompatible with the internal adapter ` +
                    `"${(internal as any)._moduleName}"`
            );
        }
    }

    /**
     * Возвращает список имен полей, взятых из адаптера необработанных данных.
     */
    protected _getRawDataFields(): string[] {
        return (
            this._rawDataFields ||
            (this._rawDataFields = (this._getRawDataAdapter() as ITable).getFields())
        );
    }

    /**
     * Добавляет поле в _rawDataFields.
     * @param name Field name
     */
    protected _addRawDataField(name: string): void {
        this._getRawDataFields().push(name);
    }

    /**
     * Сбрасывает _rawDataFields.
     */
    protected _resetRawDataFields(): void {
        this._rawDataFields = null;
    }

    /**
     * Возвращает формат поля.
     * @param buildПринудительная сборка формата, если он еще не создан.
     */
    protected _getFormat(build?: boolean): format.Format {
        if (!this._format) {
            if (this.hasDeclaredFormat()) {
                this._format = this._$format = FormattableMixin.prototype._buildFormat(
                    this._$format,
                    () => {
                        return buildFormatByRawData.call(this);
                    }
                );
            } else if (build) {
                this._format = buildFormatByRawData.call(this);
            }
        }

        return this._format;
    }

    /**
     * Очищает формат полей. Это работает, только если формат не был объявлен.
     */
    protected _clearFormat(): void {
        if (this.hasDeclaredFormat()) {
            throw new Error(
                `${
                    (this as any)._moduleName
                }: format can't be cleared because it's defined directly`
            );
        }
        // @ts-ignore
        this._format = null;
        this._clearFormatClone();
    }

    /**
     * Очищает _formatClone.
     */
    protected _clearFormatClone(): void {
        this._formatClone = null;
    }

    /**
     * Разрыв связи _$format с исходным значением.
     */
    protected _unlinkFormatOption(): void {
        if (!this._formatUnlinked && this._$format && isFormat(this._$format)) {
            this._format = (this._$format as format.Format) = (
                this._$format as format.Format
            ).clone(true);
            this._clearFormatClone();
            this._formatUnlinked = true;
        }
    }

    /**
     * Псевдоним для hasDeclaredFormat().
     * @deprecated
     */
    protected _hasFormat(): boolean {
        return this.hasDeclaredFormat();
    }

    /**
     * Возвращает формат поля с указанным именем.
     * @param name Имя поля.
     * @param adapter Экземпляр адаптера.
     */
    protected _getFieldFormat(name: string, adapter: ITable | IRecord): Field | UniversalField {
        if (this.hasDeclaredFormat()) {
            const fields = this._getFormat();
            const index = fields.getFieldIndex(name);
            if (index > -1) {
                return fields.at(index);
            }
        }

        return adapter.getSharedFormat(name);
    }

    /**
     * Возвращает тип поля по его формату.
     * @param format Формат поля.
     */
    protected _getFieldType(format: Field | UniversalField): string | Function {
        let Type = (format as Field).getType
            ? (format as Field).getType()
            : (format as UniversalField).type;
        if (Type && typeof Type === 'string') {
            if (isRegistered(Type)) {
                Type = resolve(Type);
            }
        }
        return Type;
    }

    /**
     * Создает формат поля по его описанию.
     * @param format Описание поля.
     */
    protected _buildField(format: Field | IFieldDeclaration): Field {
        if (typeof format === 'string' || Object.getPrototypeOf(format) === Object.prototype) {
            format = fieldsFactory(format as IFieldDeclaration);
        }
        if (!format || !(format instanceof Field)) {
            throw new TypeError(
                `${
                    (this as any)._moduleName
                }: format should be an instance of Types/entity:format.Field`
            );
        }
        return format;
    }

    /**
     * Строит формат по описанию.
     * @param format Описание формата (полный или неполный).
     * @param fullFormatCallback Обратный вызов, который возвращает полный формат.
     */
    protected _buildFormat(
        format: FormatDescriptor | null,
        fullFormatCallback?: Function
    ): format.Format {
        const Format = resolve<any>('Types/collection:format.Format');

        if (format) {
            const formatProto = Object.getPrototypeOf(format);
            if (formatProto === Array.prototype) {
                const factory = resolve<Function>('Types/collection:format.factory');
                // All of the fields in Array
                format = factory(format);
            } else if (formatProto === Object.prototype) {
                // Slice of the fields in Object
                format = buildFormatFromObject(
                    format as Record<string, unknown>,
                    fullFormatCallback ? fullFormatCallback() : new Format()
                );
            }
        }

        if (!format || !(format instanceof Format)) {
            format = new Format();
        }

        return format as format.Format;
    }

    // endregion
}

Object.assign(FormattableMixin.prototype, {
    '[Types/_entity/FormattableMixin]': true,
    _moduleName: 'Types/entity:FormattableMixin',
    _$rawData: null,
    _$cow: false,
    _$adapter: defaultAdapter,
    _$typeName: null,
    _$format: null,
    _format: null,
    _formatClone: null,
    _rawDataAdapter: null,
    _rawDataFields: null,
    hasDecalredFormat: FormattableMixin.prototype.hasDeclaredFormat, // Deprecated
});
