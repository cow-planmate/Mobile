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
      // Storybook의 `render`는 이름만 소문자일 뿐 실제로는 컴포넌트 렌더 함수라
      // 훅 사용이 정상이다. 규칙이 이를 구분하지 못해 오탐이 발생한다.
      files: ['*.stories.tsx', '*.stories.ts'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
