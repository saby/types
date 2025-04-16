/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */

/**
 * @description Соответствие типов полей в Types и серверного фреймворка БЛ СБИС
 * @remark Соответствие названий классов полей типов, строковых алиасов типов в Types и названий типов в БЛ СБИС:
 * <table>
 * <thead>
 *   <tr>
 *     <th><b>В Types</b></th>
 *     <th><b>В БЛ СБИС</b></th>
 *   </tr>
 * </thead>
 * <tbody>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/IntegerField/ integer}</td>
 *     <td>integer</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/MoneyField/ money}</td>
 *     <td>Деньги</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/ArrayField/ array}</td>
 *     <td>Массив</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/BinaryField/ binary}</td>
 *     <td>Двоичное</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/BooleanField/ boolean}</td>
 *     <td>Логическое</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/MoneyField/ date}</td>
 *     <td>Дата</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/DateTimeField/ dateTime}</td>
 *     <td>Дата и время</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/DictionaryField/ dictionary}</td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/EnumField/ enum}</td>
 *     <td>Перечисляемое</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/FlagsField/ flags}</td>
 *     <td>Флаги</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/IdentityField/ identity}</td>
 *     <td>Идентификатор</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/ObjectField/ object}</td>
 *     <td>JSON-объект</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/RealField/ real}</td>
 *     <td>Число вещественное</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/RecordField/ record}</td>
 *     <td>Запись</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/RecordSetField/ recordset}</td>
 *     <td>Выборка</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/RpcFileField/ rpcfile}</td>
 *     <td>Файл-rpc</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/StringField/ string}</td>
 *     <td>Строка</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/TimeField/ time}</td>
 *     <td>Время</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/UuidField/ uuid}</td>
 *     <td>UUID</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/TimeIntervalField/ timeinterval}</td>
 *     <td>Временной интервал</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/page/autodoc-ts/Types/entity/format/XmlField/ xml}</td>
 *     <td>XML-файл</td>
 *   </tr>
 * </tbody>
 * </table>
 * @public
 */
const SbisFieldType = {
    boolean: 'Логическое',
    integer: 'Число целое',
    real: 'Число вещественное',
    money: 'Деньги',
    string: 'Строка',
    xml: 'XML-файл',
    datetime: 'Дата и время',
    date: 'Дата',
    time: 'Время',
    timeinterval: 'Временной интервал',
    link: 'Связь', // deprecated
    identity: 'Идентификатор',
    enum: 'Перечисляемое',
    flags: 'Флаги',
    record: 'Запись',
    recordset: 'Выборка',
    binary: 'Двоичное',
    uuid: 'UUID',
    rpcfile: 'Файл-rpc',
    object: 'JSON-объект',
    array: 'Массив',
};

export default SbisFieldType;
