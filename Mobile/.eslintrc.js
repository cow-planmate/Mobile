module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-alert': 'off',
  },
  overrides: [
    {
      files: ['__tests__/**/*.{js,jsx,ts,tsx}', 'jest.setup.js'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react-hooks/exhaustive-deps': 'off',
      },
    },
    {
      files: ['*.stories.tsx', '*.stories.ts'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
