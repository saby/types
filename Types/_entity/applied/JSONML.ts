const CHILDREN_INDEX_WITH_ATTRIBUTES = 2;
const CHILDREN_INDEX_WITHOUT_ATTRIBUTES = 1;
const ATTRIBUTE_INDEX = 1;

export type IJSONML = (string | object)[] | string;

/**
 * Абстрактный класс для работы с JSONML
 * @class Types/_entity/applied/JSONML
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
     * Определяет наличие детей в переданном JSONML узле
     * @param {IJSONML} json
     * @returns {boolean}
     */
    static hasChildNodes(json: IJSONML): boolean {
        if (JSONML.isNode(json)) {
            if (JSONML.hasAttributes(json)) {
                return Boolean(
                    json.slice(CHILDREN_INDEX_WITH_ATTRIBUTES).length
                );
            } else {
                return Boolean(
                    json.slice(CHILDREN_INDEX_WITHOUT_ATTRIBUTES).length
                );
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
    static getAttributes(json: IJSONML): object | undefined {
        if (JSONML.isNode(json) && JSONML.hasAttributes(json)) {
            return json[ATTRIBUTE_INDEX] as object;
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
        return (
            JSONML.isNode(json) &&
            typeof json[1] === 'object' &&
            !Array.isArray(json[1])
        );
    }

    /**
     * Получить дочерние узлы переданного JSONML узла
     * @param {IJSONML} json
     * @returns {IJSONML}
     */
    static getChildren(json: IJSONML): IJSONML {
        if (JSONML.isNode(json)) {
            if (JSONML.hasAttributes(json)) {
                return json.slice(CHILDREN_INDEX_WITH_ATTRIBUTES);
            } else {
                return json.slice(CHILDREN_INDEX_WITHOUT_ATTRIBUTES);
            }
        } else {
            return undefined;
        }
    }

    /**
     * Метод для обхода JSONML в глубину. Для каждого узла вызывается callback
     * @param {IJSONML} json
     * @param {Function} callback
     */
    static iterateJSONML(json: IJSONML, callback: Function): void {
        if (JSONML.isNode(json) && typeof callback === 'function') {
            callback(json);
            const children = JSONML.getChildren(json);
            if (Array.isArray(children)) {
                children.forEach((child) => {
                    JSONML.iterateJSONML(child as IJSONML, callback);
                });
            }
        }
    }
}
