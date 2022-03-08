// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

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
    /**
     * When the user-specified size of the canvas changes, the canvas is resized
     * and the pre-mode is set to fast.
     * @param {number} newSize  The new size of the canvas
     * @param {number} oldSize  The size of the canvas before the resize
     */
    "selectedDimensions"(newSize: number, oldSize: number): void {
        resizeCanvas(this.$refs["viewCanvas"], newSize);
        this["preModeSelected"] = "fast";
        this["drawImg"]();
    },

    /**
     * When the user selects a new neural renderer, update preModeSelected to
     * "fast" mode and draw the image.
     * @param {number} newNeuralRenderer  The new size of the image
     * @param {number} oldNeuralRenderer  The size of the image before the user
     *                                    changed the size.
     */
    "selectedNeuralRenderer"(newNeuralRenderer: number, oldNeuralRenderer: number): void {
        this["preModeSelected"] = "fast";
        this["drawImg"]();
    },

    /**
     * When the user selects a new quality, update preModeSelected to "fast"
     * mode and draw the image.
     * @param {number} newQuality  The new size of the image
     * @param {number} oldQuality  The size of the image before the user changed
     *                             the size.
     */
    "selectedQuality"(newQuality: number, oldQuality: number): void {
        this["preModeSelected"] = "fast";
        this["drawImg"]();
    }
}

export let protCanvasComputedFunctions = {
    /* Gets the selected neural renderer. */
    "selectedNeuralRenderer": {
        get(): number {
            return parseInt(this.$store.state["selectedNeuralRenderer"]);
        }
    },

    /* Gets the selected image dimensions. */
    "selectedDimensions": {
        get(): number {
            return parseInt(this.$store.state["selectedDimensions"]);
        }
    },

    /* Gets the selected quality. */
    "selectedQuality": {
        get(): number {
            return parseInt(this.$store.state["selectedQuality"]);
        }
    },


    /**
     * Get a string that is the CSS style for the canvas element.*
     * @returns {string}  The style string to use on the canvas.
     */
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
    /**
     * If the mouse state is changing, set the preModeSelected to fast
     */
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

    /**
     * If it's been less than 100 milliseconds since the last mouse move, return
     * false. Otherwise, return true.
     * @returns {boolean}  Whether enough time has passed since last mouse move.
     */
    enoughTimePassed(): boolean {
        // Ignore if not much time has passed
        let now = new Date().getTime();
        if (now - this.lastMouseMoveCheck < 100) { return false; }
        this.lastMouseMoveCheck = now;
        return true;
    },

    /**
     * When the user clicks on the canvas, the buttonDown variable is set to
     * true, and the lastCanvasX and lastCanvasY variables are set to the
     * mouse's x and y coordinates
     * @param {MouseEvent} e  The mouse event.
     */
    "onCanvasMouseDown"(e: MouseEvent) {
        this.buttonDown = true;
        this.lastCanvasX = e.offsetX - 128;
        this.lastCanvasY = e.offsetY - 128;
    },

    /**
     * When the mouse button is released, the buttonDown flag is set to false,
     * etc.
     * @param {MouseEvent} e  The mouse event.
     */
    "onCanvasMouseUp"(e: MouseEvent) {
        this.buttonDown = false;
        this.previousPinchDistance = undefined;
    },

    /**
     * If the mouse is down, and enough time has passed, then rotate the protein
     * @param {MouseEvent | TouchEvent} e  The mouse or touch event.
     */
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

    /**
     * Rotates the protein.
     * @param {number} offsetX  The x-coordinate of the mouse pointer.
     * @param {number} offsetY  the y-coordinate of the mouse pointer.
     */
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

    /**
     * Zoom in and out per mouse wheel.
     * @param {WheelEvent} e The wheel event.
     */
    "onCanvasWheel"(e: WheelEvent): void {
        // Ignore if not much time has passed
        if (!this.enoughTimePassed()) { return; }

        this.zoom(e.deltaY);
        this.previousPinchDistance = undefined;
    },

    /**
     * Zoom in or out.
     * @param {number} delta  The amount to zoom.
     */
    zoom(delta: number): void {
        this.preModeSelectedTmpToFast();

        this["protDist"] = this["protDist"] + delta;
        this["offset"]();
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