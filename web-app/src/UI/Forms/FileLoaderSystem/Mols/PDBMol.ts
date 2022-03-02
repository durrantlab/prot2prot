import { IAtom, ParentMol } from "./ParentMol";

const TWO_LETTER_ELEMENTS = new Set([
    "LI", "NA", "MG", "AL", "CL", "CA", "MN", "FE", "CO", "CU", "ZN",
    "AS", "BR", "MO", "RH", "AG", "AU", "PB", "BI", "NI", "SE"
]);

export class PDBMol extends ParentMol {
    constructor(fileTxt: string = undefined, mseToMet = true) {
        super(undefined);  // Does nothing because undefined.

        if (fileTxt !== undefined) {
            this.load(fileTxt, mseToMet);
        }
    }

    load(pdbTxt: string, mseToMet = true): void {
        // Get the frames
        let frames = pdbTxt.split(/^(MODEL\s+?\d+?\s+?|^ENDMDL\s+?)/gm);

        for (let frame of frames) {
            // Key only key atoms
            let pdbLines = frame.split("\n");
            pdbLines = pdbLines.filter((l) => {
                return l.slice(0, 4) === "ATOM"
                    || l.slice(0, 6) === "HETATM"
                    || l.slice(0, 4) === "ROOT"
                    || l.slice(0, 3) === "END"
                    || l.slice(0, 6) === "BRANCH"
                    || l.slice(0, 7) === "TORSDOF";
            });

            // Ignore empty frames
            if (pdbLines.length === 0) { continue; }

            this.startNewFrame();
    
            if (mseToMet) {
                pdbLines = this.mseToMet(pdbLines);
            }

            // Parse each of the lines
            for (let pdbLine of pdbLines) {
                this.addAtomToCurrentFrame(
                    this.parsePDBLine(pdbLine)
                );
            }
        }
    }

    toText(): string {
        let txt = "";
        for (let frameIdx in this.frames) {
            txt += "MODEL " + this.padStr((parseInt(frameIdx) + 1).toString(), 8) + "\n";
            txt += this.frameToText(parseInt(frameIdx));
            txt += "ENDMDL\n"
        }

        return txt;
    }

    frameToText(frameIdx: number): string {
        let txt = "";
        for (let atom of this.frames[frameIdx].atoms) {
            if (atom.nonAtomLine !== undefined) {
                txt += atom.nonAtomLine + "\n";
                continue;
            }

            txt += atom.hetflag ? "HETATM" : "ATOM  ";
            txt += this.padStr(atom.serial, 5);

            let atm;
            switch (atom.atom.length) {
                case 1:
                    atm = "  " + atom.atom + "   ";
                    break;
                case 2:
                    atm = "  " + atom.atom + "  ";
                    break;
                case 3:
                    atm = "  " + atom.atom + " ";
                    break;
                default:
                    atm = " " + atom.atom + " ";
            }
            // If two-letter element, shift one left.
            if ((atom.elem) && (atom.elem.replace(/[^A-Za-z]/gm, "").length > 1) && 
                (atm.substring(0, 1) === " ")) {
                atm = atm.substring(1) + " ";
            }
            txt += atm;

            txt += this.padStr(atom.resn, 3);
            txt += this.padStr(atom.chain, 2);
            txt += this.padStr(atom.resi, 4);
            txt += this.padStr(atom.x.toFixed(3), 12);
            txt += this.padStr(atom.y.toFixed(3), 8);
            txt += this.padStr(atom.z.toFixed(3), 8);
            txt += this.padStr(atom.elem, 24);
            txt += "\n";
        }

        return txt;
    }

    private parsePDBLine(pdbLine: string): IAtom {
        let recordName = pdbLine.substring(0, 6);

        if (["HETATM", "ATOM  "].indexOf(recordName) === -1) {
            return {nonAtomLine: pdbLine};
        }
        
        let serial = pdbLine.substring(6, 11).trim();
        let atom = pdbLine.substring(12, 16).trim();
        let resn = pdbLine.substring(17, 20).trim();
        let chain = pdbLine.substring(21, 22).trim();
        let resi = pdbLine.substring(22, 26).trim();
        let x = parseFloat(pdbLine.substring(30, 38));
        let y = parseFloat(pdbLine.substring(38, 46));
        let z = parseFloat(pdbLine.substring(46, 54));
        
        let lngth = pdbLine.length;
        let elem = pdbLine.substring(lngth - 4).trim();
        if (elem === "") {
            elem = this.elementFromAtomName(pdbLine.substring(12, 16).trim());
        }

        let hetflag = recordName === "HETATM";

        return {
            resn, x, y, z, elem, chain, resi, atom, hetflag,
            serial, 
            // origLine: pdbLine
        }
    }

    private elementFromAtomName(atomName: string): string {
        atomName = atomName.replace(/[0-9]/g, "");
        atomName = atomName.substring(0, 2).toUpperCase();
        return (TWO_LETTER_ELEMENTS.has(atomName)) ? atomName : atomName.substring(0, 1);
    }
    
    private mseToMet(pdbLines: string[]): string[] {
        // TODO: Auto converting MSE to MET, but this could be a user parameter.
        return pdbLines.map((l) => {
            if (l.substring(17, 20) === "MSE") {
                l = l
                    .replace(/SE   MSE/g, " SD  MET")
                    .replace(/MSE/g, "MET")
                    .replace(/ SE /g, "  S ")
                    .replace(/^HETATM/g, "ATOM  ")
            }

            return l;
        });
    }
}