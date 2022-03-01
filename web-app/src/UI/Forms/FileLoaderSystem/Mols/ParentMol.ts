export interface IAtom {
    serial?: string;  // atom index (I think it can sometimes be non-numeric)
    resn?: string;  // residue name
    x?: number;  // coordinate
    y?: number;  // coordinate
    z?: number;  // coordinate
    elem?: string;
    hetflag?: boolean;  // true if hetatm
    chain?: string;
    resi?: string;  // residue number (I think it can sometimes be non-numeric)
    atom?: string;  // atom name
    nonAtomLine?: string;  // e.g., "TORSDOF" from PDBQT format.
    // origLine?: string;
}

export interface ISelection {
    resname?: string;
    resid?: string;
    chain?: string;
    nonProtein?: boolean;
}

export const PROTEIN_RESNAMES = [
    "ALA",
    "ARG",
    "ASN",
    "ASP",
    "ASH",
    "ASX",
    "CYS",
    "CYM",
    "CYX",
    "GLN",
    "GLU",
    "GLH",
    "GLX",
    "GLY",
    "HIS",
    "HID",
    "HIE",
    "HIP",
    "ILE",
    "LEU",
    "LYS",
    "LYN",
    "MET",
    "MSE",
    "PHE",
    "PRO",
    "SER",
    "THR",
    "TRP",
    "TYR",
    "VAL",
];

type SetConstructor<T extends ParentMol> = {
    new (items:any[]): T;
}

export abstract class ParentMol {
    frames: Frame[] = [];
    
    constructor(fileTxt: string = undefined) {
        if (fileTxt !== undefined) {
            this.load(fileTxt);
        }
    }

    abstract load(fileTxt: string): void;

    abstract toText(): string;

    abstract frameToText(frameIdx: number): string;

    startNewFrame(): void {
        this.frames.push(new Frame());
    }

    protected newMolOfThisType(): this {
        return new (this.constructor as SetConstructor<this>)(undefined);
    }

    clone(): this {
        let newMol = this.newMolOfThisType();
        newMol.frames = this.frames.map(f => f.clone());
        return newMol;
    }

    addAtomToCurrentFrame(atom: IAtom) {
        this.frames[this.frames.length - 1].addAtom(atom);
    }

    partitionBySelection(sel: ISelection): this[] {
        let newMol = this.newMolOfThisType();
        let newMolInvert = this.newMolOfThisType();

        for (let frame of this.frames) {
            let [newFrame, newFrameInvert] = frame.partition(sel);
            newMol.frames.push(newFrame);
            newMolInvert.frames.push(newFrameInvert);
        }

        return [newMol, newMolInvert];
    }

    getNonProteinMol(): this {
        let nonProtMol = this.newMolOfThisType();
        for (let frame of this.frames) {
            frame.addNonProteinAtomsToMol(nonProtMol);
        }

        nonProtMol.frames = nonProtMol.frames.filter(
            f => f.atoms.length > 0
        );

        return nonProtMol;
    }

    listChains(): string[] {
        let chains = new Set([]);
        for (let frame of this.frames) {
            for (let chain of frame.listChains()) {
                chains.add(chain);
            }
        }
        let chainArr = Array.from(chains);
        chainArr.sort()
        return chainArr;
    }

    protected padStr(s: string, size: number, justLeft = false): string {
        if (s.length > size) { return s; }
        if (justLeft) {
            while (s.length < size) { s += " "; }
            return s;
        }

        while (s.length < size) { s = " " + s; }
        return s;
    }
}

class Frame {
    atoms: IAtom[] = [];

    addAtom(atom: IAtom): void {
        this.atoms.push(atom);
    }

    clone(): Frame {
        let frame = new Frame();
        frame.atoms = JSON.parse(JSON.stringify(this.atoms));
        return frame;
    }

    partition(sel: ISelection): Frame[] {
        let newFrame = new Frame();
        let newFrameInvert = new Frame();
        for (let atom of this.atoms) {
            if (sel["resname"] && (sel["resname"] !== atom.resn)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            if (sel["resid"] && (sel["resid"] !== atom.resi)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            if (sel["chain"] && (sel["chain"] !== atom.chain)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            newFrame.addAtom(atom);
        }
        return [newFrame, newFrameInvert];
    }

    listChains(): string[] {
        let chains = new Set([]);
        for (let atom of this.atoms) {
            if (["", undefined].indexOf(atom.chain) === -1) {
                chains.add(atom.chain);
            }
        }
        return Array.from(chains);
    }

    addNonProteinAtomsToMol(mol: ParentMol): void {
        mol.startNewFrame();
        for (let atom of this.atoms) {
            if (atom.nonAtomLine !== undefined) { continue; }
            if (PROTEIN_RESNAMES.indexOf(atom.resn) === -1) {
                mol.addAtomToCurrentFrame(atom);
            }
        }
    }
}