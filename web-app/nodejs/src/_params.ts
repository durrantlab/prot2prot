const fs = require("fs");
var path = require('path')

// @ts-ignore
const commander = require('commander');

function myParseInt(value, _) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new commander.InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

function myParseFloat(value, _) {
    const parsedValue = parseFloat(value);
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

export function getParameters() {

    // Get the parameters
    const program = new commander.Command();
    // program.version('0.0.1');
    program
        .addOption(
            new commander.Option(
                "-p, --pdb <path>",
                "The file path of the input PDB file."
            )
            .argParser(myFilePathExists)
            .makeOptionMandatory()
        )
        .addOption(
            new commander.Option(
                "-o, --out <path>", 
                "The file path where the output PNG file should be saved."
            )
            .argParser(myFileCanWrite)
            .makeOptionMandatory()
        )
        .addOption(
            new commander.Option(
                "-m, --mode <path>",
                "The type of output. If `intermediate`, outputs the intermediate image that is fed into the neural network. If `render`, outputs the image that the neural network renders. If `both`, outputs both images."
            )
            .choices(["intermediate", "render", "both"])
            .default("render")
        )
        .addOption(
            new commander.Option(
                "-mjs, --model_js <path>",
                "If `--mode` is `render` or `both`, the file path were `model.json` is located."
            )
            .argParser(myFilePathExists)
            .default("models/simple_surf/1024/uint8/model.json")  // TODO:
            // .makeOptionMandatory()
        )
        .addOption(
            new commander.Option(
                '-r, --reso <number>', 
                "If `--mode` is `intermediate`, the resolution (size) of the intermediate image, in pixels."
            )
            .choices(["256", "512", "1024"])
            .default("1024")
        )
        .addOption(
            new commander.Option(
                "-xr, --x_rot <number>", 
                "The rotation around the x axis."
            )
            .default(0)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-yr, --y_rot <number>", 
                "The rotation around the y axis."
            )
            .default(0)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-zr, --z_rot <number>", 
                "The rotation around the z axis."
            )
            .default(0)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-d, --dist <number>", 
                "The distance from the camera."
            )
            .default(150)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-dbg, --debug", 
                "Whether to save additional intermediate files for debugging."
            )
            .default(false)
        )
        .addOption(
            new commander.Option(
                "-a, --animation <name>", 
                "Render multiple images to create an animation."
            )
            .choices(["turn_table", "rock", "zoom", "none"])
            .default("none")
        )
        .addOption(
            new commander.Option(
                "-ttax, --turn_table_axis <axis>", 
                "If `--animation` is `turn_table`, the axis of rotation."
            )
            .choices(["x", "y", "z"])
            .default("y")
        )
        .addOption(
            new commander.Option(
                "-rkm, --rock_mag <number>", 
                "If `--animation` is `rock_mag`, the magnitude of the animation."
            )
            .default(20)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-zmn, --zoom_min_dist <number>", 
                "If `--animation` is `zoom`, the minimum distance."
            )
            .default(50)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-zmx, --zoom_max_dist <number>", 
                "If `--animation` is `zoom`, the maxmimum distance."
            )
            .default(300)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-f, --frames <number>",
                "If `--animation` is not `none, the number of frames to render."
            )
            .default(24)
            .argParser(myParseInt)
        )

    program.parse(process.argv);
    const options = program.opts();
    
    // Convert some to numbers as needed
    options.reso = parseInt(options.reso);

    // Clean up the parameters a bit.
    let notUsed = "-- NOT USED --";
    if (options.animation !== "zoom") {
        options.zoom_min_dist = notUsed;
        options.zoom_max_dist = notUsed;
    }
    if (options.animation !== "rock") {
        options.rock_mag = notUsed;
    }
    if (options.animation !== "turn_table") {
        options.turn_table_axis = notUsed;
    }
    if (options.animation === "none") {
        options.frames = notUsed;
    }
    if (options.mode !== "intermediate") {
        options.reso = notUsed;
    }
    if (options.mode === "intermediate") {
        options.model_js = notUsed;
    }

    // You might need to get the resolution from the model.json file,
    // because you're going to be rendering.
    if (options.mode !== "intermediate") {
        let modeljs = JSON.parse(fs.readFileSync(options.model_js).toString());
        options.reso = parseInt(modeljs["signature"]["inputs"]["input.1"]["tensorShape"]["dim"][2]["size"]);
    }

    console.log(options);

    return options;
}
