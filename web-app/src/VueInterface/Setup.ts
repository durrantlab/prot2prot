// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2020 Jacob D. Durrant.


// import * as NumericInput from "../UI/Forms/NumericInput.ts.old";
// import * as CheckBox from "../UI/Forms/CheckBox";
import * as FileInputSetup from "../UI/Forms/FileLoader/Setup";
import * as FileInputMain from "../UI/Forms/FileLoaderMain.Vue";
import * as Prot2ProtParams from "../UI/Tabs/Prot2ProtParams";
// import * as VinaExistingOutput from "../UI/Tabs/VinaExistingOutput"
import * as StartOver from "../UI/Tabs/StartOver";
import * as FormGroup from "../UI/Forms/FormGroup";
// import * as ThreeDMol from "../UI/ThreeDMol.ts.old";
// import * as TripleNumeric from "../UI/Forms/TripleNumeric";
// import * as ResultsTable from "../UI/ResultsTable";
import * as OpenModal from "../UI/Modal/OpenModal";
// import * as ConvertFileModal from "../UI/Modal/ConvertFileModal";
// import * as DrawSmilesModal from "../UI/Modal/DrawSmilesModal";
import * as SubSection from "../UI/SubSection";
// import * as VinaCommandline from "../UI/VinaCommandline";
import * as FormButton from "../UI/Forms/FormButton";
import * as FormSelect  from "../UI/Forms/FormSelect";

declare var Vue;
declare var Vuex;

// import Vuex from "vuex";
// import BootstrapVue from "bootstrap-vue";

declare var BootstrapVue;
// declare var jQuery;

/**
 * Load and setup all Vue components.
 * @returns void
 */
export function setup(): void {
    Vue.use(BootstrapVue)
    Vue.use(Vuex)

    SubSection.setup();
    FormButton.setup();
    FormSelect.setup();
    // VinaCommandline.setup();
    OpenModal.setup();
    // ConvertFileModal.setup();
    // DrawSmilesModal.setup();
    FormGroup.setup();
    // ThreeDMol.setup();
    // NumericInput.setup();
    // TripleNumeric.setup();
    // CheckBox.setup();
    FileInputSetup.setupFileLoader();
    FileInputMain.setup();
    // ResultsTable.setup();
    Prot2ProtParams.setup();
    // Prot2ProtRunning.setup();
    // Prot2ProtOutput.setup();
    StartOver.setup();
    // VinaExistingOutput.setup();
}
