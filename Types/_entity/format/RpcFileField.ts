import Field from './Field';
import { register } from '../../di';

/**
 * Формат поля файл-RPC.
 * @remark
 * <b>Пример1. Создадим поле c типом "Файл-RPC"</b>:
 * <pre>
 *     var field = {
 *         name: 'foo',
 *         type: 'rpcfile'
 *     };
 * </pre>
 * <b>Пример 2. Добавим файл в поле с типом "Файл-RPC"</b>:
 * Шаг 1. Объявим функцию для конвертации объекта File в строку base64:
 * <pre>
 *     const toBase64 = file => new Promise((resolve, reject) => {
 *         const reader = new FileReader();
 *         reader.readAsDataURL(file);
 *         reader.onload = () => resolve(reader.result);
 *         reader.onerror = error => reject(error);
 *     });
 * </pre>
 * Шаг 2. Подготовим значение для поля с типом "Файл-RPC":
 * <pre>
 *     const data = new File(...)
 *     const file = {
 *         Данные: await toBase64(data),
 *         ИмяФайла: 'Документ.sabydoc',
 *     }
 * </pre>
 * Шаг 3. Обновим значение поля в {@link Types/entity:Record}:
 * <pre>
 *     const record = new Record({
 *         format: [{
 *             name: 'foo',
 *             type: 'rpcfile'
 *         }]
 *     });
 *
 *     record.set('foo', file);
 * </pre>
 * @class Types/_entity/format/RpcFileField
 * @extends Types/_entity/format/Field
 * @public
 */
export default class RpcFileField extends Field {}

Object.assign(RpcFileField.prototype, {
    '[Types/_entity/format/RpcFileField]': true,
    _moduleName: 'Types/entity:format.RpcFileField',
    _typeName: 'RpcFile',
});

register('Types/entity:format.RpcFileField', RpcFileField, {
    instantiate: false,
});
