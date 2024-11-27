import template from 'Types/_formatter/template';

describe('Types/_formatter/template', () => {
    test('should format string with special symbol sequence', () => {
        const scope = { foo: 'bar' };

        expect(template('{${foo}}', scope)).toStrictEqual('{bar}');
        expect(template('${foo}{}', scope)).toStrictEqual('bar{}');
    });

    test('should format string with simple object property', () => {
        const scope = { foo: 'bar' };

        expect(template('${foo}', scope)).toStrictEqual('bar');
    });

    test('should format string with hierarchical object property', () => {
        const scope = { foo: { bar: 'baz' } };

        //@ts-ignore
        expect(template('${foo.bar}', scope)).toStrictEqual('baz');
    });

    test('should format string with several placeholders', () => {
        const scope = { foo: 1, bar: 2 };

        expect(template('${foo} + ${bar}', scope)).toStrictEqual('1 + 2');
    });

    test('should format string with property method evaluation', () => {
        const scope = { foo: 'bar' };

        expect(template('${foo.toUpperCase()}', scope)).toStrictEqual('BAR');
    });

    test('should format string with expression evaluation', () => {
        const scope = { foo: 2, bar: 3 };

        expect(template('${foo * bar}!', scope)).toStrictEqual('6!');
    });
});
