// @ts-ignore
export function firstCallback(_name: string, args) {
    args.meta.a = 9;
    delete args.meta.b;
    args.meta.c = 3;
    return args;
}

// @ts-ignore
export function secondCallback(_name: string, args) {
    args.meta.push('new');
    return args;
}
