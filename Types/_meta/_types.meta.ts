import {
    AnyType,
    ArrayType,
    BooleanType,
    DateType,
    FunctionType,
    ObjectType,
    PromiseType,
    StringType,
    UnknownType,
    NullType,
    NumberType,
    UndefinedType,
    VoidType,
    WidgetType,
} from './types';

/**
 * Экспортируем базовые типы для сераилизации билдером
 */
export default {
    toJSON() {
        return [].concat(
            AnyType.toJSON(),
            ArrayType.toJSON(),
            BooleanType.toJSON(),
            DateType.toJSON(),
            FunctionType.toJSON(),
            ObjectType.toJSON(),
            PromiseType.toJSON(),
            StringType.toJSON(),
            UnknownType.toJSON(),
            NullType.toJSON(),
            NumberType.toJSON(),
            UndefinedType.toJSON(),
            VoidType.toJSON(),
            WidgetType.toJSON()
        );
    },
};
