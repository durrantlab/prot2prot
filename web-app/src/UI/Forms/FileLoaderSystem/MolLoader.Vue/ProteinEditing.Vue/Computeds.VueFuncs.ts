import { ISelection, ParentMol } from "../../Mols/ParentMol";
import { PDBMol } from "../../Mols/PDBMol";

/** An object containing the vue-component computed functions. */
export let computedFunctions = {
    currentMol(): ParentMol {
        return this["value"][this["selectedFilename"]];
    },

    chainsList(): string[] {
        let pdb: ParentMol = this.currentMol;
        if (pdb === undefined) { return []; }
        return pdb.getChains();
    },

    hasHydrogens(): boolean {
        let pdb: ParentMol = this.currentMol;
        if (pdb === undefined) { return false; }
        return pdb.hasHydrogens();
    },

    nonProteinResiduesData(): any {
        let pdb: ParentMol = this.currentMol;

        if (pdb === undefined) {
            return {};
        }

        // Make sets for each residue name
        let data = {};
        let nonProteinMol = pdb.getNonProteinMol();
        for (let frame of nonProteinMol.frames) {
            for (let atom of frame.atoms) {
                data[atom.resn] = new Set([]);
            }
        }

        // Add specific keys to those sets
        for (let frame of nonProteinMol.frames) {
            for (let atom of frame.atoms) {
                let key = atom.resn;
                key += ":" + atom.resi;
                key += ":" + atom.chain;
                data[atom.resn].add(key);
            }
        }

        return data;
    },

    "removeResiduesSelections"(): string[][] {
        let nonProtData = this.nonProteinResiduesData;
        let chainsList = this.chainsList;

        let resnames = Object.keys(nonProtData);
        resnames.sort();

        let results1 = [];
        let results2 = [];
        
        for (let resname of resnames) {
            if (nonProtData[resname].size > 10) {
                // If more than ten residues, consider it a single thing. Like
                // "waters."
                results1.push({
                    "resnames": [resname],
                    "nonProtein": true
                } as ISelection);
                // html += "Group: " + resname + ". ";
            } else {
                // If less than ten, treat as separate things (multiple copies
                // of ligand).
                let singles = []
                nonProtData[resname].forEach(key => {
                    singles.push(key);
                });
                singles.sort((a, b) => {
                    if(a["resname"] < b["resname"]) { return -1; }
                    if(a["resname"] > b["resname"]) { return 1; }
                    return 0;
                });
                for (let single of singles) {
                    // html += "Single: " + single + ". ";
                    let prts = single.split(":");
                    results2.push({
                        "resnames": [prts[0]],
                        "resids": [prts[1]],
                        "chains": [prts[2]],
                        "nonProtein": true
                    } as ISelection);
                }
            }
        }

        let results3 = [];
        if (chainsList.length > 1) {
            for (let chain of chainsList) {
                results3.push({
                    "chains": [chain],
                    "nonProtein": false
                } as ISelection)
            }
        }

        let toReturn = [...results1, ...results2, ...results3];

        // Make sure no empty ones.
        // let empties = ["", undefined];
        // toReturn = toReturn.filter((r: ISelection) => {
        //     return (empties.indexOf(r.resnames) === -1)
        //         || (empties.indexOf(r.resids) === -1)
        //         || (empties.indexOf(r.chains) === -1)
        // });

        return toReturn;
    },

    // deleteExtractDescription(): string {
    //     if (this["allowDeleteHeteroAtoms"] && this["allowExtractHeteroAtoms"]) {
    //         return "Alternatively, delete individual residues or extract them as ligands";
    //     }
    //     if (this["allowDeleteHeteroAtoms"]) {
    //         return "Alternatively, delete individual residues";
    //     }
    //     return "Alternatively, extract individual residues as ligands";
    // }
};