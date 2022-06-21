import { InteractionResponseFlags, verifyKey } from "discord-interactions";
import { NextApiRequest, NextApiResponse } from "next";
import FormData from "form-data";
import { InteractionType, InteractionResponseType, ApplicationCommandType } from "discord-api-types/v10";
import type { APIInteraction, APIApplicationCommandInteraction, APIChatInputApplicationCommandInteraction, APIInteractionResponseChannelMessageWithSource } from "discord-api-types/v10";

import { affect, cry } from "@riskyapi/image-generate";
import { fetch } from "undici";

import("dotenv/config");

export default async function discordHandler(request: NextApiRequest, response: NextApiResponse) {

    if (!process.env.DISCORD_CLIENT_PUBLIC_KEY) throw new Error("`DISCORD_CLIENT_PUBLIC_KEY` is not set, it is required for using Discord interactions");

    // CHECK IF VALID REQUEST
    if (request.method !== "POST") return response.status(405).json({ error: "Only can use POST method" });
    const signature = request.headers["x-signature-ed25519"]?.toString();
    const timestamp = request.headers["x-signature-timestamp"]?.toString();
    const rawBody = JSON.stringify(request.body);
    if (!signature || !timestamp || !rawBody ) return response.status(405).json({ error: "Invalid headers and/or body" });
    const isValidRequest = verifyKey(rawBody, signature, timestamp, process.env.DISCORD_CLIENT_PUBLIC_KEY);
    if (!isValidRequest) return response.status(401).json({ error: "Bad request signature" });

    const interaction: APIInteraction = request.body;

    const baseHost = request.headers.host?.includes("localhost") ? "http://" + request.headers.host : "https://" + request.headers.host;

    // Handle PINGs from Discord

    if (interaction.type === InteractionType.Ping) {
        console.info("Handling Ping request");
        return response.json({ type: InteractionResponseType.Pong });
    }

    const interactionUrl = `https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}`;

    // If it is a command, not a button
    if (interaction.type === InteractionType.ApplicationCommand) {
        const interaction: APIApplicationCommandInteraction = request.body;
        // If it is a text input (slash command)

        if (interaction.data.type === ApplicationCommandType.ChatInput) {
            const interaction: APIChatInputApplicationCommandInteraction = request.body;
            console.info("ChatInput command: " + interaction.data.name);

            switch (interaction.data.name) {
                case "ping":
                    return response.send({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: `Pong \`${new Date().getMilliseconds() - convertSnowflakeToDate(interaction.id).getMilliseconds()}ms\``,
                            // content: `Pong \`${new Date().getMilliseconds() - new Date(timestamp).getMilliseconds()}ms\``,
                            flags: InteractionResponseFlags.EPHEMERAL,
                        },
                    });

                case "affect": {
                    // @ts-expect-error`.value` exits. but the types are messed up
                    const userSelectedImg: string = interaction.data?.options?.find(name => name.name === "img")?.value ?? "";
                    const data = await affect({ imgLink: userSelectedImg.toString() }, { affectBgLink: baseHost + "/assets/affect/affect.bmp" });
                    return sendAttachment(response, interactionUrl, { data, name: "affect.png", description: `True story of <@${interaction.user?.id ?? interaction.member.user?.id}>` });
                }

                case "cry": {
                    // @ts-expect-error
                    const userSelectedString: string = interaction.data?.options?.find(name => name.name === "reason")?.value ?? "";
                    const data = await cry({ text: userSelectedString.toString() }, { fontLocation: baseHost + "/fonts/tahoma.ttf", fontLocationEmoji: baseHost + "/fonts/TwitterColorEmoji.ttf", cryBgLink: baseHost + "/assets/cry/cry.bmp" });
                    return sendAttachment(response, interactionUrl, { data, name: "cry.png", description: `Don't cry <@${interaction.user?.id ?? interaction.member.user?.id}>` });
                }

                default:
                    return response.send({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: `Unknown command: \`${interaction.data.name}\``,
                            flags: InteractionResponseFlags.EPHEMERAL,
                        },
                    });

            }
        }
    }
}


const DISCORD_EPOCH = 1420070400000;

function convertSnowflakeToDate(snowflake: string): Date {
    return new Date(Number(snowflake) / 4194304 + DISCORD_EPOCH);
}
// type attachment = {data: Buffer | { error?: string }, name?: string, description?: string}
// class Interaction {
//     body: APIInteraction;
//     type: InteractionType;
//     id: Snowflake;
//     token: string;
//     applicationId: Snowflake;
//     channelId?: Snowflake; 
//     guildId?: Snowflake;
//     user: APIUser;
//     member?: APIGuildMember;
//     version: number;
//     memberPermissions: BigInt; 
//     local: LocaleString;
//     guildLocale: LocaleString;
//     commandType: ApplicationCommandType;
//     data?: APIChatInputApplicationCommandInteractionData | APIUserApplicationCommandInteractionData | APIMessageApplicationCommandInteractionData | APIModalSubmission | APIMessageComponentInteractionData

