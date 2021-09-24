import * as tf from '@tensorflow/tfjs';

// This list not exhaustive!
let twoLetterElements = new Set([
    "LI", "MG", "AL", "CL", "MN", "FE", "ZN", "AS", "BR", "MO", "RH", "AG",
    "AU", "PB", "BI", "NI", "NA", "SE"
]);

let vdwRadii = {
    "H": 1.2, "C": 1.7, "N": 1.55, "O": 1.52, "F": 1.47, "P": 1.8, "S": 1.8,
    "B": 2.0, "LI": 1.82, "NA": 2.27, "MG": 1.73, "AL": 2.00, "CL": 1.75,
    "CA": 2.00, "MN": 2.00, "FE": 2.00, "CO": 2.00, "CU": 1.40, "ZN": 1.39,
    "AS": 1.85, "BR": 1.85, "MO": 2.00, "RH": 2.00, "AG": 1.72, "AU": 1.66,
    "PB": 2.02, "BI": 2.00, "K": 2.75, "I": 1.98, "NI": 1.63, "SE": 1.90
}

export let coorsTensor: tf.Tensor<tf.Rank>;
export let elements: string[];
export let vdw: tf.Tensor<tf.Rank>;
export let pdbLines: string[];

export function parsePDB(pdbText: string) {
    pdbLines = pdbText.split("\n");
    pdbLines = pdbLines.filter(l => l.startsWith("ATOM") || l.startsWith("HETATM"));
    let coors = pdbLines.map((l) => {
        let x = parseFloat(l.substr(30, 8));
        let y = parseFloat(l.substr(38, 8));
        let z = parseFloat(l.substr(46, 8));
        return [x, y, z];
    });
    elements = pdbLines.map((l) => {
        let elem = l.substr(-3).trim();
        if (elem === "") {
            elem = elementFromAtomName(l.substr(12, 4).trim());
        }
        return elem;
    });
    vdw = tf.tensor(
        elements.map((e) => {
            // Assume carbon if radii not defined...
            return vdwRadii[e] !== undefined ? vdwRadii[e] : vdwRadii["C"];
        })
    );

    coorsTensor = tf.tensor(coors)

    // Center at origin
    coorsTensor = coorsTensor.sub(coorsTensor.mean(0));
}

function elementFromAtomName(atomName: string): string {
    atomName = atomName.replace(/[0-9]/g, "");
    atomName = atomName.substr(0, 2).toUpperCase();
    return (twoLetterElements.has(atomName)) ? atomName : atomName.substr(0, 1);
}

export function getPDBTextUpdatedCoors(coors: tf.Tensor<tf.Rank>): string {
    let i = 0;
    let coorsList = coors.arraySync();
    let newPDBLines: string[] = [];
    for (let pdbLine of pdbLines) {
        let first = pdbLine.slice(0, 30);
        let last = pdbLine.slice(54);
        let coors = coorsList[i];
        let coorsStr = coors.map((c) => {
            c = c.toFixed(3);
            while (c.length < 8) {
                c = " " + c;
            }
            return c;
        });
        newPDBLines.push(first + coorsStr.join("") + last);

        i++;
    }
    return newPDBLines.join("\n");
}

function getIdxsOfElements(element: string): number[] {
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

export function replaceOccasionalHydrogen(newElement: string, frequency: number): void {
    let idxsOfHydrogens = getIdxsOfElements("H");
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

        // Also update PDB line
        let pdbLine = pdbLines[idx];

        while (pdbLine.length < 78) {
            pdbLine = pdbLine + " ";
        }

        let first = pdbLine.slice(0, 12);
        let last = pdbLine.slice(17, 76);

        pdbLines[idx] = first + newElement + "   " + last + newElement;
    }
}