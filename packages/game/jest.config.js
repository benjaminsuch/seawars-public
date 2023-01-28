/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  moduleNameMapper: {
    '^core/(.*)$': '<rootDir>/src/core/$1'
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './test/setup.ts',
  globalTeardown: './test/teardown.ts',
  setupFilesAfterEnv: ['./test/beforeAll.ts']
}
