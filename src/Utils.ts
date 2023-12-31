// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

// For functions that don't really need to be within the Vue framework.

/**
 * Get the path of the index.html file. Allows Prot2Prot to run even fromm a
 * subdir.
 * @returns string  The path.
 */
export function curPath(): string {
    let url = window.location.pathname.replace("index.html", "");
    if (url.slice(url.length - 1) !== "/") {
        url = url + "/";
    }
    return url;
}

/**
 * Given a filename, replace its extension.
 * @param  {string} filename  The original filename.
 * @param  {string} newExt    The new extension.
 * @returns string  The new filename.
 */
export function replaceExt(filename: string, newExt: string): string {
    if (filename.indexOf(".") !== -1) {
        let prts = filename.split(".");
        filename = prts.slice(0, prts.length - 1).join(".");
    }
    return filename + "." + newExt;
}

/**
 * Given some PDB text, keep only those lines that describe protein atoms.
 * @param  {string} pdbTxt  The original PDB text.
 * @returns string  the PDB text containing only the protein atoms.
 */
export function keepOnlyProteinAtoms(lines: string[]): string {
    let proteinResidues = [
        "ALA", "ARG", "ASH", "ASN", "ASP", "ASX", "CYM", "CYS", "CYX",
        "GLH", "GLN", "GLU", "GLX", "GLY", "HID", "HIE", "HIP", "HIS",
        "HSD", "HSE", "HSP", "ILE", "LEU", "LYN", "LYS", "MET", "MSE",
        "PHE", "PRO", "SER", "THR", "TRP", "TYR", "VAL"
    ];
    let l = lines.length;
    let linesToKeep = "";
    for (let i = 0; i < l; i++) {
        if ((lines[i].substring(0, 5) !== "ATOM ") && (lines[i].substring(0, 7) !== "HETATM ")) {
            // Not an atom line.
            continue;
        }

        if (proteinResidues.indexOf(lines[i].substring(17,20)) !== -1) {
            linesToKeep += lines[i] + "\n";
        }
    }

    return linesToKeep;
}
