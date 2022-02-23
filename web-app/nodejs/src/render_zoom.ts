// For node.js

import { IHooks } from './lib/core/hooks';
import { main } from './lib/core/main';
import { zoomExtraParams } from './lib/zoom/params';
import { zoomGetRotationAngles } from './lib/zoom/rots';

let hooks: IHooks = {
    extraParams: zoomExtraParams,
    rotationAngles: zoomGetRotationAngles,
    numFramesDefault: 24,
    description: "Renders a protein with the zoom-in-and-out animation."
}

main(hooks);

