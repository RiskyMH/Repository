// CREDITS:
// - Images and ideas from: https://github.com/DankMemer/imgen

import { createCanvas, Image, GlobalFonts } from "@napi-rs/canvas";
import { request, fetch } from "undici";
import { RISKY_API_BASE_URL } from "../index.mjs";
import { wrapText } from "../tools.mjs";


export default async function makeImg(input: { text: string }, config?: { fontLocation?: string; fontLocationEmoji?: string; cryBgLink?: string }): Promise<Buffer | {error?: string}> {
    
    config ||= {};
    config.cryBgLink ??= RISKY_API_BASE_URL + "/assets/cry/cry.bmp";
    config.fontLocation ??= RISKY_API_BASE_URL + "/fonts/tahoma.ttf";
    config.fontLocationEmoji ??= RISKY_API_BASE_URL + "/fonts/TwitterColorEmoji.ttf";

    const canvas = createCanvas(626, 768);
    let context = canvas.getContext("2d");

    try{
        const [{ body: bodyBg}, {body: font}, {body: fontEmoji }] = await Promise.all([request(config.cryBgLink), request(config.fontLocation), request(config.fontLocationEmoji ?? config.fontLocation)])
        const [bgBuffer, fontBuffer, fontEmojiBuffer] = await Promise.all([bodyBg.arrayBuffer(), font.arrayBuffer(), fontEmoji.arrayBuffer()])
        
        GlobalFonts.register(Buffer.from(fontBuffer), "tahoma");
        GlobalFonts.register(Buffer.from(fontEmojiBuffer), "twemoji");
    
        const imageBg = new Image();
        imageBg.src = Buffer.from(bgBuffer);
        context.drawImage(imageBg, 0, 0, canvas.width, canvas.height);
        
    } catch (e) {console.error(e); return{error: "Error when fetching assets"}}

    context.font = "900 20pt tahoma, twemoji";
    wrapText(context, input.text, 385, 85, 175, 24 + 12);

    return canvas.toBuffer("image/png");
}
