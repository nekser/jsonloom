import baseConfig from './jest.config';
import type { Config } from 'jest';

const config: Config = {
  ...baseConfig,
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
