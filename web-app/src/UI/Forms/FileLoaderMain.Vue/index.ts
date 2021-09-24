// FileLoader.ts is meant to be generic. You'll usually want to wrap it in
// another component to provide app-specific functionality.

import { IConvert, IFileLoadError, IFileLoaded } from '../FileLoader/Common/Interfaces';
import { commonFileLoaderProps } from '../FileLoader/FileLoaderInput.Vue';
// import { clearAllInDatabase, countEntries, extractFileFromDatabase, getOutputFilesAsZip, saveOutputToDatabase } from '../FileLoader/DataBase';

declare var Vue;



/** An object containing the vue-component computed functions. */
let computedFunctions = {};

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    "fileLoadError"(error: IFileLoadError): void {
        alert(error.title + " :: " + error.body);
    },
    "fileLoaded"(val: IFileLoaded): void {
        // this["curFilename"] = 
        this["curContents"] = val.fileContents;
        // alert("Loaded :: " + fileContents)
    },
    "fileNameChanged"(filename: string): void {
        alert("New filename :: " + filename);
    },
    "convertNeeded"(convertInfo: IConvert) {
        // Must always call convertInfo.onConvertDone(filename, convertedText)
        // (to resume next convert) or convertInfo.onConvertCancel (to abort
        // conversions).

        alert("Convert :: " + convertInfo.filename + " :: " + convertInfo.fileContents);

        convertInfo.onConvertDone(convertInfo.filename, "new content");
    },
    // "extractFromDatabase"(): void {
    //     extractFileFromDatabase("receptor", undefined, false).then((file: IFileLoaded) => {
    //         // console.log(file);
    //         return saveOutputToDatabase(file.filename, file.fileContents, "moosedir");
    //     })
    //     .then(() => {
    //         return saveOutputToDatabase("moodog", "hello", "moosedir");
    //     })
    //     .then(() => {
    //         return saveOutputToDatabase("moodog_root", "hello");
    //     })
    //     .then(() => {
    //         return countEntries("receptor");
    //     }).then((num) => {
    //         alert(num);
    //         return Promise.resolve();
    //     }).then(() => {
    //         return getOutputFilesAsZip();
    //     }).then(() => {
    //         debugger;
    //         clearAllInDatabase();
    //         debugger;
    //     });
    // },
    "timeUp"(): void {
        alert("time up!");
    },
};

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {}

/**
 * Setup the file-loader Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component("file-loader-main", {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"(): any {
            return {
                "curFilename": "",
                "curContents": "",
                "extraTextFields": [
                    {
                        "placeholder": "Some test...",
                        "tabName": "Test",
                        "loadFunc": function(txt: string, onSuccess: Function, onError: Function) { 
                            alert(txt); 
                            onSuccess("filename", txt);
                        },
                        "onError": (err) => {
                            alert("ERROR! " + err)
                        },
                        "onSuccess": (filename: string, text: string) => {
                            alert("SUCCESS! " + filename + " " + text);
                        }
                    }
                ]
            };
        },
        "methods": methodsFunctions,
        "template": /*html*/ `
            <div>
                <file-loader
                    :label="label"
                    :id="id"
                    :description="description"
                    :accept="accept" 
                    :convert="convert"
                    :required="required"
                    :allowUrlInput="false"
                    @onError="fileLoadError"
                    @onFileLoaded="fileLoaded"
                    @onFileNameChange="fileNameChanged"
                    @onConvertNeeded="convertNeeded"
                    :multipleFiles="multipleFiles"
                    :countDownToNextInput="-1"
                    @onTimeUp="timeUp"
                >
                    <!-- :fileFromTextFields="extraTextFields" -->
                    <template v-slot:extraDescription>
                        <slot name="extraDescription"></slot>
                    </template>
                </file-loader>

                <!-- <b-button @click="extractFromDatabase" class="mb-3">Extract</b-button> -->
                <!-- <pre style="max-width:500px; height:250px;">{{curContents}}</pre> -->
            </div>
        `,
        "props": {
            ...commonFileLoaderProps,
            "label": String,
            "description": String,
            "multipleFiles": {
                "type": Boolean,
                "default": false
            }
            // "invalidMsg": {
            //     "type": String,
            //     "default": "This field is required!",
            // },
            // "allowUrlInput": {
            //     "type": Boolean,
            //     "default": false
            // },
            // "fileFromTextFields": {  // i.e., via URL, PDB ID, etc.
            //     "type": Array,  // [IFileFromTextField]
            //     "default": function() {
            //         return [];
            //     }
            // },
            // "countDownToNextInput": {
            //     "type": Number,
            //     "default": -1  // does nothing
            // }
        },
        "computed": computedFunctions,

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction,
    });
}
