const fs = require("fs");
import { getCoorsTransformed } from "../../src/Pix2Pix/InputImage/MakeImage";
import { getPDBTextUpdatedCoors } from "../../src/Pix2Pix/InputImage/PDBParser";

export function saveDebugTextFiles(params, rotMat, offsetVec) {
    if (!params.debug) {
        return;
    }

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
