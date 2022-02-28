export let saveImageTemplate = /* html */ `
<<sub-section title="Save Full Image">
    <form-button @click.native="downloadImg" variant="primary">
        Save
    </form-button>
</sub-section>`;

export let saveImageMethodsFunctions = {
    "downloadImg"(): void {
        import(
            /* webpackChunkName: "filesaver" */ 
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