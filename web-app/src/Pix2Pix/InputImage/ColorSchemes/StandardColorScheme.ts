// This color scheme is used for displaying in the browser.

import { ParentColorScheme } from "./ParentColorScheme";

export class StandardColorScheme extends ParentColorScheme {
    backgroundColorRGB = [255, 255, 255];
    backgroundColorHex = "#fff";

    numSubCircleSteps = 1;

    atomColors = {
        "C": [153, 153, 153],
        "N": [0, 0, 255],
        "O": [255, 0, 0],
        "H": [255, 255, 255],
        "S": [255, 255, 0],
    };

    colorFromDist(baseColor: number[], dist: number, maxDist: number): string {
        let alpha = this.getAlphaFromDist(dist, maxDist)
        let baseColorToUse = baseColor.map(c => c);
        baseColorToUse[0] = baseColorToUse[0] * alpha + 255 * (1 - alpha)
        baseColorToUse[1] = baseColorToUse[1] * alpha + 255 * (1 - alpha)
        baseColorToUse[2] = baseColorToUse[2] * alpha + 255 * (1 - alpha)
    
        let colorStr = this.makeRGBStr(baseColorToUse)
    
        return colorStr
    };
    
    outlineColorFromDist(dist: number, maxDist: number): string {
        let alpha = this.getAlphaFromDist(dist, maxDist)
        let invAlph = Math.round(255 * (1 - alpha));
        let outlineStr = this.makeRGBStr([invAlph, invAlph, invAlph])
        return outlineStr
    }
}

