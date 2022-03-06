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
    altLoc?: string;  // rotamers
}

export interface ISelection {
    atomNames?: string[];
    resnames?: string[];
    resids?: string[];
    chains?: string[];
    elems?: string[];
    nonProtein?: boolean;
}

export interface IPruneParams {
    targetNumAtoms: number;
    removeHydrogens?: boolean;
    removeSidechains?: boolean;
    keepOnlyFirstFrame?: boolean;
    removeRegularlySpacedAtoms?: boolean;
    keepOnlyProtein?: boolean;
}

export const PROTEIN_RESNAMES = new Set([
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
]);

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

    frameToMol(frameIdx: number): this {
        let newMol = this.newMolOfThisType();
        newMol.frames = [this.frames[frameIdx].clone()];
        return newMol;
    }

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

    deleteSelection(sel: ISelection): this {
        let [_, invertSel] = this.partitionBySelection(sel);
        return invertSel;
    }

    keepSelection(sel: ISelection): this {
        let [matchSel, _] = this.partitionBySelection(sel);
        return matchSel;
    }

    keepOnlyProtein(): this {
        let newMol = this.clone();
        newMol.frames = newMol.frames.map(f => f.keepOnlyProtein());
        return newMol;
    }

    getNonProteinMol(): this {
        let nonProtMol = this.newMolOfThisType();
        console.warn("Num frames: " + this.frames.length.toString());
        for (let frame of this.frames) {
            frame.addNonProteinAtomsToMol(nonProtMol);
        }

        nonProtMol.frames = nonProtMol.frames.filter(
            f => f.atoms.length > 0
        );

        return nonProtMol;
    }

    getChains(): string[] {
        let chains = new Set([]);
        for (let frame of this.frames) {
            for (let chain of frame.getChains()) {
                chains.add(chain);
            }
        }
        let chainArr = Array.from(chains);
        chainArr.sort()
        return chainArr;
    }

    getCoords(): number[][][] {
        return this.frames.map(f => f.getCoords());
    }

    getElements(): string[][] {
        return this.frames.map(f => f.getElements());
    }

    hasHydrogens(onlyFirstFrame = true): boolean {
        for (let frame of this.frames) {
            if (frame.hasHydrogens()) { return true; }
            if (onlyFirstFrame) { break; }
        }
        return false;
    }

    numAtomsAcrossAllFrames(): number {
        let numAtoms = 0;
        for (let frame of this.frames) {
            numAtoms += frame.numAtoms();
        }
        return numAtoms;
    }

    numAtoms(frameIdx = 0): number {
        if (!this.frames[frameIdx]) {
            return 0;
        }
        return this.frames[frameIdx].numAtoms();
    }

    pruneAtoms(params: IPruneParams): this {
        // Not tested yet.
        debugger;
        let newMol = this.clone();
        if (this.numAtomsAcrossAllFrames() < params.targetNumAtoms) { return newMol; }

        // Keep first frame
        if (params.keepOnlyFirstFrame) { newMol.frames = [newMol.frames[0]]; }
        if (this.numAtomsAcrossAllFrames() < params.targetNumAtoms) { return newMol; }

        // Keep only protein atoms.
        if (params.keepOnlyProtein) { newMol = newMol.keepOnlyProtein(); }
        if (this.numAtomsAcrossAllFrames() < params.targetNumAtoms) { return newMol; }

        // Remove hydrogen atoms
        if (params.removeHydrogens) { newMol = newMol.deleteSelection({elems: ["H"]}); }
        if (this.numAtomsAcrossAllFrames() < params.targetNumAtoms) { return newMol; }

        // Keep only backbone atoms.
        if (params.removeSidechains) { newMol = newMol.keepSelection({atomNames: ["C", "N", "CA", "O"]}); }
        if (this.numAtomsAcrossAllFrames() < params.targetNumAtoms) { return newMol; }

        // Stride the atoms to reduce counts.
        let stride = this.numAtomsAcrossAllFrames() / params.targetNumAtoms;
        for (let frame of this.frames) {
            frame.strideAtoms(stride);
        }
        // if (this.numAtomsAcrossAllFrames() < params.targetNumAtoms) { return newMol; }
        
        return newMol;
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

    scaleFrames(targetNumFrames: number): this {
        let currentNumFrames = this.frames.length;
    
        if (targetNumFrames !== currentNumFrames) {
            console.log(`WARNING: You have requested ${targetNumFrames} output frame(s), but your PDB file has ${currentNumFrames} frame(s). I will duplicate or stride the PDB frames to produce your requested ${targetNumFrames} output frame(s).\n`)
        }
    
        let newFrames: Frame[] = [];
    
        for (let newFramesIdx = 0; newFramesIdx < targetNumFrames; newFramesIdx++) {
            let framesIdx = Math.round((currentNumFrames - 1) * newFramesIdx / (targetNumFrames - 1));
            if (isNaN(framesIdx)) {
                // Happens if --frames = 1, for example.
                framesIdx = 0;
            }
            newFrames.push(this.frames[framesIdx].clone());
        }

        let newMol = this.newMolOfThisType();
        newMol.frames = newFrames;
    
        return newMol;
    }

    updateCoords(frameIdx: number, coors: any) {
        this.frames[frameIdx].updateCoords(coors);
    }

    protected removeAltLocsCurrentFrame(): void {
        this.frames[this.frames.length - 1].removeAltLocs();
    }
}

