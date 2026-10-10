
describe('Convert to figma', () => {
    let htmlToFigma;
    beforeAll(async () => {
        htmlToFigma = async (name) => {
            await page.goto(`http://localhost:3000/stubs/${name}.html`);
            await page.addScriptTag({ url: '../index.js' });
            // Wait for the local test font so text metrics are deterministic
            await page.evaluate(() => document.fonts.ready);

            return page.$eval(`#container`, (el) => window.__htmlToFigma(el));
        }
    });

    it('button with padding', async () => {
        expect(await htmlToFigma('base-button')).toMatchSnapshot();
    });

    it('buttons with :before :after', async () => {
        expect(await htmlToFigma('button-before-after')).toMatchSnapshot();
    });

    it('input and placeholder', async () => {
        expect(await htmlToFigma('input')).toMatchSnapshot();
    });

    it('shadows', async () => {
        expect(await htmlToFigma('shadows')).toMatchSnapshot();
    });

    it('borders', async () => {
        expect(await htmlToFigma('borders')).toMatchSnapshot();
    });

    it('opacity', async () => {
        expect(await htmlToFigma('opacity')).toMatchSnapshot();
    });

    it('zero height parent with visible overflow keeps its children', async () => {
        expect(await htmlToFigma('zero-height-parent')).toMatchSnapshot();
    });

    it('text styles: weight, italics, decoration, alignment', async () => {
        expect(await htmlToFigma('text-styles')).toMatchSnapshot();
    });

    it('options: exclude and nameLayer', async () => {
        await page.goto(`http://localhost:3000/stubs/options.html`);
        await page.addScriptTag({ url: '../index.js' });
        await page.evaluate(() => document.fonts.ready);

        // callbacks run in the page context (they cannot be serialized
        // from the test), so they are defined inside the pageFunction
        const result = await page.$eval('#container', (el) =>
            window.__htmlToFigma(el, {
                exclude: (node) => node.classList.contains('skip'),
                nameLayer: (node) => node.dataset.layer,
            })
        );

        expect(result).toMatchSnapshot();
        const json = JSON.stringify(result);
        expect(json).not.toContain('EXCLUDED');
        expect(json).toContain('CustomName');

        // exclude also accepts a CSS selector string
        const withSelector = await page.$eval('#container', (el) =>
            window.__htmlToFigma(el, { exclude: '.skip' })
        );
        expect(JSON.stringify(withSelector)).not.toContain('EXCLUDED');
    });

    it('svg <use> is expanded without mutating the page', async () => {
        expect(await htmlToFigma('svg-use')).toMatchSnapshot();

        // conversion must be read-only: the original <use> stays in the DOM
        const useCount = await page.evaluate(
            () => document.querySelectorAll('use').length
        );
        expect(useCount).toBe(1);
    });
});
