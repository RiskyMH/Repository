
import type { NextApiRequest, NextApiResponse } from "next";

export default async function respond(req: NextApiRequest, res: NextApiResponse) {

    return res.json({
        name: "RiskyAPI",
        endpoints: [
            "./imggen/cry",
            "./imggen/affect"
        ]

    });

}