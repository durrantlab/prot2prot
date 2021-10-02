import { resizeCanvas } from "../../../Pix2Pix/InputImage/ImageDataHelper";
import { updateRotMat } from "../../../Pix2Pix/InputImage/MakeImage";

export let protCanvasTemplate = /*html*/ `
    <canvas
        ref="viewCanvas"
        style="width:256px;height:256px;margin-left:auto;margin-right:auto;display:block;"
        @mousedown="onCanvasMouseDown"
        @mouseup="onCanvasMouseUp"
        @mousemove="onCanvasMouseMove"
        @wheel.prevent="onCanvasWheel"
        ></canvas>
    `;
    // @mouseleave="onCanvasMouseUp"

export let protCanvasWatchFunctions = {
    "selectedDimensions"(newSize: number, oldSize: number): void {
        resizeCanvas(this.$refs["viewCanvas"], newSize);
        this["drawImg"]();
    }
}

export let protCanvasComputedFunctions = {
    "selectedDimensions": {
        get(): number {
            return parseInt(this.$store.state.selectedDimensions);
        }
    }
}

export let protCanvasMethodsFunctions = {
    preModeSelectedTmpToFast(): void {
        if (this.mouseStateChanging === false) {
            // Changing for first time. Set it to fast.
            this.preModeSelectedBeforeMouseChange = this["preModeSelected"];
            this["preModeSelected"] = "fast";
        }

        this.mouseStateChanging = true;

        clearTimeout(this.doneMouseStateChangeTimeoutId);
        this.doneMouseStateChangeTimeoutId = setTimeout(() => {
            // If it gets here, mouse state no longer changing.
            this["preModeSelected"] = this.preModeSelectedBeforeMouseChange;
            this["drawImg"]();
            this.mouseStateChanging = false;
        }, 500);
    },
    enoughTimePassed(): boolean {
        // Ignore if not much time has passed
        let now = new Date().getTime();
        if (now - this.lastMouseMoveCheck < 100) { return false; }
        this.lastMouseMoveCheck = now;
        return true;
    },
    "onCanvasMouseDown"(e: MouseEvent) {
        this.buttonDown = true;
        this.lastCanvasX = e.offsetX - 128;
        this.lastCanvasY = e.offsetY - 128;
    },
    "onCanvasMouseUp"(e: MouseEvent) {
        this.buttonDown = false;
    },
    "onCanvasMouseMove"(e: MouseEvent) {
        // Ignore if mouse not down
        if (!this.buttonDown) { return; }
        
        // Ignore if not much time has passed
        if (!this.enoughTimePassed()) { return; }

        this.preModeSelectedTmpToFast();

        // Get the vector
        let x = e.offsetX - 128;
        let y = e.offsetY - 128;
        
        if (this.lastCanvasX !== undefined) {
            let deltaX = x - this.lastCanvasX;
            let deltaY = y - this.lastCanvasY;
            let len = Math.sqrt(deltaX**2 + deltaY**2)
            if (len === 0) { return; }

            let axis = [-deltaY / len, deltaX / len, 0];
            this["tilt"](axis, -len);
        }

        this.lastCanvasX = x;
        this.lastCanvasY = y;
    },
    "onCanvasWheel"(e: WheelEvent) {
        // Ignore if not much time has passed
        if (!this.enoughTimePassed()) { return; }
    
        this.preModeSelectedTmpToFast();

        this["protDist"] = this["protDist"] + e.deltaY;
        this["offset"]();

        // clearTimeout(this.doneMouseStateChangeTimeoutId);
        // this.doneMouseStateChangeTimeoutId = setTimeout(() => {
        //     this.wheelScrolling = false;
        //     this.restorePreModeSelected();
        // }, 500);
    }
}

export let protCanvasData = {
    buttonDown: false,
    lastCanvasX: undefined,
    lastCanvasY: undefined,
    lastMouseMoveCheck: 0,
    preModeSelectedBeforeMouseChange: "fast",
    mouseStateChanging: false,
    doneMouseStateChangeTimeoutId: undefined
}