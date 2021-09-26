import { loadTfjs } from '../../Utils';
import { ParentColorScheme } from './ColorSchemes/ParentColorScheme';
import { getImageDataFromCanvasContext, makeInMemoryCanvasContext } from './ImageDataHelper';
import { coorsTensor, elements, vdw } from './PDBParser';

let FOCAL_LENGTH = 1418.5  // 10/0.050  # If using 1/dist to define magnification.

export let rotMat: any;
export let offsetVec: any;

var tf: any;

export function getCoorsTransformed(): any {  // tf.Tensor<tf.Rank>
    // Apply rotation and offset, return new coors
    
    return tf.tidy(() => {
        // First, rotate
        let coors = applyRotation();
        
        // Now translate it
        coors = coors.add(offsetVec);

        return coors;
    });
}

export function makeImg(imgSize: number, colorScheme: ParentColorScheme): Promise<ImageData> {
    // Get color scheme
    // let colorScheme = new StandardColorScheme();
    // colorScheme = new InputColorScheme();

    return loadTfjs().then((tfMod) => {
        tf = tfMod;

        // Set initial values if needed.
        if (rotMat === undefined) {
            rotMat = tf.tensor(
                [
                    [1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1]
                ]
            );

            offsetVec = tf.tensor([0, 0, 0]);
        }

        let distsSorted: number[][];
        let maxDist: number;
        let drawCenters: number[][];
        let drawRadii: number[];
        let newOffsetVec: any;  // tf.Tensor<tf.Rank>;
        [distsSorted, maxDist, drawCenters, drawRadii, newOffsetVec] = tf.tidy(() => {
            let coors = getCoorsTransformed();
        
            // It must be in front of the "camera". Alternative would be to remove atoms
            // < 0.
            let minZ = coors.min(0).arraySync()[2];
            // let newOffsetVec = (offsetVec as tf.Tensor<tf.Rank>).clone()
            let newOffsetVec = offsetVec.clone()
            if (minZ < 5) {
                let delta = tf.tensor([0, 0, -minZ + 5]);
                coors = coors.add(delta);
        
                // Update offsetVec too in case you generate transformed PDB afterwards.
                newOffsetVec = newOffsetVec.add(delta);
            }
        
            // Get the max distance from the origin to any atom.
            let dists = coors.mul(coors).sum(1).sqrt();
            let maxDist = dists.max().arraySync();
            let distsSorted = (dists.arraySync() as number[]).map((v, i) => {
                return [v, i]
            }).sort((a, b) => b[0] - a[0]);
        
            // Get the atom centers in 2D (canvas space).
            let drawCentersTensor = points3Dto2D(coors, imgSize);
            let drawCenters = drawCentersTensor.arraySync();
        
            // Get the atom radii in 2D (canvas space).
            let tmpZeros = tf.zeros([vdw.size]);
            let radiiToAdd = tf.stack([vdw, tmpZeros, tmpZeros]).transpose();
            let coorsEdges = coors.add(radiiToAdd);
            let drawEdges = points3Dto2D(coorsEdges, imgSize);
            let drawRadii = column(drawEdges.sub(drawCentersTensor), 0).arraySync();
            
            return [
                distsSorted as number[][],
                maxDist as number,
                drawCenters as number[][],
                drawRadii as number[],
                newOffsetVec
            ];
        });
        offsetVec.dispose();
        offsetVec = newOffsetVec;
    
        // Create a canvas
        let context = makeInMemoryCanvasContext(imgSize, "canvasRenderer");
        context.fillStyle = colorScheme.backgroundColorHex;
        context.fillRect(0, 0, imgSize, imgSize)
    
        // For debugging
        // document.body.appendChild(canvas);  
    
        // Draw spheres
        for (let data of distsSorted) {
            let atomCenterDist = data[0];
            let i = data[1];
            let element = elements[i];
            let colorsInf = colorScheme.getColorsForAtom(
                atomCenterDist, 
                maxDist, 
                element, 
                drawRadii[i]
            );
    
            let center = drawCenters[i];
            let first = true;
            for (let subCircle of colorsInf.subCircles) {
                context.beginPath();
                context.arc(center[0], center[1], subCircle.radius, 0, 2 * Math.PI, false);
                context.fillStyle = subCircle.color; //  "rgb(0,0,0)";  // fill_color;
                context.fill();
                context.lineWidth = 1;
                context.strokeStyle = first ? colorsInf.outline : subCircle.color;  // "rgb(0,0,0)" // outline_color;
                context.stroke();
                first = false;
            }
        }
    
        // return image
        return getImageDataFromCanvasContext(context);
    });
    
}

// function points3Dto2D(pts3D: tf.Tensor<tf.Rank>, imgSize: number): tf.Tensor<tf.Rank> {
function points3Dto2D(pts3D: any, imgSize: number): any {
    // Project the points onto a 2D plane
    let xs = column(pts3D, 0);
    let ys = column(pts3D, 1);
    let zs = column(pts3D, 2);

    let xs2D = xs.div(zs).mul(FOCAL_LENGTH);
    let ys2D = ys.div(zs).mul(FOCAL_LENGTH);

    let xy = tf.stack([xs2D, ys2D], 1);
    xy = xy.reshape([xy.shape[0], 2]);

    // Map to the viewport.
    let zoomFactor = imgSize / 1024.0;
    xy = xy.mul([zoomFactor, zoomFactor]);
    xy = xy.add([0.5 * imgSize, 0.5 * imgSize]);

    return xy;
}

// function column(tensor: tf.Tensor<tf.Rank>, idx: number): tf.Tensor<tf.Rank> {
function column(tensor: any, idx: number): any {
    return tf.gather(tensor, [idx], 1);
}

export function updateRotMat(axis: string, degrees: number): void {
    let angle = degrees / 180 * Math.PI;
    let ux = 0;
    let uy = 0;
    let uz = 0;
    switch (axis) {
        case "X":
            ux = 1;
            break;
        case "Y":
            uy = 1;
            break;
        case "Z":
            uz = 1;
            break;
    }

    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let icos = 1 - cos;
    // let isin = 1 - sin;

    // See
    // https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    let t = tf.tensor(
        [
            [cos + ux * ux * icos,       ux * uy * icos - uz * sin,  ux * uz * icos + uy * sin],
            [uy * ux * icos + uz * sin,  cos + uy * uy * icos,       uy * uz * icos - ux * sin],
            [uz * ux * icos - uy * sin,  uz * uy * icos + ux * sin,  cos + uz * uz * icos     ]
        ]
    );

    rotMat = tf.matMul(t, rotMat);

    t.dispose();
}

export function updateOffsetVec(deltaX: number, deltaY: number, deltaZ: number): void {
    offsetVec.dispose();
    offsetVec = tf.tensor([deltaX, deltaY, deltaZ])
}

function applyRotation() {
    // First must update the rotation matrix with updateRotMat()
    return tf.matMul(rotMat, coorsTensor, false, true).transpose();
}
