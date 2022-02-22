export function singleGetRotationAngles(params: any): any[] {
    let rots: number[][] = [];
    let frame = 1;
    // let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    // So render just one image.
    frame = undefined;
    rots = [[params.x_rot, params.y_rot, params.z_rot, params.dist]]

    return [frame, rots];
}