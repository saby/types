import formatsFactory from 'Types/_collection/format/factory';
import Format from 'Types/_collection/format/Format';

describe('Types/_entity/format/factory', () => {
    test('should throw an error if not simple array passed', () => {
        expect(() => {
            //@ts-ignore
            formatsFactory(undefined);
        }).toThrow();
        expect(() => {
            //@ts-ignore
            formatsFactory(null);
        }).toThrow();
        expect(() => {
            formatsFactory(false as any);
        }).toThrow();
        expect(() => {
            formatsFactory(true as any);
        }).toThrow();
        expect(() => {
            formatsFactory(0 as any);
        }).toThrow();
        expect(() => {
            formatsFactory(1 as any);
        }).toThrow();
        expect(() => {
            formatsFactory('' as any);
        }).toThrow();
        expect(() => {
            formatsFactory({} as any);
        }).toThrow();
    });

    test('should return an empty formats list', () => {
        const format = formatsFactory([]);
        expect(format).toBeInstanceOf(Format);
        expect(format.getCount()).toBe(0);
    });

    test('should return formats list', () => {
        const declaration = [
            {
                name: 'f1',
                type: 'boolean',
            },
            {
                name: 'f2',
                type: 'integer',
            },
            {
                name: 'f3',
                type: 'real',
            },
            {
                name: 'f4',
                type: 'string',
            },
        ];
        const format = formatsFactory(declaration);

        expect(format.getCount()).toBe(4);
        for (let i = 0; i < format.getCount(); i++) {
            expect(format.at(i).getName()).toBe(declaration[i].name);
        }
    });
});
