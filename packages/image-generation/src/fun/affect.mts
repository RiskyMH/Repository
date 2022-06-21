// CREDITS:
// - Images and ideas from: https://github.com/DankMemer/imgen

import { createCanvas, Image, GlobalFonts } from "@napi-rs/canvas";
import { Dispatcher, request } from "undici";
import BodyReadable from "undici/types/readable.js";
import { RISKY_API_BASE_URL } from "../index.mjs";
import { fakeRequest, requestTypes } from "../tools.mjs";

let imageBg;


export default async function makeImg(input: { imgLink: string }, config?: { affectBgLink?: string }): Promise<Buffer | {error?: string}> {
    
    config ||= {};
    config.affectBgLink ??= RISKY_API_BASE_URL + "/assets/affect/affect.bmp";
    
    const canvas = createCanvas(500, 636);
    let context = canvas.getContext("2d");

    context.fillStyle = "#36393f";
    context.fillRect(0, 0, canvas.width, canvas.height);

    try{
        const [{ body: bodyBg }, { body: bodyImg } ]: {body: BodyReadable & Dispatcher.BodyMixin}[] = await Promise.all([
            imageBg ? fakeRequest(imageBg, requestTypes.buffer): request(config.affectBgLink),
            request(input.imgLink)
        ])
        const [bgBuffer, imgBuffer] = await Promise.all([bodyBg.arrayBuffer(), bodyImg.arrayBuffer()])

        if (!imageBg) {
            imageBg = new Image();
            imageBg.src = Buffer.from(bgBuffer);
            context.drawImage(imageBg, 0, 0, canvas.width, canvas.height);
        }
        const image = new Image();
        image.src = Buffer.from(imgBuffer);
        context.drawImage(image, 180, 383, 200, 157);
        
    } catch (e) {console.error(e); return{error: "Error when loading images"}}

    return canvas.toBuffer("image/png");
}
