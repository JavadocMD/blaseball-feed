module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
}
