import { animParams } from "../core/params/anim_params";

export function turnTableExtraParams(commander, program) {
    program
    .addOption(
        new commander.Option(
            "-ttax, --turn_table_axis <axis>", 
            // "If `--animation` is `turn_table`, the axis of rotation."
            "The rotation axis of the turn-table animation."
        )
        .choices(["x", "y", "z"])
        .default("y")
    )

    animParams(commander, program);
}