//     constructor(body: APIInteraction) {
//         this.body = body;
//         this.type = body.type;
//         this.id = body.id;
//         this.token = body.token;
//         this.applicationId = body.application_id;
//         this.channelId = body.channel_id ?? null;
//         this.guildId = body.guild_id ?? null;
//         this.user = body.user ?? body.member.user;
//         this.member = body.member ?? null;
//         this.version = body.version;
//         this.memberPermissions = BigInt(body.member?.permissions ?? 0);
        
        
//         if (this.type !== InteractionType.Ping) {
//             this.local = body.local;
//             this.data = body.data ?? null;
//             this.guildLocale = body.guild_locale ?? null
//         }
//     }
//     get createdAt() {
//         return convertSnowflakeToDate(this.id);
//     }
//     inGuild() {
//         return Boolean(this.guildId && this.member);
//     }
//     isChatInputCommand() {
//         return this.type === InteractionType.ApplicationCommand && this.commandType === ApplicationCommandType.ChatInput;
//     }
//     async send(data: {content?: string, embeds?: APIEmbed[], attachments?: attachment[], ephemeral?: boolean}): Promise<void> {
//         if (!data.content || !data.embeds || !data.attachments) throw new Error("No content, embeds or attachments");
//         const form = new FormData();

//         let payloadJson = {
//             type: InteractionResponseType.ChannelMessageWithSource,
//             data: {
//                 content: data.content,
//                 embeds: data.embeds,
//                 attachments: [],
//             },
//             flags: data.ephemeral ? InteractionResponseFlags.EPHEMERAL : 0,
//         };

//         if (data.attachments) {
//             for (const attachment of data.attachments) {
//                 if (attachment.data instanceof Buffer) {
//                     payloadJson.data.attachments.push({
//                         id: data.attachments.findIndex(a => a.name === attachment.name).toString(),
//                         filename: attachment.name ?? "",
//                     });

//                     form.append("files[0]", attachment.data, { filename: attachment.name });
//                 } else if (attachment.data.error) {
//                     throw new Error(attachment.data.error);
//                 } else {
//                     throw new Error("Unknown error");
//                 }
//             }
//         }
//         form.append("payload_json", JSON.stringify(data));
//         const response = await fetch(`https://discord.com/api/v10/interactions/${this.id}/${this.token}/callback`, {
//             method: "POST",
//             body: form,
//             headers: form.getHeaders(),
//         });
//         if (!response.ok) throw new Error(response.statusText);
        


//     }

// }

async function sendAttachment(response: NextApiResponse, interactionUrl: string, attachment: { data: Buffer | { error?: string }, name: string, description?: string }) {
    var form = new FormData();
    if (attachment.data instanceof Buffer) {

        const respJson: APIInteractionResponseChannelMessageWithSource = {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                allowed_mentions: {parse: []},
                content: attachment.description,
                attachments: [
                    {
                        id: "0",
                        filename: attachment.name,
                    }
                ],
                // flags: InteractionResponseFlags.EPHEMERAL,
            },
        };
        form.append("payload_json", JSON.stringify(respJson), { contentType: "application/json" });
        form.append("files[0]", attachment.data, { filename: attachment.name });
        await fetch(interactionUrl+"/callback", { body: form.getBuffer(), headers: form.getHeaders(), method: "POST" });
        return response.status(200).end();

    } else if (attachment.data.error) {
        const respJson = {
            type: InteractionResponseType.ChannelMessageWithSource,
            flags: InteractionResponseFlags.EPHEMERAL,
            data: {
                content: "We had an issue: `" + attachment.data.error + "`",
            },
        };

        return response.send(respJson);
    } else {
        return response.status(500).json({ error: "Unknown error" });
    }

}

/** https://discord.com/api/v10/applications/${Id}applicationId/commands */
export const applicationCommands = [
    {
        "name": "ping",
        "description": "Why are you trying to ping me?"
    },
    {
        "name": "affect",
        "description": "Show everyone why you are affected",
        "options": [
            {
                "type": 3,
                "name": "img",
                "description": "The link to an image describing you",
                "required": true
            }
        ]
    },
    {
        "name": "cry",
        "description": "Show everyone why you are crying",
        "options": [
            {
                "type": 3,
                "name": "reason",
                "description": "The reason that you are crying",
                "required": true
            }
        ]
    }
];