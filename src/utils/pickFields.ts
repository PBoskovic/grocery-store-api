export function pickFields<T extends object, K extends keyof T>(obj: T, allowed: K[]): Pick<T, K> {
    const out = {} as Pick<T, K>;
    allowed.forEach(f => {
        if (obj[f] !== undefined) out[f] = obj[f];
    });
    return out;
}