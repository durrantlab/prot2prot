const fs = require("fs");
var path = require('path')

let commander;

export function setCommanderInParamUtils(commdr): void {
    commander = commdr;
}

export function myParseInt(value, _) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new commander.InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

export function myParseFloat(value, _) {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
        throw new commander.InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

export function myFilePathExists(value, _) {
    if (!fs.existsSync(value)) {
        throw new commander.InvalidArgumentError('File does not exist.');
    }
    if (!fs.lstatSync(value).isFile()) {
        throw new commander.InvalidArgumentError('Path points to a directory, not a file.');
    }
    return value;
}

export function myFileCanWrite(value, _) {
    // Make sure file doesn't already exist
    if (fs.existsSync(value)) {
        throw new commander.InvalidArgumentError('File already exists.');
    }

    // Make sure file ends in png.
    if (path.extname(value).toLowerCase() !== ".png") {
        throw new commander.InvalidArgumentError('File name must end in `.png`.');
    }

    // Try writing a file. To make sure path accessible.
    try {
        fs.writeFileSync(value + ".tmp", "");
        fs.unlinkSync(value + ".tmp");
    } catch {
        throw new commander.InvalidArgumentError('Cannot save file at this path.');
    }
    return value;
}

export function commaSeparatedList(value, _) {
    return value.split(',');
}