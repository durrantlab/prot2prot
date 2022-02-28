import { resizeCanvas } from "../../../Pix2Pix/InputImage/ImageDataHelper";

export let protCanvasTemplate = /*html*/ `
    <canvas
        ref="viewCanvas"
        :style="canvasStyle"

        @mousedown="onCanvasMouseDown"
        @touchstart="onCanvasMouseDown"
        
        @mouseup="onCanvasMouseUp"
        @touchend="onCanvasMouseUp"
        @mouseleave="onCanvasMouseUp"
        
        @touchmove="onCanvasMouseMove"
        @mousemove="onCanvasMouseMove"

        @wheel.prevent="onCanvasWheel"
    ></canvas>
    `;

export let protCanvasWatchFunctions = {
    "selectedDimensions"(newSize: number, oldSize: number): void {
        resizeCanvas(this.$refs["viewCanvas"], newSize);
        this["preModeSelected"] = "fast";
        this["drawImg"]();
    },
    "selectedNeuralRenderer"(newSize: number, oldSize: number): void {
        this["preModeSelected"] = "fast";
        this["drawImg"]();
    },
    "selectedQuality"(newSize: number, oldSize: number): void {
        this["preModeSelected"] = "fast";
        this["drawImg"]();
    }
}

export let protCanvasComputedFunctions = {
    "selectedNeuralRenderer": {
        get(): number {
            return parseInt(this.$store.state["selectedNeuralRenderer"]);
        }
    },
    "selectedDimensions": {
        get(): number {
            return parseInt(this.$store.state["selectedDimensions"]);
        }
    },
    "selectedQuality": {
        get(): number {
            return parseInt(this.$store.state["selectedQuality"]);
        }
    },
    "canvasStyle"(): string {
        let dimen = this.$store.state["selectedDimensions"];
        let style = `width:${dimen}px;aspect-ratio: 1/1;`;
        style += "margin-left:auto;margin-right:auto;display:block;";
        style += "border:#e5e5e5 1px solid;";
        style += `cursor:${this["mouseStateChanging"] ? "grabbing;" : "grab;"}`;
        style += "max-width:100%; touch-action:none;"
        return style;
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
        this.previousPinchDistance = undefined;
    },
    "onCanvasMouseMove"(e: MouseEvent | TouchEvent) {
        // Ignore if mouse not down
        if (!this.buttonDown) { return; }
        
        // Ignore if not much time has passed
        if (!this.enoughTimePassed()) { return; }

        let offsetX: number;
        let offsetY: number;

        // @ts-ignore
        if (e.touches) {
            let e2 = e as TouchEvent;

            if (e2.touches.length === 1) {
                // Just a single touch, so rotate.
                // @ts-ignore
                var rect = e2.target.getBoundingClientRect();
                offsetX = e2.targetTouches[0].clientX - rect.left;
                offsetY = e2.targetTouches[0].clientY - rect.top;
    
                this.rotateProtein(offsetX, offsetY);
            } else if (e2.touches.length > 1) {
                // Two touches, so pinch/zoom. Fun fact: this code written with
                // help from codex.

                // Consider the first two entries in the touches array.
                var touches = e2.touches;
                var firstTouch = touches[0];
                var secondTouch = touches[1];

                // Calculate the distance between the two.
                var distance = Math.sqrt(
                    Math.pow(secondTouch.clientX - firstTouch.clientX, 2) 
                    + Math.pow(secondTouch.clientY - firstTouch.clientY, 2)
                );

                if (this.previousPinchDistance === undefined) {
                    // On first time, can't do anything more but record
                    // calculated distance.
                    this.previousPinchDistance = distance;
                    return;
                }

                this.zoom(this.previousPinchDistance - distance);
                
                this.previousPinchDistance = distance;
            }
        } else {
            // @ts-ignore
            offsetX = e.offsetX;

            // @ts-ignore
            offsetY = e.offsetY;

            this.rotateProtein(offsetX, offsetY);
        }

    },

    rotateProtein(offsetX: number, offsetY: number): void {
        this.preModeSelectedTmpToFast();

        // Get the vector
        let x = offsetX - 128;
        let y = offsetY - 128;
        
        if ((this.lastCanvasX !== undefined) && !isNaN(this.lastCanvasX)) {
            let deltaX = x - this.lastCanvasX;
            let deltaY = y - this.lastCanvasY;
            let len = Math.sqrt(deltaX**2 + deltaY**2)
            if (len === 0) { return; }

            let axis = [-deltaY / len, deltaX / len, 0];
            this["tilt"](axis, -len);
        }

        this.lastCanvasX = x;
        this.lastCanvasY = y;
        this.previousPinchDistance = undefined;
    },

    "onCanvasWheel"(e: WheelEvent) {
        // Ignore if not much time has passed
        if (!this.enoughTimePassed()) { return; }

        this.zoom(e.deltaY);
        this.previousPinchDistance = undefined;
    },

    zoom(delta: number): void {
        this.preModeSelectedTmpToFast();

        this["protDist"] = this["protDist"] + delta;
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
    doneMouseStateChangeTimeoutId: undefined,
    previousPinchDistance: undefined
}