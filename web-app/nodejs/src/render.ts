#!/usr/bin/env node

// For node.js

const fs = require("fs");
const { Command, Option, InvalidArgumentError } = require('commander');
import { makeImg, updateRotMat, updateOffsetVec, getCoorsTransformed, rotMat, offsetVec, initializeVars, closestAllowedDist } from '../../src/Pix2Pix/InputImage/MakeImage';
import { parsePDB, getPDBTextUpdatedCoors } from '../../src/Pix2Pix/InputImage/PDBParser';
import { drawImageDataOnCanvas, makeInMemoryCanvas, updateCreateCanvasFunc } from '../../src/Pix2Pix/InputImage/ImageDataHelper';
import { InputColorScheme } from '../../src/Pix2Pix/InputImage/ColorSchemes/InputColorScheme';
import { avoidWorkers, neuralRender } from '../../src/Pix2Pix/NeuralRender/index';
import { setupFakeVueXStore } from '../../src/VueInterface/Store';
const { createCanvas } = require('canvas')
var path = require('path')
const tf = require("@tensorflow/tfjs-node");
console.log(tf)

function getParameters() {
    function myParseInt(value, _) {
        // parseInt takes a string and a radix
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new InvalidArgumentError('Not a number.');
        }
        return parsedValue;
    }

    function myFilePathExists(value, _) {
        if (!fs.existsSync(value)) {
            throw new InvalidArgumentError('File does not exist.');
        }
        if (!fs.lstatSync(value).isFile()) {
            throw new InvalidArgumentError('Path points to a directory, not a file.');
        }
        return value;
    }

    function myFileCanWrite(value, _) {
        // Make sure file doesn't already exist
        if (fs.existsSync(value)) {
            throw new InvalidArgumentError('File already exists.');
        }

        // Make sure file ends in png.
        if (path.extname(value).toLowerCase() !== ".png") {
            throw new InvalidArgumentError('File name must end in `.png`.');
        }

        // Try writing a file. To make sure path accessible.
        try {
            fs.writeFileSync(value + ".tmp", "");
            fs.unlinkSync(value + ".tmp");
        } catch {
            throw new InvalidArgumentError('Cannot save file at this path.');
        }
        return value;
    }

    // Get the parameters
    const program = new Command();
    // program.version('0.0.1');
    program
        .addOption(
            new Option("-p, --pdb <path>", "The file path of the input PDB file.")
            .argParser(myFilePathExists)
            .makeOptionMandatory()
        )
        .addOption(
            new Option("-o, --out <path>", "The file path where the output PNG file should be saved.")
            .argParser(myFileCanWrite)
            .makeOptionMandatory()
        )
        .addOption(
            new Option('-r, --reso <number>', "The resolution (size) of the output image, in pixels.")
            .choices(["256", "512", "1024"])
            .default("1024")
        )
        .addOption(
            new Option("-x, --x_rot <number>", "The rotation around the x axis.")
            .default(0)
            .argParser(myParseInt)
        )
        .addOption(
            new Option("-y, --y_rot <number>", "The rotation around the y axis.")
            .default(0)
            .argParser(myParseInt)
        )
        .addOption(
            new Option("-z, --z_rot <number>", "The rotation around the z axis.")
            .default(0)
            .argParser(myParseInt)
        )
        .addOption(
            new Option("-d, --dist <number>", "The distance from the camera.")
            .default(150)
            .argParser(myParseInt)
        )
        .addOption(
            new Option("-g, --debug", "Whether to save additional intermediate files for debugging.")
            .default(false)
        )
        .addOption(
            new Option("-i, --intermediate", "Whether to save the intermediate PNG file that serves as input into the neural network.")
            .default(false)
        )

    program.parse(process.argv);
    const options = program.opts();
    
    // Convert some to numbers as needed
    options.reso = parseInt(options.reso);
    
    console.log(options);

    return options;
}

let params = getParameters();

parsePDB(fs.readFileSync(params.pdb).toString())
.then(() => {
    function transformPDBCoors() {
        // Decide on how to position the PDB
        initializeVars();
        // let xRot = Math.random() * 360;
        // let yRot = Math.random() * 360;
        // let zRot = Math.random() * 360;
        updateRotMat([1, 0, 0], params.x_rot);
        updateRotMat([0, 1, 0], params.y_rot);
        updateRotMat([0, 0, 1], params.z_rot);
        
        // Distance from camera to protein COG.
        // let pdbDist = (150 - closestAllowedDist) * Math.random() + closestAllowedDist;
        updateOffsetVec(0, 0, params.dist);
    }
    transformPDBCoors();

    function saveTextOutput() {
        // let dir = "../output." + id + "/";

        // Make sure output directory exists.
        // if (!fs.existsSync(dir)){
            // fs.mkdirSync(dir);
        // }
        
        // Pick an ID for this calculation
        // let fileId = dir + "model." + Math.random().toString().replace(/\./g, "") + "/";
        // if (!fs.existsSync(fileId)){
            // fs.mkdirSync(fileId);
        // }

        // Get the updated coordinates.
        let coors = getCoorsTransformed();
        let pdbTxt = getPDBTextUpdatedCoors(coors);

        // Save the transformed PDB file.
        fs.writeFileSync(params.out + ".transformed.pdb", pdbTxt);

        // Save info
        fs.writeFileSync(params.out + ".info.json", JSON.stringify({
            "sourceFile": params.pdb,
            "outFile": params.out,
            "rotMatrix": rotMat.arraySync(),
            "offsetVector": offsetVec.arraySync()
        }, null, 4));
    }
    
    if (params.debug) {
        saveTextOutput();
    }

    // Use the node.js-compatible canvas
    updateCreateCanvasFunc(createCanvas);

    // Also prevent vue from throwing errors (not used in nodejs).
    setupFakeVueXStore();
    avoidWorkers();

    // Make the input imagedata.
    makeImg(params.reso, new InputColorScheme())
    .then((imgData) => {
        // Put that image data on a canvas
        let newCanvas = makeInMemoryCanvas(params.reso, "tmp");
        drawImageDataOnCanvas(imgData, newCanvas);
        
        // Save that canvas image
        if (params.debug || params.intermediate) {
            const out = fs.createWriteStream(params.out + '.intermediate.png');
            const stream = (newCanvas as any).createPNGStream()
            stream.pipe(out)
        }

        // Feed the image data into the neural network.

        let filename = `../../dist/models/simple_surf/1024/uint8/model.json`;

        // console.log(filename);
        // filename = "./models/simple_surf/256/uint8/model.json";
        // filename = "./models/simple_surf/256/full/model.json";
        neuralRender(path.resolve(filename), imgData).then((imgOutData: ImageData) => {
            if (imgOutData !== undefined) {
                drawImageDataOnCanvas(imgOutData, newCanvas);
                // let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
                // this.$store.commit("setVar", {
                //     name: "webWorkerInfo",
                //     val: `Render time: ${deltaTime.toFixed(1)} seconds`
                // });

                // Save the image
                const out = fs.createWriteStream(params.out);
                const stream = (newCanvas as any).createPNGStream()
                stream.pipe(out)    
            }

        });
    });
});

