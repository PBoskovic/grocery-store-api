module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./test/setup.ts'],
    setupFiles: ['dotenv/config']
};
