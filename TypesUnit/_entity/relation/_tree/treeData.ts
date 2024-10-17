interface TData {
    name: string;
}

interface TNestedData extends TData {
    children?: Record<string, TNestedData>;
}

interface TFlatArrayData extends TData {
    id: string;
    parentId?: string;
}

interface TFlatObjectData extends TData {
    parentId?: string;
}

const nestedHierarchy: Record<string, TNestedData> = {
    s: {
        name: 'Rickard Stark',
        children: {
            s_1: {
                name: 'Eddard Stark',
                children: {
                    s_1_1: {
                        name: 'Robb Stark',
                    },
                    s_1_2: {
                        name: 'Sansa Stark',
                    },
                    s_1_3: {
                        name: 'Arya Stark',
                    },
                },
            },
            s_2: {
                name: 'Benjen Stark',
            },
            s_3: {
                name: 'Lyanna Stark',
            },
        },
    },
    t: {
        name: 'Aerys II Targaryen',
        children: {
            t_1: {
                name: 'Rhaegar Targaryen',
                children: {
                    t_1_1: {
                        name: 'Rhaenys Targaryen',
                    },
                    t_1_2: {
                        name: 'Aegon Targaryen',
                    },
                },
            },
            t_2: {
                name: 'Viserys Targaryen',
            },
            t_3: {
                name: 'Daenerys Targaryen',
            },
        },
    },
};

const flatArrayHierarchy: TFlatArrayData[] = [
    { id: 's', name: 'Rickard Stark' },
    { id: 's_1', name: 'Eddard Stark', parentId: 's' },
    { id: 's_1_1', name: 'Robb Stark', parentId: 's_1' },
    { id: 's_1_2', name: 'Sansa Stark', parentId: 's_1' },
    { id: 's_1_3', name: 'Arya Stark', parentId: 's_1' },
    { id: 's_2', name: 'Benjen Stark', parentId: 's' },
    { id: 's_3', name: 'Lyanna Stark', parentId: 's' },
    { id: 't', name: 'Aerys II Targaryen' },
    { id: 't_1', name: 'Rhaegar Targaryen', parentId: 't' },
    { id: 't_1_1', name: 'Rhaenys Targaryen', parentId: 't_1' },
    { id: 't_1_2', name: 'Aegon Targaryen', parentId: 't_1' },
    { id: 't_2', name: 'Viserys Targaryen', parentId: 't' },
    { id: 't_3', name: 'Daenerys Targaryen', parentId: 't' },
];

const flatObjectHierarchy: Record<string, TFlatObjectData> = {
    s: { name: 'Rickard Stark' },
    s_1: { name: 'Eddard Stark', parentId: 's' },
    s_1_1: { name: 'Robb Stark', parentId: 's_1' },
    s_1_2: { name: 'Sansa Stark', parentId: 's_1' },
    s_1_3: { name: 'Arya Stark', parentId: 's_1' },
    s_2: { name: 'Benjen Stark', parentId: 's' },
    s_3: { name: 'Lyanna Stark', parentId: 's' },
    t: { name: 'Aerys II Targaryen' },
    t_1: { name: 'Rhaegar Targaryen', parentId: 't' },
    t_1_1: { name: 'Rhaenys Targaryen', parentId: 't_1' },
    t_1_2: { name: 'Aegon Targaryen', parentId: 't_1' },
    t_2: { name: 'Viserys Targaryen', parentId: 't' },
    t_3: { name: 'Daenerys Targaryen', parentId: 't' },
};

export {
    flatArrayHierarchy,
    flatObjectHierarchy,
    nestedHierarchy,
    TNestedData,
    TData,
    TFlatObjectData,
    TFlatArrayData,
};
