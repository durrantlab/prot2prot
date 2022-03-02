import { getBasename, getExt } from "../Common/Utils";
import { ParentMol } from "./ParentMol";
import { PDBMol } from "./PDBMol";

export function getMol(filename: string, fileContents: string, mseToMet = true): ParentMol {
    let ext = getExt(filename);
    if (ext === "txt") { ext = getExt(getBasename(filename)); }
    ext = ext.toLowerCase();

    switch (ext) {
        case "pdb":
            return new PDBMol(fileContents, mseToMet);
        case "pdbqt":
            return new PDBMol(fileContents, mseToMet);
        case "ent":
            return new PDBMol(fileContents, mseToMet);
        case "brk":
            // Acceptable extension for PDB file per
            // https://en.wikipedia.org/wiki/Protein_Data_Bank_(file_format)
            return new PDBMol(fileContents, mseToMet);
        default:
            // In absense of other information, assume PDB.
            return new PDBMol(fileContents, mseToMet);
    }
}