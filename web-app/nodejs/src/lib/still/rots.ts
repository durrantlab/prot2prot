import { extendFrames } from "../core/utils";

export function stillGetRotationAngles(params: any, frames: string[]): any[] {
    let rots: number[][] = [];
    let currentFrameIdx = 1;
    // let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    // So render just one image.
    currentFrameIdx = 1;
    for (let i = 0; i < params.frames; i++) {
        rots.push([params.x_rot, params.y_rot, params.z_rot, params.dist]);
    }

    frames = extendFrames(frames, rots.length);

    return [currentFrameIdx, rots, frames];
}