// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

// import { addCSS } from "../Common/Utils";
// import { fileLoaderFileListMethodsFunctions } from "./Methods.VueFuncs";

declare var Vue;

/** An object containing the vue-component computed functions. */
let computedFunctions = {};

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {
    // Add some CSS
    // addCSS(`.alert-dismissible { padding: 0.15rem !important;} .alert-dismissible .close {padding-top: 1px; padding-right: 8px; padding-left: 8px; padding-bottom: 0;}`);

    // Start the countdown
    this["countDownTimeLeft"] = this["countDownSeconds"];
    setTimeout(this.nextCountDownTick, 1000);

}

/**
 * Setup the file-list Vue commponent.
 * @returns void
 */
export function setupDataBaseQueue(): void {
    Vue.component("database-queue", {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"(): any {
            return {
                "countDownPaused": false,
                "countDownTimeLeft": undefined
            };
        },
        "watch": {},
        "methods": {
            nextCountDownTick(): void {
                if (this["countDownTimeLeft"] === -1) {
                    // Not enabled from the beginning
                    return;
                }
        
                let newVal = this["countDownTimeLeft"] - 1;
                if (newVal >= 0) {
                    this["countDownTimeLeft"] = newVal;
        
                    if (!this["countDownPaused"]) {
                        setTimeout(this.nextCountDownTick, 1000);
                    }
                } else {
                    // Time up.
                    this["onProceed"]();
                }
            },

            "onPauseOrResume"(): void {
                this["countDownPaused"] = !this["countDownPaused"];
        
                if (!this["countDownPaused"]) {
                    setTimeout(this.nextCountDownTick, 1000);
                }
            },

            "onProceed"(): void {
                this["countDownTimeLeft"] = -1;  // disable
                console.warn("below?")
                alert("proceed")
                // this.$emit("onTimeUp");
            },
        },
        "template": /*html*/ `
            <b-alert
                v-if="countDownTimeLeft !== -1"
                show
                variant="primary"
            >
                <p style="text-align:center;">
                    Will act on next "id" file 
                    {{countDownPaused 
                        ? "after resume"
                        : "in " + countDownTimeLeft + " seconds"
                    }}...
                </p>
                <b-container fluid>
                    <b-row>
                        <b-col cols="4" class="px-1">
                            <b-button 
                                @click="onPauseOrResume"
                                style="width:100%;"
                                title="Pause/resume countdown"
                            >{{countDownPaused ? "Resume": "Pause"}}</b-button>
                        </b-col>
                        <b-col cols="4" class="px-1">
                            <!-- @click="onCancelAndDownload" -->
                            <b-button
                                style="width:100%;"
                                title="Cancel and download results generated thus far"
                            >Stop</b-button>
                        </b-col>
                        <b-col cols="4" class="px-1">
                            <b-button
                                @click="onProceed"
                                style="width:100%;"
                                title="Proceed with next calculation"
                            >Proceed</b-button>
                        </b-col>
                    </b-row>
                </b-container>
            </b-alert>`,
        "props": {
            "countDownSeconds": {
                "type": Number,
                "default": -1  // does nothing
            }
        },
        "computed": computedFunctions,

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction,
    });
}
