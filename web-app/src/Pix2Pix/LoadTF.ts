export let tf;
let alreadyLoaded = false;


export function loadTfjs(): Promise<any> {
    if (alreadyLoaded) {
        return Promise.resolve(tf);
    }
    alreadyLoaded = true;

    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.onload = () => {
            tf = window["tf"];
            resolve(tf);
        };
        script.src = "./tfjs/tfjs.js";
        document.head.appendChild(script);
    });

    // return import(
    //     /* webpackChunkName: "tf" */ 
    //     /* webpackMode: "lazy" */
    //     '@tensorflow/tfjs'
    // ).then((tfMod) => {
    //     tf = tfMod;
    // })
}