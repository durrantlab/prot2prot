// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

// FileLoader.ts is meant to be generic. You'll usually want to wrap it in
// another component to provide app-specific functionality.

import { IConvert, IFileInfo, IFileLoadError, IExtractInfo } from '../Common/Interfaces';
import { slugify } from '../Common/Utils';
import { setupFileLoaderFormGroup } from '../Common/FileLoaderFormGroup.Vue/FileLoaderFormGroup.Vue';
import { setupQueueController } from '../Queue/QueueController.Vue';
import { setupFileLoader } from './FileLoader.Vue';
import { setupProteinEditing } from './ProteinEditing.Vue';
// import { setupProteinEditingDeleteExtract } from './ProteinEditing.Vue/ProteinEditing.ts.old';
import { setupFileList } from './FileList.Vue';
import { filesObjToLocalForage } from '../Queue/LocalForageWrapper';
import { setupSmallPillBtn } from '../Common/SmallPillBtn.Vue';
import { commonMultipleFilesProps, commonProteinEditingProps } from '../Common/CommonProps.VueFuncs';
import { PDBMol } from '../Mols/PDBMol';
import { getMol } from '../Mols';

declare var Vue;

export interface IAllowProteinEditing {
    always?: boolean;
    ifNumAtomsLessThan?: number;
}

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    "currentPdbFile"(): IFileInfo {
        return {
            filename: this["selectedFilename"],
            mol: this["files"][this["selectedFilename"]]
        }
    },

    "idToUse"(): string {
        return slugify(this["label"]);
    }
};

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    "onSelectedFilenameChange"(selectedFilename: string): void {
        this["selectedFilename"] = selectedFilename
    },

    "onError"(error: IFileLoadError): void {
        this.$emit("onError", error);
    },

    "onExtractAtoms"(residueInfo: IExtractInfo): void {
        this.$emit("onExtractAtoms", residueInfo);
    },

    "onStartConvertFile"(convertInfo: IConvert) {
        // Must always call convertInfo.onConvertDone(filename, convertedText)
        // (to resume next convert) or convertInfo.onConvertCancel (to abort
        // conversions).

        this.$emit("onStartConvertFile", convertInfo);

        // alert("Convert :: " + convertInfo.filename + " :: " + convertInfo.fileContents);
        // convertInfo.onConvertDone(convertInfo.filename, "new content");
    },
    "loadMolFromExternal"(filename: string, pdbContents: string): void {
        // Note that typically you don't want a parent component to access a
        // child component directly through $ref. But in some rare cases, this
        // is just easier. This function allows the user to load a PDB file
        // directly, bypassing the user interface. For example, when extracting
        // a ligand molecule from the protein structure, you might want to set
        // the ligand here directly.
        
        this.$refs["fileLoader"].$refs["fileLoaderPlugin1"].onFilesLoaded([
            {
                filename: filename,
                mol: getMol(filename, pdbContents)
            } as IFileInfo
        ]);
    }
};

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {}

/**
 * Setup the mol-loader Vue commponent.
 * @returns void
 */
export function setupMolLoader(): void {
    setupFileLoaderFormGroup();
    setupFileLoader();
    setupFileList();
    setupProteinEditing();
    // setupProteinEditingDeleteExtract();
    setupQueueController();
    setupSmallPillBtn();

    Vue.component("mol-loader", {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"(): any {
            return {
                "selectedFilename": "",
                "files": {}
            };
        },
        "methods": methodsFunctions,
        "template": /*html*/ `
            <div>
                <file-loader
                    ref="fileLoader"
                    v-model="files"
                    :label="label"
                    :id="idToUse"
                    :description="description"
                    :accept="accept"
                    :convert="convert"
                    :required="required"

                    :fileLoaderPlugins="fileLoaderPlugins"

                    @onSelectedFilenameChange="onSelectedFilenameChange"
                    :selectedFilename="selectedFilename"

                    @onError="onError"
                    @onStartConvertFile="onStartConvertFile"
                    :multipleFiles="multipleFiles"
                >
                    <template v-slot:extraDescription>
                        {{extraDescription}}
                        <file-list
                            v-if="multipleFiles"
                            v-model="files"
                            :selectedFilename="selectedFilename"
                            @onSelectedFilenameChange="onSelectedFilenameChange"
                        ></file-list>
        
                        <protein-editing
                            v-if="allowAtomDelete || allowAtomExtract"
                            v-model="files"
                            :selectedFilename="selectedFilename"
                            :allowAtomExtract="allowAtomExtract"
                            :allowAtomDelete="allowAtomDelete"
                            @onSelectedFilenameChange="onSelectedFilenameChange"
                            @onExtractAtoms="onExtractAtoms"
                        ></protein-editing>
                    </template>
                </file-loader>
            </div>
        `,
        "props": {
            ...commonMultipleFilesProps,
            ...commonProteinEditingProps,
            "label": {
                "type": String,
                "default": "Molecule"
            },
            "description": {
                "type": String,
                "default": "Primary description goes here."
            },
            "extraDescription": {
                "type": String,
                "default": "Some extra description goes here."
            },
            "accept": {
                "type": String,
                "default": ".pdb"
            },
            "convert": {
                "type": String,
                "default": "" // ".pdbqt, .ent, .xyz, .pqr, .mcif, .mmcif"
            },
            "required": {
                "type": Boolean,
                "default": true
            },
            "fileLoaderPlugins": {
                "type": Array,
                "default": ["pdb-id-input", "file-loader-input"]
            }
        },
        "computed": computedFunctions,
        "watch": {
            "currentPdbFile"(newValue: string, oldValue: string): void {
                this.$emit("onFileReady", newValue);
            },
            "files"(newValue: any, oldValue: any): void {
                if (
                    // (this["multipleFiles"] !== false) && 
                    (this["saveMultipleFilesToDatabase"] !== false)
                ) {
                    // You are supposed to save the files to the database.
                    filesObjToLocalForage(this["idToUse"], newValue);
                }
            }
        },

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction,
    });
}
