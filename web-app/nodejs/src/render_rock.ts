// For node.js

import { IHooks } from './lib/core/hooks';
import { main } from './lib/core/main';
import { rockExtraParams } from './lib/rock/params';
import { rockGetRotationAngles } from './lib/rock/rots';

let hooks: IHooks = {
    extraParams: rockExtraParams,
    rotationAngles: rockGetRotationAngles
}

main(hooks);

