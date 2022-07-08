import { affect, cry } from "@riskyapi/image-generate";

// Not going to use currently because it is dependant on the new feature being added on the stable website


describe("Affect Generate", () => {
    it("should return a buffer", async () => {
        const result = await affect({imgLink: "https://i.pravatar.cc/300"});
        console.log(result)
        expect(result).toBeInstanceOf(Buffer);
    })
});

describe("Cry Generate", () => {
    it("should return a buffer", async () => {
        const result = await cry({text: "Hello World"});
        console.log(result)
        expect(result).toBeInstanceOf(Buffer);
    })
})