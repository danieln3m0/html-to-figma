import { replaceSvgFill } from '../../src/browser/utils';

describe('replaceSvgFill', () => {
    it('adds a fill attribute when the root tag has none', () => {
        expect(
            replaceSvgFill('<svg class="icon"><path d="M0 0"></path></svg>', 'rgb(204, 0, 0)')
        ).toBe('<svg class="icon" fill="rgb(204, 0, 0)"><path d="M0 0"></path></svg>');
    });

    it('replaces an existing fill on the root tag', () => {
        expect(
            replaceSvgFill('<svg fill="blue"><path d="M0 0"></path></svg>', 'red')
        ).toBe('<svg fill="red"><path d="M0 0"></path></svg>');
    });

    it('replaces an existing fill that is the last attribute', () => {
        expect(
            replaceSvgFill('<svg class="a" fill="blue"><path></path></svg>', 'red')
        ).toBe('<svg class="a" fill="red"><path></path></svg>');
    });

    it('does not duplicate the closing bracket of the root tag', () => {
        const result = replaceSvgFill('<svg><path></path></svg>', 'red');

        expect(result).toBe('<svg fill="red"><path></path></svg>');
        expect(result).not.toContain('>>');
    });
});
