import { getMergeableProperty } from '../entity';
import { EntityMarker } from 'Types/declarations';

/**
 * Интерфейс объекта с соответствием методов CRUD контракту
 * @public
 */
export interface IBinding {
    /**
     * Операция создания записи через метод {@link create}
     */
    create?: string;
    /**
     * Операция чтения записи через метод {@link read}
     */
    read?: string;
    /**
     * Операция обновления записи через метод {@link update}
     */
    update?: string;
    /**
     * Операция удаления записи через метод {@link destroy}.
     */
    destroy?: string;
    /**
     * Операция получения списка записей через метод {@link query}
     */
    query?: string;
    /**
     * Операция копирования записей через метод {@link copy}
     */
    copy?: string;
    /**
     * Операция объединения записей через метод {@link merge}
     */
    merge?: string;
    /**
     * Операция перемещения записи через метод {@link move}
     */
    move?: string;
}

/**
 * @public
 */
export interface IOptions {
    /**
     *
     */
    binding?: IBinding;
}

/**
 * Миксин, позволяющий задавать привязку CRUD к контракту источника.
 * @public
 */
export default abstract class BindingMixin {
    readonly '[Types/_source/BindingMixin]': EntityMarker;

    /**
     * Соответствие методов CRUD контракту. Определяет, как именно источник реализует каждый метод CRUD.
     * @see {@link getBinding}
     * @example
     * Подключаем пользователей через HTTP API, для каждого метода CRUD укажем путь в URL:
     * <pre>
     *     var dataSource = new HttpSource({
     *         endpoint: {
     *             address: '//some.server/',
     *             contract: 'users/'
     *         },
     *         binding: {
     *             create: 'add/',//dataSource.create() calls //some.server/users/add/ via HTTP
     *             read: 'load/',//dataSource.read() calls //some.server/users/load/ via HTTP
     *             update: 'save/',//dataSource.update() calls //some.server/users/save/ via HTTP
     *             destroy: 'delete/',//dataSource.destroy() calls //some.server/users/delete/ via HTTP
     *             query: 'list/'//dataSource.query() calls //some.server/users/list/ via HTTP
     *         }
     *     });
     * </pre>
     * Подключаем пользователей через RPC, для каждого метода CRUD укажем суффикс в имени удаленного метода:
     * <pre>
     *     var dataSource = new RpcSource({
     *         endpoint: {
     *             address: '//some.server/rpc-gate/',
     *             contract: 'Users'
     *         },
     *         binding: {
     *             create: 'Add',//dataSource.create() calls UsersAdd() via RPC
     *             read: 'Load',//dataSource.read() calls UsersLoad() via RPC
     *             update: 'Save',//dataSource.update() calls UsersSave() via RPC
     *             destroy: 'Delete',//dataSource.destroy() calls UsersDelete() via RPC
     *             query: 'List'//dataSource.query() calls UsersList() via RPC
     *         }
     *     });
     * </pre>
     */
    protected _$binding: IBinding;

    /**
     * Возвращает соответствие методов CRUD контракту источника.
     * @example
     * Получим имя метода, отвечающего за чтение списка сотрудников:
     * <pre>
     *      var dataSource = new SbisService({
     *          endpoint: 'Employee',
     *          binding: {
     *             query: 'MyCustomList'
     *          }
     *      });
     *      console.log(dataSource.getBinding().query);//'MyCustomList'
     * </pre>
     * Выполним вызов, который вернет данные статьи:
     * <pre>
     *     var articlesSource = new RestSource({
     *         binding: {
     *             create: '/api/article/add/',
     *             read: '/api/article/read/',
     *             update: '/api/article/save/',
     *             destroy: '/api/article/remove/'
     *         },
     *         keyProperty: 'id'
     *     });
     *     console.log('Calling read() method via ' + dataSource.getBinding().read);
     *     //'Calling read() method via /api/article/read/'
     *     articlesSource.read(13);
     *    //Cause HTTP request to /api/article/read/?id=13
     * </pre>
     */
    getBinding(): IBinding {
        return { ...this._$binding };
    }

    setBinding(binding: IBinding): void {
        this._$binding = binding;
    }
}

Object.assign(BindingMixin.prototype, {
    '[Types/_source/BindingMixin]': true,
    _$binding: getMergeableProperty<IBinding>({
        create: 'create',
        read: 'read',
        update: 'update',
        destroy: 'delete',
        query: 'query',
        copy: 'copy',
        merge: 'merge',
        move: 'move',
    }),
});
