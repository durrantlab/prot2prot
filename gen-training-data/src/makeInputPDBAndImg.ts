// For node.js

const fs = require("fs");
import { makeImg, updateRotMat, updateOffsetVec, getCoorsTransformed, rotMat, offsetVec, initializeVars } from './Pix2Pix/InputImage/MakeImage';
import { parsePDB, getPDBTextUpdatedCoors, removeAllOfElement, replaceElement, elements, mergeAtomTypes } from './Pix2Pix/InputImage/PDBParser';
import { drawImageDataOnCanvas, makeInMemoryCanvas, updateCreateCanvasFunc } from './Pix2Pix/InputImage/ImageDataHelper';
import { InputColorScheme } from './Pix2Pix/InputImage/ColorSchemes/InputColorScheme';
import { closestAllowedDist } from './Pix2Pix/InputImage/MakeImage';
const { createCanvas } = require('canvas')

let imgSize = 1024  // Size of image (pixels)
let keptHydrogens = true;
let hydrogenReplacements = [];
let removeWatersIfPresent = Math.random() < 0.5;

// Load the PDB file
let pdbFile = process.argv[2];
let pdbTxt = fs.readFileSync(pdbFile).toString();

// Also get the id
let id = process.argv[3];

if (removeWatersIfPresent) {
    let lines = pdbTxt.split(/\n/g);
    lines = lines
        .filter(l => l.indexOf("HOH") === -1)
        .filter(l => l.indexOf("WAT") === -1)
        .filter(l => l.indexOf("TIP3") === -1);
    pdbTxt = lines.join("\n");
}

parsePDB(pdbTxt).then(() => {
    // Check to make sure the PDB has hydrogen atoms.
    if (elements.indexOf("H") === -1) {
        console.log(elements);
        console.log("");
        console.log("Protein must contain hydrogen atoms!");
        process.exit();
    }

    function modifyPDBAtoms() {
        //  Much of the time, you should strip the hydrogens (common for PDB files to
        //  not have hydrogen atoms).
        if (Math.random() < 0.5) {
            removeAllOfElement("H");
            keptHydrogens = false;
        } else {
            // Keeping hydrogens.
            if (Math.random() < 0.5) {
                // Consider replacing a few of them with other elements to give the ML
                // model plenty to train on. In some cases, these are merged atom types
                // (see InputColorScheme.ts).
                let rareElems = [
                    "S", "D", "E", "G", "P"
        
                    // "P", "FE", "K", "NA", "MG", "ZN", 
                    // "MN", "F", "CL", "BR", "I", "S"
                ];
                let rareElem1 = rareElems[Math.floor(Math.random() * rareElems.length)];
                let rareElem2 = rareElems[Math.floor(Math.random() * rareElems.length)];

                // rareElem1 = "E";
                // rareElem2 = "G";
        
                replaceElement("H", rareElem1, 0.05, true);
                replaceElement("H", rareElem2, 0.05, true);
        
                hydrogenReplacements.push([rareElem1, 0.05]);
                hydrogenReplacements.push([rareElem2, 0.05]);
            }
        }
    }
    modifyPDBAtoms();

    function transformPDBCoors() {
        // Decide on how to position the PDB
        initializeVars();
        let xRot = Math.random() * 360;
        let yRot = Math.random() * 360;
        let zRot = Math.random() * 360;
        updateRotMat([1, 0, 0], xRot);
        updateRotMat([0, 1, 0], yRot);
        updateRotMat([0, 0, 1], zRot);
        
        // Distance from camera to protein COG.
        let pdbDist = (150 - closestAllowedDist) * Math.random() + closestAllowedDist;
        updateOffsetVec(0, 0, pdbDist);
    }
    transformPDBCoors();

    function saveTextOutput(id) {
        let dir = "../output." + id + "/";

        // Make sure output directory exists.
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        
        // Pick an ID for this calculation
        let fileId = dir + "model." + Math.random().toString().replace(/\./g, "") + "/";
        if (!fs.existsSync(fileId)){
            fs.mkdirSync(fileId);
        }

        // Get the updated coordinates.
        let coors = getCoorsTransformed();
        let pdbTxt = getPDBTextUpdatedCoors(coors);

        // Save the transformed PDB file.
        fs.writeFileSync(fileId + "model.no_atom_merge.pdb", pdbTxt);

        // Merge the rare atoms into single type and save that too.
        mergeAtomTypes(true);
        coors = getCoorsTransformed();
        pdbTxt = getPDBTextUpdatedCoors(coors);
        fs.writeFileSync(fileId + "model.pdb", pdbTxt);

        // Save info
        fs.writeFileSync(fileId + "info.json", JSON.stringify({
            "sourceFile": pdbFile,
            "id": fileId,
            "rotMatrix": rotMat.arraySync(),
            "offsetVector": offsetVec.arraySync(),
            "keptHydrogens": keptHydrogens,
            "hydrogenReplacements": hydrogenReplacements,
            "removeWatersIfPresent": removeWatersIfPresent
        }, null, 4));

        return fileId;
    }
    let fileId = saveTextOutput(id);

    // Use the node.js-compatible canvas
    updateCreateCanvasFunc(createCanvas);

    // Make the input imagedata.
    makeImg(imgSize, new InputColorScheme()).then((imgData) => {
        // Put that image data on a canvas
        let newCanvas = makeInMemoryCanvas(imgSize, "tmp");
        drawImageDataOnCanvas(imgData, newCanvas);
        
        // Save that canvas image
        const out = fs.createWriteStream(fileId + 'input.png');
        const stream = (newCanvas as any).createPNGStream()
        stream.pipe(out)
    });
});

