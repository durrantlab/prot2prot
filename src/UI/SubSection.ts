// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

declare var Vue;

/**
 * Setup the sub-section Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('sub-section', {
        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"(): any {
            return {}
        },
        "computed": {
            /**
             * Get CSS text for card text.
             * @returns The CSS style for the card text.
             */
            "cardTextMargin"(): string {
                if (this["title"] === "") {
                    return "";
                }
                return "margin-top: 16px;";
            }
        },
        "template": /* html */ `
            <b-card :title="title" class="mb-4">
                <b-card-text :style="cardTextMargin">
                    <slot></slot>
                </b-card-text>
            </b-card>
        `,
        "props": {
            "title": {"type": String, "default": ""}
        }
    })
}
