import { Record, TObserveSessionCallback } from 'Types/entity';

/**
 * Отслеживает изменения полей, использованных в селекторе
 * @param record целевой рекорд
 * @param selector селектор, читает отслеживаемые поля
 * @param onChangeCallback колбек, поджигаемый при изменении отслеживаемых полей
 * @example
 * Предположим, что у нас есть такой инстанс записи:
 * <pre>
 *     const record = new Record({
 *         rawData: {
 *             FirstName: 'Гарри',
 *             LastName: 'Поттер',
 *             Age: 30,
 *             Department: 'Отдел Магических Расследований',
 *         },
 *     });
 * </pre>
 *
 * Далее колбек, который будет вызываться при изменении полей:
 * <pre>
 *     const callback = (changes: object) => console.log(changes)};
 * </pre>
 *
 * Опишем селектор отслеживаемых полей записи:
 * <pre>
 *     const selector = (record: Record) => {
 *         record.get('FirstName');
 *         record.get('Age');
 *     };
 * </pre>
 *
 * Запустим отслеживание изменений:
 * <pre>
 *     import { observeRecordChanges } from 'Types/util';
 *
 *     const cleanUpFunc = observeRecordChanges(record, selector, callback)
 * </pre>
 *
 * В дальнейшем при любых изменениях этих полей будет поджигаться колбек callback
 * <pre>
 *     record.set('FirstName', 'Лили'); // произошел вызов колбека
 *     record.set('Age', 45'); // произошел вызов колбека
 *     record.set('Department', 'Отдел Защиты от Тёмных Искусств');
 *     // колбек НЕ вызвался, т.к. поле Deparment не использовался в рамках сессии
 * </pre>
 *
 * По завершении работы нужно не забыть почистить отслеживающую функцию, чтобы избежать утечек памяти:
 * <pre>
 *     cleanUpFunc(); // вызове функцию очистки, который вернул observeRecordChanges
 * </pre>
 */
function observeRecordChanges(
    record: Record,
    selector: (record: Record) => void,
    onChangeCallback: TObserveSessionCallback
): Function {
    record.startObserveSession();
    selector?.(record);
    return record.endObserveSession(onChangeCallback);
}

export { observeRecordChanges };