export class Frame {
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
            if (sel.resnames && (sel.resnames.indexOf(atom.resn) === -1)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            if (sel.resids && (sel.resids.indexOf(atom.resi) === -1)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            if (sel.chains && (sel.chains.indexOf(atom.chain) === -1)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            if (sel.atomNames && (sel.atomNames.indexOf(atom.atom) === -1)) {
                newFrameInvert.addAtom(atom);
                continue
            }
            if (sel.elems && (sel.elems.indexOf(atom.elem) === -1)) {
                newFrameInvert.addAtom(atom);
                continue
            }

            newFrame.addAtom(atom);
        }
        return [newFrame, newFrameInvert];
    }

    getChains(): string[] {
        let chains = new Set([]);
        for (let atom of this.atoms) {
            if (["", undefined].indexOf(atom.chain) === -1) {
                chains.add(atom.chain);
            }
        }
        return Array.from(chains);
    }

    isProtein(atom: IAtom): boolean {
        // let atom = this.atoms[atomIdx];
        // if (atom.nonAtomLine !== undefined) { return false; }
        return PROTEIN_RESNAMES.has(atom.resn);
    }

    addNonProteinAtomsToMol(mol: ParentMol): void {
        mol.startNewFrame();
        for (let atom of this.atoms) {
            if (!this.isProtein(atom)) {
                mol.addAtomToCurrentFrame(atom);
            }
        }
    }

    getCoords(): number[][] {
        return this.atoms.filter(a => !a.nonAtomLine).map(a => [a.x, a.y, a.z]);
    }

    getElements(): string[] {
        return this.atoms.filter(a => !a.nonAtomLine).map(a => a.elem);
    }

    hasHydrogens(): boolean {
        for (let atom of this.atoms) {
            if (atom.elem === "H") { return true; }
        }
        return false;
    }

    hasNonAtomLine(): boolean {
        for (let atom of this.atoms) {
            if (atom.nonAtomLine) {
                return true;
            }
        }
        return false;
    }

    numAtoms(): number {
        return this.atoms.filter(a => !a.nonAtomLine).length;
    }

    strideAtoms(stride: number): void {
        // TODO: Should not be in place.
        let curAtomIdx = 0;
        let origNumAtoms = this.atoms.length;
        let newAtoms: IAtom[] = [];
        while (curAtomIdx < origNumAtoms) {
            newAtoms.push(this.atoms[Math.floor(curAtomIdx)]);
            curAtomIdx += stride;
        }
        this.atoms = newAtoms;
    }

    keepOnlyProtein(): Frame {
        let frame = new Frame();
        frame.atoms = this.atoms.filter(a => this.isProtein(a));
        return frame;
    }

    updateCoords(coors: any) {
        if (this.hasNonAtomLine()) {
            console.log("Can't set coordinates because frame contains non-atom lines!");
        }
        
        for (let idx in coors) {
            let coor = coors[idx];
            let [x, y, z] = coor;
            this.atoms[idx].x = x;
            this.atoms[idx].y = y;
            this.atoms[idx].z = z;
        }
    }

    removeAltLocs(): void {
        let atomIdsSeen = new Set([]);
        this.atoms = this.atoms.filter((atom) => {
            if (atom.altLoc === " ") {
                // Must be marked with altLoc.
                return true;
            }
    
            let id = atom.resn;
            id += ":" + atom.resi;
            id += ":" + atom.chain;
            id += ":" + atom.atom;
            
            if (atomIdsSeen.has(id)) {
                // It's an altLoc! Already seen.
                return false;
            }

            atomIdsSeen.add(id);
            return true;
        });
    }
}