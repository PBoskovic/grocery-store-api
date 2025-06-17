export function pickFields(obj: any, allowed: string[]) {
    const out: any = {};
    allowed.forEach(f => {
        if (obj[f] !== undefined) out[f] = obj[f];
    });
    return out;
}