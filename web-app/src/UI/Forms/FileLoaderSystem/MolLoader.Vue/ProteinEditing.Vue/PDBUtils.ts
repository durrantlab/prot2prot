// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

import { IExtractInfo, ISelection, iSelectionToStr } from "../../Common/Interfaces";
import { deepCopy, getBasename, getExt, slugify } from "../../Common/Utils";

export function getPDBLineInfo(pdbLine: string): string[] {
    let resname = pdbLine.slice(17,20).trim();
    let resid = pdbLine.slice(22,26).trim();
    let chain = pdbLine.slice(21,22).trim();
    return [
        resname,
        resid,
        chain,
    ]
}

export function getAtomLines(pdbText: string): string [] {
    let pdbLines = pdbText.split("\n");
    pdbLines = pdbLines.filter((l) => {
        return l.slice(0, 4) === "ATOM"
            || l.slice(0, 6) === "HETATM"
            || l.slice(0, 4) === "ROOT"
            || l.slice(0, 3) === "END"
            || l.slice(0, 6) === "BRANCH"
            || l.slice(0, 7) === "TORSDOF";
    });

    // TODO: Auto converting MSE to MET, but this could be a user parameter.
    pdbLines = pdbLines.map((l) => {
        if (l.substring(17, 20) === "MSE") {
            l = l
                .replace(/SE   MSE/g, " SD  MET")
                .replace(/MSE/g, "MET")
                .replace(/ SE /g, "  S ")
                .replace(/^HETATM/g, "ATOM  ")
        }

        return l;
    });

    return pdbLines;
}

export function filterResidues(pdbTxt: string, sel: ISelection): string[] {
    let pdbLines = getAtomLines(pdbTxt);
    let tmpResname: string;
    let tmpResid: string;
    let tmpChain: string;

    let deletedAtoms = [];

    let delFilter = (pdbLine) => {
        [tmpResname, tmpResid, tmpChain] = getPDBLineInfo(pdbLine);
        if (sel["resname"] && (sel["resname"] !== tmpResname)) {
            return true;
        }
        if (sel["resid"] && (sel["resid"] !== tmpResid)) {
            return true;
        }
        if (sel["chain"] && (sel["chain"] !== tmpChain)) {
            return true;
        }

        return false;
    }

    deletedAtoms = pdbLines.filter((pdbLine) => { return !delFilter(pdbLine); });
    let deletedAtomsTxt = deletedAtoms.join("\n");

    pdbLines = pdbLines.filter((pdbLine) => { return delFilter(pdbLine); });
    let pdbText = pdbLines.join("\n");
    
    // let delFilter: Function;
    // if (!sel["resid"]) {
    //     // Just by residue name
    //     delFilter = (pdbLine: string) => {
    //         [tmpResname, tmpResid, tmpChain] = getPDBLineInfo(pdbLine);
    //         if (sel["resname"] === tmpResname) {
    //             deletedAtoms.push(pdbLine);
    //             return false;
    //         }
    //         return true;
    //     }
    // } else {
    //     // More specific than just residue name.
    //     delFilter = (pdbLine: string) => {
    //         [tmpResname, tmpResid, tmpChain] = getPDBLineInfo(pdbLine);
    //         if ((sel["resname"] === tmpResname) && (sel["resid"] === tmpResid) && (sel["chain"] === tmpChain)) {
    //             deletedAtoms.push(pdbLine);
    //             return false;
    //         }
    //         return true;
    //     }
    // }

    // pdbLines = pdbLines.filter(l => delFilter(l));

    return [pdbText, deletedAtomsTxt];
}

// Must be called in context of vue component
export function deleteResidues(sel: ISelection): string {
    let pdbTxt: string;
    let deletedAtomsTxt: string;
    [pdbTxt, deletedAtomsTxt] = filterResidues(
        this["value"][this["selectedFilename"]],
        sel
    );

    let files = deepCopy(this["value"]);
    files[this["selectedFilename"]] = pdbTxt
    this.$emit("input", files);

    return deletedAtomsTxt;
}

// Must be called in context of vue component
export function extractResidues(sel: ISelection): void {
    let deletedLines = deleteResidues.bind(this)(sel);
    let origFilename = this["selectedFilename"];

    let ext = getExt(origFilename);
    let baseName = getBasename(origFilename);

    let suggestedNewFilename = baseName + "-" + slugify(iSelectionToStr(sel)).toUpperCase() + "." + ext;
    this.$emit("onExtractAtoms", {
        selection: sel,
        pdbLines: deletedLines,
        origFilename: origFilename,
        suggestedNewFilename: suggestedNewFilename
    } as IExtractInfo);
}