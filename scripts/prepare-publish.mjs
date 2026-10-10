import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.prettier;

Object.assign(pkg, {
    main: './browser/index.js',
    types: './browser/index.d.ts',
    exports: {
        '.': {
            types: './browser/index.d.ts',
            default: './browser/index.js',
        },
        './browser': {
            types: './browser/index.d.ts',
            default: './browser/index.js',
        },
        './figma': {
            types: './figma/index.d.ts',
            default: './figma/index.js',
        },
        './*': {
            types: './*.d.ts',
            default: './*.js',
        },
    },
});

writeFileSync('build/package.json', JSON.stringify(pkg, null, 2) + '\n');
copyFileSync('README.md', 'build/README.md');
if (existsSync('LICENSE')) {
    copyFileSync('LICENSE', 'build/LICENSE');
}
