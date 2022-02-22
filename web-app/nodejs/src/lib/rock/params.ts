import { animParams } from "../core/params/anim_params";
import { myParseFloat } from "../core/params/params_utils";

export function rockExtraParams(commander, program) {
    program
    .addOption(
        new commander.Option(
            "-rkm, --rock_mag <number>", 
            // "If `--animation` is `rock_mag`, the magnitude of the animation."
            "The magnitude of the rock animation."
        )
        .default(20)
        .argParser(myParseFloat)
    )

    animParams(commander, program);
}