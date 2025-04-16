import { Record as TypesRecord, Model, IModelProperty } from 'Types/entity';
import { RecordSet } from 'Types/collection';

describe('ObserveSessionMixion', () => {
    describe('отслеживание изменений полей рекорда', () => {
        let record: TypesRecord;

        const callback = jest.fn();

        callback.mockImplementation((changes) => {
            const shouldBeChanged = ['FirstName', 'LastName'];

            const containsAtLeastOneKey = shouldBeChanged.some((key) =>
                changes.hasOwnProperty(key)
            );

            expect(containsAtLeastOneKey).toBe(true);
        });

        beforeEach(() => {
            record = new TypesRecord({
                rawData: {
                    FirstName: 'Иван',
                    LastName: 'Иванов',
                    Age: 25,
                    Department: 'Разработка',
                },
            });
            callback.mockClear();
        });

        test('отслеживается изменение только используемых в рамках сессии полей', () => {
            record.startObserveSession();
            record.get('FirstName');
            record.get('LastName');
            record.endObserveSession(callback);

            // колбек должен поджечься при изменении FirstName
            record.set('FirstName', 'Петр');
            expect(callback).toHaveBeenCalledWith({ FirstName: 'Петр' });

            // колбек должен поджечься при изменении LastName
            record.set('LastName', 'Петров');
            expect(callback).toHaveBeenCalledWith({ LastName: 'Петров' });

            // колбек не должен поджечься при изменении Age и Department
            record.set('Age', 26);
            expect(callback).not.toHaveBeenCalledWith({ Age: '26' });
            record.set('Department', 'Правление');
            expect(callback).not.toHaveBeenCalledWith({ Department: 'Правление' });
        });
    });

    describe('отслеживание изменений вычисляемых свойств модели', () => {
        class EmployeeModel extends Model {
            private _fired: boolean = false;

            protected _$properties: Record<string, IModelProperty<EmployeeModel>> = {
                FullName: {
                    get() {
                        return `${this.get('FirstName')} ${this.get('LastName')}`;
                    },
                },

                Fired: {
                    get() {
                        return this._fired;
                    },
                    set() {
                        return this._fired;
                    },
                },
            };

            getAge(): number {
                return this.get('Age');
            }
        }

        let model: EmployeeModel;

        const callback = jest.fn();

        callback.mockImplementation((changes) => {
            const shouldBeChanged = ['FirstName', 'LastName', 'Age'];

            const containsAtLeastOneKey = shouldBeChanged.some((key) =>
                changes.hasOwnProperty(key)
            );

            expect(containsAtLeastOneKey).toBe(true);
        });

        beforeEach(() => {
            model = new EmployeeModel({
                rawData: {
                    FirstName: 'Иван',
                    LastName: 'Иванов',
                    Age: 25,
                    Department: 'Разработка',
                },
            });
            callback.mockClear();
        });

        test('отслеживается изменение только используемых в рамках сессии полей', () => {
            model.startObserveSession();
            model.get('FullName'); // вычисляемое свойство
            model.getAge(); // метод класса
            model.endObserveSession(callback);

            // колбек должен поджечься при изменении зависимого поля FirstName
            model.set('FirstName', 'Петр');
            expect(callback).toHaveBeenCalledWith({ FirstName: 'Петр' });

            // колбек должен поджечься при изменении зависимого поля LastName
            model.set('LastName', 'Петров');
            expect(callback).toHaveBeenCalledWith({ LastName: 'Петров' });

            // колбек должен поджечься при изменении зависимого поля Age
            model.set('Age', 26);
            expect(callback).toHaveBeenCalledWith({ Age: 26 });

            // колбек не должен поджечься при изменении Department
            model.set('Department', 'Правление');
            expect(callback).not.toHaveBeenCalledWith({ Department: 'Правление' });
        });

        test('колбек вызывается даже если вычисляемое значение уже попало в кэш', () => {
            model.get('FullName'); // кэшируем значение свойства

            model.startObserveSession();
            model.get('FullName');
            model.endObserveSession(callback);

            // колбек должен поджечься при изменении зависимого поля FullName
            model.set('FirstName', 'Петр');
            expect(callback).toHaveBeenCalledWith({ FirstName: 'Петр' });
        });

        test.skip('отслеживаются изменения вычисляемого свойства, не работающего с данными', () => {
            model.startObserveSession();
            model.get('Fired');
            model.getAge(); // метод класса

            // колбек должен поджечься при изменении зависимого поля Fired
            model.set('Fired', false);
            expect(callback).toHaveBeenCalledWith({ Fired: true });
        });
    });

    describe('несколько сессий на одном рекорде', () => {
        let record: TypesRecord;
        const firstSessionCallback = jest.fn();
        const secondSessionCallback = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
            record = new TypesRecord({
                rawData: {
                    FirstName: 'Иван',
                    LastName: 'Иванов',
                    Age: 25,
                    Department: 'Разработка',
                },
            });

            // первая сессия для отслеживания полей FirstName и LastName
            record.startObserveSession();
            record.get('FirstName');
            record.get('LastName');
            record.endObserveSession(firstSessionCallback);

            // вторая сессия для отслеживания полей FirstName и Age
            record.startObserveSession();
            record.get('FirstName');
            record.get('Age');
            record.endObserveSession(secondSessionCallback);
        });

        test('при изменении поля FirstName поджигаются колбеки и ПЕРВОЙ и ВТОРОЙ сессии отслеживания', () => {
            record.set('FirstName', 'Петр');
            expect(firstSessionCallback).toHaveBeenCalledTimes(1);
            expect(firstSessionCallback).toHaveBeenCalledWith({ FirstName: 'Петр' });
            expect(secondSessionCallback).toHaveBeenCalledTimes(1);
            expect(secondSessionCallback).toHaveBeenCalledWith({ FirstName: 'Петр' });
        });

        test('при изменении поля LastName поджигаются колбеки только ПЕРВОЙ сессии отслеживания', () => {
            record.set('LastName', 'Петров');
            expect(firstSessionCallback).toHaveBeenCalledTimes(1);
            expect(firstSessionCallback).toHaveBeenCalledWith({ LastName: 'Петров' });
            expect(secondSessionCallback).toHaveBeenCalledTimes(0);
            expect(secondSessionCallback).not.toHaveBeenCalledWith({ LastName: 'Петров' });
        });

        test('при изменении поля Age поджигаются колбеки только ВТОРОЙ сессии отслеживания', () => {
            record.set('Age', 30);
            expect(firstSessionCallback).toHaveBeenCalledTimes(0);
            expect(firstSessionCallback).not.toHaveBeenCalledWith({ Age: 30 });
            expect(secondSessionCallback).toHaveBeenCalledTimes(1);
            expect(secondSessionCallback).toHaveBeenCalledWith({ Age: 30 });
        });
    });

    describe('отслеживание изменений в иерархии рекорда -> рекордсет -> рекорд', () => {
        let record: TypesRecord;
        const callback = jest.fn();

        beforeEach(() => {
            record = new TypesRecord({
                rawData: {
                    FirstName: 'Иван',
                    LastName: 'Иванов',
                    DepartmentEmployees: new RecordSet({
                        rawData: [
                            { FirstName: 'Алексей', LastName: 'Петров' },
                            { FirstName: 'Дмитрий', LastName: 'Смирнов' },
                            { FirstName: 'Сергей', LastName: 'Кузнецов' },
                        ],
                    }),
                },
            });

            callback.mockClear();
        });

        test('отслеживается изменение используемых полей в глубину структуры', () => {
            record.startObserveSession();
            record.get('DepartmentEmployees').at(0).get('FirstName');
            record.get('DepartmentEmployees').at(2).get('LastName');
            record.endObserveSession(callback);

            // колбек должен поджечься при изменении Department.0.FirstName
            record.get('DepartmentEmployees').at(0).set('FirstName', 'Петр');
            expect(callback).toHaveBeenLastCalledWith({ FirstName: 'Петр' });

            // колбек должен поджечься при изменении Department.2.LastName
            record.get('DepartmentEmployees').at(2).set('LastName', 'Петров');
            expect(callback).toHaveBeenLastCalledWith({ LastName: 'Петров' });

            // для остальных полей колбек не поджигается
            record.get('DepartmentEmployees').at(0).set('LastName', 'Иванов');
            expect(callback).not.toHaveBeenLastCalledWith({ LastName: 'Иванов' });
            record.get('DepartmentEmployees').at(1).set('LastName', 'Иванов');
            expect(callback).not.toHaveBeenLastCalledWith({ LastName: 'Иванов' });
            record.get('DepartmentEmployees').at(2).set('FirstName', 'Иван');
            expect(callback).not.toHaveBeenLastCalledWith({ FirstName: 'Иван' });
        });
    });
});
