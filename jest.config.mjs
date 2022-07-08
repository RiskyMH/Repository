/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  moduleFileExtensions: [
    "mts",
    "mjs",
    "ts",
    "js",
  ],
  
  testRegex: `test\.(mjs|mts)$`,
  testEnvironment: "node",
  transform: {
    '^.+\\.(ts|mts)?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  globals: {
    "ts-jest": {
      tsconfig:{
        allowJs: true,
      },
      compiler: "typescript",
      isolatedModules: true
      },
  },
};