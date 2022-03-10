// For node.js

import { IHooks } from './lib/core/hooks';
import { main } from './lib/core/main';
import { stillGetRotationAngles } from './lib/still/rots';

let hooks: IHooks = {
    extraParams: undefined,
    rotationAngles: stillGetRotationAngles,
    numFramesDefault: 1,
    description: "Renders a protein without any animated rotations or zooming."
}

main(hooks);
