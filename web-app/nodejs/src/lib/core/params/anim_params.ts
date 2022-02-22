// Parameters common to all animation modes

import { myParseInt } from "./params_utils";

export function animParams(commander, program) {
    program
    .addOption(
        new commander.Option(
            "-f, --frames <number>",
            "The number of animation frames to render."
        )
        .default(24)
        .argParser(myParseInt)
    )
}
