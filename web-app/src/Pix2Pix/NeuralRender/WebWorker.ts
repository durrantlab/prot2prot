import { InputColorScheme } from "../InputImage/ColorSchemes/InputColorScheme";
import * as MakeImage from "../InputImage/MakeImage";

const ctx: Worker = self as any;

declare var WorkerGlobalScope: any;

/** @const {number} */
// const DATA_CHUNK_SIZE = 10000000;

/** @type {Array<*>} */
// let dataToSendBack: any[] = [];

// const numRegex = new RegExp("(^|-| )[0-9\.]{1,8}", "g");
// let geoCenter: any = undefined;

// Determine if we're in a webworker. See
// https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
let inWebWorker = false;
if (typeof WorkerGlobalScope !== "undefined" && ctx instanceof WorkerGlobalScope) {
    inWebWorker = true;
}

// Get the data from the main thread, if webworker.
if (inWebWorker) {
    debugger
    ctx.onmessage = (e: MessageEvent) => {
        debugger;
        /** @type {string} */
        let cmd = e.data["cmd"];

        const data = e.data["data"];

        let colorScheme = new InputColorScheme();

        let t = MakeImage.makeImg(256, colorScheme);
        debugger;

        // if (cmd === "sendDataChunk") {
            ctx.postMessage({
                "chunk": "",
                "status": "",
                "geoCenter": "geoCenter"
            });
        // }
    };
}
