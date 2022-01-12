export let tf;
let alreadyLoaded = false;


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
    }

}