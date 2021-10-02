// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2020 Jacob D. Durrant.


import * as Utils from "../../../Utils";
// import * as MakeImg from "../../Pix2Pix/Library.old/make_img";
// import { rotat } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { viewSetupComputedFunctions, viewSetupData, viewSetupTemplate } from "./ViewSetup";
import { loadModelComputedFunctions, loadModelMethodsFunctions, loadModelTemplate } from "./LoadModel";
import { viewSetupMethodsFunctions } from '../Prot2ProtParams/ViewSetup';
import { pickNeuralRendererComputedFunctions, pickNeuralRendererData, pickNeuralRendererMethodsFunctions, pickNeuralRendererTemplate } from "./PickNeuralRenderer";
import { protCanvasComputedFunctions, protCanvasData, protCanvasMethodsFunctions, protCanvasWatchFunctions } from "./ProtCanvas";

Vue.component('font-awesome-icon', FontAwesomeIcon)
// Vue.config.productionTip = false

declare var Vue;
declare var Prot2Prot;
declare var jQuery;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Whether to hide the vina docking-box parameters.
     * @returns boolean  True if they should be hidden, false otherwise.
     */
    "hideDockingBoxParams"(): boolean {
        return this.$store.state.hideDockingBoxParams;
    },

    "leftRightOffset": {
        get(): number {
            return this.$store.state["leftRightOffset"];
        },
        set(val: string): void {
            this.$store.commit("setVar", {
                name: "leftRightOffset",
                val: parseInt(val)
            });
        }
    },

    ...viewSetupComputedFunctions,
    ...loadModelComputedFunctions,
    ...pickNeuralRendererComputedFunctions,
    ...protCanvasComputedFunctions
}

