// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2020 Jacob D. Durrant.

declare var Vue;



declare var FileSaver;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Get's Vina's standard output.
     * @returns string  The standard output.
     */
    "stdOut"(): string {
        return this.$store.state["stdOut"];
    },

    /**
     * Get's Vina's output file.
     * @returns string  The output file.
     */
    "outputContents"(): string {
        return this.$store.state["outputContents"];
    },

    /**
     * Get the execution time.
     * @returns string  The time.
     */
    "time"(): string {
        return this.$store.state["time"].toString();
    }
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when the user clicks the stdout download button.
     * @returns void
     */
    "stdOutDownload"(): void {
        var blob = new Blob([this["stdOut"]], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "stdout.txt");
    },

    /**
     * Runs when the user clicks the download output button.
     * @returns void
     */
    "vinaOutputContentsDownload"(): void {
        var blob = new Blob([this["outputContents"]], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "prot2prot_out.pdbqt");
    }
}

/**
 * Setup the prot2prot-output Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('prot2prot-output', {
        "template": `
            <div>
                <sub-section title="Visualization">
                    <form-group
                        label=""
                        id="input-group-receptor-3dmol"
                        description=""
                    >
                        <!-- <threedmol :autoLoad="true" type="docked" :proteinSurface="true"></threedmol> -->
                    </form-group>
                    <!-- <results-table></results-table> -->
                    <p class="text-center mb-0">Execution time: {{time}} seconds</p>
                </sub-section>

                <sub-section title="Output Files">
                    <form-group v-if="stdOut !== ''"
                        label="Standard Output"
                        id="input-group-standard-output"
                        description="Prot2Prot's standard output, including the docking scores and RMSD values."
                        :labelToLeft="false"
                    >
                        <b-form-textarea
                            readonly
                            id="textarea"
                            v-model="stdOut"
                            placeholder="Standard Output"
                            rows="3"
                            max-rows="6"
                            style="white-space: pre;"
                            class="text-monospace"
                            size="sm"
                        ></b-form-textarea>
                        <form-button :small="true" @click.native="stdOutDownload">Download</form-button>
                    </form-group>

                    <form-group
                        label="Output PDBQT File"
                        id="input-group-standard-output"
                        description="Prot2Prot's output file with the docked ligand poses."
                        :labelToLeft="false"
                    >
                        <b-form-textarea
                            readonly
                            id="textarea"
                            v-model="outputContents"
                            placeholder="Standard Output"
                            rows="3"
                            max-rows="6"
                            style="white-space: pre;"
                            class="text-monospace"
                            size="sm"
                        ></b-form-textarea>
                        <form-button :small="true" @click.native="vinaOutputContentsDownload">Download</form-button>
                    </form-group>
                </sub-section>
            </div>
        `,
        "props": {},
        "computed": computedFunctions,

        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {}
        },
        "methods": methodsFunctions
    })
}
