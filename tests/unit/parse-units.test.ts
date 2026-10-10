import { parseUnits } from '../../src/utils';

describe('parseUnits', () => {
    it('parses pixel values', () => {
        expect(parseUnits('16px')).toEqual({ unit: 'PIXELS', value: 16 });
        expect(parseUnits('1.5px')).toEqual({ unit: 'PIXELS', value: 1.5 });
    });

    it('returns null for empty values', () => {
        expect(parseUnits('')).toBeNull();
        expect(parseUnits(null)).toBeNull();
        expect(parseUnits(undefined)).toBeNull();
    });

    it('returns null for zero', () => {
        expect(parseUnits('0')).toBeNull();
    });

    it('returns null for percentages without a relative base', () => {
        expect(parseUnits('50%')).toBeNull();
    });

    it('resolves percentages against a relative base', () => {
        expect(parseUnits('50%', 200)).toEqual({ unit: 'PIXELS', value: 100 });
    });

    it('returns null for non-px keywords', () => {
        expect(parseUnits('normal')).toBeNull();
    });
});
