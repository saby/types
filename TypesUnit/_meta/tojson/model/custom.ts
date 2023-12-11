import type { RecordSet } from 'Types/collection';
import { StringType, IPropertyEditorProps } from 'Types/meta';
import { Meta } from 'Types/_meta/baseMeta';
import { MetaClass, TMetaJson, TVariantMeta } from 'Types/_meta/marshalling/format';

const id = 'some-id-1';
const inherits = [];
const required = true;
/* const editor = 'NOT IMPLEMENTED: MODULE PATH -1'; */
const defaultValue = 'none-1';

const info = {
    title: 'title-1',
    description: 'description-1',
    icon: '//sbis.ru/favicon.ico',
    category: 'category-1',
    group: { name: '', uid: '' },
    order: 1,
    hidden: true,
    disabled: true,
};

export function getMeta(): TVariantMeta {
    return new Meta<string>({
        is: MetaClass.primitive,
        id,
        inherits,
        required,
        defaultValue,
        info,
    });
}

export function getJson(): TMetaJson {
    return [
        {
            is: MetaClass.primitive,
            id,
            inherits,
            required,
            defaultValue: JSON.stringify(defaultValue),
            ...info,
            group: JSON.stringify(['', '']),
        },
    ];
}

interface IEditorProps extends IPropertyEditorProps<string> {
    items: [RecordSet, RecordSet];
}

export function getMetaWithRecordSet(items: [RecordSet, RecordSet]): Meta<string> {
    const result = StringType.id(id).editor<IEditorProps>('TypesUnit/_meta/tojson/editor', {
        items,
        value: undefined,
        onChange: undefined,
    });

    // Прогрев для гарантии чистоты теста.
    // Была ошибка из-за одного общего инстанса Сериализатора на сервере для всех клиентов.
    result.toJSON();

    return result;
}
