// import localforage from "localforage";

import { IFileInfo } from "../Common/Interfaces";
import { ParentMol } from "../Mols/ParentMol";

let localforage: any;

// export const enum QueueStatus {
//     // Note: const enum needed for closure-compiler compatibility.
//     MULTPLE_ENTRIES = 1,
//     ONE_ENTRY_LEFT = 2,
//     EMPTY = 3,
//     ERROR = 4
// }

let delim = "-::-:-";
let outputPrefix = "OUTPUTOUTPUT"

function getLocalForage(): Promise<any> {
    return import(
        /* webpackChunkName: "localforage" */
        /* webpackMode: "lazy" */
        "localforage"
    )
    .then((mod: any) => {
        localforage = mod;
        return Promise.resolve();
    });

}

function getKeys(id: string): Promise<any> {
    return getLocalForage()
    .then(() => {
        return localforage.keys()
    })
    .then((keys: string[]) => {
        keys = keys.filter(k => k.startsWith(id + delim));
        return Promise.resolve(keys);
    });
}

export function clearAllLocalForage(id: string): Promise<any> {
    return getLocalForage()
    .then(() => { return getKeys(id); })
    .then((keys: string[]) => {
        let removePromises = keys.map(k => localforage.removeItem(k));
        return Promise.all(removePromises);
    });
}

export function filesObjToLocalForage(id: string, files: any): Promise<any> {
    return getLocalForage()
    .then(() => { return clearAllLocalForage(id); })
    .then(() => {
        let setPromises = Object.keys(files).map(k => localforage.setItem(id + delim + k, files[k]));
        return Promise.all(setPromises);
    })
}

function getQueueKeysPerId(ids: string[]): Promise<string[][]> {
    // Gets the status of the queue, but doesn't change the queue.
    let getKeysPromises = ids.map(id => getKeys(id));
    return Promise.all(getKeysPromises)
    .then((keysPerId: string[][]) => {
        return Promise.resolve(keysPerId);
    });
}

export function numLeftInQueue(ids: string[]): Promise<number> {
    // Gets the status of the queue, but doesn't change the queue.
    return getQueueKeysPerId(ids)
    .then((keysPerId: string[][]) => {
        let numEntriesPerId = keysPerId.map(p => p.length);

        // Check if there are no keys for any id (empty queue).
        let sumNumKeys = numEntriesPerId.reduce((p, c) => p + c);
        if (sumNumKeys === 0) {
            return Promise.resolve(0);
        }

        // Is there any id with not associated items? That must be due to an
        // error, but let's just return 0 (silent error).
        for (let numEntries of numEntriesPerId) {
            if (numEntries === 0) {
                return Promise.resolve(0);
            }
        }

        // So return the maximum size of any entry.
        return Promise.resolve(Math.max(...numEntriesPerId));
    });
}

function getContents(ids: string[]): Promise<ParentMol[]> {
    // Each one contains only one element.
    let contentsPromises: Promise<ParentMol>[] = ids.map(
        id => localforage.getItem(id)
    );
    return Promise.all(contentsPromises);
}

