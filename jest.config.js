module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
}
