export function get_rotation_angles(params): any[] {
    let rots: number[][] = [];
    let frame = 1;
    let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    switch (params.animation) {
        case "turn_table":
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
            break;
        case "rock":
            // Rock animation
            for (let angle = 0; angle < 360 + 0.1 * deltaAnglePerFrame; angle = angle + deltaAnglePerFrame) {
                let radian = angle * Math.PI / 180.0;
                let x = params.rock_mag * Math.sin(radian);
                let y = params.rock_mag * Math.sin(radian + 0.125 * Math.PI);
                let z = params.rock_mag * Math.sin(radian + 0.25 * Math.PI);
                rots.push([x, y, z, params.dist]);
            }
            break;
        case "zoom":
            let minDist = params.zoom_min_dist;
            let maxDist = params.zoom_max_dist;
        
            let deltaDist = (maxDist - minDist) / (params.frames - 1);
            for (let dist = maxDist; dist >= minDist + 0.1 * deltaDist; dist = dist - deltaDist) {
                rots.push([params.x_rot, params.y_rot, params.z_rot, dist]);
            }
            break;
        default:
            // So render just one image.
            frame = undefined;
            rots = [[params.x_rot, params.y_rot, params.z_rot, params.dist]]
    }

    return [frame, rots];
}