/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import {
    VariantType,
    ResourceType
} from 'Meta/types';


describe('Meta/_types/types', () => {
    describe('ResourceType', () => {
        it('наследует класс `Meta`', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(ResourceType.is(VariantType)).to.be.true;
        });
    });
});