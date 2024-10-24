import { assert } from 'chai';
import splitTemplateString from 'Types/_util/splitTemplateString';

describe('Types/_util/splitTemplateString', () => {
    it('should return array with in empty sting', () => {
        assert.deepEqual(splitTemplateString(''), ['']);
    });

    it('should return array with 3 elements if range one', () => {
        assert.deepEqual(splitTemplateString('Ссылка и текст:::{0-6}'), ['', 'Ссылка', ' и текст']);
        assert.deepEqual(splitTemplateString('Ссылка и текст:::{9-14}'), [
            'Ссылка и ',
            'текст',
            '',
        ]);
        assert.deepEqual(splitTemplateString('Ссылка и текст:::{7-8}'), ['Ссылка ', 'и', ' текст']);
    });

    it('should return array with 5 elements if range two', () => {
        assert.deepEqual(splitTemplateString('Ссылка и текст и сслыка:::{0-6}{17-23}'), [
            '',
            'Ссылка',
            ' и текст и ',
            'сслыка',
            '',
        ]);
    });
});
