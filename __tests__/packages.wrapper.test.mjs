import { imgGen } from "@riskyapi/api";

// For some reason this crashes the test suite

describe("Image Generation Fetch", () => {
    describe("Affect", () => {
        it("should return generate a url", async () => {
            const result = imgGen.buildAffectUrl("https://i.pravatar.cc/300");
            expect(result).toMatch(/.*/);
        })
        it("generated should return a buffer", async () => {
            const result = await imgGen.getGeneratedAffect("https://i.pravatar.cc/300");
            expect(result).toBeInstanceOf(Buffer);
        })
    });
    describe("Cry", () => {
        it("should return generate a url", async () => {
            const result = imgGen.buildCryUrl("Hello World");
            expect(result).toMatch(/.*/);
        })
        it("generated should return a buffer", async () => {
            const result = await imgGen.getGeneratedCry("Hello World");
            expect(result).toBeInstanceOf(Buffer);
        })
    }
    )
})