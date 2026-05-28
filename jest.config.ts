import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
    // bad-words and its dependency badwords-list ship as ESM; transform them via ts-jest as JS.
    '^.+\\.js$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' }, diagnostics: false }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(bad-words|badwords-list)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};

export default config;
