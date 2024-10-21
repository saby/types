const RANGE_DESCRIPTION = /\{\d+-\d+}/g;

/**
 * Функция разбиения шаблонной строки на подстроки, согласно заданным правилам.
 * Правила задаются в шаблонной строке, после символа ":::". В фигурных скобках задаётся интервал,
 * для выделяемой подстроки.
 * @example
 * Примеры работы функции:
 * <pre>
 *     import { splitTemplateString } from 'Types/utils';
 *
 *     // ['', 'Ссылка', ' и текст']
 *     const [start, link, end] = splitTemplateString('Ссылка и текст:::{0-6}');
 *
 *     // ['Ссылка и ', 'текст', '']
 *     const [start, link, end] = splitTemplateString('Ссылка и текст:::{9-14}');
 *
 *     // ['Ссылка ', 'и', ' текст']
 *     const [start, link, end] = splitTemplateString('Ссылка и текст:::{7-8}');
 *
 *     // ['', 'Ссылка', ' и текст и ', 'сслыка', '']
 *     const [start, firstLink, text, secondLink, end] = splitTemplateString('Ссылка и текст и сслыка:::{0-6}{17-23}');
 * </pre>
 * @param template..."
 */
export default function splitTemplateString(template: string): string[] {
    const [str, rules] = template.split(':::');
    const ranges = (rules || '').match(RANGE_DESCRIPTION) || [];
    const result = [];
    let currentIndex = 0;

    for (const rangeStr of ranges) {
        const range = rangeStr
            .slice(1, -1)
            .split('-')
            .map((num) => +num);

        result.push(str.slice(currentIndex, range[0]));
        result.push(str.slice(...range));

        currentIndex = range[1];
    }

    result.push(str.slice(currentIndex, str.length));

    return result;
}
