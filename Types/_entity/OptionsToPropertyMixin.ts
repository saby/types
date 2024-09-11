/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { IHashMap } from '../_declarations';

const optionPrefix = '_$';
const optionPrefixLen = optionPrefix.length;

const $mergeable = Symbol('mergeable');

export function getMergeableProperty<T>(value: T): T {
    value[$mergeable] = true;
    return value;
}

/**
 * Примесь, позволяющая передавать в конструктор сущности набор опций (объект вида ключ-значение).
 * @remark
 * Для разделения защищенных свойств и опций последние должны именоваться определенным образом - имя должно начинаться с префикса '_$':
 * <pre>
 *     import {OptionsToPropertyMixin} from 'Types/entity'
 *
 *     class Device extends OptionsToPropertyMixin {
 *         protected _$vendor: string;
 *         getVendor(): string {
 *             return this._$vendor;
 *         }
 *     });
 * </pre>
 * Если класс-наследник имеет свой конструктор, обязательно вызовите конструктор примеси (или конструктор родительского класса, если примесь уже есть у родителя):
 * <pre>
 *     import {OptionsToPropertyMixin} from 'Types/entity'
 *
 *     class Device extends OptionsToPropertyMixin {
 *         protected _$vendor: string;
 *         constructor(options: IOptions) {
 *             super(options);
 *         }
 *         getVendor(): string {
 *             return this._$vendor;
 *         }
 *     });
 * </pre>
 * Потому что именно конструктор примеси OptionsToPropertyMixin раскладывает значения аргумента options по защищенным свойствам:
 * <pre>
 *     var hdd = new Device({
 *         vendor: 'Seagate'
 *     });
 *     hdd.getVendor(); //Seagate
 * </pre>
 * @public
 */
export default abstract class OptionsToPropertyMixin {
    /**
     * @deprecated Только для старомодного наследования.
     */

    /*
     * @deprecated Only for old-fashioned inheritance
     */
    protected _options: any;

    /**
     * Конструктор объекта, принимающий набор опций в качестве первого аргумента
     * @param [options] Значения опций
     */
    constructor(options?: IHashMap<any>) {
        OptionsToPropertyMixin.initMixin(this, options);
    }

    static initMixin(instance: any, options?: IHashMap<any>) {
        if (options && typeof options === 'object') {
            const keys = Object.keys(options);

            if (keys.length) {
                const proto = Object.getPrototypeOf(instance);
                const prefix = optionPrefix;
                let option;
                let property;

                for (let i = 0, count = keys.length; i < count; i++) {
                    option = keys[i];
                    property = prefix + option;
                    const isMergeable = proto[property] && proto[property][$mergeable];

                    if (property in instance) {
                        instance[property] = isMergeable
                            ? { ...proto[property], ...options[option] }
                            : options[option];
                    }
                }
            }
        }
    }

    /**
     * Возвращает опции объекта
     * @return Значения опций
     * @protected
     */
    protected _getOptions(): IHashMap<any> {
        const options = {};
        const keys = Object.keys(this);
        const proto = Object.getPrototypeOf(this);
        let name;
        let value;
        let optionName;
        for (let i = 0, count = keys.length; i < count; i++) {
            name = keys[i];
            if (name.substr(0, optionPrefixLen) === optionPrefix) {
                value = this[name];
                optionName = name.substr(optionPrefixLen);

                if (proto[name] && proto[name][$mergeable]) {
                    // For mergeable option keep only not original part of value
                    options[optionName] = Object.keys(value)
                        .filter((propName) => {
                            return value[propName] !== proto[name][propName];
                        })
                        .reduce((memo, propName) => {
                            memo[propName] = value[propName];
                            return memo;
                        }, {});
                } else {
                    options[optionName] = value;
                }
            }
        }

        // FIXME: get rid of _options
        if (this._options) {
            for (name in this._options) {
                if (this._options.hasOwnProperty(name) && !(name in options)) {
                    options[name] = this._options[name];
                }
            }
        }

        return options;
    }
}

OptionsToPropertyMixin.prototype['[Types/_entity/OptionsToPropertyMixin]'] = true;
