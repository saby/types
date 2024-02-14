import { adapter } from '../entity';
import { EntityMarker } from '../_declarations';

/**
 * Интерфейс источника данных, поддерживающего абстракцию работы с данными.
 *
 * @public
 */
export default interface IData {
    readonly '[Types/_source/IData]': EntityMarker;

    /**
     * Возвращает адаптер для работы с данными.
     * @see adapter
     * @see Types/_entity/adapter/IAdapter
     * @example
     * Получим адаптер источника, используемый по умолчанию:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {adapter} from 'Types/entity';
     *
     *     const dataSource = new Memory();
     *     console.assert(dataSource.getAdapter() instanceof adapter.Json); // correct
     * </pre>
     */
    getAdapter(): adapter.IAdapter;

    /**
     * Возвращает конструктор записей, порождаемых источником данных.
     * @see model
     * @see Types/_entity/Model
     * @see Types/di
     * @example
     * Получим конструктор записей, используемый по умолчанию:
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const dataSource = new Memory();
     *     console.assert(dataSource.getModel() === 'Types/entity:Model'); // correct
     * </pre>
     */
    getModel(): Function | string;

    /**
     * Устанавливает конструктор записей, порождаемых источником данных.
     * @param {String|Function} model
     * @see model
     * @see getModel
     * @see Types/_entity/Model
     * @example
     * Установим конструктор пользовательской модели:
     * <pre>
     *     import {Memory} from 'Types/source';
     *     import {User} from 'My/application/models';
     *
     *     const dataSource = new Memory();
     *     dataSource.setModel(User);
     * </pre>
     */
    setModel(model: Function): void;

    /**
     * Возвращает конструктор рекордсетов, порождаемых источником данных.
     * @see listModule
     * @example
     * Получим конструктор рекордсетов, используемый по умолчанию:
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const dataSource = new Memory();
     *     console.assert(dataSource.getListModule() === 'Types/collection:RecordSet'); // correct
     * </pre>
     */
    getListModule(): Function | string;

    setListModule(listModule: Function | string): void;

    /**
     * Возвращает название свойства записи, содержащего первичный ключ
     * @see keyProperty
     * @see Types/_entity/Model#keyProperty
     * @example
     * Получим название свойства записи, содержащего первичный ключ:
     * <pre>
     *     import {Memory} from 'Types/source';
     *
     *     const dataSource = new Memory({
     *         keyProperty: 'id'
     *     });
     *     console.log(dataSource.getKeyProperty()); // 'id'
     * </pre>
     */
    getKeyProperty(): string;

    setKeyProperty(name: string): void;
}
