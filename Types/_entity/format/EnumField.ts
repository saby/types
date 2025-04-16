/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import DictionaryField from './DictionaryField';
import { register } from '../../di';

/**
 * Формат перечисляемого поля.
 * @remark
 * Создадим поле c типом "Перечисляемое":
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'enum',
 *         dictionary: ['one', 'two', 'three']
 *     };
 * </pre>
 * Изменим значение поля enum.
 * <pre>
 *    import {Record} from 'Types/entity';
 *
 *    const record = new Record({
 *        format: {
 *            foo: {
 *                type: 'enum',
 *                dictionary: ['one', 'two', 'three']
 *            }
 *        },
 *        rawData: {
 *            foo: 1
 *        }
 *    });
 *
 *    record.get('foo').set(2);
 *    record.get('foo').get(); // 2
 * </pre>
 * @public
 */
export default class EnumField extends DictionaryField {}

Object.assign(EnumField.prototype, {
    '[Types/_entity/format/EnumField]': true,
    _moduleName: 'Types/entity:format.EnumField',
    _typeName: 'Enum',
});

register('Types/entity:format.EnumField', EnumField, { instantiate: false });
