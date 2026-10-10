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

### Figma
```js
import { addLayersToFrame } from 'html-figma/figma';

const rootNode = figma.currentPage;

await addLayersToFrame([layersMeta], rootNode);
```
