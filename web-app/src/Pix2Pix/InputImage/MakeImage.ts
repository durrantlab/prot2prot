// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { ParentColorScheme } from './ColorSchemes/ParentColorScheme';
import { getImageDataFromCanvasContext, makeInMemoryCanvasContext } from './ImageDataHelper';
import { loadTfjs, tf } from '../LoadTF';
import { coorsTensor, elements, vdw } from './PDBParser/index';

const FOCAL_LENGTH = 1418.5  // 10/0.050  # If using 1/dist to define magnification.
const TWO_PI = 2 * Math.PI
export const CLOSEST_ALLOWED_DIST = 15.0;

export let rotMat: any;
export let offsetVec: any;

/**
 * Returns the rotation matrix as an array of numbers
 * @returns The rotation matrix as a JavaScript array.
 */
export function getRotMatAsArray(): any {
    return rotMat ? rotMat.arraySync() : undefined;
}

/**
 * Sets the rotation tensor from an array.
 * @param {any} arr  An array representing a rotation matrix.
 */
export function setRotMatFromArray(arr: any): void {
    if (rotMat) { rotMat.dispose(); }
    rotMat = tf.tensor(arr);
}

/**
 * Return a coordinates tensor that has been transformed by rotation and
 * offsetVec tensors.
 * @returns {*} The tensor.
 */
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

/**
 * If the rotation matrix and offset vector are undefined, set them to the
 * identity matrix and zero vector.
 * @param {boolean} [reset=false]  If true, the variables will be reset to their
 *                                 initial values.
 */
export function initializeVars(reset = false): void {
    if (tf === undefined) {
        // Not ready yet.
        return;
    }

    // Set initial values if needed.
    if ((rotMat === undefined) || reset) {

        if (rotMat) { rotMat.dispose(); }
        rotMat = tf.tensor(
            [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ]
        );

        if (offsetVec) { offsetVec.dispose(); }
        offsetVec = tf.tensor([0, 0, 0]);
    }
}

/**
 * Creates an image of the protein.
 * @param {number}            imgSize           The size of the image to
 *                                              generate.
 * @param {ParentColorScheme} colorScheme       The color scheme to use.
 * @param {boolean}           [simplify=false]  Whether to simplify the image,
 *                                              meaning no subcircles and
 *                                              outlines.
 * @returns {Promise}  Resolves with the image data.
 */
export function makeImg(imgSize: number, colorScheme: ParentColorScheme, simplify=false): Promise<ImageData> {
    if (coorsTensor === undefined) {
        // No pdb loaded yet.
        return Promise.resolve(undefined);
    }

    return loadTfjs()
    .then(() => {
        // let mem = tf.memory();
        // console.log(mem.numBytesInGPU, mem.numTensors, mem.numDataBuffers);

        initializeVars();

        let distsTensor: any;  // tf.Tensor<tf.Rank>
        let drawCentersTensor: any;  // tf.Tensor<tf.Rank>;
        let drawRadiiTensor: any;  // tf.Tensor<tf.Rank>;
        let newOffsetVec: any;  // tf.Tensor<tf.Rank>;
        [distsTensor, drawCentersTensor, drawRadiiTensor, newOffsetVec] = tf.tidy(() => {
            let coors = getCoorsTransformed();
        
            // It must be in front of the "camera". Alternative would be to
            // remove atoms < 0.
            let minZ = coors.min(0).arraySync()[2];
            let newOffsetVec = offsetVec.clone()
            if (minZ < CLOSEST_ALLOWED_DIST) {
                let delta = tf.tensor([0, 0, -minZ + CLOSEST_ALLOWED_DIST]);
                coors = coors.add(delta);
        
                // Update offsetVec too in case you generate transformed PDB
                // afterwards.
                newOffsetVec = newOffsetVec.add(delta);
            }           
        
            // Get the max distance from the origin to any atom.
            let distsTensor = coors.mul(coors).sum(1).sqrt();

            // Get the atom centers in 2D (canvas space).
            let drawCentersTensor = points3Dto2D(coors, imgSize);
            
            // Get the atom radii in 2D (canvas space).
            let radiiToAdd = tf.stack([
                vdw, 
                tf.zeros([vdw.size]), 
                tf.zeros([vdw.size])
            ]).transpose();
            let coorsEdges = coors.add(radiiToAdd);
            let drawEdges = points3Dto2D(coorsEdges, imgSize);
            let drawRadiiTensor = column(drawEdges.sub(drawCentersTensor), 0);

            drawCentersTensor = tf.cast(drawCentersTensor, 'int32');
            
            return [
                distsTensor,
                drawCentersTensor,  // as number[][],
                drawRadiiTensor,
                newOffsetVec
            ];
        });
        offsetVec.dispose();
        offsetVec = newOffsetVec;

        // Convert some of the tensors to arrays (sync)       
        let drawCentersPromise = drawCentersTensor.array()
            .then((drawCenters: number[][]) => {
                drawCentersTensor.dispose();
                return Promise.resolve(drawCenters);
            });

        let drawRadiiPromise = drawRadiiTensor.array()
            .then((drawRadii: number[]) => {
                drawRadiiTensor.dispose();
                return Promise.resolve(drawRadii);
            });

        let distsSortedPromise = distsTensor.array()
            .then((dists: number[]) => {
                distsTensor.dispose();

                let distsWithIdxs = dists.map((v, i) => {
                    return [v, i]
                });

                // Here keep only a limited number (in case very large protein).
                if (colorScheme.maxAtomsToShow) {
                    let tmp = [];
                    let step = distsWithIdxs.length / colorScheme.maxAtomsToShow;
                    for (let i = 0; i < distsWithIdxs.length; i += step) {
                      tmp.push(distsWithIdxs[Math.floor(i)]);
                    }
                    distsWithIdxs = tmp;
                }

                let distsSorted = distsWithIdxs.sort((a, b) => b[0] - a[0]);
                return Promise.resolve(distsSorted);
            });
    
        return Promise.all([drawCentersPromise, drawRadiiPromise, distsSortedPromise]);
    }).then((payload) => {
        let drawCenters: number[][];
        let drawRadii: number[];
        let distsSorted: number[][];
        [drawCenters, drawRadii, distsSorted] = payload;
        let maxDist = distsSorted[0][0];
       
        // Create a canvas
        let context = makeInMemoryCanvasContext(imgSize, "canvasRenderer");
        context.fillStyle = colorScheme.backgroundColorHex;
        context.fillRect(0, 0, imgSize, imgSize)
        context.lineWidth = 1;

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
            
            let biggestRadius = colorsInf.subCircles[0].radius;
            let minVal = -biggestRadius;
            let maxVal = imgSize + biggestRadius;
            if (
                (center[0] < minVal) || 
                (center[0] > maxVal) || 
                (center[1] < minVal) || 
                (center[1] > maxVal)
            ) {
                // To avoid drawing circles needlessly. (It takes a while to
                // draw.)
                continue;
            }

            let first = true;
            for (let subCircle of colorsInf.subCircles) {
                context.beginPath();
                context.arc(center[0], center[1], subCircle.radius, 0, TWO_PI, false);
                context.fillStyle = subCircle.color;
                context.fill();
                if (first && !simplify) {
                    // Draw the outline if its the first circle and it's not
                    // marked simplify.

                    context.strokeStyle = colorsInf.outline;
                    context.stroke();
                    first = false;
                }

                if (simplify) {
                    // Give up after first circle (so not roundness to the atoms).
                    break;
                }
            }
        }

        // return image
        let imgData = getImageDataFromCanvasContext(context);
        return Promise.resolve(imgData);
    });
    
}

