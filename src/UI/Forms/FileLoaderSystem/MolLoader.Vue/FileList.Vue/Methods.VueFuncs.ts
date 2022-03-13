// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2022
// Jacob D. Durrant.

import { deepCopy } from "../../Common/Utils";

/** An object containing the vue-component methods functions. */
export let fileLoaderFileListMethodsFunctions = {
    /**
     * Remove a loaded file and select the next file.
     * @param {string} filename  The name of the file to dismiss.
     */
    "fileDismissed"(filename: string) {
        let files = deepCopy(this["value"]);
        let keys = Object.keys(files);
        let idx = keys.indexOf(filename);
        let newIdx = (idx === 0) ? idx + 1 : idx - 1;
        let newFilename = keys[newIdx];
        this["fileNameClicked"](newFilename);

        delete files[filename];

        this.$emit("input", files);
        this.$emit("onSelectedFilenameChange", newFilename);
    },

    /**
     * Clears all entries in the list
     */
    "clearAll"(): void {
        // Clears all entries in the list.
        this.$emit("input", {});
        this.$emit("onSelectedFilenameChange", "");
    },

    /**
     * Runs when the user clicks on a filename.
     * @param {string} filename  The filename.
     */
    "fileNameClicked"(filename: string): void {
        this["currentlySelectedFilenameToUse"] = filename;
        
        this.$nextTick(() => {
            this.$emit("onSelectedFilenameChange", filename);
        });
    },

    /**
     * Scrolls the files div to the bottom.
     */
    "scrollToBottom"(): void {
        setTimeout(() => {
            let div = (this.$refs["filesDiv"] as HTMLDivElement);
            div.scrollTo({
                top: div.clientHeight,
                left: 0,
                behavior: 'smooth'
            });
        }, 500);
    },
};
