import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/tests'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          // Use CommonJS for Jest runtime transpile to avoid ESM loader complexity
          module: 'commonjs',
        },
        diagnostics: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup-e2e.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/operations/**/*.ts',
    '!src/operations/index.ts',
    '!src/operations/operationRegistry.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: '<rootDir>/.coverage-e2e',
};

export default config;
