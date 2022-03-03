import { loadTfjs, tf } from '../../LoadTF';
import { initializeVars } from '../MakeImage';
import { mergeAtomsData } from './MergedAtoms';
import { vdwRadii } from './VDWRadii';
import { ParentMol } from '../../../UI/Forms/FileLoaderSystem/Mols/ParentMol';

// let twoLetterElements: Set<string>;  // populated in parsePDB

export let coorsTensor: any;  // tf.Tensor<tf.Rank>;
export let elements: string[];
export let vdw: any;  // tf.Tensor<tf.Rank>;
export let pdbLines: string[];

export function parsePDB(pdb: ParentMol, recenter = true, radiusScale = 1.0, atomNamesToKeep: string[] = undefined): Promise<any> {
    // Reset the rotation and offset vectors, in case reloading PDB.
    initializeVars(true);

    // Update radii for merged atom types
    for (let atomType in mergeAtomsData) {
        vdwRadii[atomType] = mergeAtomsData[atomType][2];
    }

    // Mark certain element names as having two letters.
    // twoLetterElements = new Set(Object.keys(vdwRadii).filter(e => e.length > 1));
    
    return loadTfjs().then(() => {
        // pdbLines = pdbMol.split("\n");
        // pdbLines = pdbLines.filter(l => l.startsWith("ATOM") || l.startsWith("HETATM"));

        // atomNamesToKeep = ["C", "CA", "N"];
        // radiusScale = 0.5;
        if (atomNamesToKeep) {
            pdb = pdb.keepSelection({atomNames: atomNamesToKeep});
            
            // pdbLines = pdbLines.filter(
            //     l => atomNamesToKeep.indexOf(
            //         l.substring(11, 16).trim()
            //     ) !== -1
            // );
        }

        let coors = pdb.getCoords()[0];
        elements = pdb.getElements()[0];

        // elements = pdbLines.map((l) => {
        //     let ln = l.length;
        //     let elem = l.substring(ln - 3).trim();
        //     if (elem === "") {
        //         elem = elementFromAtomName(l.substring(12, 16).trim());
        //     }
        //     return elem;
        // });
        vdw = tf.tensor(
            elements.map((e) => {
                // Assume carbon if radii not defined...
                return radiusScale * (vdwRadii[e] !== undefined ? vdwRadii[e] : vdwRadii["C"]);
                // return vdwRadii[e] !== undefined ? vdwRadii[e] : vdwRadii["C"];
            })
        );
    
        coorsTensor = tf.tensor(coors)
    
        // Center at origin
        if (recenter) {
            coorsTensor = coorsTensor.sub(coorsTensor.mean(0));
        }

        return Promise.resolve(undefined);
    });
}

function getIdxsOfElements(element: string): number[] {
    if (elements === undefined) {
        return [];
    }
    let elemsMatchEval = elements.map((e, i) => [e === element, i]);
    let elemsMatchs = elemsMatchEval.filter(e => e[0]);
    return elemsMatchs.map(e => e[1]) as number[];
}

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

    coorsTensor = tf.tensor(coorsTensorArr);
    vdw = tf.tensor(vdwArr);
}

// Certain atoms should be considered the same atom for visualization purposes
// (limited colors).
export function mergeAtomTypes(updatePDBLine = false): void {
    for (let newElem in mergeAtomsData) {
        for (let origElem of mergeAtomsData[newElem][0]) {
            replaceElement(origElem, newElem, 1.0, updatePDBLine);
        }
    }
}

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
        // let newName = newElement + Math.floor(10 * Math.random()).toString();
        
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