// CREDITS:
// - Images and ideas from: https://github.com/DankMemer/imgen

import { createCanvas, Image, GlobalFonts } from "@napi-rs/canvas";
import { request, fetch, Dispatcher } from "undici";
import BodyReadable from "undici/types/readable.js";
import { RISKY_API_BASE_URL } from "../index.mjs";
import { fakeRequest, requestTypes, wrapText } from "../tools.mjs";

let imageBg: Image;
let fontBuffered: Buffer;
let fontEmojiBuffered: Buffer;


export default async function makeImg(input: { text: string }, config?: { fontLocation?: string; fontLocationEmoji?: string; cryBgLink?: string }): Promise<Buffer | {error?: string}> {
    
    config ||= {};
    config.cryBgLink ??= RISKY_API_BASE_URL + "/assets/cry/cry.bmp";
    config.fontLocation ??= RISKY_API_BASE_URL + "/fonts/tahoma.ttf";
    config.fontLocationEmoji ??= RISKY_API_BASE_URL + "/fonts/TwitterColorEmoji.ttf";

    const canvas = createCanvas(626, 768);
    let context = canvas.getContext("2d");

    try{
        // const [{ body: bodyBg }, { body: bodyImg } ] = await Promise.all([imageBg ? fakeRequest(imageBg, requestTypes.image): request(config.affectBgLink), request(input.imgLink)])
        const [{ body: bodyBg}, {body: font}, {body: fontEmoji }]: {body: BodyReadable & Dispatcher.BodyMixin}[] = await Promise.all([
            imageBg ? fakeRequest(imageBg, requestTypes.buffer): request(config.cryBgLink), 
            fontBuffered ? fakeRequest(fontBuffered, requestTypes.buffer): request(config.fontLocation), 
            fontEmojiBuffered ? fakeRequest(fontEmojiBuffered, requestTypes.buffer): request(config.fontLocationEmoji ?? config.fontLocation)
        ])
        const [bgBuffer, fontBuffer, fontEmojiBuffer] = await Promise.all([bodyBg.arrayBuffer(), font.arrayBuffer(), fontEmoji.arrayBuffer()])
        
        fontBuffered ||= Buffer.from(fontBuffer);
        fontEmojiBuffered ||= Buffer.from(fontEmojiBuffer);

        GlobalFonts.register(fontBuffered, "tahoma");
        GlobalFonts.register(fontEmojiBuffered, "twemoji");
        
        if (!imageBg) {
            imageBg = new Image();
            imageBg.src = Buffer.from(bgBuffer);
            context.drawImage(imageBg, 0, 0, canvas.width, canvas.height);
        }
        
    } catch (e) {console.error(e); return{error: "Error when fetching assets"}}

    context.font = "900 20pt tahoma, twemoji";
    wrapText(context, input.text, 385, 85, 175, 24 + 12);

    return canvas.toBuffer("image/png");
}
