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
    abstract colorFromDist(baseColor: number[], dist: number, maxDist: number): string;
    abstract outlineColorFromDist(dist: number, maxDist: number): string;
    numSubCircleSteps = 3;

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

    getColorsForManyRadii(baseColor: number[], atomDrawRadius: number, atomCenterDist: number, maxDist: number): IAtomColorRadius[] {
        let subCircles = [];
        // let numSteps = 3;
        let r = this.numSubCircleSteps;
        while (r > 0) {
            let f = r / this.numSubCircleSteps;
            // for f in [r / num_steps for r in range(int(num_steps), 0, -1)]:
            let newPerpendicularRadius = f * atomDrawRadius;
            let newDist = atomCenterDist - atomDrawRadius * Math.sqrt(1 - f * f);
            let colorStr = this.colorFromDist(
                baseColor, newDist, maxDist
            );
            subCircles.push({
                color: colorStr,
                radius: newPerpendicularRadius
            });
            r--;
        }
        return subCircles
    }

    getColorsForAtom(atomCenterDist: number, maxDist: number, element: string, atomDrawRadius: number): IAtomColorInfo {
        let baseColor = this.atomColors[element]
    
        let outlineStr = this.outlineColorFromDist(atomCenterDist, maxDist)

        let subCircles = this.getColorsForManyRadii(
            baseColor, atomDrawRadius, atomCenterDist, maxDist
        )
    
        return {
            outline: outlineStr,
            subCircles: subCircles
        }
    };

    getAlphaFromDist(dist: number, maxDist: number): number {
        return 1 - dist / maxDist;
    }
}
