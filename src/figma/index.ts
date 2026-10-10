import { LayerNode, PlainLayerNode } from '../types';
import { traverse, traverseAsync } from '../utils';
import { processLayer } from './processLayer';
import { setDefaultFont } from './getFont';

interface LayerCbArgs {
    node: SceneNode;
    layer: LayerNode;
    parent: LayerNode | null;
}

export interface AddLayersOptions {
    onLayerProcess?: (args: LayerCbArgs) => void;
    /** Fallback font when no family matches (default: Roboto Regular). */
    defaultFont?: FontName;
}

export async function addLayersToFrame(
    layers: PlainLayerNode[],
    baseFrame: PageNode | FrameNode,
    cbOrOptions?: ((args: LayerCbArgs) => void) | AddLayersOptions
) {
    const options: AddLayersOptions =
        typeof cbOrOptions === 'function'
            ? { onLayerProcess: cbOrOptions }
            : cbOrOptions || {};

    if (options.defaultFont) {
        setDefaultFont(options.defaultFont);
    }
    const { onLayerProcess } = options;

    for (const rootLayer of layers) {
        await traverseAsync(rootLayer, async (layer, parent) => {
            try {
                const node = await processLayer(layer, parent, baseFrame);

                onLayerProcess?.({ node, layer, parent });
            } catch (err) {
                console.warn('Error on layer:', layer, err);
            }
        });
    }
}

export * from './getFont';
export * from './dropOffset';