let watchFunctions = {
    ...protCanvasWatchFunctions
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when the user presses the submit button.
     * @returns void
     */
    "onSubmitClick"(): void {
        if (this["validate"]() === true) {
            this.$store.commit("disableTabs", {
                "parametersTabDisabled": true,
                // "existingVinaOutputTabDisabled": true,
                "runningTabDisabled": false,
            });

            jQuery("body").addClass("waiting");

            Vue.nextTick(() => {
                this.$store.commit("setVar", {
                    name: "tabIdx",
                    val: 2
                });

                Vue.nextTick(() => {
                    // setTimeout(() => {
                    //     this.afterWASM(this["testVinaOut"], this["testStdOut"]);
                    // }, 1000);

                    // Keep track of start time
                    this.$store.commit("setVar", {
                        name: "time",
                        val: new Date().getTime()
                    });

                    Prot2Prot.start(
                        this.$store.state["vinaParams"],
                        this.$store.state["receptorContents"],
                        this.$store.state["ligandContents"],

                        // onDone
                        (outPdbqtFileTxt: string, stdOut: string, stdErr: string) => {
                            this.$store.commit("setVar", {
                                name: "time",
                                val: Math.round((new Date().getTime() - this.$store.state["time"]) / 100) / 10
                            });

                            this.afterWASM(outPdbqtFileTxt, stdOut, stdErr);
                        },

                        // onError
                        (errObj: any) => {
                            // Disable some tabs
                            this.$store.commit("disableTabs", {
                                "parametersTabDisabled": true,
                                // "existingVinaOutputTabDisabled": true,
                                "runningTabDisabled": true,
                                "outputTabDisabled": true,
                                "startOverTabDisabled": false
                            });

                            this.showProt2ProtError(errObj["message"]);
                        },
                        Utils.curPath() + "Prot2Prot/"
                    )
                });
            });
        }
    },

    /**
     * Opens the draw ligand modal.
     * @param  {*} e  A click event so you can stop the propagation.
     * @returns void
     */
    // "onDrawLigClick"(e: any): void {
    //     this.$store.commit("drawSmilesModal");
    //     e.preventDefault();
    //     e.stopPropagation();
    // },


    /**
     * Determines whether all form values are valid.
     * @param  {boolean=true} modalWarning  Whether to show a modal if
     *                                      they are not valid.
     * @returns boolean  True if they are valid, false otherwise.
     */
    "validate"(modalWarning: boolean=true): boolean {
        let validations = this.$store.state["validation"];

        let pass = true;

        const paramName = Object.keys(validations);
        const paramNameLen = paramName.length;
        let badParams: string[] = [];
        for (let i = 0; i < paramNameLen; i++) {
            const name = paramName[i];

            if (name === "output") {
                // This one isn't part of the validation.
                continue;
            }

            const valid = validations[name];
            if (valid === false) {
                pass = false;
                badParams.push(name);
            }
        }

        if (pass === false) {
            if (modalWarning === true) {
                this.onError(
                    "Invalid Parameters!", 
                    "Please correct the following parameter(s) before continuing: <code>" 
                        + badParams.join(" ") 
                        + "</code>"
                );
            }
        }

        this.$store.commit("setVar", {
            name: "vinaParamsValidates",
            val: pass
        })

        return pass;
    },

    onError(title: string, msg: string): void {
        this.$store.commit("openModal", {
            title: title,
            body: `<p>${msg}</p>`
        });
    },

    /**
     * Runs after the Vina WASM file is complete.
     * @param  {string} outPdbqtFileTxt  The contents of the Vina output pdbqt file.
     * @param  {string} stdOut           The contents of the Vina standard output.
     * @param  {string} stdErr           The contents of the Vina standard error.
     * @returns void
     */
    afterWASM(outPdbqtFileTxt: string, stdOut: string, stdErr: string): void {
        // Disable some tabs
        this.$store.commit("disableTabs", {
            "parametersTabDisabled": true,
            // "existingVinaOutputTabDisabled": true,
            "runningTabDisabled": true,
            "outputTabDisabled": false,
            "startOverTabDisabled": false
        });

        // Switch to output tab.
        this.$store.commit("setVar", {
            name: "tabIdx",
            val: 3
        });

        this.$store.commit("setVar", {
            name: "stdOut",
            val: stdOut
        });
        this.$store.commit("setVar", {
            name: "outputContents",
            val: outPdbqtFileTxt
        });

        if (stdErr !== "") {
            this.showProt2ProtError(stdErr);
        }

        // Process the standard output (extract scores and rmsds) and
        // frames.
        this.$store.commit("outputToData");

        jQuery("body").removeClass("waiting");
    },

    /**
     * Shows a Prot2Prot error.
     * @param  {string} message  The error message.
     * @returns void
     */
    showProt2ProtError(message: string): void {
        this.onError(
            "Prot2Prot Error!", 
            "Prot2Prot returned the following error: <code>" + message + "</code>"
        );
    },

    ...viewSetupMethodsFunctions,
    ...loadModelMethodsFunctions,
    ...pickNeuralRendererMethodsFunctions,
    ...protCanvasMethodsFunctions
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {
    this["webAssemblyAvaialble"] = Utils.webAssemblySupported();
}

/**
 * Setup the prot2prot-params Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('prot2prot-params', {
        "template": /* html */ `
            <div>
                <b-form v-if="webAssemblyAvaialble">
                    <b-card
                        class="mb-2 text-center"
                        style="margin-bottom:1.4rem !important;"
                    >
                        <b-card-text>
                            Use this tab to setup a Prot2Prot job in your browser.
                            Specify the input files and Prot2Prot parameters below.
                        </b-card-text>
                    </b-card>

                    ${loadModelTemplate}

                    ${pickNeuralRendererTemplate}

                    ${viewSetupTemplate}

                    <!-- <span style="display:none;">{{validate(false)}}</span> --> <!-- Hackish. Just to make reactive. -->
                    <form-button @click.native="onSubmitClick" variant="primary" cls="float-right mb-4">Start Prot2Prot</form-button>

                </b-form>
                <div v-else>
                    <p>Unfortunately, your browser does not support WebAssembly.
                    Please <a href='https://developer.mozilla.org/en-US/docs/WebAssembly#Browser_compatibility'
                    target='_blank'>switch to a browser that does</a> (e.g., Google Chrome).</p>

                    <!-- <p>Note that you can still use the "Existing Vina Output" option
                    (see menu on the left) even without WebAssembly.</p> -->
                </div>
            </div>
        `,
        "props": {},
        "computed": computedFunctions,

        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {
                "showFileInputs": true,
                "webAssemblyAvaialble": true,
                ...pickNeuralRendererData,
                ...viewSetupData,
                ...protCanvasData
            }
        },
        "methods": methodsFunctions,

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction,

        "watch": watchFunctions
    });
}
