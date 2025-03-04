/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VariantType, ResourceType } from 'Meta/types';

describe('Meta/_types/types', () => {
    describe('ResourceType', () => {
        test('наследует класс `Meta`', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(ResourceType.is(VariantType)).toBe(true);
        });
    });
});
