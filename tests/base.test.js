
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

    it('opacity', async () => {
        expect(await htmlToFigma('opacity')).toMatchSnapshot();
    });

    it('zero height parent with visible overflow keeps its children', async () => {
        expect(await htmlToFigma('zero-height-parent')).toMatchSnapshot();
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
