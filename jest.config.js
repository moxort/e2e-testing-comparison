module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/*.spec.js' // This matches any files ending in .spec.js anywhere in your project
    ],
    setupFilesAfterEnv: ['./jest.setup.js']  // This file will contain any global setup configurations
};
