export let tf;
export function loadTfjs(): Promise<any> {
    return import(
        /* webpackChunkName: "tf" */ 
        /* webpackMode: "lazy" */
        '@tensorflow/tfjs'
    ).then((tfMod) => {
        tf = tfMod;
    })
}