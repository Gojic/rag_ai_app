module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    clearMocks: true,
    setupFiles: ['dotenv/config'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    detectOpenHandles: true,
    //forceExit: true,
};