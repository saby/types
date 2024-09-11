/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
const CHILDREN_INDEX_WITH_ATTRIBUTES = 2;
const CHILDREN_INDEX_WITHOUT_ATTRIBUTES = 1;
const ATTRIBUTE_INDEX = 1;
const NODE_NAME_INDEX = 0;

export type IJSONML = (string | object)[] | string;

/**
 * Абстрактный класс для работы с JSONML
 * @public
 */
export default abstract class JSONML {
    /**
     * Определяет является ли JsonML узлом
     * @param {IJSONML} json
     * @returns {boolean}
     */
    static isNode(json: IJSONML): boolean {
        return Boolean(Array.isArray(json) && typeof json[0] === 'string');
    }

    /**
     * Определяет является ли JsonML корневым узлом
     * @param {IJSONML} json
     * @returns {boolean}
     */
    static isRootNode(json: IJSONML): boolean {
        return (
            Array.isArray(json) &&
            (JSONML.isNode(json[0] as IJSONML) || typeof json[0] !== 'string')
        );
    }

    /**
     * Определяет наличие детей в переданном JSONML узле
     * @param {IJSONML} json
     * @returns {boolean}
     */
    static hasChildNodes(json: IJSONML): boolean {
        if (JSONML.isNode(json)) {
            if (JSONML.hasAttributes(json)) {
                return Boolean(json.slice(CHILDREN_INDEX_WITH_ATTRIBUTES).length);
            } else {
                return Boolean(json.slice(CHILDREN_INDEX_WITHOUT_ATTRIBUTES).length);
            }
        } else {
            return false;
        }
    }

    /**
     * Возвращает атрибуты переданного JSONML узла
     * @param {IJSONML} json
     * @returns {object | undefined}
     */
    static getAttributes<T>(json: IJSONML): T | undefined {
        if (JSONML.isNode(json) && JSONML.hasAttributes(json)) {
            return json[ATTRIBUTE_INDEX] as unknown as T;
        } else {
            return undefined;
        }
    }

    /**
     * Проверяет наличие аттрибутов у переданного JSONML узла
     * @param {IJSONML} json
     * @returns {boolean}
     */
    static hasAttributes(json: IJSONML): boolean {
        return JSONML.isNode(json) && typeof json[1] === 'object' && !Array.isArray(json[1]);
    }

    /**
     * Получить дочерние узлы переданного JSONML узла
     * @param {IJSONML} json
     * @returns {IJSONML}
     */
    static getChildren(json: IJSONML): IJSONML | undefined {
        if (JSONML.isNode(json)) {
            if (JSONML.hasAttributes(json)) {
                return json.slice(CHILDREN_INDEX_WITH_ATTRIBUTES);
            } else {
                return json.slice(CHILDREN_INDEX_WITHOUT_ATTRIBUTES);
            }
        } else if (JSONML.isRootNode(json)) {
            return json;
        }
        return undefined;
    }

    /**
     * Вставляет JSONML узлы в начало переданного JSONML узла
     * @param json
     * @param children
     */
    static prepend(json: IJSONML, ...children: IJSONML[]): void {
        if (!JSONML.isNode(json)) {
            return;
        }

        if (JSONML.hasAttributes(json)) {
            (json as (string | object)[]).splice(CHILDREN_INDEX_WITH_ATTRIBUTES, 0, ...children);
        } else {
            (json as (string | object)[]).splice(CHILDREN_INDEX_WITHOUT_ATTRIBUTES, 0, ...children);
        }
    }

    /**
     * Вставляет JSONML узлы в конец переданного JSONML узла
     * @param json
     * @param children
     */
    static append(json: IJSONML, ...children: IJSONML[]): void {
        if (!JSONML.isNode(json)) {
            return;
        }

        (json as (string | object)[]).push(...children);
    }

    /**
     * Удаляет дочерний узел JSONML узла по индексу
     * @param json
     * @param index
     */
    static removeChild(json: IJSONML, index: number): IJSONML | void {
        if (!JSONML.isNode(json)) {
            return;
        }

        if (JSONML.hasAttributes(json)) {
            return (json as (string | object)[]).splice(
                CHILDREN_INDEX_WITH_ATTRIBUTES + index,
                1
            )[0] as IJSONML;
        } else {
            return (json as (string | object)[]).splice(
                CHILDREN_INDEX_WITHOUT_ATTRIBUTES + index,
                1
            )[0] as IJSONML;
        }
    }

