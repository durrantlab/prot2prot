// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

declare var Vuex;
declare var Vue;

interface IVueXStoreSetVar {
    name: string;
    val: any;
}

interface IModal {
    title: string;
    body: string;
}

interface IInputFileNames {
    type: string;
    filename: string;
}

export var store;

export function setupVueXStore(ExampleReceptorPDBQT) {
    Vue.use(Vuex)

    store = new Vuex.Store({
        "state": {
            "tabIdx": 0,
            "receptorFileName": "",
            "receptorContentsExample": ExampleReceptorPDBQT,
            "showKeepProteinOnlyLink": true,
            "onConvertCancel": undefined,
            "onConvertDone": undefined,
            "modalShow": false,
            "modalTitle": "Title",
            "modalBody": "Some text here...",
            "time": 0,  // Used to keep track of execution time.
            "protDist": 150,
            "leftRightOffset": 0,
            "upDownOffset": 0,
            "pdbLoaded": false,
            "selectedNeuralRenderer": "",
            "selectedDimensions": "",
            "selectedQuality": "",
            "webWorkerInfo": `Drag, scroll, and pinch to rotate and resize the protein structure. When ready to render, switch from "Preview" to "Prot2Prot" in the Render Mode panel below.`
        },
        "mutations": {
            /**
             * Set one of the VueX store variables.
             * @param  {any}              state    The VueX state.
             * @param  {IVueXStoreSetVar} payload  An object containing
             *                                     information about which
             *                                     variable to set.
             * @returns void
             */
            "setVar"(state: any, payload: IVueXStoreSetVar): void {
                state[payload.name] = payload.val;
            },
    
            /**
             * Open the modal.
             * @param  {*}      state    The VueX state.
             * @param  {IModal} payload  An object with the title and body.
             * @returns void
             */
            "openModal"(state: any, payload: IModal): void {
                state["modalTitle"] = payload.title;
                state["modalBody"] = payload.body;
                state["modalShow"] = true;
                document.body.classList.remove("waiting");
            },
    
            /**
             * Update the filenames of the receptor and ligand input files.
             * @param  {any}             state    The VueX state.
             * @param  {IInputFileNames} payload  An object describing the
             *                                    filename change.
             * @returns void
             */
            "updateFileName"(state: any, payload: IInputFileNames): void {
                // Also update file names so example vina command line is valid.
                state[payload.type + "FileName"] = payload.filename;
            }
        }
    });
    
    // Good for debugging.
    window["store"] = store;
}

export function setupFakeVueXStore() {
    // To make things work in nodejs.
    store = {
        commit: (a: any, b: any) => {}
    }
}