export function popQueue(ids: string[]): Promise<IFileInfo[]> {
    return getLocalForage()
    .then(() => { return numLeftInQueue(ids); })
    .then((numItems: number): Promise<IFileInfo[]> => {
        let onlyOneOfEach: boolean;
        switch (numItems) {
            // case QueueStatus.ERROR:
            //     console.warn("One is empty, but other's aren't!", ids)
            //     return Promise.resolve(ids.map(id => ""));
            case 0:
                let emptyFiles = ids.map((id) => {
                    return {filename: "", mol: undefined} as IFileInfo
                });
                return Promise.resolve(emptyFiles);
            case 1:
                onlyOneOfEach = true;
                break;
            default:
                onlyOneOfEach = false;
                break;
        }

        return getQueueKeysPerId(ids)
        .then((keysPerId: string[][]) => {
            let infosPerId: any[] = keysPerId.map(p => {
                return {
                    num: p.length,
                    firstKey: p[0]
                }
            });

            // Each one contains only one element.
            let keys = infosPerId.map(info => info.firstKey);
            return getContents(keys)
            .then((mols: ParentMol[]) => {
                keys = keys.map(k => k.split(delim)[1])
                let files: IFileInfo[] = mols.map((c, i) => {
                    return {
                        filename: keys[i],
                        mol: c
                    } as IFileInfo;
                });

                let removeItemsPromise: Promise<any>[] = [];
                if (onlyOneOfEach) {
                    // There's only one item assocaited with each id, so remove
                    // everything.
                    ids.forEach(id => clearAllLocalForage(id));
                } else {
                    // One of them contains more than one element. Only remove
                    // from the one(s) with more than 1.
                    infosPerId.forEach(infoPerId => {
                        if (infoPerId.num > 1) {
                            removeItemsPromise.push(
                                localforage.removeItem(infoPerId.firstKey)
                            );
                        }
                    })
                }

                return Promise.all(removeItemsPromise)
                .then((): Promise<IFileInfo[]> => {
                    return Promise.resolve(files);
                });
            });
        });
    });
}

function generateZIPDownload(files: any, zipFilename: string = "output.zip") {
    let jsZipPromise = import(
        /* webpackChunkName: "JSZip" */ 
        /* webpackMode: "lazy" */
        'jszip'
    ).then((mod) => {
        // @ts-ignore
        return Promise.resolve(mod.default);
    });

    let fileSaverPromise = import(
        /* webpackChunkName: "FileSaver" */ 
        /* webpackMode: "lazy" */
        "file-saver"
    )
    .then((mod) => {
        return Promise.resolve(mod.default);
    });

    Promise.all([jsZipPromise, fileSaverPromise])
    .then((payload) => {
        let [JSZip, FileSaver] = payload;

        var zip = new JSZip();
        
        for (let id1 in files) {
            let content1 = files[id1];
            if (typeof(content1) === "string") {
                zip["file"](id1, content1);
            } else {
                // it's a folder
                for (let id2 in files[id1]) {
                    let content2 = files[id1][id2];
                    zip["folder"](id1)["file"](id2, content2);
                }
            }
        }

        return zip["generateAsync"]({["type"]:"blob"}).then(
            function (blob) {
                FileSaver["saveAs"](blob, zipFilename);
            }
        );
    });

}

// export function activeQueue(val: boolean = undefined): Promise<any> {
//     return (val !== undefined)
//         ? localforage.setItem("activeQueue", val)  // set
//         : localforage.getItem("activeQueue");      // get
// }

export function endQueueAndDownloadFilesIfAvailable(zipFilename = "output.zip"): Promise<any> {
    // return activeQueue(false) 
    return getLocalForage()
    .then(() => { return getKeys(outputPrefix); })
    .then((ids: string[]) => {
        if (ids.length > 0) {
            // There are files to download.
            return getContents(ids)
            .then((mols: ParentMol[]) => {
                let files = {};
                ids.forEach((id: string, idx: number) => {
                    let [dirname, filename] = id.split(delim).slice(1);
                    if (dirname !== "") {
                        // There is a directory.

                        files[dirname] = (!files[dirname]) 
                            ? {} 
                            : files[dirname];
                        files[dirname][filename] = mols[idx];
                    } else {
                        // Just a file,.
                        files[filename] = mols[idx];
                    }
                });
                return generateZIPDownload(files, zipFilename);
            })
        }
        // Nothing to download
        return Promise.resolve();
    })
    .then(() => {
        return localforage.clear();
    });
}

export function saveOutputToLocalForage(filename: string, content: string, dirname: string = ""): Promise<any> {
    let key = [outputPrefix, dirname, filename].join(delim);
    return getLocalForage()
    .then(() => { 
        return localforage.setItem(key, content); 
    })
}


export function saveMetaToLocalForage(content: any): Promise<any> {
    return getLocalForage()
    .then(() => { 
        return localforage.setItem("meta", content); 
    })
}

export function loadMetaFromLocalForage(): Promise<any> {
    return localforage.getItem("meta");
}