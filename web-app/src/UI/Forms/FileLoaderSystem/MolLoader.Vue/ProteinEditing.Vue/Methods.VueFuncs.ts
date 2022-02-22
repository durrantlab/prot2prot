// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

import { IExtractInfo, ISelection, iSelectionToStr } from '../../Common/Interfaces';
import { deepCopy } from '../../Common/Utils';
import { deleteResidues, extractResidues, filterResidues } from './PDBUtils';

/** An object containing the vue-component methods functions. */
export let proteinProcessingMethodsFunctions = {
    "filterResidues": filterResidues,
    // "extractResidues": extractResidues,
    "onExtractAtoms"(residueInfo: IExtractInfo): void {
        this.$emit("onExtractAtoms", residueInfo);
    },
    "deleteAllNonProteinResidues"(removeResiduesSelections) {
        let pdbTxt = this["value"][this["selectedFilename"]];
        let deletedAtomsTxt: string;

        // Keep only the non-protein selections.
        removeResiduesSelections = removeResiduesSelections.filter(r => r["nonProtein"] === true);

        for (let removeResidueSel of removeResiduesSelections) {
            [pdbTxt, deletedAtomsTxt] = this["filterResidues"](
                pdbTxt,
                removeResidueSel
            );
        }
        
        let files = deepCopy(this["value"]);
        files[this["selectedFilename"]] = pdbTxt
        this.$emit("input", files);
    },
    "deleteOrExtractResidues"(sel: ISelection) {
        if (this["editAction"] === "delete") {
            deleteResidues.bind(this)(sel);
        } else {
            extractResidues.bind(this)(sel);
        }
    },
    "selDesc"(sel: ISelection): string {
        return iSelectionToStr(sel);
    }
};
