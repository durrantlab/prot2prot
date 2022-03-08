// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2022
// Jacob D. Durrant.

import { IExtractInfo, iSelectionToStr } from '../../Common/Interfaces';
import { ISelection } from '../../Mols/ParentMol';
import { deleteResidues, extractResidues } from './PDBUtils';

/** An object containing the vue-component methods functions. */
export let proteinProcessingMethodsFunctions = {
    /**
     * It emits an event to the parent component when the user extracts a
     * selection of atoms.
     * @param {IExtractInfo} residueInfo The information about the extracted
     *                                   atoms.
     */
    "onExtractAtoms"(residueInfo: IExtractInfo): void {
        this.$emit("onExtractAtoms", residueInfo);
    },


    /**
     * Delete the non-protein selections.
     * @param {*} removeResiduesSelections All selections that can be removed
     *                                     (including ones not limited to
     *                                     non-protein residues).
     */
    "deleteAllNonProteinResidues"(removeResiduesSelections): void {
        // Keep only the non-protein selections.
        removeResiduesSelections = removeResiduesSelections.filter(r => r["nonProtein"] === true);

        let pdb = this["value"][this["selectedFilename"]];

        for (let removeResidueSel of removeResiduesSelections) {
            pdb = pdb.deleteSelection(removeResidueSel);
        }
        
        let files = Object.assign({}, this["value"]);
        files[this["selectedFilename"]] = pdb;  // .toText();
        this.$emit("input", files);
    },
    
    /**
     * Delete all hydrogen atoms.
     */
    "deleteHydrogens"(): void {
        this["deleteOrExtractResidues"]({elems: ["H"]} as ISelection);
    },

    /**
     * If the editAction is "delete", delete the selected residues. Otherwise,
     * extract the selected residues
     * @param {ISelection} sel  The selected residues to act on.
     */
    "deleteOrExtractResidues"(sel: ISelection): void {
        if (this["editAction"] === "delete") {
            deleteResidues.bind(this)(sel);
        } else {
            extractResidues.bind(this)(sel);
        }
    },
    
    /**
     * Returns a string representation of the given selection
     * @param {ISelection} sel  The selection.
     * @returns The string representation of the selection.
     */
    "selDesc"(sel: ISelection): string {
        return iSelectionToStr(sel);
    }
};
