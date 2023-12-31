import { PDBMol } from "../../../../src/UI/FileLoaderSystem/Mols/PDBMol";

export function stillGetRotationAngles(params: any, mol: PDBMol): any[] {
    let rots: number[][] = [];
    let currentFrameIdx = 1;
    // let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    // So render just one image.
    currentFrameIdx = 1;
    for (let i = 0; i < params.frames; i++) {
        rots.push([params.x_rot, params.y_rot, params.z_rot, params.dist]);
    }

    mol = mol.scaleFrames(rots.length);

    return [currentFrameIdx, rots, mol.frames];
}