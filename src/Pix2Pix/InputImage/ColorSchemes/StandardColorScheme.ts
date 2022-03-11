// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

// This color scheme is used for displaying in the browser.

import { ParentColorScheme } from "./ParentColorScheme";

export class StandardColorScheme extends ParentColorScheme {
    backgroundColorRGB = [255, 255, 255];
    backgroundColorHex = "#fff";

    numSubCircleSteps = 1;
    maxAtomsToShow = 10000; // 20000;

    atomColors = {
        "C": [153, 153, 153],
        "N": [0, 0, 255],
        "O": [255, 0, 0],
        "H": [255, 255, 255],
        "S": [255, 255, 0],
    };

    /**
     * Given a base color and a distance from the virtual camera, return a color
     * that is a mix of the base color and white, with the alpha value being
     * determined by the distance
     * @param {number[]} baseColor  The color to use for the atom.
     * @param {number}   dist       Distance from vitual camera.
     * @param {number}   maxDist    The maximum distance allowed (pefectly
     *                              white).
     * @returns {string} A string of the form `rgb(r, g, b)`.
     */
    colorFromDist(baseColor: number[], dist: number, maxDist: number): string {
        let alpha = this.getAlphaFromDist(dist, maxDist)
        let baseColorToUse = baseColor.map(c => c);
        baseColorToUse[0] = baseColorToUse[0] * alpha + 255 * (1 - alpha)
        baseColorToUse[1] = baseColorToUse[1] * alpha + 255 * (1 - alpha)
        baseColorToUse[2] = baseColorToUse[2] * alpha + 255 * (1 - alpha)
    
        let colorStr = this.makeRGBStr(baseColorToUse)
    
        return colorStr
    };
    
    /**
     * Given a distance from the virtual camera, return a color string for the
     * outline of an atom circle.
     * @param {number}   dist       Distance from vitual camera.
     * @param {number}   maxDist    The maximum distance allowed (pefectly
     *                              white).
     * @returns The outline color as a string.
     */
    outlineColorFromDist(dist: number, maxDist: number): string {
        let alpha = this.getAlphaFromDist(dist, maxDist)
        let invAlph = Math.round(255 * (1 - alpha));
        let outlineStr = this.makeRGBStr([invAlph, invAlph, invAlph])
        return outlineStr
    }
}

