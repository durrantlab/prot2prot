// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { initializeVars } from "../../../Pix2Pix/InputImage/MakeImage";
import { loadMolIntoTF, pdbLines } from "../../../Pix2Pix/InputImage/PDBParser";
import { keepOnlyProteinAtoms, replaceExt } from "../../../Utils";
import { IFileInfo, IFileLoadError } from '../../Forms/FileLoaderSystem/Common/Interfaces';

export let loadModelTemplate = /* html */ `
<sub-section title="Input PDB File" v-if="showFileInputs">
    <mol-loader
        ref="receptorLoader"
        :allowDeleteHeteroAtoms="true"
        :allowExtractHeteroAtoms="true"
        :multipleFiles="false"
        :fileLoaderPlugins="['pdb-id-input', 'file-loader-input']"
        description="Format: PDB"
        extraDescription=""
        accept=".pdb,.ent"
        convert=""
        :required="true"
        @onError="onFileLoadError"
        @onFileReady="onFileReady"
    ></mol-loader>

    <form-button
        @click.native="useExampleProt2ProtInputFiles"
        cls="float-right"
    >Use Example File</form-button>
</sub-section>
`;

export let loadModelMethodsFunctions = {
    /**
     * When an error occurs.
     * @param {IFileLoadError} error  The error.
     */
    "onFileLoadError"(error: IFileLoadError): void {
        this.onError(
            error.title,
            error.body
        );
    },

    /**
     * When a file is ready.
     * @param {IFileInfo} fileInfo  File information.
     */
    "onFileReady"(fileInfo: IFileInfo): void {
        if (fileInfo.mol === undefined) {
            // Not really loaded
            return;
        }

        loadMolIntoTF(fileInfo.mol).then(() => {
            initializeVars();
            this["offset"](false);
            this["drawImg"](true);  // So on initial load, show all atoms (true).

            this.$store.commit("setVar", {
                name: "pdbLoaded",
                val: true
            });
        });
    },

    /**
     * Removes residues from protein model that are not protein amino acids.
     * @param  {any} e  The click event.
     * @returns void
     */
     "onShowKeepProteinOnlyClick"(e: any): void {
        let linesToKeep = keepOnlyProteinAtoms(pdbLines);

        // Update some values.
        this["onFileReady"]({
            fileContents: linesToKeep,
            filename: "5iy4.pdb",
            id: "receptor"
        });    

        this.$store.commit("updateFileName", {
            type: "receptor",
            filename: replaceExt(
                this.$store.state["receptorFileName"],
                "protein.pdb"
            )
        });

        this["showKeepProteinOnlyLink"] = false;

        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * Runs when user indicates theye want to use example vina input files,
     * rather than provide their own.
     * @returns void
     */
     "useExampleProt2ProtInputFiles"(): void {
        fetch("./5iy4.pdb")
        .then(response => {
            return response.text()
        })
        .then(pdbTxt => {
            this.$refs["receptorLoader"].loadMolFromExternal(
                "5iy4.pdb", pdbTxt
            );
        });
    },
}

export let loadModelComputedFunctions = {
    /** Whether to show the keep-protein-only link. Has both a getter and a
     * setter. */
    "showKeepProteinOnlyLink": {
        get(): number {
            return this.$store.state["showKeepProteinOnlyLink"];
        },

        set(val: string): void {
            this.$store.commit("setVar", {
                name: "showKeepProteinOnlyLink",
                val: parseInt(val)
            });
        }
    },
}