    /**
     * Удаляет дочерние узлы JSONML узла.
     * @param json
     */
    static removeChildNodes(json: IJSONML): void {
        if (!JSONML.hasChildNodes(json)) {
            return;
        }

        if (JSONML.hasAttributes(json)) {
            (json as (string | object)[]).splice(CHILDREN_INDEX_WITH_ATTRIBUTES);
        } else {
            (json as (string | object)[]).splice(CHILDREN_INDEX_WITHOUT_ATTRIBUTES);
        }
    }

    /**
     * Возвращает название JSONML узла
     * @param json
     */
    static getNodeName(json: IJSONML): string | undefined {
        if (!JSONML.isNode(json)) {
            return;
        }

        return json[0] as string;
    }

    /**
     * Устанавливает значение атрибута JSONML узла
     * @param json
     * @param name
     * @param value
     */
    static setAttribute<T = string>(json: IJSONML, name: string, value: T): void {
        if (!JSONML.isNode(json)) {
            return;
        }

        if (!JSONML.hasAttributes(json)) {
            JSONML.setAttributes(json, { [name]: value });
        } else {
            // @ts-ignore
            json[ATTRIBUTE_INDEX][name] = value;
        }
    }

    /**
     * Возвращает значение атрибута JSONML узла
     * @param json
     * @param name
     */
    static getAttribute<T>(json: IJSONML, name: string): T | null {
        if (!JSONML.isNode(json) || !JSONML.hasAttributes(json)) {
            return null;
        }

        // @ts-ignore
        return (JSONML.getAttributes(json)[name] as T) ?? null;
    }

    /**
     * Удаляет атрибут JSONML узла
     * @param json
     * @param name
     */
    static removeAttribute<T>(json: IJSONML, name: string): T | undefined | null {
        if (!JSONML.isNode(json) || !JSONML.hasAttributes(json)) {
            return;
        }

        const value = JSONML.getAttribute<T>(json, name);

        // @ts-ignore
        delete JSONML.getAttributes(json)[name];

        return value;
    }

    /**
     * Удаляет атрибуты JSONML узла.
     * @param json
     */
    static removeAttributes(json: IJSONML): void {
        if (JSONML.hasAttributes(json)) {
            (json as (string | object)[]).splice(ATTRIBUTE_INDEX, 1);
        }
    }

    /**
     * Полностью заменяет набор атрибутов JSONML узла
     * @param json
     * @param attributesObject
     */
    static setAttributes<T extends object>(json: IJSONML, attributesObject: T): void {
        if (!JSONML.isNode(json)) {
            return;
        }

        if (JSONML.hasAttributes(json)) {
            (json as (string | object)[]).splice(ATTRIBUTE_INDEX, 1, attributesObject);
        } else {
            (json as (string | object)[]).splice(ATTRIBUTE_INDEX, 0, attributesObject);
        }
    }

    /**
     * Заменяет тип JSONML узла
     * @param json
     * @param nodeName
     */
    static changeNodeName(json: IJSONML, nodeName: string): void {
        if (!JSONML.isNode(json)) {
            return;
        }

        (json[NODE_NAME_INDEX] as string) = nodeName;
    }

    /**
     * Метод для обхода JSONML в глубину. Для каждого узла вызывается callback
     * @param {IJSONML} json
     * @param {Function} callback
     * @param {IJSONML} parent
     */
    static iterateJSONML(json: IJSONML, callback: Function, parent?: IJSONML): void {
        if (typeof callback !== 'function') {
            return;
        }

        if (JSONML.isNode(json) || JSONML.isRootNode(json)) {
            callback(json, parent);
            const children = JSONML.getChildren(json);
            if (Array.isArray(children)) {
                children.forEach((child) => {
                    JSONML.iterateJSONML(child as IJSONML, callback, json);
                });
            }
        } else if (typeof json === 'string') {
            callback(json, parent);
        }
    }

    /**
     * Заменяет JSONML узел на другой JSONML узел.
     * @param {IJSONML} newNode
     * @param {IJSONML} oldNode
     */
    static replaceNode(newNode: IJSONML, oldNode: IJSONML): void {
        if (!JSONML.isNode(newNode) || !JSONML.isNode(oldNode)) {
            return;
        }

        (oldNode as (string | object)[]).splice(
            NODE_NAME_INDEX,
            Infinity,
            ...(newNode as (string | object)[])
        );
    }
}
