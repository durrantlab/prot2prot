// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

import { IExtractInfo, iSelectionToStr } from '../../Common/Interfaces';
import { ISelection } from '../../Mols/ParentMol';
import { PDBMol } from '../../Mols/PDBMol';
import { deleteResidues, extractResidues } from './PDBUtils';

/** An object containing the vue-component methods functions. */
export let proteinProcessingMethodsFunctions = {
    // "filterResidues"(pdb: PDBMol, sel: ISelection): string[] {
    //     // let pdb = new PDBMol(pdbTxt);
    //     let [pdbSel, pdbInvert] = pdb.partitionBySelection(sel);
    //     return [pdbSel.toText(), pdbInvert.toText()];
    // },
    // "extractResidues": extractResidues,
    "onExtractAtoms"(residueInfo: IExtractInfo): void {
        this.$emit("onExtractAtoms", residueInfo);
    },
    "deleteAllNonProteinResidues"(removeResiduesSelections) {
        // let pdbTxt = this["value"][this["selectedFilename"]];

        // Keep only the non-protein selections.
        removeResiduesSelections = removeResiduesSelections.filter(r => r["nonProtein"] === true);

        // let pdb = new PDBMol(pdbTxt);
        let pdb = this["value"][this["selectedFilename"]];

        for (let removeResidueSel of removeResiduesSelections) {
            pdb = pdb.deleteSelection(removeResidueSel);
        }
        
        let files = Object.assign({}, this["value"]);
        files[this["selectedFilename"]] = pdb;  // .toText();
        this.$emit("input", files);
    },
    "deleteHydrogens"() {
        this["deleteOrExtractResidues"]({elems: ["H"]} as ISelection);
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
