/**
 * @kaizen_zone 4da97f72-44f8-4abf-b9b9-4ad5495c48ea
 */
import Format from './Format';
import { format } from '../../entity';
import { register } from '../../di';

/**
 * Конструирует формат полей по декларативному описанию
 * @description Используется в {@link Types/entity:Record#format} и {@link Types/entity:RecordSet#format} для конструирования формата полей по декларативному описанию, заданному пользователем.
 * @example
 * Сконструируем формат полей по декларативному описанию IFieldDeclaration[]:
 * <pre>
 *     import {format} from 'Types/collection';
 *     import {IFieldDeclaration} from 'Types/entity';
 *
 *     const factory = format.factory;
 *
 *     // описание формата
 *     const fields: IFieldDeclaration[] = [
 *        { name: 'user_id', type: 'integer'},
 *        { name: 'creationDate', type: 'dateTime', withoutTimeZone: false },
 *        { name: 'settings', type: 'flags', dictionary: ['dark_mode', 'large_font', 'skip_tutorial'] },
 *        { name: 'foo', type: 'money', large: true },
 *        { name: 'group_ids', type: 'array', kind: 'integer' }
 *     ];
 *
 *     const result = factory(fields);
 * </pre>
 * @see Types/entity:Record#format
 * @see Types/entity:Model#format
 * @see Types/entity:RecordSet#format
 * @param {Types/entity:format.IFieldDeclaration[]} declaration Декларативное описание
 * @returns {Types/collection:format.Format<Types/entity:format.Field>} Объект с форматом полей
 */
export default function factory(
    declaration: format.IFieldDeclaration[]
): Format<format.Field> {
    if (!declaration || !(declaration instanceof Array)) {
        throw new TypeError(
            'Types/_collection/format/factory: declaration should be an instance of Array'
        );
    }
    const instance = new Format<format.Field>();
    for (let i = 0; i < declaration.length; i++) {
        instance.add(format.fieldsFactory(declaration[i]));
    }
    return instance;
}

register('Types/collection:format.factory', factory, { instantiate: false });
