import { parseUnits } from "../utils";

interface ExtendedWindow extends Window {
    HTMLInputElement: HTMLInputElement
}
interface FigmaToHtmlContext { 
    window: ExtendedWindow;
    document: Document
}

export const context: FigmaToHtmlContext = { 
    // @ts-expect-error
    window,
    document
};

export const setContext = (window: Window) => {
    context.document = window.document;
    // @ts-expect-error
    context.window = window;
};

export const replaceSvgFill = (svg: string, fillColor: string) => {
    const endTagIndex = svg.indexOf('>');
    if (endTagIndex === -1) {
        return svg;
    }

    let mainTag = svg.slice(1, endTagIndex);

    if (/fill=(['"]).*?\1/.test(mainTag)) {
        mainTag = mainTag.replace(/fill=(['"]).*?\1/, `fill="${fillColor}"`);
    } else {
        mainTag = `${mainTag} fill="${fillColor}"`;
    }

    return `<${mainTag}>${svg.slice(endTagIndex + 1)}`;
}