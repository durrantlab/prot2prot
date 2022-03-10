import { IHooks } from "../hooks";
import { myFileCanWrite, myFilePathExists, myParseFloat, myParseInt, setCommanderInParamUtils } from "./params_utils";

const fs = require("fs");

// @ts-ignore
const commander = require('commander');

export function getParameters(hooks: IHooks): any {
    setCommanderInParamUtils(commander);

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
            .default("prot2prot_models/simple_surf/1024/uint8/model.json")  // TODO:
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
                "The distance from the camera. If 9999, the distance is unchanged from the PDB."
            )
            .default(150)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-rs, --radius_scale <number>", 
                "The relative size of the atoms."
            )
            .default(undefined)  // 1.0)
            .argParser(myParseFloat)
            .hideHelp()
        )
        .addOption(
            new commander.Option(
                "-an, --atom_names <number>", 
                "A common separated list containins the names of the atoms you want to keep."
            )
            .default(undefined)
            .hideHelp()
            // .argParser(commaSeparatedList)
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
                "-c, --color <hex>", 
                "The color tint to apply to the protein. A HEX value, like FF0000."
            )
            .default(undefined)
        )
        .addOption(
            new commander.Option(
                "-cs, --color_strength <number>", 
                "The strength of the protein coloring, ranging from 0.0 to 1.0."
            )
            .default(0.5)
            .argParser(myParseFloat)
        )
        .addOption(
            new commander.Option(
                "-cb, --color_blend <number>", 
                "The strength of the protein-coloring blending."
            )
            .default(8)
            .argParser(myParseInt)
        )
        .addOption(
            new commander.Option(
                "-f, --frames <number>",
                "The number of frames to render."
            )
            .default(hooks.numFramesDefault)
            .argParser(myParseInt)
        )

    if (hooks.extraParams) {
        hooks.extraParams(commander, program);
    }

    program.parse(process.argv);
    const options = program.opts();
    
    // Convert some to numbers as needed
    options.reso = parseInt(options.reso);

    // Clean up the parameters a bit.
    let notUsed = "-- NOT USED --";
    // if (options.animation !== "zoom") {
    //     options.zoom_min_dist = notUsed;
    //     options.zoom_max_dist = notUsed;
    // }
    // if (options.animation !== "rock") {
    //     options.rock_mag = notUsed;
    // }
    // if (options.animation !== "turn_table") {
    //     options.turn_table_axis = notUsed;
    // }
    // if (options.animation === "none") {
    //     options.frames = notUsed;
    // }
    if (options.mode !== "intermediate") {
        options.reso = notUsed;
    }
    if (options.mode === "intermediate") {
        options.model_js = notUsed;
    }

    // You might need to get the resolution from the model.json file, because
    // you're going to be rendering.
    if (options.mode !== "intermediate") {
        let modeljs = JSON.parse(fs.readFileSync(options.model_js).toString());
        options.reso = parseInt(modeljs["signature"]["inputs"]["input.1"]["tensorShape"]["dim"][2]["size"]);
    }

    return options;
}
