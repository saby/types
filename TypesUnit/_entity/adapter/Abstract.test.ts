import AbstractAdapter from 'Types/_entity/adapter/Abstract';

class TestAdapter extends AbstractAdapter {
    constructor() {
        super();
    }
}

describe('Types/_entity/adapter/Abstract', () => {
    let adapter: TestAdapter;

    beforeEach(() => {
        adapter = new TestAdapter();
    });

    describe('.getProperty()', () => {
        test('should return property value by path', () => {
            expect(adapter.getProperty({ foo: { bar: 'baz' } }, 'foo.bar')).toBe('baz');
        });
    });

    describe('.setProperty()', () => {
        test('should set property value by path', () => {
            const data = { foo: { bar: 'baz' } };
            adapter.setProperty(data, 'foo.bar', 'new');
            expect(data.foo.bar).toBe('new');
        });
    });
});
