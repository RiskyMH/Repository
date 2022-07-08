import {fetch} from "undici";
import {RISKY_API_BASE_URL} from "./global.mjs";


export function buildAffectUrl(img: string): string {
    return `${RISKY_API_BASE_URL}/api/imggen/affect?${new URLSearchParams({ img })}`;
}

export function buildCryUrl(text: string): string {
    return `${RISKY_API_BASE_URL}/api/imggen/cry?${new URLSearchParams({ text })}`;
}

export async function getGeneratedAffect(img: string): Promise<Buffer|null|undefined> {
    let rawResult = await fetch(buildAffectUrl(img)).catch(undefined);
    
    if (!rawResult || rawResult.status !== 200) {
        return undefined;
    }
    
    const result = Buffer.from(await rawResult.arrayBuffer());
    
    if (!result) {
        return null;
    }

    return result;
}

export async function getGeneratedCry(text: string): Promise<Buffer|null|undefined> {
    let rawResult = await fetch(buildCryUrl(text)).catch(undefined);
    
    if (!rawResult || rawResult.status !== 200) {
        return undefined;
    }
    
    const result = Buffer.from(await rawResult.arrayBuffer());
    
    if (!result) {
        return null;
    }

    return result;
}


