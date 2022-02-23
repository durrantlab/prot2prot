export function turnTableGetRotationAngles(params: any): any[] {
    let rots: number[][] = [];
    let frame = 1;
    let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    // Turntable animation about specified axis.
    for (let angle = 0; angle < 360 + 0.1 * deltaAnglePerFrame; angle = angle + deltaAnglePerFrame) {
        switch (params.turn_table_axis) {
            case "x":
                rots.push([angle, params.y_rot, params.z_rot, params.dist]);
                break;
            case "y":
                rots.push([params.x_rot, angle, params.z_rot, params.dist]);
                break;
            case "z":
                rots.push([params.x_rot, params.y_rot, angle, params.dist]);
                break;
        }
    }

    return [frame, rots];
}