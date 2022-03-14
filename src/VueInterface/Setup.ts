// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import * as Prot2ProtParams from "../UI/Tabs/Prot2ProtParams";
import * as StartOver from "../UI/Tabs/StartOver";
import * as FormGroup from "../UI/Forms/FormGroup";
import * as OpenModal from "../UI/Modal/OpenModal";
import * as SubSection from "../UI/SubSection";
import * as FormButton from "../UI/Forms/FormButton";
import * as FormSelect  from "../UI/Forms/FormSelect";
import { setupMolLoader } from '../UI/FileLoaderSystem/MolLoader.Vue/index';
import { setupVueXStore } from "./Store";

declare var Vue;

declare var BootstrapVue;

/**
 * Load and setup all Vue components.
 * @returns void
 */
export function setup(): void {
    Vue.use(BootstrapVue)
    setupVueXStore();

    SubSection.setup();
    FormButton.setup();
    FormSelect.setup();
    OpenModal.setup();
    FormGroup.setup();
    setupMolLoader();
    Prot2ProtParams.setup();
    StartOver.setup();
}
