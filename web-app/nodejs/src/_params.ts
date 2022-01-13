const fs = require("fs");
var path = require('path')

// @ts-ignore
const commander = require('commander');

export function getParameters() {
    function myParseInt(value, _) {
        // parseInt takes a string and a radix
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new commander.InvalidArgumentError('Not a number.');
        }
        return parsedValue;
    }

    function myFilePathExists(value, _) {
        if (!fs.existsSync(value)) {
            throw new commander.InvalidArgumentError('File does not exist.');
        }
        if (!fs.lstatSync(value).isFile()) {
            throw new commander.InvalidArgumentError('Path points to a directory, not a file.');
        }
        return value;
    }

    function myFileCanWrite(value, _) {
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

    // Get the parameters
    const program = new commander.Command();
    // program.version('0.0.1');
    program
        .addOption(
            new commander.Option("-p, --pdb <path>", "The file path of the input PDB file.")
            .argParser(myFilePathExists)
            .makeOptionMandatory()
        )
        .addOption(
            new commander.Option("-o, --out <path>", "The file path where the output PNG file should be saved.")
            .argParser(myFileCanWrite)
            .makeOptionMandatory()
        )
        .addOption(
            new commander.Option('-r, --reso <number>', "The resolution (size) of the output image, in pixels.")
            .choices(["256", "512", "1024"])
            .default("1024")
        )
        .addOption(
            new commander.Option("-x, --x_rot <number>", "The rotation around the x axis.")
            .default(0)
            .argParser(myParseInt)
        )
        .addOption(
            new commander.Option("-y, --y_rot <number>", "The rotation around the y axis.")
            .default(0)
            .argParser(myParseInt)
        )
        .addOption(
            new commander.Option("-z, --z_rot <number>", "The rotation around the z axis.")
            .default(0)
            .argParser(myParseInt)
        )
        .addOption(
            new commander.Option("-d, --dist <number>", "The distance from the camera.")
            .default(150)
            .argParser(myParseInt)
        )
        .addOption(
            new commander.Option("-g, --debug", "Whether to save additional intermediate files for debugging.")
            .default(false)
        )
        .addOption(
            new commander.Option("-i, --intermediate", "Whether to save the intermediate PNG file that serves as input into the neural network.")
            .default(false)
        )
        .addOption(
            new commander.Option("-t, --turn_table", "Whether to render multiple images to create a turn-table animation.")
            .default(false)
        )

    program.parse(process.argv);
    const options = program.opts();
    
    // Convert some to numbers as needed
    options.reso = parseInt(options.reso);
    
    console.log(options);

    return options;
}
