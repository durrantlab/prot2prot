const fs = require("fs");
import { getCoorsTransformed } from "../../../../src/Pix2Pix/InputImage/MakeImage";
import { PDBMol } from "../../../../src/UI/Forms/FileLoaderSystem/Mols/PDBMol";

export function saveDebugTextFiles(mol: PDBMol, params, rotMat, offsetVec) {
    if (!params.debug) {
        return;
    }

    // Get the updated coordinates.
    let coors = getCoorsTransformed();
    mol.updateCoords(0, coors.arraySync());
    let pdbTxt = mol.toText();

    // Save the transformed PDB file.
    fs.writeFileSync(params.out_to_use + ".transformed.pdb", pdbTxt);
    console.log("    Saved " + params.out_to_use + ".transformed.pdb");

    // Save info
    fs.writeFileSync(params.out_to_use + ".info.json", JSON.stringify({
        "sourceFile": params.pdb,
        "outFile": params.out_to_use,
        "rotMatrix": rotMat.arraySync(),
        "offsetVector": offsetVec.arraySync()
    }, null, 4));
    console.log("    Saved " + params.out_to_use + ".info.json");
}
