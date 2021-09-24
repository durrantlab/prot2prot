const fs = require("fs");
import { makeImg, updateRotMat, updateOffsetVec, getCoorsTransformed, rotMat, offsetVec } from './InputImage/MakeImage';
import { parsePDB, getPDBTextUpdatedCoors, elements, removeAllOfElement, replaceOccasionalHydrogen } from './InputImage/PDBParser';
import { drawImageDataOnCanvas, makeInMemoryCanvas, updateCreateCanvasFunc } from './InputImage/ImageDataHelper';
import { InputColorScheme } from './InputImage/ColorSchemes/InputColorScheme';
const { createCanvas } = require('canvas')

let imgSize = 1024  // Size of image (pixels)

// Load the PDB file
let pdbFile = process.argv[2];
const buffer = fs.readFileSync(pdbFile);
const fileContent = buffer.toString();
let keptHydrogens = true;
let hydrogenReplacements = [];

parsePDB(fileContent);

// Check to make sure the PDB has hydrogen atoms.
if (elements.indexOf("H") === -1) {
    console.log(elements);
    console.log("");
    console.log("Protein must contain hydrogen atoms!");
    process.exit();
}

//  Much of the time, you should strip the hydrogens (common for PDB files to
//  not have hydrogen atoms).
if (Math.random() < 0.5) {
    removeAllOfElement("H");
    keptHydrogens = false;
} else {
    // Keeping hydrogens.
    if (Math.random() < 0.5) {
        // Consider replacing a few of them with other elements to give the ML
        // model plenty to train on.
        let rareElems = [
            "P", "FE", "K", "NA", "MG", "ZN", 
            "MN", "F", "CL", "BR", "I", "S"
        ];
        let rareElem1 = rareElems[Math.floor(Math.random() * rareElems.length)];
        let rareElem2 = rareElems[Math.floor(Math.random() * rareElems.length)];

        replaceOccasionalHydrogen(rareElem1, 0.1);
        replaceOccasionalHydrogen(rareElem2, 0.1);

        hydrogenReplacements.push([rareElem1, 0.1]);
        hydrogenReplacements.push([rareElem2, 0.1]);
    }
}

// Decide on how to position the PDB
let xRot = Math.random() * 360;
let yRot = Math.random() * 360;
let zRot = Math.random() * 360;
updateRotMat("X", xRot);
updateRotMat("Y", yRot);
updateRotMat("Z", zRot);

let pdbDist = 150 * Math.random()  // Distance from camera to protein COG
updateOffsetVec(0, 0, pdbDist);

// Use the node.js-compatible canvas
updateCreateCanvasFunc(createCanvas);

// Make the input imagedata
let imgData = makeImg(imgSize, new InputColorScheme());

// Put that image data on a canvas
let newCanvas = makeInMemoryCanvas(imgSize, "tmp");
drawImageDataOnCanvas(imgData, newCanvas);

// Make sure output directory exists.
if (!fs.existsSync("../output/")){
    fs.mkdirSync("../output/");
}

// Pick an ID for this calculation
let id = "../output/model." + Math.random().toString().replace(/\./g, "") + "/";
if (!fs.existsSync(id)){
    fs.mkdirSync(id);
}

// Save that canvas image
const out = fs.createWriteStream(id + 'input.png');
const stream = (newCanvas as any).createPNGStream()
stream.pipe(out)

// Get the updated coordinates.
let coors = getCoorsTransformed();
let pdbTxt = getPDBTextUpdatedCoors(coors);

// Save the transformed PDB file
fs.writeFileSync(id + "model.pdb", pdbTxt);

// Save info
fs.writeFileSync(id + "info.json", JSON.stringify({
    "sourceFile": pdbFile,
    "id": id,
    "rotMatrix": rotMat.arraySync(),
    "offsetVector": offsetVec.arraySync(),
    "keptHydrogens": keptHydrogens,
    "hydrogenReplacements": hydrogenReplacements
}, null, 4));