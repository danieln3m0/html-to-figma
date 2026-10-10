const fontCache: { [key: string]: FontName | undefined } = {};

const normalizeName = (str: string) =>
    str.toLowerCase().replace(/[^a-z]/gi, '');

export const defaultFont = { family: 'Roboto', style: 'Regular' };

let currentDefaultFont: FontName = defaultFont;

/** Fallback font used when no family matches (default: Roboto Regular). */
export const setDefaultFont = (font: FontName) => {
    currentDefaultFont = font;
};

let cachedAvailableFonts: Font[] | null = null;

const getAvailableFontNames = async () => {
    if (!cachedAvailableFonts) {
        cachedAvailableFonts = await figma.listAvailableFontsAsync();
    }
    return cachedAvailableFonts;
};

const WEIGHT_STYLES: { [weight: number]: string[] } = {
    100: ['Thin', 'Hairline'],
    200: ['ExtraLight', 'UltraLight'],
    300: ['Light'],
    400: ['Regular', 'Normal', 'Book'],
    500: ['Medium'],
    600: ['SemiBold', 'DemiBold'],
    700: ['Bold'],
    800: ['ExtraBold', 'UltraBold'],
    900: ['Black', 'Heavy'],
};
const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const pickStyle = (
    familyFonts: Font[],
    weight: number,
    italic: boolean
): FontName => {
    const styles = familyFonts.map((font) => font.fontName);
    const withItalic = styles.filter(
        (name) => /italic|oblique/i.test(name.style) === italic
    );
    const candidates = withItalic.length ? withItalic : styles;

    // "Bold Italic" -> "Bold", bare "Italic" -> "Regular"
    const weightOf = (style: string) =>
        style.replace(/\s*(italic|oblique)\s*/i, ' ').trim() || 'Regular';

    // exact weight first, then closest
    const byDistance = [...WEIGHTS].sort(
        (a, b) => Math.abs(a - weight) - Math.abs(b - weight)
    );

    for (const w of byDistance) {
        for (const styleName of WEIGHT_STYLES[w]) {
            const found = candidates.find(
                (name) =>
                    normalizeName(weightOf(name.style)) ===
                    normalizeName(styleName)
            );
            if (found) return found;
        }
    }
    return candidates[0];
};

export async function getMatchingFont(
    fontStr: string,
    weight: number = 400,
    italic: boolean = false
) {
    const cacheKey = `${fontStr}|${weight}|${italic}`;
    const cached = fontCache[cacheKey];
    if (cached) {
        return cached;
    }

    const availableFonts = await getAvailableFontNames();
    const familySplit = fontStr.split(/\s*,\s*/);

    for (const family of familySplit) {
        const normalized = normalizeName(family);
        const familyFonts = availableFonts.filter(
            (font) => normalizeName(font.fontName.family) === normalized
        );
        if (!familyFonts.length) continue;

        const fontName = pickStyle(familyFonts, weight, italic);
        await figma.loadFontAsync(fontName);
        fontCache[cacheKey] = fontName;
        return fontName;
    }

    return currentDefaultFont;
}
