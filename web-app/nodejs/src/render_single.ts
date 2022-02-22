// For node.js

import { IHooks } from './lib/core/hooks';
import { main } from './lib/core/main';
import { singleGetRotationAngles } from './lib/single/rots';

let hooks: IHooks = {
    extraParams: undefined,
    rotationAngles: singleGetRotationAngles
}

main(hooks);

