// keep the publish output (build/) out of jest's module map
const modulePathIgnorePatterns = ['<rootDir>/build/', '<rootDir>/dist/'];

module.exports = {
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
            modulePathIgnorePatterns,
            transform: {
                '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
            },
        },
        {
            displayName: 'e2e',
            preset: 'jest-puppeteer',
            testMatch: ['<rootDir>/tests/*.test.js'],
            modulePathIgnorePatterns,
        },
    ],
};
