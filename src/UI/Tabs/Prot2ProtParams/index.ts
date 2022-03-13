// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { viewSetupComputedFunctions, viewSetupData, viewSetupTemplate } from "./ViewSetup";
import { loadModelComputedFunctions, loadModelMethodsFunctions, loadModelTemplate } from "./LoadModel";
import { viewSetupMethodsFunctions } from '../Prot2ProtParams/ViewSetup';
import { pickNeuralRendererComputedFunctions, pickNeuralRendererData, pickNeuralRendererMethodsFunctions, pickNeuralRendererTemplate } from "./PickNeuralRenderer";
import { protCanvasComputedFunctions, protCanvasData, protCanvasMethodsFunctions, protCanvasWatchFunctions } from "./ProtCanvas";
import { saveImageMethodsFunctions, saveImageTemplate } from "./SaveImage";
import { URL_PARAMS } from '../../../URLParams';

Vue.component('font-awesome-icon', FontAwesomeIcon)
// Vue.config.productionTip = false

declare var Vue;

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
    /**
     * Opens a modal with the given error title and message.
     * @param {string} title  The title of the modal.
     * @param {string} msg    The error message to display in the modal.
     */
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
function mountedFunction(): void {
    if (URL_PARAMS.size !== undefined) {
        this.$store.commit("setVar", {
            name: "selectedDimensions",
            val: URL_PARAMS.size
        });
    }
}

/**
 * Setup the prot2prot-params Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('prot2prot-params', {
        "template": /* html */ `
            <div>
                <b-form>
                    ${loadModelTemplate}
                    ${pickNeuralRendererTemplate}

                    <div 
                        class="slide-height"
                        :style="!$store.state.pdbLoaded ? 'height:0; overflow:hidden; opacity:0;' : ''"
                    >
                        ${viewSetupTemplate}

                        <!-- ${saveImageTemplate} -->
                    </div>
                </b-form>
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
