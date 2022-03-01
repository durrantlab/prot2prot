import { ISelection } from "../../Mols/ParentMol";
import { PDBMol } from "../../Mols/PDBMol";

/** An object containing the vue-component computed functions. */
export let computedFunctions = {
    currentPDB(): string {
        return this["value"][this["selectedFilename"]];
    },

    chainsList(): string[] {
        let pdbTxt: string = this.currentPDB;
        if (pdbTxt === undefined) { return []; }

        let pdb = new PDBMol(pdbTxt);
        return pdb.listChains();
    },

    nonProteinResiduesData(): any {
        let pdbTxt: string = this.currentPDB;

        if (pdbTxt === undefined) {
            return {};
        }

        let data = {};
        let pdb = new PDBMol(pdbTxt);
        let nonProteinMol = pdb.getNonProteinMol();
        for (let frame of nonProteinMol.frames) {
            for (let atom of frame.atoms) {
                let key = atom.resn;
                key += ":" + atom.resi;
                key += ":" + atom.chain;
                if (!data[atom.resn]) {
                    data[atom.resn] = new Set([]);
                }
                data[atom.resn].add(key);
            }
        }

        // let pdbLines = getAtomLines(pdbTxt);

        // let data = {};
        // let resname: string;
        // let resid: string;
        // let chain: string;
        // for (let l of pdbLines) {
        //     // let resname = l.slice(17,20).trim();
        //     // let resid = l.slice(22,26).trim();
        //     // let chain = l.slice(21,22).trim();
        //     [resname, resid, chain] = getPDBLineInfo(l);
        //     let key = resname;
        //     key += ":" + resid;
        //     key += ":" + chain;
        //     if (proteinResnames.indexOf(resname) === -1) {
        //         if (!data[resname]) {
        //             data[resname] = new Set([]);
        //         }
        //         data[resname].add(key);
        //     }
        // }

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
                    "resname": resname,
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
                        "resname": prts[0],
                        "resid": prts[1],
                        "chain": prts[2],
                        "nonProtein": true
                    } as ISelection);
                }
            }
        }

        let results3 = [];
        if (chainsList.length > 1) {
            for (let chain of chainsList) {
                results3.push({
                    "chain": chain,
                    "nonProtein": false
                } as ISelection)
            }
        }

        let toReturn = [...results1, ...results2, ...results3];

        // Make sure no empty ones.
        let empties = ["", undefined];
        toReturn = toReturn.filter((r: ISelection) => {
            return (empties.indexOf(r.resname) === -1)
                || (empties.indexOf(r.resid) === -1)
                || (empties.indexOf(r.chain) === -1)
        });

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