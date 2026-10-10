# Oportunidades de mejora — html-to-figma

Análisis del código a fecha 2026-10-09 (fork de `sergcen/html-to-figma`, master `27dc42d`).

## 1. Bugs confirmados

### 1.1 La caché de fuentes nunca se llena — `src/figma/getFont.ts:10-18`
`getAvailableFontNames()` comprueba `cachedAvailableFonts` pero nunca lo asigna, así que
`figma.listAvailableFontsAsync()` se ejecuta en cada texto con fuente nueva. Fix: asignar el
resultado a `cachedAvailableFonts` antes de devolverlo.

### 1.2 `setProperty('display', 'none', '!important')` no hace nada — `src/browser/add-constraints.ts:41`
La prioridad válida en CSSOM es `'important'` (sin `!`). Con `'!important'` el navegador ignora
la llamada por completo, de modo que el elemento nunca se oculta y `computed.width` siempre
devuelve píxeles → `hasFixedWidth`/`hasFixedHeight` resultan `true` para casi todos los
elementos. Toda la detección de ancho/alto fijo está rota.

### 1.3 `text-decoration` nunca se detecta — `src/browser/text-to-figma.ts:135-143`
- El valor computado de `textDecoration` en navegadores modernos es p. ej.
  `"underline solid rgb(0, 0, 0)"`, así que `=== 'underline'` nunca coincide.
  Hay que leer `textDecorationLine`.
- Se compara contra `'strikethrough'`, que no existe en CSS (es `line-through`).
  El tachado es inalcanzable.

### 1.4 `text-align: justify` nunca coincide — `src/browser/text-to-figma.ts:146`
El valor CSS es `justify`, no `justified` (y en Figma `JUSTIFIED`). Tampoco se mapean
`start`/`end`, que son los valores computados habituales hoy.

### 1.5 Las sombras `inset` se exportan como DROP_SHADOW — `src/browser/element-to-figma.ts:194-205`
`parseBoxShadowValue` sí captura `inset`, pero al construir los efectos se ignora y todo se
convierte en `DROP_SHADOW`. Figma tiene `INNER_SHADOW` para esto.

### 1.6 `htmlToFigma` muta el DOM real de la página — `src/browser/html-to-figma.ts:124`
`use.outerHTML = symbol.innerHTML` reemplaza destructivamente los `<use>` de SVG en la página
del usuario y no lo restaura. Además `getBoundingClientRectPseudo` (`dom-utils.ts:80-83`)
inserta/borra un `<span>` dentro del elemento, lo que puede disparar MutationObservers y romper
selectores `:first-child`/`:last-child` durante la captura. La conversión debería ser de solo
lectura (o trabajar sobre un clon).

### 1.7 Hijos de elementos descartados desaparecen — `src/browser/html-to-figma.ts` (`mapDOM`)
Los hijos se indexan por `parentElement`; si el padre se descarta (p. ej. `rect.width < 1` en
`element-to-figma.ts:61`), sus hijos quedan huérfanos y nunca se añaden al árbol. Un contenedor
con `height: 0; overflow: visible` (patrón común de centrado) pierde todo su contenido.
Relacionado: si el elemento raíz se descarta, `elems[0]` pasa a ser un descendiente arbitrario.

### 1.8 `traverseAsync` muta el array del caller — `src/utils.ts:50`
`layer.children.reverse()` invierte el array *in place*. Quien pase el mismo árbol dos veces a
`addLayersToFrame` obtiene resultados distintos en cada llamada. Usar `[...children].reverse()`.

### 1.9 README desactualizado/erróneo
- `import { htmlTofigma }` → el export real es `htmlToFigma` (minúscula/mayúscula).
- `await htmlTofigma(element)` → la función es síncrona.
- `document.getElementById('#element-to-export')` → `getElementById` no lleva `#`.
- La imagen de portada es una URL firmada de S3 caducada en 2021 (imagen rota).

### 1.10 Tipo incorrecto de `borders` — `src/types.ts:51`
`WithMeta<T>['borders']` está tipado como `WithMeta<T>` pero `getBorderPin` devuelve
`MetaLayerNode[]` y `mapDOM` hace `children.concat(elem.borders)` esperando array.

## 2. Robustez y correctitud

- **`getRgb` solo entiende `rgb()/rgba()` con comas** (`src/utils.ts:74`). Colores computados
  modernos (`oklch()`, `color(srgb …)`, `lab()`) devuelven `null` y se pierde el fill.
- **`getBorder` depende del shorthand `computedStyle.border`** (`src/browser/border.ts:7`),
  que en Firefox es cadena vacía cuando los lados difieren → en Firefox casi nunca hay strokes
  y siempre se cae al hack de rectángulos de `getBorderPin`.
- **`getBorderPin` dibuja los bordes fuera de la caja** (`border.ts:64-75`): el borde `top` se
  coloca en `rect.top - height`, pero el borde CSS está *dentro* del border-box
  (`getBoundingClientRect` lo incluye).
- **Colapso de espacios incondicional** en texto (`text-to-figma.ts:74`): rompe
  `white-space: pre/pre-wrap`.
- **`fontWeight`/`fontStyle` se ignoran por completo**: todo texto sale en Regular
  (`getMatchingFont` filtra solo `style === 'Regular'`). Negritas e itálicas se pierden —
  probablemente la pérdida de fidelidad más visible.