/**
 * Given a set of 3D points, project them onto a 2D plane.
 * @param {*}      pts3D    A 3D point cloud with shape [N, 3].
 * @param {number} imgSize  The size of the image in pixels.
 * @returns {*}  A tensor of shape [N, 2] where N is the number of points.
 */
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
    let halfImgSize = 0.5 * imgSize;
    xy = xy.mul([zoomFactor, zoomFactor]);
    xy = xy.add([halfImgSize, halfImgSize]);

    return xy;
}

/**
 * Return a tensor that is a column of the input tensor.
 * @param {*}      tensor  The tensor to be sliced.
 * @param {number} idx     The index of the column to gather.
 * @returns {*}  A tensor with the same number of rows as the input tensor, but
 *               a single column.
 */
function column(tensor: any, idx: number): any {
    return tf.gather(tensor, [idx], 1);
}

/**
 * Updates the rotation matrix given a rotation axis and a rotation angle.
 * @param {number[]} axis     The axis of rotation.
 * @param {number}   degrees  The number of degrees to rotate.
 */
export function updateRotMat(axis: number[], degrees: number): void {
    if (tf === undefined) {
        return;
    }

    let angle = degrees / 180 * Math.PI;
    let ux = 0;
    let uy = 0;
    let uz = 0;
    [ux, uy, uz] = axis;  // assuming normalized

    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let icos = 1 - cos;

    // See
    // https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    let t = tf.tensor(
        [
            [cos + ux * ux * icos,       ux * uy * icos - uz * sin,  ux * uz * icos + uy * sin],
            [uy * ux * icos + uz * sin,  cos + uy * uy * icos,       uy * uz * icos - ux * sin],
            [uz * ux * icos - uy * sin,  uz * uy * icos + ux * sin,  cos + uz * uz * icos     ]
        ]
    );

    let rotMat2 = tf.matMul(t, rotMat);
    rotMat.dispose();
    t.dispose();
    rotMat = rotMat2;
}

/**
 * Update the offset vector by adding the delta to it.
 * @param {number} deltaX  The change in the x-coordinate.
 * @param {number} deltaY  The change in the y-coordinate.
 * @param {number} deltaZ  The change in the z-coordinate.
 */
export function updateOffsetVec(deltaX: number, deltaY: number, deltaZ: number): void {
    if (tf === undefined) {
        return;
    }

    if (offsetVec) { offsetVec.dispose(); }
    offsetVec = tf.tensor([deltaX, deltaY, deltaZ])
}

/**
 * Multiply the rotation matrix by the coordinates tensor
 * @returns {*}  The rotated coordinates.
 */
function applyRotation(): any {
    // First must update the rotation matrix with updateRotMat()
    return tf.matMul(rotMat, coorsTensor, false, true).transpose();
}
