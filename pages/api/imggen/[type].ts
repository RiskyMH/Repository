import type { NextApiRequest, NextApiResponse } from "next";
import {affect, cry} from "@riskyapi/image-generate";

export default async function imageHandler(req: NextApiRequest, res: NextApiResponse) {
    const { query: { type, ...querys }, method } = req;
    const url = absoluteUrl(req);

    switch (method) {
        case "GET":

            res.setHeader("Cache-Control", "public, s-max-age=86400000 "); // 86400000 = 1 day
            res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());
            switch (type) {
                case "affect": {
                    
                    if (!querys.img) return res.status(400).json({ error: "No input provided, please use the `img` query parameter" });
                    const data = await affect({imgLink: querys.img.toString()}, {affectBgLink: url.origin + "/assets/affect/affect.bmp"});

                    if (data instanceof Buffer) return res.setHeader("Content-Type", "image/png").send(data);
                    else return res.status(400).json(data);
                }
                case "cry": {
                    if (!querys.text) return res.status(400).json({ error: "No input provided, please use the `text` query parameter" });
                    const data = await cry({text: querys.text.toString()}, {fontLocation: url.origin +"/fonts/tahoma.ttf", fontLocationEmoji: url.origin+"/fonts/TwitterColorEmoji.ttf", cryBgLink: url.origin + "/assets/cry/cry.bmp"});
                    
                    if (data instanceof Buffer) return res.setHeader("Content-Type", "image/png").send(data);
                    else return res.status(400).json(data);

                }
                default:
                    // unimplemented error
                    return res.status(501).json({ error: "Not implemented" });

            }

        case "POST":
            // same as GET but using body (URL encoded or JSON body)
            switch (type) {
                case "affect": {
                    if (!req.body) return res.status(400).json({ error: "Body required", example: "{ \"img\": \"https://example.com/image.png\" }" });
                    if (!req.body.img) return res.status(400).json({ error: "Body requires `img` object", example: "{ \"img\": \"https://example.com/image.png\" }"});
                    const data = await affect({imgLink: req.body.img.toString()}, {affectBgLink: url.origin + "/assets/affect/affect.bmp"});

                    if (data instanceof Buffer) return res.setHeader("Content-Type", "image/png").send(data);
                    else return res.status(400).json(data);
                }
                case "cry": {
                    if (!req.body) return res.status(400).json({ error: "Body required", example: "{ \"text\": \"Hello World\" }"});
                    if (!req.body.text) return res.status(400).json({ error: "Body requires `text` object", example: "{ \"text\": \"Hello World\" }"});
                    const data = await cry({text: req.body.text.toString()}, {fontLocation: url.origin +"/fonts/tahoma.ttf", fontLocationEmoji: url.origin+"/fonts/TwitterColorEmoji.ttf", cryBgLink: url.origin + "/assets/cry/cry.bmp"});

                    if (data instanceof Buffer) return res.setHeader("Content-Type", "image/png").send(data);
                    else return res.status(400).json(data);
                }
            }
            break;

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}



function absoluteUrl(req?: NextApiRequest, localhostAddress = "localhost:3000"): URL {

    let host = (req?.headers ? req.headers.host : null) || localhostAddress;
    let protocol = /^localhost(:\d+)?$/.test(host) ? "http:" : "https:";

    if (req && req.headers["x-forwarded-host"] && typeof req.headers["x-forwarded-host"] === "string") {
        host = req.headers["x-forwarded-host"];
    }

    if (req && req.headers["x-forwarded-proto"] && typeof req.headers["x-forwarded-proto"] === "string") {
        protocol = `${req.headers["x-forwarded-proto"]}:`;
    }

    let url = new URL(`${protocol}//${host}`);
    if (req && req.url){
        url = new URL(`${protocol}//${host}${req.url}`);
    }

    return url;
}