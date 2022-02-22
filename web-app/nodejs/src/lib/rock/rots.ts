export function rockGetRotationAngles(params: any): any[] {
    let rots: number[][] = [];
    let frame = 1;
    let deltaAnglePerFrame = 360 / (params.frames - 1);
    
    // Rock animation
    for (let angle = 0; angle < 360 + 0.1 * deltaAnglePerFrame; angle = angle + deltaAnglePerFrame) {
        let radian = angle * Math.PI / 180.0;
        let x = params.rock_mag * Math.sin(radian);
        let y = params.rock_mag * Math.sin(radian + 0.125 * Math.PI);
        let z = params.rock_mag * Math.sin(radian + 0.25 * Math.PI);
        rots.push([x, y, z, params.dist]);
    }

    return [frame, rots];
}