import { traverseAsync } from '../../src/utils';

describe('traverseAsync', () => {
    const makeTree = () =>
        ({
            type: 'FRAME',
            name: 'root',
            children: [
                { type: 'TEXT', name: 'a' },
                { type: 'TEXT', name: 'b' },
                { type: 'TEXT', name: 'c' },
            ],
        } as any);

    const visit = async (tree: any) => {
        const seen: string[] = [];
        await traverseAsync(tree, async (layer: any) => {
            seen.push(layer.name);
        });
        return seen;
    };

    it('visits children in reverse order', async () => {
        expect(await visit(makeTree())).toEqual(['root', 'c', 'b', 'a']);
    });

    it('does not mutate the input and is stable across invocations', async () => {
        const tree = makeTree();
        const first = await visit(tree);
        const second = await visit(tree);

        expect(second).toEqual(first);
        expect(tree.children.map((c: any) => c.name)).toEqual(['a', 'b', 'c']);
    });
});