- **`element-to-figma.ts:20-33`**: chequeo de `nodeType !== ELEMENT_NODE` duplicado.
- **Redondeo agresivo** (`Math.round` en todas las coordenadas): Figma acepta decimales;
  el redondeo acumula desalineaciones de ±1 px entre padres e hijos.
- **`.npmrc` apunta a `http://`** (sin TLS): debería ser `https://registry.npmjs.org`.

## 3. Rendimiento

- **`isHidden` sube toda la cadena de ancestros por cada nodo** (`dom-utils.ts:238-260`):
  O(n·profundidad) llamadas a `getComputedStyle`. Como el TreeWalker ya recorre top-down, se
  puede propagar la visibilidad del padre o memoizar por elemento.
- **`addConstraintToLayer` fuerza reflows**: alterna `display` del elemento vivo (además del
  bug 1.2) y llama `getComputedStyle` varias veces por nodo.
- **`getBoundingClientRectPseudo` copia TODAS las propiedades computadas** a un span y fuerza
  layout dos veces por pseudo-elemento.
- **Sin caché de imágenes** (`dom-utils.ts:288`, el propio TODO lo dice): la misma URL se
  descarga una vez por capa que la use.

## 4. Funcionalidades ausentes (ordenadas por impacto)

1. **Auto Layout**: mapear `display: flex` (dirección, gap, padding, justify/align) a
   `layoutMode`, `itemSpacing`, `padding*`, `primaryAxisAlignItems`… Hoy todo es posición
   absoluta; con Auto Layout el resultado sería editable de verdad en Figma.
2. **Gradientes**: `backgroundImage` solo soporta `url()`. `linear-gradient()` /
   `radial-gradient()` → `GRADIENT_LINEAR` / `GRADIENT_RADIAL` de Figma.
3. **Peso y estilo de fuente** (ver 2): mapear `fontWeight: 700` → estilo "Bold", `italic` →
   "Italic", con matching aproximado sobre `listAvailableFontsAsync`.
4. **Bordes por lado con API moderna**: Figma soporta `strokeTopWeight` etc. desde 2022;
   eliminaría el hack de rectángulos `::borders`.
5. **`background-size`/`position`/`repeat`** (TODOs existentes): `repeat` → `scaleMode: 'TILE'`.
6. **Transformaciones CSS**: `rotate`/`scale` → `rotation`/`relativeTransform`.
7. **Shadow DOM e iframes**: `getShadowEls` existe pero está muerto; el TreeWalker no entra en
   shadow roots.
8. **`text-shadow`**, `filter: drop-shadow()`, `mix-blend-mode` → efectos/blendMode de Figma.
9. **Nombres de capas**: hoy todos los frames se llaman "Frame". Nombrarlos
   `tag#id.clase` haría el archivo navegable (gran mejora de UX con poco esfuerzo).

## 5. Infraestructura y DX

- **CI en Node 12.13.1** (EOL desde 2022) con `actions/checkout@v2`/`setup-node@v2`
  (deprecados). Subir a Node 20 + acciones v4, y añadir el workflow también a ramas de fork.
- **Dependencias antiguas**: TypeScript 4.2, Jest 26, Puppeteer 9 (2021), `file-type` 12.
- **Scripts no portables**: `build:package` y `build:tests` usan `cp` (fallan en Windows).
  Usar `shx`/`cpy-cli` o un script Node.
- **`package.json` sin `exports`/`types`/`main`**: los imports `html-figma/browser` dependen
  del layout de archivos del build. Añadir mapa `exports` con tipos.
- **~340 líneas de código muerto comentado**: `build-tree.ts` entero (300 líneas), bloques en
  `html-to-figma.ts`, `element-to-figma.ts`, `add-constraints.ts`, `dom-utils.ts`. Borrar
  (está en git).
- **Sin LICENSE**: `package.json` declara MIT pero no hay archivo LICENSE.
- **Tests**: solo 5 snapshots vía Puppeteer. `getRgb`, `parseBoxShadowValues`, `parseUnits`,
  `replaceSvgFill` son funciones puras testeables en unidad sin navegador (y cubrirían los
  bugs 1.3, 1.4 y 2).
- **Sin linter/prettier en CI** (hay config de prettier en package.json pero nada lo ejecuta).

## 6. Personalización (secundario)

La API actual solo acepta un selector/elemento. Un objeto de opciones abriría la librería:

```ts
htmlToFigma(el, {
    exclude?: string | (el: Element) => boolean,  // filtrar nodos (banners, scripts…)
    pseudoElements?: boolean,                      // on/off ::before/::after
    round?: boolean,                               // redondeo de coordenadas
    imageProxy?: (url: string) => string,          // proxy CORS para imágenes
    nameLayer?: (el: Element) => string,           // nombres de capa personalizados
    onElement?: (el, layer) => LayerNode | void,   // visitor para ajustar/sustituir capas
})
```

Y en el lado Figma:

- `defaultFont` configurable (hoy Roboto hardcodeado) y mapa de sustitución de fuentes
  (`{ 'Helvetica Neue': 'Inter' }`).
- `addLayersToFrame` ya expone `onLayerProcess`; documentarlo en el README.
- `setContext(window)` ya permite iframes/JSDOM; también sin documentar.
