// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { loadTfjs, tf } from '../../LoadTF';
import { initializeVars } from '../MakeImage';
import { mergeAtomsData } from './MergedAtoms';
import { vdwRadii } from './VDWRadii';
import { ParentMol } from '../../../UI/Forms/FileLoaderSystem/Mols/ParentMol';

export let coorsTensor: any;  // tf.Tensor<tf.Rank>;
export let elements: string[];
export let vdw: any;  // tf.Tensor<tf.Rank>;
export let pdbLines: string[];

/**
 * Load a molecule into tensorflow tensors.
 * @param {ParentMol}  mol                The molecule.
 * @param {boolean}    [recenter=true]    If true, center the molecule at the
 *                                        origin.
 * @param {number}     [radiusScale=1.0]  The scale factor for the vdw radii.
 * @param {string[]}   atomNamesToKeep    An optional array of atom names to
 *                                        keep.
 */
export function loadMolIntoTF(mol: ParentMol, recenter = true, radiusScale = 1.0, atomNamesToKeep: string[] = undefined): Promise<any> {
    // Reset the rotation and offset vectors, in case reloading PDB.
    initializeVars(true);

    // Update radii for merged atom types
    for (let atomType in mergeAtomsData) {
        vdwRadii[atomType] = mergeAtomsData[atomType][2];
    }

    return loadTfjs().then(() => {
        // atomNamesToKeep = ["C", "CA", "N"];
        // radiusScale = 0.5;
        if (atomNamesToKeep) {
            mol = mol.keepSelection({atomNames: atomNamesToKeep});
        }

        let coors = mol.getCoords()[0];
        elements = mol.getElements()[0];

        if (vdw) { vdw.dispose(); }

        vdw = tf.tensor(
            elements.map((e) => {
                // Assume carbon if radii not defined...
                return radiusScale * (vdwRadii[e] !== undefined ? vdwRadii[e] : vdwRadii["C"]);
            })
        );

        if (coorsTensor) { coorsTensor.dispose(); }

        coorsTensor = tf.tidy(() => {
            let coorsTensr = tf.tensor(coors);

            // Center at origin
            if (recenter) {
                coorsTensr = coorsTensr.sub(coorsTensr.mean(0));
            }
            return coorsTensr;
        });

        return Promise.resolve(undefined);
    });
}

/**
 * Get the indexes of all atoms of a given element.
 * @param {string} element  The element to search for.
 * @returns {number[]} An array of indexes of matching atoms.
 */
function getIdxsOfElements(element: string): number[] {
    if (elements === undefined) {
        return [];
    }
    let elemsMatchEval = elements.map((e, i) => [e === element, i]);
    let elemsMatchs = elemsMatchEval.filter(e => e[0]);
    return elemsMatchs.map(e => e[1]) as number[];
}

/**
 * Remove all of the atoms of a given element.
 * @param {string} element  The element to remove.
 */
export function removeAllOfElement(element: string): void {
    let idxsToRemove = getIdxsOfElements(element);
    
    // TODO: There's probably a way to filter tensors without coverting them to
    // arrays...
    let coorsTensorArr = coorsTensor.arraySync() as any[];
    let vdwArr = vdw.arraySync() as any[];

    for (let idx of idxsToRemove) {
        elements[idx] = undefined;
        pdbLines[idx] = undefined;
        coorsTensorArr[idx] = undefined;
        vdwArr[idx] = undefined;
    }

    elements = elements.filter(i => i !== undefined);
    pdbLines = pdbLines.filter(i => i !== undefined);
    coorsTensorArr = coorsTensorArr.filter(i => i !== undefined);
    vdwArr = vdwArr.filter(i => i !== undefined);

    if (coorsTensor) { coorsTensor.dispose(); }
    coorsTensor = tf.tensor(coorsTensorArr);

    if (vdw) { vdw.dispose(); }
    vdw = tf.tensor(vdwArr);
}

/**
 * For each element in the `mergeAtomsData` object, replace all instances of the
 * original element with the new element. Because certain atoms should be
 * considered the same atom for visualization purposes (limited colors).
 * @param {boolean} [updatePDBLine=false]  If true, the PDB line will be updated
 *                                         to reflect the new element.
 */
export function mergeAtomTypes(updatePDBLine = false): void {
    for (let newElem in mergeAtomsData) {
        for (let origElem of mergeAtomsData[newElem][0]) {
            replaceElement(origElem, newElem, 1.0, updatePDBLine);
        }
    }
}

/**
 * Replace all instances of a given element with a new element.
 * @param {string} origElement             The element to replace.
 * @param {string} newElement              The element to replace with.
 * @param {number} frequency               The probability that a element will
 *                                         be replaced.
 * @param {boolean} [updatePDBLine=false]  If true, the PDB line will be updated
 *                                         to reflect the new element.
 */
export function replaceElement(origElement: string, newElement: string, frequency: number, updatePDBLine = false): void {
    let idxsOfHydrogens = getIdxsOfElements(origElement);
    let initialNewElement = newElement.toUpperCase().trim();
    newElement = (initialNewElement.length === 1) 
        ? " " + initialNewElement 
        : initialNewElement;

    for (let idx of idxsOfHydrogens) {
        if (Math.random() > frequency) {
            continue;
        }
        
        elements[idx] = initialNewElement;
        
        if (updatePDBLine) {
            // Also update PDB line. Only do this if you plan to save out the
            // PDB for loading in external programs (e.g., VMD).
            let pdbLine = pdbLines[idx];
    
            while (pdbLine.length < 78) {
                pdbLine = pdbLine + " ";
            }
    
            let first = pdbLine.substring(0, 12);
            let last = pdbLine.substring(17, 76);
    
            pdbLines[idx] = first + newElement + "   " + last + newElement;
        }
    }
}