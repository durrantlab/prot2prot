import pkg from './canvas/index.js';
const { createCanvas } = pkg;

import fs from 'fs';
import * as path from 'path'
import * as child_process from 'child_process';
import * as make_img from './make_img.js';

let node_params = {
    createCanvas: createCanvas,
    fs: fs,
    abspath: path.resolve,
    execSync: child_process.execSync
}

let args = process.argv.slice(2);

let pdb = args[0];

const data = fs.readFileSync(pdb,
            {encoding:'utf8', flag:'r'});

make_img.main(node_params, data)
