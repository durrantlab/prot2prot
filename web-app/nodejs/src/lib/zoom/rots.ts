import { ParentMol } from "../../../../src/UI/Forms/FileLoaderSystem/Mols/ParentMol";
import { extendFrames, scaleFrames } from "../core/utils";

export function zoomGetRotationAngles(params: any, mol: ParentMol): any[] {
    let rots: number[][] = [];
    let currentFrameIdx = 1;
    // let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    // zoom in and out
    let minDist = params.zoom_min_dist;
    let maxDist = params.zoom_max_dist;

    let deltaDist = (maxDist - minDist) / (params.frames - 1);
    for (let dist = maxDist; dist >= minDist + 0.1 * deltaDist; dist = dist - deltaDist) {
        rots.push([params.x_rot, params.y_rot, params.z_rot, dist]);
    }

    mol = scaleFrames(mol, rots.length);

    return [currentFrameIdx, rots, mol];
}