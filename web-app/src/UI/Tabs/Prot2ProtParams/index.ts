// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2020 Jacob D. Durrant.


// import * as Utils from "../../../Utils";
// import * as MakeImg from "../../Pix2Pix/Library.old/make_img";
// import { rotat } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { viewSetupComputedFunctions, viewSetupData, viewSetupTemplate } from "./ViewSetup";
import { loadModelComputedFunctions, loadModelMethodsFunctions, loadModelTemplate } from "./LoadModel";
import { viewSetupMethodsFunctions } from '../Prot2ProtParams/ViewSetup';
import { pickNeuralRendererComputedFunctions, pickNeuralRendererData, pickNeuralRendererMethodsFunctions, pickNeuralRendererTemplate } from "./PickNeuralRenderer";
import { protCanvasComputedFunctions, protCanvasData, protCanvasMethodsFunctions, protCanvasWatchFunctions } from "./ProtCanvas";
import { saveImageMethodsFunctions, saveImageTemplate } from "./SaveImage";

Vue.component('font-awesome-icon', FontAwesomeIcon)
// Vue.config.productionTip = false

declare var Vue;
// declare var jQuery;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
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
    onError(title: string, msg: string): void {
        this.$store.commit("openModal", {
            title: title,
            body: `<p>${msg}</p>`
        });
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
    ...protCanvasMethodsFunctions,
    ...saveImageMethodsFunctions
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {}

/**
 * Setup the prot2prot-params Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('prot2prot-params', {
        "template": /* html */ `
            <div>
                <b-form>
                    <!-- <b-card
                        class="mb-2 text-center"
                        style="margin-bottom:1.4rem !important;"
                    >
                        <b-card-text>
                            Use this tab to setup a Prot2Prot job in your browser.
                            Specify the input files and Prot2Prot parameters below.
                        </b-card-text>
                    </b-card> -->

                    ${loadModelTemplate}

                    ${pickNeuralRendererTemplate}

                    <div 
                        class="slide-height"
                        :style="!$store.state.pdbLoaded ? 'height:0; overflow:hidden; opacity:0;' : ''"
                    >
                        ${viewSetupTemplate}

                        ${saveImageTemplate}
                    </div>
                </b-form>
                <!-- <div v-else>
                    <p>Unfortunately, your browser does not support WebAssembly.
                    Please <a href='https://developer.mozilla.org/en-US/docs/WebAssembly#Browser_compatibility'
                    target='_blank'>switch to a browser that does</a> (e.g., Google Chrome).</p>
                -->
                    <!-- <p>Note that you can still use the "Existing Vina Output" option
                    (see menu on the left) even without WebAssembly.</p> -->
                <!-- </div> -->
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
