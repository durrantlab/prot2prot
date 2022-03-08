// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

export let tf;
let alreadyLoaded = false;

/**
 * Loads the tensorflow.js module.
 * @returns {Promise}  A promise that resolves the tensorflow.js module.
 */
export function loadTfjs(): Promise<any> {
    if (alreadyLoaded) {
        return Promise.resolve(tf);
    }
    alreadyLoaded = true;

    if (typeof document !== 'undefined') {
        // Assume running in browser.
        return new Promise((resolve, reject) => {
            var script = document.createElement('script');
            script.onload = () => {
                tf = window["tf"];
                resolve(tf);
            };
            script.src = "./tfjs/tfjs.js";
            document.head.appendChild(script);
        });
    } else {
        /// #if USE_TFJS_NODE

        // Assume nodejs.
        // '@tensorflow/tfjs'
        return import(
            /* webpackChunkName: "tf" */ 
            /* webpackMode: "lazy" */
            "@tensorflow/tfjs-node"
        ).then((tfMod) => {
            tf = tfMod;
            return Promise.resolve(tf);
        })

        /// #endif
    }
}