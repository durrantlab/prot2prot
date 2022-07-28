export interface IURLParams {
    cpu: boolean;
    size: number;
}

export var URL_PARAMS: IURLParams;

/**
 * Sets the URL parameters to globally accessible URL_PARAMS.
 * @returns void
 */
export function getUrlParams(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let cpu = (urlParams.get("cpu") !== null);

    let size: string | number | null | undefined = urlParams.get("size");
    if (size === null) {
        size = undefined;
    } else {
        size = parseInt(size);
        if ([256, 512, 1024].indexOf(size) === -1) {
            size = 256;
        }
    }

    if ((size === undefined) && cpu) {
        // If CPU and size not specified, make smallest size default (faster).
        size = 256;
    }

    // If there's no support for OffscreenCanvas, you're not going to be able to
    // use the GPU (e.g., Firefox). So set size to lowest value.
    var canvasTest = document.createElement('canvas');
    let offscreenCanvasSupport = (typeof canvasTest.transferControlToOffscreen === "function");
    if (!offscreenCanvasSupport) {
        size = 256;
    }
    
    URL_PARAMS = {
        cpu: cpu,
        size: size
    } as IURLParams
}