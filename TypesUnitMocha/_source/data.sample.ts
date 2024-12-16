const barFunction = (() => {
    const bar = () => {
        return undefined;
    };
    bar.toJSON = () => {
        return {
            $serialized$: 'func',
            module: 'test/_source/data.sample',
            path: 'barFunction',
        };
    };

    return bar;
})();

const arrayWithFunctions = [
    {
        foo: 'foo',
        bar: barFunction,
    },
];

export { barFunction, arrayWithFunctions };
