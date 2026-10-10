import { cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
cpSync('tests/page/stubs', 'dist/stubs', { recursive: true });
cpSync('tests/page/fonts', 'dist/fonts', { recursive: true });
