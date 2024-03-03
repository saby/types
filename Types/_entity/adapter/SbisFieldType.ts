/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * @class Types/_entity/adapter/SbisFieldType
 * @description Класс используют, чтобы для строкового названия типа данных WS получить соответствующее ему строковое
 * название типа данных, которое применяется в серверном фреймворке.
 * @remark Соответствие названий классов полей типов, строковых алиасов типов в Types и названий типов в БЛ СБИС:
 * <table>
 * <thead>
 *   <tr>
 *     <th><b>Тип поля</b></th>
 *     <th><b>Название в Types</b></th>
 *     <th><b>Название в БЛ СБИС</b></th>
 *   </tr>
 * </thead>
 * <tbody>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/IntegerField/ IntegerField}</td>
 *     <td>integer</td>
 *     <td>Число целое</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/MoneyField/ MoneyField}</td>
 *     <td>money</td>
 *     <td>Деньги</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/ArrayField/ ArrayField}</td>
 *     <td>array</td>
 *     <td>Массив</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/BinaryField/ BinaryField}</td>
 *     <td>binary</td>
 *     <td>Двоичное</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/BooleanField/ BooleanField}</td>
 *     <td>boolean</td>
 *     <td>Логическое</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/MoneyField/ MoneyField}</td>
 *     <td>date</td>
 *     <td>Дата</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/DateTimeField/ DateTimeField}</td>
 *     <td>dateTime</td>
 *     <td>Дата и время</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/DictionaryField/ DictionaryField}</td>
 *     <td>dictionary</td>
 *     <td></td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/EnumField/ EnumField}</td>
 *     <td>enum</td>
 *     <td>Перечисляемое</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/FlagsField/ FlagsField}</td>
 *     <td>flags</td>
 *     <td>Флаги</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/IdentityField/ IdentityField}</td>
 *     <td>identity</td>
 *     <td>Идентификатор</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/ObjectField/ ObjectField}</td>
 *     <td>object</td>
 *     <td>JSON-объект</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/RealField/ RealField}</td>
 *     <td>real</td>
 *     <td>Число вещественное</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/RecordField/ RecordField}</td>
 *     <td>record</td>
 *     <td>Запись</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/RecordSetField/ RecordSetField}</td>
 *     <td>recordset</td>
 *     <td>Выборка</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/RpcFileField/ RpcFileField}</td>
 *     <td>rpcfile</td>
 *     <td>Файл-rpc</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/StringField/ StringField}</td>
 *     <td>string</td>
 *     <td>Строка</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/TimeField/ TimeField}</td>
 *     <td>time</td>
 *     <td>Время</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/UuidField/ UuidField}</td>
 *     <td>uuid</td>
 *     <td>UUID</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/TimeIntervalField/ TimeIntervalField}</td>
 *     <td>timeinterval</td>
 *     <td>Временной интервал</td>
 *   </tr>
 *   <tr>
 *     <td>{@link https://wi.sbis.ru/docs/js/WS/Types/\_entity/format/XmlField/ XmlField}</td>
 *     <td>xml</td>
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
