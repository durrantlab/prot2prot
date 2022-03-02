const fs = require("fs");
const zlib = require('zlib');
import { getMol } from "../../../../src/UI/Forms/FileLoaderSystem/Mols/";
import { ParentMol } from "../../../../src/UI/Forms/FileLoaderSystem/Mols/ParentMol";

export function getMolObj(filename: string): ParentMol {
    // Get PDB text.
    let pdbTxt: string;
    if (filename.endsWith(".gz")) {
        pdbTxt =  zlib.unzipSync(fs.readFileSync(filename)).toString();
        filename = filename.substring(0, filename.length - 3);
    } else {
        // Not compressed
        pdbTxt = fs.readFileSync(filename).toString();
    }

    return getMol(filename, pdbTxt);

    // let pdbLines = pdbTxt.split("\n").filter((l) => {
    //     return l.startsWith("ATOM") || l.startsWith("HETATM") || l.startsWith("END")
    // });

    // let frames = [""];
    // const pdbLinesLen = pdbLines.length;
    // for (let i = 0; i < pdbLinesLen; i++) {
    //     const pdbLine = pdbLines[i];
    //     if (pdbLine.startsWith("END")) {
    //         frames.push("");
    //         continue;
    //     }
    //     frames[frames.length - 1] += pdbLine + "\n";
    // }

    // frames = frames.filter(f => f.trim() !== "");

    // return frames;
}