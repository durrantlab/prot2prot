// @ts-ignore
import neuralRenderersInfo from "../../../models/info.json";

export let pickNeuralRendererTemplate = /* html */ `
<sub-section id="pick-panel" title="Pick Prot2Prot Renderer">
    <form-select
        label="Renderer"
        :options="neuralRendererOptions"
        storeVarName="selectedNeuralRenderer"
        @change="updateAssociatedInfo"
    ></form-select>

    <form-select
        label="Dimensions"
        v-if="$store.state.selectedNeuralRenderer"
        :options="dimensionsOptions"
        storeVarName="selectedDimensions"
        @change="updateAssociatedInfo"
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
    "updateAssociatedInfo"(): void {
        let nr = this.getCurrentNeuralRendererInfo();
        this["description"] = nr["description"];
        this["colorScheme"] = nr["colorScheme"];
    },

    getCurrentNeuralRendererInfo(): any {
        return neuralRenderersInfo[this.$store.state["selectedNeuralRenderer"]];
    },

    getCurrentDimensionsInfo(): any {
        let nrInfo = this.getCurrentNeuralRendererInfo();
        if (!nrInfo) {
            return undefined;
        }
        return nrInfo["sizes"];
    },

    getCurrentQualityInfo(): any {
        let dimenInfo = this.getCurrentDimensionsInfo();
        if (!dimenInfo) {
            return undefined;
        }
        return dimenInfo[this.$store.state["selectedDimensions"]];
    }
}

export let pickNeuralRendererComputedFunctions = {
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
            // this["updateAssociatedInfo"]();
        };

        return options;
    },

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