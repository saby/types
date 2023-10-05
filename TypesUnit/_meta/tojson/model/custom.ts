import { Meta } from 'Types/_meta/baseMeta';
import {
    MetaClass,
    TMetaJson,
    TVariantMeta,
} from 'Types/_meta/marshalling/format';


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