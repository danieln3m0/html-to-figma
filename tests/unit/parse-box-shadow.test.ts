import { parseBoxShadowValue, parseBoxShadowValues } from '../../src/utils';

describe('parseBoxShadowValue', () => {
    it('parses computed-style order (color first)', () => {
        const parsed = parseBoxShadowValue('rgba(0, 0, 0, 0.5) 0px 1px 2px 0px');

        expect(parsed.offsetX).toBe(0);
        expect(parsed.offsetY).toBe(1);
        expect(parsed.blurRadius).toBe(2);
        expect(parsed.spreadRadius).toBe(0);
        expect(parsed.inset).toBe(false);
        expect(parsed.color).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    });

    it('detects inset shadows', () => {
        const parsed = parseBoxShadowValue(
            'rgba(0, 0, 0, 0.25) 0px 2px 4px 0px inset'
        );

        expect(parsed.inset).toBe(true);
        expect(parsed.offsetY).toBe(2);
        expect(parsed.blurRadius).toBe(4);
    });

    it('parses spread radius', () => {
        const parsed = parseBoxShadowValue('rgba(0, 0, 0, 1) 0px 0px 0px 1px');

        expect(parsed.spreadRadius).toBe(1);
    });
});

describe('parseBoxShadowValues', () => {
    it('splits multiple shadows without breaking on commas inside colors', () => {
        const parsed = parseBoxShadowValues(
            'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 4px 6px 0px'
        );

        expect(parsed).toHaveLength(2);
        expect(parsed[0].spreadRadius).toBe(1);
        expect(parsed[1].blurRadius).toBe(6);
    });
});
