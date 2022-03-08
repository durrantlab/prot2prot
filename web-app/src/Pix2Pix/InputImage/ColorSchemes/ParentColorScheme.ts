// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

export interface IAtomColorRadius {
    color: string;
    radius: number;
}

export interface IAtomColorInfo {
    outline: string;
    subCircles: IAtomColorRadius[];
}

export abstract class ParentColorScheme {
    abstract atomColors: {[key: string]: number[]}
    abstract backgroundColorRGB: number[];
    abstract backgroundColorHex: string;
    
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
    abstract colorFromDist(baseColor: number[], dist: number, maxDist: number): string;

    /**
     * Given a distance from the virtual camera, return a color string for the
     * outline of an atom circle.
     * @param {number}   dist       Distance from vitual camera.
     * @param {number}   maxDist    The maximum distance allowed (pefectly
     *                              white).
     * @returns The outline color as a string.
     */
    abstract outlineColorFromDist(dist: number, maxDist: number): string;
    
    abstract maxAtomsToShow: number;
    numSubCircleSteps = 3;

    /**
     * Converts color (an array of three numbers) to a string representation.
     * @param {number[]} color  The color to be converted to a string.
     * @returns {string}  The color in rgb format.
     */
    makeRGBStr(color: number[]): string {
        let colorStr = (
            "rgb("
            + Math.round(color[0]).toString()
            + ","
            + Math.round(color[1]).toString()
            + ","
            + Math.round(color[2]).toString()
            + ")"
        );

        return colorStr;
    }

    /**
     * Get a list of colors and radii for subcircles (to impart depth to atom
     * circles).
     * @param {number[]} baseColor       The color of the atom.
     * @param {number}   atomDrawRadius  The radius of the atom's circle
     * @param {number}   atomCenterDist  The distance from the center of the
     *                                   atom to the virtual camera.
     * @param {number}   maxDist         The maximum distance allowed.
     * @returns {IAtomColorRadius[]}  An array of IAtomColorRadius objects, each
     *                                of which has a color and radius.
     */
    getColorsForManyRadii(baseColor: number[], atomDrawRadius: number, atomCenterDist: number, maxDist: number): IAtomColorRadius[] {
        let subCircles = [];
        let r = this.numSubCircleSteps;
        while (r > 0) {
            let f = r / this.numSubCircleSteps;
            let newPerpendicularRadius = f * atomDrawRadius;
            let newDist = atomCenterDist - atomDrawRadius * Math.sqrt(1 - f * f);
            let colorStr = this.colorFromDist(
                baseColor, newDist, maxDist
            );
            subCircles.push({
                color: colorStr,
                radius: Math.floor(newPerpendicularRadius)
            });
            r--;
        }
        return subCircles
    }

    /**
     * Get an atom's colors.
     * @param {number} atomCenterDist  The distance from the center of the atom
     *                                 to the center of the circle.
     * @param {number} maxDist         The maximum distance allowed.
     * @param {string} element         The element of the atom.
     * @param {number} atomDrawRadius  The radius of the atom.
     * @returns An object with two properties: 
     * - outline: a string representing the color of the outline of the atom. 
     * - subCircles: an array of objects, each representing a sub-circle of the
     *   atom.
     */
    getColorsForAtom(atomCenterDist: number, maxDist: number, element: string, atomDrawRadius: number): IAtomColorInfo {
        let baseColor = this.atomColors[element]
        if (baseColor === undefined) {
            // If undefined, use color for carbon.
            baseColor = this.atomColors["C"];
        }
    
        let outlineStr = this.outlineColorFromDist(atomCenterDist, maxDist)

        let subCircles = this.getColorsForManyRadii(
            baseColor, atomDrawRadius, atomCenterDist, maxDist
        )
    
        return {
            outline: outlineStr,
            subCircles: subCircles
        }
    };

    /**
     * Get the alpha value for the color.
     * @param {number} dist  The distance to the virtual camera.
     * @param {number} maxDist  The maximum distance allowed.
     * @returns The alpha value.
     */
    getAlphaFromDist(dist: number, maxDist: number): number {
        return 1 - dist / maxDist;
    }
}
