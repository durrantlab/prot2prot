// This color scheme is used for generating input that is fed into the neural
// renderer.

import { elements, mergeAtomTypes } from "../PDBParser";
import { mergeAtomsData } from "../PDBParser/MergedAtoms";
import { ParentColorScheme } from "./ParentColorScheme";

export class InputColorScheme extends ParentColorScheme {
    backgroundColorRGB = [0, 0, 0];
    backgroundColorHex = "#000";

    numSubCircleSteps = 3;
    maxAtomsToShow = undefined;

    // Don't put anything in 3rd (B) value.
    atomColors = {
        "C": [255, 255, 0],
        "N": [255, 0, 0],
        "O": [0, 255, 0],
        "H": [0, 128, 0],
        "P": [128, 128, 0]
    };

    constructor() {
        super();

        // Update theatom colors per the mergeAtomsData
        for (let mergedSymbol in mergeAtomsData) {
            this.atomColors[mergedSymbol] = mergeAtomsData[mergedSymbol][1];
        }

        // Also update the PDB-parsed data to merge atoms as needed.
        mergeAtomTypes();
    }

    colorFromDist(baseColor: number[], dist: number, maxDist: number) {
        // dist = dist * 0.25;

        let alpha = this.getAlphaFromDist(dist, maxDist);
        
        // TODO: Probably a more efficient way of handling this (set element
        // from beginning). If you don't handle it, you get an error with atoms
        // that aren't in training set (see atom-color defs above).
        if (baseColor === undefined) {
            baseColor =  this.atomColors["C"];
            console.warn("No color found! Undefined atom type?");
            console.warn("    Possible candidates: " + elements.filter(
                e => ["C", "O", "N", "S", "H"].indexOf(e) === -1
            ).map(
                e => ">" + e + "<").join(", ")
            );
        }

        let baseColorToUse = baseColor.map(c => c);
        baseColorToUse[2] = 255 * (1 - alpha);

        let colorStr = this.makeRGBStr(baseColorToUse);

        return colorStr;
    }

    outlineColorFromDist(dist: number, maxDist: number) {
        let alpha = this.getAlphaFromDist(dist, maxDist);
        let invAlph = Math.round(255 * (1 - alpha));
        let outlineStr = this.makeRGBStr([invAlph, invAlph, invAlph]);
        return outlineStr;
    }
}

