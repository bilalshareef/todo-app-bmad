import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          types: ['jest'],
          verbatimModuleSyntax: false,
          allowImportingTsExtensions: false,
          noUncheckedSideEffectImports: false,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__mocks__/styleMock.js',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
}

export default config
