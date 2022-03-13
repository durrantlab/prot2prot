// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2022
// Jacob D. Durrant.

import { IExtractInfo, iSelectionToStr } from "../../Common/Interfaces";
import { deepCopy, getBasename, getExt, slugify } from "../../Common/Utils";
import { ISelection } from "../../Mols/ParentMol";
import { PDBMol } from "../../Mols/PDBMol";

// Must be called in context of vue component
/**
 * Given a selection, delete the residues and return the deleted residues as a
 * new PDBMol object.
 * @param {ISelection} sel  The atom selection to delete.
 * @returns The PDBMol with deleted atoms.
 */
export function deleteResidues(sel: ISelection): PDBMol {
    let pdb: PDBMol = this["value"][this["selectedFilename"]]

    let [delPDB, keepPDB] = pdb.partitionBySelection(sel);

    let files = deepCopy(this["value"]);  // reactivity in case you ever need it
    files[this["selectedFilename"]] = keepPDB;  // .toText();
    this.$emit("input", files);

    return delPDB;
}

// Must be called in context of vue component
/**
 * Extracts the residues in the selection and emits an event with the extracted
 * atoms.
 * @param {ISelection} sel  The atom selection to extract.
 */
export function extractResidues(sel: ISelection): void {
    let deletedAtomsMol = deleteResidues.bind(this)(sel);
    let origFilename = this["selectedFilename"];

    let ext = getExt(origFilename);
    let baseName = getBasename(origFilename);

    let suggestedNewFilename = baseName + "-" + slugify(iSelectionToStr(sel)).toUpperCase() + "." + ext;
    this.$emit("onExtractAtoms", {
        selection: sel,
        pdbLines: deletedAtomsMol,  // .toText().split("\n"),  // TODO: ???
        origFilename: origFilename,
        suggestedNewFilename: suggestedNewFilename
    } as IExtractInfo);
}