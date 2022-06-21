import type { SKRSContext2D } from "@napi-rs/canvas";

export function wrapText(context: SKRSContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    var words = text.split(" ");
    var line = "";

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

export const getMaxNextLine = (input, maxChars = 20) => {
    // Split the string into an array of words.
    const allWords = input.split(" ");
    // Find the index in the words array at which we should stop or we will exceed
    // maximum characters.
    const lineIndex = allWords.reduce((prev, cur, index) => {
        if (prev?.done) return prev;
        const endLastWord = prev?.position || 0;
        const position = endLastWord + 1 + cur.length;
        return position >= maxChars ? { done: true, index } : { position, index };
    });
    // Using the index, build a string for this line ...
    const line = allWords.slice(0, lineIndex.index).join(" ");
    // And determine what's left.
    const remainingChars = allWords.slice(lineIndex.index).join(" ");
    // Return the result.
    return { line, remainingChars };
};
/**
 * @param {Date} date
 * @returns {string}
 */
export function dateMaker(date) {
    let UTC = new Date(date);

    let unit = `${UTC.getHours() > 12 ? "PM" : "AM"}`;

    let min = ("00" + UTC.getMinutes()).slice(-2);
    let hour = (
        "00" + (unit == "AM" ? UTC.getHours() : UTC.getHours() - 12)
    ).slice(-2);
    let daynum = ("00" + UTC.getDate()).slice(-2);
    let month = ("00" + UTC.getMonth()).slice(-2);
    let year = ("0000" + UTC.getFullYear()).slice(-2);

    let dateNew = "";
    if (date.getDate() == new Date().getDate()) {
        dateNew = `Today at ${hour}:${min} ${unit}`;
    } else {
        dateNew = `${daynum}/${month}/${year}`;
    }

    return dateNew;
}


export enum requestTypes {
    buffer
}

class fakeRequestBuffer {
    variable: any;
    constructor(variable) {this.variable = variable;}
    async arrayBuffer() {return this.variable;}
}

export function fakeRequest(variable: any, type?: requestTypes ) {
    if (type === requestTypes.buffer) {
        return new fakeRequestBuffer(variable);
    }
    return variable;

}