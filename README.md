# html-figma

**WORK IN PROGRESS**

Converts DOM nodes to Figma nodes.

Inspired by [figma-html](https://github.com/BuilderIO/figma-html).

*DEMO*: https://www.figma.com/community/plugin/1005496056687344906/html-to-figma-DEV-plugin

Example: `/dev-plugin`

```npm i html-figma```

## USAGE

### Browser
```js
import { htmlToFigma } from 'html-figma/browser';

const element = document.getElementById('element-to-export');

const layersMeta = htmlToFigma(element);
```

#### Options

```js
const layersMeta = htmlToFigma(element, {
    // skip elements (and their subtrees): CSS selector or callback
    exclude: '.ads, [data-no-export]',
    // exclude: (el) => el.classList.contains('skip'),

    // override the default tag#id.classes layer name;
    // return undefined to keep the default
    nameLayer: (el) => el.dataset.layerName,
});
```

The conversion runs against the window that owns the element. For
iframes or non-default windows, register it first:

```js
import { setContext } from 'html-figma/browser';

setContext(iframe.contentWindow);
```

### Figma
```js
import { addLayersToFrame } from 'html-figma/figma';

const rootNode = figma.currentPage;

await addLayersToFrame([layersMeta], rootNode);
```

#### Options

```js
await addLayersToFrame([layersMeta], rootNode, {
    // called after each layer is created
    onLayerProcess: ({ node, layer, parent }) => {
        console.log('created', node.type, node.name);
    },

    // fallback font when no family matches (default: Roboto Regular)
    defaultFont: { family: 'Inter', style: 'Regular' },
});
```

`addLayersToFrame` also accepts a bare callback as the third argument
(legacy signature, equivalent to `onLayerProcess`).

## Known limitations

- CSS colors in `oklch()` / `lab()` and other non-sRGB spaces are not
  converted (solid fills fall back to none). `rgb()`, `rgba()` and
  `color(srgb ...)` are supported.
- Gradients, CSS transforms and Shadow DOM are not supported yet.
