// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

declare var Vue;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /** Gets and sets the vinaParams object. In setting, also makes sure that
     * the value meets min/max requirements, etc.*/
    "val": {
        get(): any {
            return this.$store.state[this["storeVarName"]];
        },

        set(val: any): void {
            this.$store.commit("setVar", {
                name: this["storeVarName"],
                val: val
            });
        }
    },

    /**
     * Generates a description string.
     * @returns string  The description.
     */
    "desc"(): string {
        let toAdd = "";
        if ((this["required"] !== true) && (this["default"] === undefined)) {
            toAdd = " (Leave blank to use default value.)";
        }
        return this["description"] ? this["description"] + toAdd : toAdd.trim();
    },
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {}

/**
 * Setup the form-select Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('form-select', {
        "computed": computedFunctions,
        "template": /* html */ `
            <form-group
                :label="label"
                :id="'input-group-' + id"
                :style="styl"
                :description="desc"
                :formGroupWrapper="formGroupWrapper"
            >
                <b-form-select 
                    :id="id"
                    :name="id"
                    :required="required"
                    :placeholder="placeholder"
                    v-model="val" 
                    :options="options"
                    @change="$emit('change')"
                ></b-form-select>
            </form-group>
        `,

        "props": {
            "label": String,
            "id": String,
            "description": String,
            "placeholder": String,
            "required": Boolean,
            "styl": String,
            "storeVarName": String,
            "formGroupWrapper": {
                "type": Boolean,
                "default": true
            },
            "options": {
                "type": Array,
                "default": []
            },
        },

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction
    })
}
