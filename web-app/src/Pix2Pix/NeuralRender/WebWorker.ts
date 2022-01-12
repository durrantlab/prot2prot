import { neuralRenderInWorker } from './WebWorkerSupport';
declare var tf;

let ctx;
try { ctx = self as any; } 
catch { ctx = undefined; }

// Determine if we're in a webworker. See
// https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
let inWebWorker = (
    typeof WorkerGlobalScope !== "undefined" && 
    ctx instanceof WorkerGlobalScope
);

declare var WorkerGlobalScope: any;

// Get the data from the main thread, if webworker.
if (inWebWorker) {
    // importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
    
    // @ts-ignore
    importScripts("./tfjs/tfjs.js");

    // @ts-ignore
    importScripts("./tfjs/tf-backend-wasm.js");

    tf["wasm"]["setWasmPaths"]({
        'tfjs-backend-wasm.wasm': './tfjs/tfjs-backend-wasm.wasm',
        'tfjs-backend-wasm-simd.wasm': './tfjs/tfjs-backend-wasm-simd.wasm',
        'tfjs-backend-wasm-threaded-simd.wasm': './tfjs/tfjs-backend-wasm-threaded-simd.wasm'
    });

    // @ts-ignore : A strange shim to avoid bootstrap errors in the webworker.
    self["document"] = { "createElement"() { return {"setAttribute"(a, b) {}} }, "head": {"appendChild"(a) {}} }

    ctx.onmessage = (e: MessageEvent) => {
        /** @type {string} */
        let cmd = e.data["cmd"];

        const data = e.data["data"];

        if (cmd === "inference") {
            neuralRenderInWorker(data["modelPath"], data["imageData"], tf, sendMsg)
            .then((outTypedArray) => {
                ctx.postMessage({
                    "cmd": "inference",
                    "out": outTypedArray
                });
            });
        }
    };
}

function sendMsg(msg: string): void {
    ctx.postMessage({
        "cmd": "message",
        "msg": msg
    });
}

