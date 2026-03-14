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
  coverageThreshold: {
    global: {
      statements: 20,
      lines: 20,
      functions: 10,
      branches: 5,
    },
    './src/operations/configResolver.ts': {
      statements: 55,
      lines: 55,
      functions: 60,
      branches: 35,
    },
    './src/operations/writeResult.ts': {
      statements: 90,
      lines: 90,
      functions: 100,
      branches: 60,
    },
    './src/operations/pipelineRunner.ts': {
      statements: 70,
      lines: 70,
      functions: 80,
      branches: 15,
    },
  },
};

export default config;
