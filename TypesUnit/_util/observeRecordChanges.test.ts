import { Record as TypesRecord } from 'Types/entity';
import { observeRecordChanges } from 'Types/util';

describe('observeRecordChanges', () => {
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
            const selector = (record: TypesRecord) => {
                record.get('FirstName');
                record.get('LastName');
            };

            observeRecordChanges(record, selector, callback);

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
});
