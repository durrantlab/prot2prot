// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

export let saveImageTemplate = /* html */ `
<sub-section title="Save Full Image">
    <form-button @click.native="downloadImg" variant="primary">
        Save
    </form-button>
</sub-section>`;

export let saveImageMethodsFunctions = {
    /**
     * Saves the canvas as a png file.
     */
    "downloadImg"(): void {
        import(
            /* webpackChunkName: "FileSaver" */ 
            /* webpackMode: "lazy" */
            'file-saver'
        ).then((mod) => {
            let canvas = this.$refs["viewCanvas"];
            canvas.toBlob(function(blob){ 
                mod.saveAs(blob, "temp4.png"); 
            });
        });
    },
}

export let saveImageData = {}

export let saveImageComputedFunctions = {}