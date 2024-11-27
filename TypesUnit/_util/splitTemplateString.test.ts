import splitTemplateString from 'Types/_util/splitTemplateString';

describe('Types/_util/splitTemplateString', () => {
    test('should return array with in empty sting', () => {
        expect(splitTemplateString('')).toEqual(['']);
    });

    test('should return array with 3 elements if range one', () => {
        expect(splitTemplateString('Ссылка и текст:::{0-6}')).toEqual(['', 'Ссылка', ' и текст']);
        expect(splitTemplateString('Ссылка и текст:::{9-14}')).toEqual(['Ссылка и ', 'текст', '']);
        expect(splitTemplateString('Ссылка и текст:::{7-8}')).toEqual(['Ссылка ', 'и', ' текст']);
    });

    test('should return array with 5 elements if range two', () => {
        expect(splitTemplateString('Ссылка и текст и сслыка:::{0-6}{17-23}')).toEqual([
            '',
            'Ссылка',
            ' и текст и ',
            'сслыка',
            '',
        ]);
    });
});
