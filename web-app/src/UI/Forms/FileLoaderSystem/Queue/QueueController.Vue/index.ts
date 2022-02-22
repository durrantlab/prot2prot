// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

import { commonQueueProps } from "../../Common/CommonProps.VueFuncs";
import { IFileInfo } from "../../Common/Interfaces";
import { endQueueAndDownloadFilesIfAvailable, popQueue, numLeftInQueue, saveOutputToLocalForage } from "../LocalForageWrapper";

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

    numLeftInQueue(this["molLoaderIds"])
    .then((numItems: number) => {
        this["numItemsInQueue"] = numItems;
        if (numItems === 0) {
            // Either the queue is empty or there was an error. Either way,
            // download files if they are available.
            endQueueAndDownloadFilesIfAvailable(this["outputZipFilename"]);
        } else {
            // There are entries you can use.
            this["active"] = true;
        }
    });
}

/**
 * Setup the file-list Vue commponent.
 * @returns void
 */
export function setupQueueController(): void {
    Vue.component("queue-controller", {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"(): any {
            return {
                "active": false,
                "numItemsInQueue": -1
            };
        },
        "watch": {
            "trigger"(newVal: boolean, oldVal: boolean) {
                this["onProceed"]();
            }
        },
        "methods": {
            "onProceed"(): void {
                popQueue(this["molLoaderIds"])
                .then((fileInfos: IFileInfo[]) => {
                    let files = {};
                    this["molLoaderIds"].forEach((id: string, idx: number) => {
                        files[id] = fileInfos[idx];
                    });
                    this.$emit("onQueueDelivery", files);
                });
            },
            "onStop"(): void {
                endQueueAndDownloadFilesIfAvailable(this["outputZipFilename"]);
            }
        },
        "template": /*html*/ `
            <queue-timer
                v-if="active"
                :countDownSeconds="countDownSeconds"
                :numItemsInQueue="numItemsInQueue"
                @onProceed="onProceed"
                @onStop="onStop"
            >
            </queue-timer>
            <div v-else>
                <slot></slot>
            </div>
        `,
        "props": {
            // "trigger" is a property that must be explicitly set to true to
            // either (1) return the next item in the queue via
            // emit("onQueueDelivery"), or (2) download the files if queue is
            // now empty. Useful if you just loaded models into the file system
            // and you want to trigger first item in queue (via "Start Calc"
            // button, for example).
            ...commonQueueProps
        },
        "computed": computedFunctions,

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction,
    });
}
