/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import VersionableMixin, { VersionCallback } from '../VersionableMixin';
import { Map } from '../../shim';

/**
 * Реактивный объект предоставляет возможность отслеживать его изменения.
 * @remark
 * Это объект JavaScript с определенным набором параметром. Когда любой из них обновляется, вы можете отслеживать изменение его состояния, используя метод {@link getVersion}.
 *
 * В соответствии с ограничением JavaScript при работе с параметрами объекта, чтобы избежать ошибок, соблюдайте правило: ReactiveObject отслеживает только те параметры, которые были переданы конструктору. Это также означает, что вы не должны добавлять или удалять параметры в экземпляре ReactiveObject (это означает, что эти параметры просто не будут реактивными).
 *
 * Отследим параметр 'foo':
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = new ReactiveObject({
 *     foo: 'bar'
 * });
 * console.log(instance.foo, instance.getVersion()); // 'bar', 0
 * instance.foo = 'baz';
 * console.log(instance.foo, instance.getVersion()); // 'baz', 1
 * </pre>
 *
 * Вы также можете отслеживать изменение версии с помощью callback'а:
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = new ReactiveObject({
 *     foo: 'bar'
 * }, (version) => {
 *     console.log('version:', version);
 * });
 * instance.foo = 'baz'; // outputs 'version: 1' in console
 * </pre>
 *
 * Вы можете установить параметр 'только для чтения', использовав {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get property getter}:
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = new ReactiveObject({
 *     get foo() {
 *         return 'bar';
 *     }
 * });
 * console.log(instance.foo, instance.getVersion()); // 'bar', 0
 * instance.foo = 'baz'; // Throws an error
 * </pre>
 *
 * Вы также можете определить свою собственную логику чтения и записи значения параметра:
 * <pre>
 * import {ReactiveObject} from 'Types/entity';
 * const instance = new ReactiveObject({
 *     email: 'foo@bar.com',
 *     get domain(): string {
 *         return this.email.split('@')[1];
 *     },
 *     set domain(value: string) {
 *         const parts = this.email.split('@');
 *         parts[1] = value;
 *         this.email = parts.join('@');
 *     }
 * });
 * console.log(instance.email); // 'foo@bar.com'
 * console.log(instance.domain); // 'bar.com'
 * instance.domain = 'bar.org';
 * console.log(instance.email); // 'foo@bar.org'
 * console.log(instance.domain); // 'bar.org'
 * </pre>
 * @public
 */
class ReactiveObject<T> extends VersionableMixin {
    private _nestedVersions: Map<string, number>;

    /**
     * Конструктор реактивных объектов.
     * @param data Устанавливает реактивные свойства.
     * @param callback Callback вызывается при изменении версии.
     */
    constructor(data: T, callback?: VersionCallback) {
        super();

        if (callback) {
            this._$versionCallback = callback;
        }

        this._proxyProperties(data);
    }

    // region VersionableMixin

    getVersion(): number {
        // Check for changes in nested instances of VersionableMixin
        Object.keys(this).forEach((key) => {
            const value = this[key as keyof this];
            if (value instanceof VersionableMixin) {
                if (!this._nestedVersions) {
                    this._nestedVersions = new Map<string, number>();
                }

                const nestedVersions = this._nestedVersions;
                const lastVersion = nestedVersions.get(key) || 0;
                const actualVersion = value.getVersion();
                // Move self version only if nested object has been modified since last check
                if (lastVersion !== actualVersion) {
                    nestedVersions.set(key, actualVersion);
                    this._nextVersion();
                }
            }
        });

        return super.getVersion();
    }

    // endregion

    // region Protected

    /**
     * Определение параметров прокси от данного объекта до текущего экземпляра.
     * @param donor Объект для получения объявленных параметров.
     */
    private _proxyProperties(donor: T): void {
        let storage: Map<string, T[keyof T]>;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Object.keys(donor).forEach((key: string) => {
            let descriptor = Object.getOwnPropertyDescriptor(donor, key);

            if (!descriptor) {
                throw new Error(`Дескриптор для поля ${key} не существует в объекте ${donor}.`);
            }

            if (descriptor.set) {
                // Access descriptor: decorate write operation
                descriptor.set = ((original) => {
                    return (value) => {
                        const oldValue = this[key as keyof this];
                        original.call(this, value);

                        if (value !== oldValue) {
                            this._nextVersion();
                        }
                    };
                })(descriptor.set);
            } else if (!descriptor.get) {
                // Data descriptor: translate to the access descriptor
                if (!storage) {
                    storage = new Map<string, T[keyof T]>();
                }

                storage.set(key, descriptor.value);
                descriptor = {
                    get: () => {
                        return storage.get(key);
                    },
                    set: descriptor.writable
                        ? (value) => {
                              const oldValue = storage.get(key);
                              storage.set(key, value);

                              if (value !== oldValue) {
                                  this._nextVersion();
                              }
                          }
                        : undefined,
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable,
                };
            }

            Object.defineProperty(this, key, descriptor);
        });
    }

    // endregion
}

/**
 * @public
 */
export interface IReactiveObjectConstructor {
    readonly prototype: ReactiveObject<object>;
    new <T>(data: T, callback?: VersionCallback): T & ReactiveObject<T>;
}

/**
 * @public
 */
export default ReactiveObject as IReactiveObjectConstructor;
