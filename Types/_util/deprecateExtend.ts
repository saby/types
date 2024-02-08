import logger from './logger';

/**
 * Возвращает оболочку для устаревшего метода extend().
 * @public
 */

/*
 * Returns wrapper for deprecate extend() method.
 * @public
 * @author Буранов А.Р.
 */
export default function deprecateExtend(
    subClass: any,
    superClass: any,
    mixinsList: any,
    tag: string,
    skipFor?: string[]
): Function {
    let isTrusted = false;
    if (skipFor && subClass && subClass._moduleName) {
        isTrusted = skipFor.indexOf(subClass._moduleName) > -1;
    }
    if (!isTrusted) {
        logger.info(
            tag,
            'Method extend() is deprecated, use ES6 extends or Core/core-extend for inheritance'
        );
    }

    if (!require.defined('Core/core-extend')) {
        throw new ReferenceError(
            'You should require module "Core/core-extend" to use old-fashioned extending via static extend() method.'
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const coreExtend = require('Core/core-extend');
    return coreExtend(subClass, mixinsList, superClass);
}
