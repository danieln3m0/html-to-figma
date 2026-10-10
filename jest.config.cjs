module.exports = {
    projects: [
        {
            displayName: 'unit',
            testEnvironment: 'jsdom',
            testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
            transform: {
                '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
            },
        },
        {
            displayName: 'e2e',
            preset: 'jest-puppeteer',
            testMatch: ['<rootDir>/tests/*.test.js'],
        },
    ],
};
