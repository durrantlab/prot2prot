import { initializeVars } from "../../../Pix2Pix/InputImage/MakeImage";
import { parsePDB } from "../../../Pix2Pix/InputImage/PDBParser";
import { keepOnlyProteinAtoms, replaceExt } from "../../../Utils";
import { IConvert, IFileLoaded, IFileLoadError } from "../../Forms/FileLoader/Common/Interfaces";
import { getExt } from "../../Forms/FileLoader/Common/Utils";

export let loadModelTemplate = /* html */ `
<sub-section title="Input PDB File" v-if="showFileInputs">
    <!-- TODO: Attention here -->
    <!-- convert=".pdb, .ent, .xyz, .pqr, .mcif, .mmcif" 
    description="Formats: PDBQT (best), PDB, ENT, XYZ, PQR, MCIF, MMCIF. If PDB, be sure to add polar hydrogen atoms."
    -->
    <!-- label="Receptor" -->
    <file-loader
        id="receptor"
        description="Format: PDB"
        accept=".pdb" 
        :required="true"
        :allowUrlInput="false"
        :multipleFiles="false"
        :countDownToNextInput="-1"
        @onError="showFileLoaderError"
        @onFileLoaded="onFileLoaded"
    >
        <template v-slot:extraDescription>
            <span v-if="showKeepProteinOnlyLink">
                <a href='' @click="onShowKeepProteinOnlyClick($event);">Automatically remove all non-protein atoms?</a>
            </span>
            <span v-else>
                <b>(Removed all non-protein atoms!)</b>
            </span>
        </template>
    </file-loader>

    <form-button @click.native="useExampleProt2ProtInputFiles" cls="float-right">Use Example Files</form-button>  <!-- variant="default" -->
</sub-section>
`;

export let loadModelMethodsFunctions = {
    "showFileLoaderError"(error: IFileLoadError): void {
        this.onError(
            error.title,
            error.body
        );
    },

    "onFileLoaded"(fileInfo: IFileLoaded): void {
        if (fileInfo.fileContents === "") {
            // Not really loaded
            return;
        }

        parsePDB(fileInfo.fileContents).then(() => {
            initializeVars();
            this["offset"]();
            // this["drawImg"]();
        });

        return;

        // MakeImg.set_figure_dimens(256);
        // MakeImg.main(undefined, fileInfo.fileContents, {
        //     "thetaX": 0,
        //     "thetaY": 0,
        //     "thetaZ": 0,
        //     "deltaX": 0,
        //     "deltaY": 0,
        //     "deltaZ": 50,
        // });

        // debugger;
        // this.$store.commit("updateFileName", {
        //     type: this["id"],
        //     filename: fileInfo.filename,
        // });

        // // this.getModelFileContents(this["file"]).then((text: string) => {
        // this.$store.commit("setVar", {
        //     name: fileInfo.id + "Contents",
        //     val: fileInfo.fileContents,
        // });

        // // Reset the show non-protein atom's link.
        // if (fileInfo.id === "receptor") {
        //     this.$store.commit("setVar", {
        //         name: "showKeepProteinOnlyLink",
        //         val: true,
        //     });
        // }

        // // });
    },
    /**
     * Removes residues from protein model that are not protein amino acids.
     * @param  {any} e  The click event.
     * @returns void
     */
     "onShowKeepProteinOnlyClick"(e: any): void {
        let linesToKeep = keepOnlyProteinAtoms(this.$store.state["receptorContents"]);

        this.$store.commit("setVar", {
            name: "receptorContents",
            val: linesToKeep
        });

        this.$store.commit("updateFileName", {
            type: "receptor",
            filename: replaceExt(
                this.$store.state["receptorFileName"],
                "protein.pdbqt"
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
        this["showFileInputs"] = false;

        setTimeout(() => {  // Vue.nextTick doesn't work...
            // Update some values.
            this.$store.commit("setVar", {
                name: "receptorContents",
                val: this.$store.state["receptorContentsExample"]
            });

            // this.$store.commit("setVar", {
            //     name: "ligandContents",
            //     val: this.$store.state["ligandContentsExample"]
            // });
            // this.$store.commit("setVar", {
            //     name: "crystalContents",
            //     val: this.$store.state["crystalContentsExample"]
            // });
            // this.$store.commit("setVinaParam", {
            //     name: "center_x",
            //     val: 41.03
            // });
            // this.$store.commit("setVinaParam", {
            //     name: "center_y",
            //     val: 18.98
            // });
            // this.$store.commit("setVinaParam", {
            //     name: "center_z",
            //     val: 14.03
            // });
            // this.$store.commit("setVinaParam", {
            //     name: "size_x",
            //     val: 20.00
            // });
            // this.$store.commit("setVinaParam", {
            //     name: "size_y",
            //     val: 20.00
            // });
            // this.$store.commit("setVinaParam", {
            //     name: "size_z",
            //     val: 20.00
            // });

            // Also update file names so example vina command line is valid.
            this.$store.commit("updateFileName", { type: "ligand", filename: "ligand_example.pdbqt" });
            this.$store.commit("updateFileName", { type: "receptor", filename: "receptor_example.pdbqt" });

            // These values should now validate.
            // let validateVars = [
            //     "receptor", "ligand", "center_x", "center_y", "center_z",
            //     "size_x", "size_y", "size_z"
            // ];
            // const validateVarsLen = validateVars.length;
            // for (let i = 0; i < validateVarsLen; i++) {
            //     const validateVar = validateVars[i];
            //     this.$store.commit("setValidationParam", {
            //         name: validateVar,
            //         val: true
            //     });
            // }
        }, 100);
    },

    "onConvertNeeded"(convertInfo: IConvert): void {
        // Set the filename.
        this.$store.commit("updateFileName", {
            type: convertInfo.id,
            filename: convertInfo.filename,
        });

        let ext = getExt(convertInfo.filename);

        // this.getModelFileContents(val).then((text: string) => {
            // this.$store.commit("openConvertFileModal", {
            //     ext: ext,
            //     type: convertInfo.id,
            //     file: convertInfo.fileContents,
            //     onConvertCancel: convertInfo.onConvertCancel,
            //     onConvertDone: convertInfo.onConvertDone,
            // });
        // });

        alert("");
        // Handle below!!!
        // convertInfo.onConvertCancel
        // convertInfo.onConvertDone
    },
}

export let loadModelComputedFunctions = {
    /** Whether to show the keep-protein-only link. Has both a getter and a setter. */
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