import { ITypeDesc } from 'MetaUnit/sampleData/ServiceFormat';

const arrayDesc: ITypeDesc = {
    Id: '',
    TypeId: 'ArrayContainer',
    MetaType: 'object',
    Version: '25.2000',
    Inherits: [],
    InheritsHierarchy: [],
    HasOverrides: false,
    MetaAttributes: [
        {
            Name: 'title',
            Type: 'title',
            Value: {
                value: 'Массив таблиц',
            },
        },
        {
            Name: 'description',
            Type: 'description',
            Value: {
                value: '',
            },
        },
    ],
    Properties: [
        {
            Id: '',
            Name: 'Value',
            Type: 'TableInfo',
            MetaType: 'object',
            IsArray: true,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Имя',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Название таблицы',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: 'Базовые свойства',
                    },
                },
            ],
        },
    ],
    ComplexTypes: [
        {
            Id: '',
            TypeId: 'TableColumn',
            MetaType: 'object',
            Version: '25.2000',
            Inherits: [],
            InheritsHierarchy: [],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Таблица',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: '',
                    },
                },
            ],
            Properties: [
                {
                    Id: '',
                    Name: 'Name',
                    Type: 'String',
                    MetaType: 'primitive',
                    IsArray: false,
                    MetaAttributes: [
                        {
                            Name: 'title',
                            Type: 'title',
                            Value: {
                                value: 'Имя',
                            },
                        },
                        {
                            Name: 'description',
                            Type: 'description',
                            Value: {
                                value: 'Название таблицы',
                            },
                        },
                        {
                            Name: 'category',
                            Type: 'category',
                            Value: {
                                value: 'Базовые свойства',
                            },
                        },
                        {
                            Name: 'hidden',
                            Type: 'hidden',
                            Value: {
                                value: false,
                            },
                        },
                        {
                            Name: 'validators',
                            Type: 'validators',
                            Value: {
                                value: ['not_empty'],
                            },
                        },
                        {
                            Name: 'required',
                            Type: 'required',
                            Value: {
                                value: true,
                            },
                        },
                        {
                            Name: 'order',
                            Type: 'order',
                            Value: {
                                value: 0,
                            },
                        },
                    ],
                },
                {
                    Id: '',
                    Name: 'Deprecated',
                    Type: 'Boolean',
                    MetaType: 'primitive',
                    IsArray: false,
                    MetaAttributes: [
                        {
                            Name: 'title',
                            Type: 'title',
                            Value: {
                                value: 'Устаревшая',
                            },
                        },
                        {
                            Name: 'description',
                            Type: 'description',
                            Value: {
                                value: 'Устаревшая таблица',
                            },
                        },
                        {
                            Name: 'category',
                            Type: 'category',
                            Value: {
                                value: 'Базовые свойства',
                            },
                        },
                        {
                            Name: 'hidden',
                            Type: 'hidden',
                            Value: {
                                value: true,
                            },
                        },
                        {
                            Name: 'validators',
                            Type: 'validators',
                            Value: {
                                value: ['not_empty'],
                            },
                        },
                        {
                            Name: 'required',
                            Type: 'required',
                            Value: {
                                value: false,
                            },
                        },
                        {
                            Name: 'order',
                            Type: 'order',
                            Value: {
                                value: 10,
                            },
                        },
                    ],
                },
                {
                    Id: '',
                    Name: 'CreationDate',
                    Type: 'Date',
                    MetaType: 'primitive',
                    IsArray: false,
                    MetaAttributes: [
                        {
                            Name: 'title',
                            Type: 'title',
                            Value: {
                                value: 'Дата создания',
                            },
                        },
                        {
                            Name: 'description',
                            Type: 'description',
                            Value: {
                                value: 'Дата создания таблицы',
                            },
                        },
                        {
                            Name: 'category',
                            Type: 'category',
                            Value: {
                                value: 'Базовые свойства',
                            },
                        },
                        {
                            Name: 'hidden',
                            Type: 'hidden',
                            Value: {
                                value: false,
                            },
                        },
                        {
                            Name: 'validators',
                            Type: 'validators',
                            Value: {
                                value: ['not_empty'],
                            },
                        },
                        {
                            Name: 'required',
                            Type: 'required',
                            Value: {
                                value: true,
                            },
                        },
                        {
                            Name: 'order',
                            Type: 'order',
                            Value: {
                                value: 20,
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export { arrayDesc };
