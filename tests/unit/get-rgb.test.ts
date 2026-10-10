import { getRgb } from '../../src/utils';

describe('getRgb', () => {
    it('parses legacy comma syntax', () => {
        expect(getRgb('rgb(255, 0, 0)')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
        expect(getRgb('rgba(0, 0, 0, 0.5)')).toEqual({
            r: 0,
            g: 0,
            b: 0,
            a: 0.5,
        });
    });

    it('parses modern space syntax', () => {
        expect(getRgb('rgb(255 0 0)')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
        expect(getRgb('rgb(0 0 0 / 0.5)')).toEqual({
            r: 0,
            g: 0,
            b: 0,
            a: 0.5,
        });
        expect(getRgb('rgb(0 0 0 / 50%)')).toEqual({
            r: 0,
            g: 0,
            b: 0,
            a: 0.5,
        });
    });

    it('parses color(srgb ...) with 0..1 channels', () => {
        expect(getRgb('color(srgb 1 0.5 0)')).toEqual({
            r: 1,
            g: 0.5,
            b: 0,
            a: 1,
        });
        expect(getRgb('color(srgb 0 0 1 / 0.25)')).toEqual({
            r: 0,
            g: 0,
            b: 1,
            a: 0.25,
        });
    });

    it('returns null for fully transparent colors', () => {
        expect(getRgb('rgba(0, 0, 0, 0)')).toBeNull();
        expect(getRgb('rgb(0 0 0 / 0%)')).toBeNull();
    });

    it('returns null for unsupported color spaces and empty input', () => {
        expect(getRgb('oklch(0.7 0.1 200)')).toBeNull();
        expect(getRgb('lab(50% 40 59.5)')).toBeNull();
        expect(getRgb('')).toBeNull();
        expect(getRgb(null)).toBeNull();
        expect(getRgb(undefined)).toBeNull();
    });
});
