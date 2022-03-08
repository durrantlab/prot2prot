// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

// @ts-ignore
import neuralRenderersInfo from "../../../models/info.json";

export let pickNeuralRendererTemplate = /* html */ `
<sub-section id="pick-panel" title="Prot2Prot Renderer">
    <form-select
        label="Render Style"
        :options="neuralRendererOptions"
        storeVarName="selectedNeuralRenderer"
        @change="updateAssociatedInfo"
        :required="true"
    ></form-select>

    <form-select
        label="Dimensions"
        v-if="$store.state.selectedNeuralRenderer"
        :options="dimensionsOptions"
        storeVarName="selectedDimensions"
        @change="updateAssociatedInfo"
        :required="true"
    ></form-select>

    <form-select
        label="Quality"
        v-if="$store.state.selectedDimensions && qualityOptions.length > 1"
        :options="qualityOptions"
        storeVarName="selectedQuality"
        @change="updateAssociatedInfo"
    ></form-select>

    <p>
        {{description}}
        {{colorScheme}}
    </p>
</sub-section>
`;

export let pickNeuralRendererData = {
    "description": "",
    "colorScheme": "",
}

export let pickNeuralRendererMethodsFunctions = {
    /**
     * Updates the description and color scheme with the values of the current
     * neural renderer.
     */
    "updateAssociatedInfo"(): void {
        let nr = this.getCurrentNeuralRendererInfo();
        this["description"] = nr["description"];
        this["colorScheme"] = nr["colorScheme"];
    },

    /**
     * Returns information about the current neural renderer.
     * @returns {*}  The info for the currently selected neural renderer.
     */
    getCurrentNeuralRendererInfo(): any {
        return neuralRenderersInfo[this.$store.state["selectedNeuralRenderer"]];
    },

    /**
     * Get the available image dimensions of the current neural renderer.
     * @returns {*}  The sizes of the images.
     */
    getCurrentDimensionsInfo(): any {
        let nrInfo = this.getCurrentNeuralRendererInfo();
        if (!nrInfo) {
            return undefined;
        }
        return nrInfo["sizes"];
    },

    /**
     * Get the available qualiy information of the current neural renderer.
     * @returns {*}  The quality information.
     */
    getCurrentQualityInfo(): any {
        let dimenInfo = this.getCurrentDimensionsInfo();
        if (!dimenInfo) {
            return undefined;
        }
        return dimenInfo[this.$store.state["selectedDimensions"]];
    }
}

export let pickNeuralRendererComputedFunctions = {
    /**
     * Get a list of available neural renderers.
     * @returns {*} The renderers.
     */
    "neuralRendererOptions"(): any[] { 
        let options = Object.keys(neuralRenderersInfo).map((r) => {
            return {value: r, text: neuralRenderersInfo[r]["name"]}
        });

        if (this.$store.state["selectedNeuralRenderer"] === "") {
            this.$store.commit("setVar", {
                name: "selectedNeuralRenderer",
                val: options[0].value
            });
            this["updateAssociatedInfo"]();
        }
        return options;
    },

    /**
     * Get a list of available image dimensions.
     * @returns {*} The dimensions.
     */
     "dimensionsOptions"(): any[] {
        let sizeInfo = this.getCurrentDimensionsInfo();

        if (!sizeInfo) {
            return [];
        }
        
        let ids = Object.keys(sizeInfo);
        let options = ids.map((s) => {
            let txt = `${s}px x ${s}px`;
            let sizeKeys = Object.keys(sizeInfo[s]);
            txt += (sizeKeys.length === 1) 
                ? " (" + sizeInfo[s][sizeKeys[0]] + ")" 
                : "";

            return {value: s, text: txt};
        });

        if (
            (this.$store.state["selectedDimensions"] === "")
            || (ids.indexOf(this.$store.state["selectedDimensions"]) === -1)
        ) {
            this.$store.commit("setVar", {
                name: "selectedDimensions",
                val: options[0].value
            });
        };

        return options;
    },

    /**
     * Get a list of available quality options.
     * @returns {*} The quality options.
     */
     "qualityOptions"(): any[] {
        let qualInfo = this.getCurrentQualityInfo();

        if (!qualInfo) {
            return [];
        }

        let descriptions = {
            "full": "NOUSE",  // Don't use
            "float16": "NOUSE",  // Don't use
            "uint16": "NOUSE",  // smallish, same as even full model per vis inspect
            "uint8": "Low",  // smallest, almost identical to uint16 (slight differences only)
        };

        let options = [];
        for (let id in qualInfo) {
            if ((descriptions[id] === "NOUSE") || (descriptions[id] === undefined)) {
                continue;
            }
            options.push({value: id, text: descriptions[id] + " (" + qualInfo[id] + ")"});
        }

        let ids = Object.keys(qualInfo);

        if (
            (this.$store.state["selectedQuality"] === "")
            || (ids.indexOf(this.$store.state["selectedQuality"]) === -1)
        ) {
            this.$store.commit("setVar", {
                name: "selectedQuality",
                val: options[0].value
            });
            this["updateAssociatedInfo"]();
        };

        return options;
    }
}