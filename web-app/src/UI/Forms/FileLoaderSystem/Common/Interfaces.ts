// This file is released under the Apache 2.0 License. See
// https://opensource.org/licenses/Apache-2.0 for full details. Copyright 2021
// Jacob D. Durrant.

import { ISelection, ParentMol } from "../Mols/ParentMol";

export interface IVueXVar {
    name: string;
    val: any;
}

export interface IConvert extends IFileInfo {
    onConvertDone: Function;  // Must return IFileInfo
    onConvertCancel: Function;
}

export interface IFileInfo {
    filename: string;
    mol: ParentMol;
    // onConvertDone: IConvert;
    // convertedResolveFunc?: Function;
    // convertedRejectFunc?: Function;
    // id?: string;  // associated component id
}

export interface IFileLoadError {
    title: string;
    body: string;
}

// export interface IFileFromTextField {
//     placeholder: string;
//     tabName: string;
//     loadFunc: Function
//     onSuccess: Function;
//     onError: Function;
// }

export interface IAllFiles {
    selectedFilename: string;
    allFiles: {[key: string]: string};  // filename => contents
}

export interface IExtractInfo {
    selection: ISelection[],
    pdbLines: string,
    origFilename: string,
    suggestedNewFilename: string
}

export function iSelectionToStr(sel: ISelection): string {
    if (sel["chains"] && !sel["resnames"] && !sel["resids"]) {
        // Only has chain.
        return "Chain: " + sel["chains"];
    }
    
    let prts = [];
    if (sel["resnames"]) { prts.push(sel["resnames"]); }
    if (sel["resids"]) { prts.push(sel["resids"]); }
    if (sel["chains"]) { prts.push(sel["chains"]); }
    return prts.join(":");
}