import { initializeVars } from "../../../Pix2Pix/InputImage/MakeImage";
import { parsePDB, pdbLines } from "../../../Pix2Pix/InputImage/PDBParser";
import { keepOnlyProteinAtoms, replaceExt, scrollIt } from "../../../Utils";
import { IConvert, IFileLoaded, IFileLoadError } from "../../Forms/FileLoader/Common/Interfaces";
import { getExt } from "../../Forms/FileLoader/Common/Utils";

export let loadModelTemplate = /* html */ `
<sub-section title="Input PDB File" v-if="showFileInputs">
    <file-loader
        id="receptor"
        description="Format: PDB"
        accept=".pdb,.ent" 
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

    <form-button
        @click.native="useExampleProt2ProtInputFiles"
        cls="float-right"
    >Use Example Files</form-button>  <!-- variant="default" -->
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

            this.$store.commit("setVar", {
                name: "pdbLoaded",
                val: true
            });

            setTimeout(() => {
                scrollIt("pick-panel");
                // document.getElementById("pick-panel").scrollTo({
                //     top: 0,
                //     left: 0,
                //     behavior: 'smooth'
                // });
            }, 1000);
        });

        return;

        // TODO: Still need to think about the below.
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
        let linesToKeep = keepOnlyProteinAtoms(pdbLines);

        // Update some values.
        this["onFileLoaded"]({
            fileContents: linesToKeep,
            filename: "5iy4.pdb",
            id: "receptor"
        });    

        // Also update file names so example vina command line is valid.
        // this.$store.commit("updateFileName", { type: "receptor", filename: "receptor_example.pdbqt" });

        // return

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
        this["showFileInputs"] = false;

        setTimeout(() => {  // Vue.nextTick doesn't work...
            // Update some values.
            this["onFileLoaded"]({
                fileContents: this.$store.state["receptorContentsExample"],
                filename: "5iy4.pdb",
                id: "receptor"
            });    

            // Also update file names so example vina command line is valid.
            this.$store.commit("updateFileName", { type: "receptor", filename: "receptor_example.pdbqt" });
        }, 100);
    },

    "onConvertNeeded"(convertInfo: IConvert): void {
        // Set the filename.
        this.$store.commit("updateFileName", {
            type: convertInfo.id,
            filename: convertInfo.filename,
        });

        // let ext = getExt(convertInfo.filename);

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