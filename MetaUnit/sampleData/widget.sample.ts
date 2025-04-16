import { ITypeDesc } from 'MetaUnit/sampleData/ServiceFormat';

const widgetDesc: ITypeDesc = {
    Id: '',
    TypeId: 'TextInput',
    MetaType: 'widget',
    Version: '25.2000',
    Inherits: [],
    InheritsHierarchy: [],
    HasOverrides: false,
    MetaAttributes: [
        {
            Name: 'required',
            Type: 'required',
            Value: {
                value: true,
            },
        },
        {
            Name: 'defaultValue',
            Type: 'defaultValue',
            Value: {
                value: '{"value":0,"label":"Введите число"}',
            },
        },
        {
            Name: 'category',
            Type: 'category',
            Value: {
                value: 'Базовые виджеты',
            },
        },
        {
            Name: 'icon',
            // @ts-ignore на сервисе типов не зафиксирован такой мета-атрибут
            Type: 'icon',
            Value: {
                value: 'icon-Widget',
            },
        },
        {
            Name: 'title',
            Type: 'title',
            Value: {
                value: 'Текстовое поле',
            },
        },
        {
            Name: 'description',
            Type: 'description',
            Value: {
                value: 'Поле ввода текста',
            },
        },
        {
            Name: 'rights',
            // @ts-ignore на сервисе типов не зафиксирован такой мета-атрибут
            Type: 'rights',
            Value: {
                value: '["c4427c3a-4e92-4344-bb18-1a4e4ece0555"]',
            },
        },
        {
            Name: 'rightmode',
            // @ts-ignore на сервисе типов не зафиксирован такой мета-атрибут
            Type: 'rightmode',
            Value: {
                value: 10,
            },
        },
        {
            Name: 'feature',
            // @ts-ignore на сервисе типов не зафиксирован такой мета-атрибут
            Type: 'feature',
            Value: {
                value: 'some_test_feature',
            },
        },
        {
            Name: 'keywords',
            // @ts-ignore на сервисе типов не зафиксирован такой мета-атрибут
            Type: 'keywords',
            Value: {
                value: '["поле","ввод","число"]',
            },
        },
        {
            Name: 'parent',
            // @ts-ignore на сервисе типов не зафиксирован такой мета-атрибут
            Type: 'parent',
            Value: {
                value: 'InputParent',
            },
        },
    ],
    Properties: [
        {
            Id: '',
            Name: 'value',
            Type: 'string',
            MetaType: 'primitive',
            IsArray: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Значение',
                    },
                },
            ],
        },
        {
            Id: '',
            Name: 'label',
            Type: 'string',
            MetaType: 'primitive',
            IsArray: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Метка',
                    },
                },
            ],
        },
    ],
};

export { widgetDesc };
