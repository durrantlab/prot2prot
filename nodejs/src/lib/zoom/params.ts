import { myParseFloat } from "../core/params/params_utils";

export function zoomExtraParams(commander, program) {
    program
    .addOption(
        new commander.Option(
            "-zmn, --zoom_min_dist <number>", 
            // "If `--animation` is `zoom`, the minimum distance."
            "The minimum distance of the zoom animation."
        )
        .default(50)
        .argParser(myParseFloat)
    )
    .addOption(
        new commander.Option(
            "-zmx, --zoom_max_dist <number>", 
            // "If `--animation` is `zoom`, the maxmimum distance."
            "The maxmimum distance of the zoom animation."
        )
        .default(300)
        .argParser(myParseFloat)
    )
}