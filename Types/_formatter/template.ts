/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
type TransformerCallback = (expression: string) => string;

interface ITransformer {
    transform(cb: TransformerCallback): this;
    render(): string;
}

const PARSE_REGEXP = /\$\{([^}]*)\}/g;

// https://developer.mozilla.org/en-US/docs/Glossary/Identifier
const IDENTIFIER_REGEXP = /^[-_$A-z][0-9-_$A-z]*$/;

/**
 * Returns flag that given expression is a valid identifier
 */
function isIdentifier(str: string): boolean {
    return IDENTIFIER_REGEXP.test(str);
}

/**
 * Compiles string template into executable object
 */
function compile(str: string): ITransformer {
    let result: string;

    return {
        transform(cb: TransformerCallback): ITransformer {
            result = str.replace(PARSE_REGEXP, (_match, expression) => {
                return cb(expression);
            });
            return this;
        },
        render(): string {
            return result === undefined ? str : result;
        },
    };
}

/**
 * Resolves expression value
 */
function resolve(expression: string, scope: Record<string, string>): string {
    if (scope && isIdentifier(expression)) {
        if (!(expression in (scope as object))) {
            throw new ReferenceError(`${expression} is not defined`);
        }

        return scope[expression];
    }

    let argNames;
    let executor;

    try {
        argNames = scope ? Object.keys(scope) : [];
        executor = new Function(argNames.join(', '), `return ${expression};`);
    } catch (error) {
        const err = error as Error;

        err.message = `Unable to compile expression "${expression}": ${err.message}`;

        throw err;
    }

    try {
        const argValues = argNames.map((name) => {
            return scope[name];
        });
        return executor.apply(null, argValues);
    } catch (error) {
        const err = error as Error;

        err.message = `Unable to evaluate expression "${expression}": ${err.message}`;

        throw err;
    }
}

/**
 * Форматирует строку по шаблону.
 * @example
 * <h2>Отформатируем строку c использованием объекта</h2>
 * <pre>
 *     import {template} from 'Types/formatter';
 *     template('A ${person} walks into a ${place} and asks "${question}" ', {
 *         person: 'neutron',
 *         place: 'bar',
 *         question: 'How much for a beer?'
 *     }); // returns 'A neutron walks into a bar and asks "How much for a beer?"'
 * </pre>
 *
 * <h2>Отформатируем строку c использованием вложенных полей объекта</h2>
 * <pre>
 *     import {template} from 'Types/formatter';
 *     template('A ${person.kind} walks into a ${place}..." ', {
 *         person: {
 *             kind: 'neutron',
 *             state: 'thirsty'
 *         },
 *         place: 'bar'
 *     }); // returns 'A neutron walks into a bar...'
 * </pre>
 *
 * @param str Форматируемая строка
 * @param scope Данные для подстановки
 * @returns Отформатированная строка
 * @public
 */
export default function template(str: string, scope: Record<string, string>): string {
    return compile(String(str))
        .transform((expression: string) => {
            return resolve(expression, scope);
        })
        .render();
}
