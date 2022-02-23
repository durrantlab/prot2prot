// For node.js

import { IHooks } from './lib/core/hooks';
import { main } from './lib/core/main';
import { turnTableExtraParams } from './lib/turn_table/params';
import { turnTableGetRotationAngles } from './lib/turn_table/rots';

let hooks: IHooks = {
    extraParams: turnTableExtraParams,
    rotationAngles: turnTableGetRotationAngles,
    numFramesDefault: 24,
    description: "Renders a protein with the turn-table animation."
}

main(hooks);

